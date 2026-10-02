import { notFound } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getCollection } from '@/lib/collections'
import MasonryGrid from '@/components/MasonryGrid'
import type { Artwork } from '@/lib/types'

type Props = { params: Promise<{ slug: string }> }

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const collection = getCollection(slug)
  if (!collection) notFound()

  const supabase = await getSupabaseServerClient()
  const { data: artworks } = await supabase
    .from('artworks')
    .select('*')
    .eq('collection_slug', slug)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-4xl">{collection.icon_emoji}</span>
        <h1 className="text-3xl font-black uppercase tracking-widest text-ink">
          {collection.name}
        </h1>
      </div>

      {artworks && artworks.length > 0 ? (
        <MasonryGrid artworks={artworks as Artwork[]} />
      ) : (
        <p className="text-rose font-black uppercase tracking-widest text-sm">
          No pieces here yet — check back soon.
        </p>
      )}
    </div>
  )
}
