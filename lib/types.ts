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
  created_at: string
}

export type Video = {
  id: string
  title: string
  youtube_url: string
  thumbnail_url: string
  description: string | null
  created_at: string
}

export type PageContent = {
  slug: string
  content_json: Record<string, unknown>
  updated_at: string
}
