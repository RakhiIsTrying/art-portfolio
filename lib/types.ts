export type Collection = {
  slug: string
  name: string
  icon_emoji: string
  sort_order: number
}

export type Artwork = {
  id: string
  title: string
  collection_slug: string
  image_url: string
  medium: string | null
  year: number | null
  featured: boolean
  featured_order: number | null
  instagram_url: string | null
  prints_available: boolean
  original_available: boolean
  created_at: string
}

export type Video = {
  id: string
  title: string
  youtube_url: string | null
  video_url: string | null
  thumbnail_url: string | null
  description: string | null
  category: string | null
  instagram_url: string | null
  created_at: string
}

export type PageContent = {
  slug: string
  content_json: Record<string, unknown>
  updated_at: string
}

export type ClubBox = {
  id: string
  month: string          // "2026-11"
  note: string | null
  photo_urls: string[]
  video_url: string | null
  artwork_ids: string[]
  created_at: string
}
