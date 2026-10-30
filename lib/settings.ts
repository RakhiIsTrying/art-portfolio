// Site settings you can change from Admin, stored as one JSON row in the `pages` table
// (slug 'site-settings'). Anything not saved yet falls back to these defaults.
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { DEFAULT_PRINT_SIZES, DEFAULT_GREETINGS, type PrintSize } from '@/lib/prints'
import { DEFAULT_PLANS, type Plans } from '@/lib/printClub'
import CUTOUTS from '@/lib/cutouts.json'

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
  shopIntro: 'Bring a piece home. Every print and card is made to order. Pick a piece, see it at every size and send your order.',
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
    // If the read fails, don't keep the failure around, and fall back to the defaults for this visit
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
  return next
}

/** Put items in the hand-arranged order; anything not arranged yet keeps its place after them. */
export function arrange<T extends { id: string }>(items: T[], order: string[] | undefined) {
  if (!order?.length) return items
  const rank = new Map(order.map((id, i) => [id, i]))
  return [...items].sort((a, b) => (rank.get(a.id) ?? 1e6 + items.indexOf(a)) - (rank.get(b.id) ?? 1e6 + items.indexOf(b)))
}

export type Cutout = { url: string; title: string; collection: string }

/** The cut-out shown for each collection, chosen by the artist (always the same, never random). */
const CHOSEN_CUTOUTS: Record<string, string> = {
  music: 'KATSEYE',
  movies: 'Joker',
  comics: 'Spirited Away',
  'bee-ben': 'Distinguished Gentleman',   // 5th piece in the Bee, Ben & Dug-Dug gallery
  sketchbook: 'Pink Blossoms',
}

/** The featured original: top of the Originals page and on the front-page Originals tile. */
export const FEATURED_ORIGINAL_TITLE = 'Koi Pond'
/** The flower shown next to it on the front-page Originals tile. */
export const ORIGINALS_TILE_FLOWER = 'Hibiscus'
/** The cut-out on the front-page Prints & cards tile. */
export const PRINTS_TILE_CUTOUT = 'Baby Penguins'

/** A cut-out by the artwork's title, if one was made. */
export function cutoutByTitle(title: string): Cutout | null {
  const c = CUTOUTS.find(x => x.title === title)
  return c ? { url: c.url, title: c.title, collection: c.collection } : null
}

/** One cut-out per collection. The list of cut-outs lives in lib/cutouts.json. */
export async function collectionCutouts(): Promise<Record<string, Cutout | null>> {
  return Object.fromEntries(Object.entries(CHOSEN_CUTOUTS).map(([slug, title]) => {
    const c = CUTOUTS.find(x => x.collection === slug && x.title === title) ?? CUTOUTS.find(x => x.collection === slug)
    return [slug, c ? { url: c.url, title: c.title, collection: c.collection } : null]
  }))
}
