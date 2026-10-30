import type { Collection } from '@/lib/types'

export const COLLECTIONS: Collection[] = [
  { slug: 'music',   name: 'Music & Pop Culture', icon_emoji: '🎵', sort_order: 1 },
  { slug: 'movies',  name: 'Movies & TV',         icon_emoji: '🎬', sort_order: 2 },
  { slug: 'comics',  name: 'Comics & Anime',      icon_emoji: '💥', sort_order: 3 },
  { slug: 'bee-ben', name: 'Bee, Ben & Dug-Dug',  icon_emoji: '🐝', sort_order: 4 },
  { slug: 'sketchbook', name: 'Sketchbook',       icon_emoji: '✏️', sort_order: 5 },
]

export function getCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find(c => c.slug === slug)
}

export const categoryColors: Record<string, string> = {
  music:    '#7a3040',
  movies:   '#1e3a8a',
  comics:   '#1a6060',
  'bee-ben':'#4a3a7a',
  sketchbook: '#3d4f45',
}

export const categoryDesc: Record<string, string> = {
  music:    'Icons, legends & sounds',
  movies:   'Cinema & television',
  comics:   'Manga, anime & panels',
  'bee-ben':'Original characters',
  sketchbook: 'Pencil, watercolor & still life',
}

/** Categories the videos table accepts (its database check allows only these). */
export const VIDEO_CATEGORIES = ['music', 'movies', 'comics', 'bee-ben'] as const
