// Site settings you can change from Admin, stored as one JSON row in the `pages` table
// (slug 'site-settings'). Anything not saved yet falls back to these defaults.
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { DEFAULT_PRINT_SIZES, DEFAULT_GREETINGS, type PrintSize } from '@/lib/prints'
import { DEFAULT_PLANS, type Plans } from '@/lib/printClub'

export type SiteSettings = {
  /** Artwork shown big on the front page (null = latest upload) */
  heroArtworkId: string | null
  /** Hand-arranged order of artwork ids, per collection slug */
  artworkOrder: Record<string, string[]>
  /** Hand-arranged order of video ids; the first one is "Now showing" */
  videoOrder: string[]
  printSizes: PrintSize[]
  greetings: string[]
  plans: Plans
  shopIntro: string
}

const SLUG = 'site-settings'

export const DEFAULT_SETTINGS: SiteSettings = {
  heroArtworkId: null,
  artworkOrder: {},
  videoOrder: [],
  printSizes: DEFAULT_PRINT_SIZES,
  greetings: DEFAULT_GREETINGS,
  plans: DEFAULT_PLANS,
  shopIntro: 'Bring a piece home. Every print and card is made to order — pick a piece, see it at every size, and send your order.',
}

export async function getSettings(): Promise<SiteSettings> {
  const { data } = await getSupabaseAdminClient().from('pages').select('content_json').eq('slug', SLUG).maybeSingle()
  const saved = (data?.content_json ?? {}) as Partial<SiteSettings>
  return { ...DEFAULT_SETTINGS, ...saved, plans: { ...DEFAULT_SETTINGS.plans, ...(saved.plans ?? {}) } }
}

export async function saveSettings(patch: Partial<SiteSettings>) {
  const current = await getSettings()
  const next = { ...current, ...patch }
  const { error } = await getSupabaseAdminClient().from('pages')
    .upsert({ slug: SLUG, content_json: next, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
  return next
}

/** Put items in the hand-arranged order; anything not arranged yet keeps its place after them. */
export function arrange<T extends { id: string }>(items: T[], order: string[] | undefined) {
  if (!order?.length) return items
  const rank = new Map(order.map((id, i) => [id, i]))
  return [...items].sort((a, b) => (rank.get(a.id) ?? 1e6 + items.indexOf(a)) - (rank.get(b.id) ?? 1e6 + items.indexOf(b)))
}
