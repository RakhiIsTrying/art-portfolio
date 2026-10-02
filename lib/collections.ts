import type { Collection } from '@/lib/types'

export const COLLECTIONS: Collection[] = [
  { slug: 'music',   name: 'Music & Pop Culture', icon_emoji: '🎵', sort_order: 1 },
  { slug: 'movies',  name: 'Movies & TV',         icon_emoji: '🎬', sort_order: 2 },
  { slug: 'comics',  name: 'Comics & Anime',      icon_emoji: '💥', sort_order: 3 },
  { slug: 'bee-ben', name: 'Bee, Ben & Dug-Dug',  icon_emoji: '🐝', sort_order: 4 },
  { slug: 'paper',   name: 'Paper Art',           icon_emoji: '✂️', sort_order: 5 },
]

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find(c => c.slug === slug)
}
