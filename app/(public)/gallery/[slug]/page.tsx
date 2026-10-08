import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getCollection } from '@/lib/collections'
import MasonryGrid from '@/components/MasonryGrid'
import type { Artwork } from '@/lib/types'

const categoryColors: Record<string, string> = {
  music:    '#7a3040',
  movies:   '#1e3a8a',
  comics:   '#1a6060',
  'bee-ben':'#4a3a7a',
  paper:    '#7a5020',
}

type Props = { params: Promise<{ slug: string }> }

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const collection = getCollection(slug)
  if (!collection) notFound()

  const supabase = await getSupabaseServerClient()
  const { data: artworks } = await supabase
    .from('artworks').select('*')
    .eq('collection_slug', slug)
    .order('created_at', { ascending: false })

  const color = categoryColors[slug] ?? '#1a1014'

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 36px 60px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #d0d0d0' }}>
        <div style={{ width: 3, background: color, marginRight: 16, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <Link href="/gallery" style={{ fontSize: '7px', letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0', textDecoration: 'none', display: 'block', marginBottom: 6 }}>
            ← Collections
          </Link>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 32, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>
            {collection.name}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '7px', fontWeight: 300, letterSpacing: '.3em', color: '#a0a0a0', textTransform: 'uppercase' }}>
            {artworks?.length ?? 0} works
          </span>
        </div>
      </div>

      {artworks && artworks.length > 0 ? (
        <MasonryGrid artworks={artworks as Artwork[]} />
      ) : (
        <p style={{ fontSize: '8px', letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0', padding: '40px 0' }}>
          No pieces here yet — check back soon.
        </p>
      )}

    </div>
  )
}
