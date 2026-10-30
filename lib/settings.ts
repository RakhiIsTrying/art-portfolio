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
  /** Background-removed versions of artworks (artwork id → image url), used as cut-outs */
  cutouts: Record<string, string>
}

const SLUG = 'site-settings'

export const DEFAULT_SETTINGS: SiteSettings = {
  heroArtworkId: null,
  artworkOrder: {},
  videoOrder: [],
  printSizes: DEFAULT_PRINT_SIZES,
  greetings: DEFAULT_GREETINGS,
  plans: DEFAULT_PLANS,
  cutouts: {},
  shopIntro: 'Bring a piece home. Every print and card is made to order — pick a piece, see it at every size, and send your order.',
}

// Settings change rarely, so each server keeps a copy for up to a minute (saves clear it)
const TTL_MS = 60_000
let cached: { at: number; value: Promise<SiteSettings> } | null = null

async function loadSettings(): Promise<SiteSettings> {
  const { data, error } = await getSupabaseAdminClient().from('pages').select('content_json').eq('slug', SLUG).maybeSingle()
  if (error) throw new Error(error.message)
  const saved = (data?.content_json ?? {}) as Partial<SiteSettings>
  return { ...DEFAULT_SETTINGS, ...saved, plans: { ...DEFAULT_SETTINGS.plans, ...(saved.plans ?? {}) } }
}

export async function getSettings(): Promise<SiteSettings> {
  if (!cached || Date.now() - cached.at > TTL_MS) {
    const value = loadSettings()
    cached = { at: Date.now(), value }
    // If the read fails, don't keep the failure around — and fall back to the defaults for this visit
    value.catch(() => { if (cached?.value === value) cached = null })
  }
  return cached.value.catch(() => DEFAULT_SETTINGS)
}

export async function saveSettings(patch: Partial<SiteSettings>) {
  const current = await getSettings()
  const next = { ...current, ...patch }
  const { error } = await getSupabaseAdminClient().from('pages')
    .upsert({ slug: SLUG, content_json: next, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
  cached = { at: Date.now(), value: Promise.resolve(next) }
  cutoutMeta = null
  return next
}

/** Put items in the hand-arranged order; anything not arranged yet keeps its place after them. */
export function arrange<T extends { id: string }>(items: T[], order: string[] | undefined) {
  if (!order?.length) return items
  const rank = new Map(order.map((id, i) => [id, i]))
  return [...items].sort((a, b) => (rank.get(a.id) ?? 1e6 + items.indexOf(a)) - (rank.get(b.id) ?? 1e6 + items.indexOf(b)))
}

export type Cutout = { url: string; title: string; collection: string }

/** One random cut-out per collection (different on every page load). */
let cutoutMeta: { at: number; value: Promise<Record<string, Cutout[]>> } | null = null

async function loadCutoutsByCollection(): Promise<Record<string, Cutout[]>> {
  const { cutouts } = await getSettings()
  const ids = Object.keys(cutouts)
  if (!ids.length) return {}
  const { data, error } = await getSupabaseAdminClient().from('artworks').select('id, title, collection_slug').in('id', ids)
  if (error) throw new Error(error.message)
  const byCollection: Record<string, Cutout[]> = {}
  for (const a of data ?? []) (byCollection[a.collection_slug] ??= []).push({ url: cutouts[a.id], title: a.title, collection: a.collection_slug })
  return byCollection
}

/** One random cut-out per collection (a fresh pick on every page load). */
export async function randomCutouts(): Promise<Record<string, Cutout | null>> {
  if (!cutoutMeta || Date.now() - cutoutMeta.at > TTL_MS) {
    const value = loadCutoutsByCollection()
    cutoutMeta = { at: Date.now(), value }
    value.catch(() => { if (cutoutMeta?.value === value) cutoutMeta = null })
  }
  const byCollection = await cutoutMeta.value.catch(() => ({} as Record<string, Cutout[]>))
  return Object.fromEntries(Object.entries(byCollection).map(([slug, list]) => [slug, list[Math.floor(Math.random() * list.length)]]))
}
