import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { COLLECTIONS } from '@/lib/collections'
import Image from 'next/image'
import type { Artwork } from '@/lib/types'

const categoryColors: Record<string, string> = {
  music:    '#7a3040',
  movies:   '#1e3a8a',
  comics:   '#1a6060',
  'bee-ben':'#4a3a7a',
  paper:    '#7a5020',
}

const categoryDesc: Record<string, string> = {
  music:    'Icons, legends & sounds',
  movies:   'Cinema & television',
  comics:   'Manga, anime & panels',
  'bee-ben':'Original characters',
  paper:    'Cuts, folds & textures',
}

export default async function GalleryPage() {
  const supabase = await getSupabaseServerClient()
  const previews: Record<string, Artwork[]> = {}
  await Promise.all(
    COLLECTIONS.map(async col => {
      const { data } = await supabase
        .from('artworks').select('*')
        .eq('collection_slug', col.slug)
        .order('created_at', { ascending: false }).limit(3)
      previews[col.slug] = (data ?? []) as Artwork[]
    })
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 36px 60px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #d0d0d0' }}>
        <div style={{ width: 3, background: '#7a3040', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '7px', letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040', marginBottom: 6 }}>Browse</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 32, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Collections</h1>
        </div>
      </div>

      {/* Collection rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #d0d0d0' }}>
        {COLLECTIONS.map((col, i) => {
          const color = categoryColors[col.slug] ?? '#1a1014'
          const desc  = categoryDesc[col.slug] ?? ''
          return (
            <Link
              key={col.slug}
              href={`/gallery/${col.slug}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 0,
                borderBottom: i < COLLECTIONS.length - 1 ? '1px solid #d0d0d0' : 'none',
                textDecoration: 'none', background: '#fff',
                transition: 'background .15s',
                overflow: 'hidden',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              {/* Color tab */}
              <div style={{ width: 4, alignSelf: 'stretch', background: color, flexShrink: 0 }} />

              {/* Text */}
              <div style={{ flex: 1, padding: '20px 24px' }}>
                <h2 style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '.35em', textTransform: 'uppercase', color: '#1a1014', marginBottom: 5 }}>
                  {col.name}
                </h2>
                <p style={{ fontSize: '8px', fontWeight: 300, letterSpacing: '.2em', color: '#a0a0a0' }}>
                  {desc} · {previews[col.slug]?.length ?? 0} pieces shown
                </p>
              </div>

              {/* Preview thumbnails */}
              <div style={{ display: 'flex', gap: 1, padding: '12px 16px', flexShrink: 0 }}>
                {previews[col.slug]?.map(art => (
                  <div key={art.id} style={{ width: 52, height: 52, position: 'relative', overflow: 'hidden', background: '#e6e6e6' }}>
                    <Image src={art.image_url} alt={art.title} fill className="object-cover" sizes="52px" />
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 3 - (previews[col.slug]?.length ?? 0)) }).map((_, k) => (
                  <div key={k} style={{ width: 52, height: 52, background: '#ebebeb' }} />
                ))}
              </div>

              {/* Arrow */}
              <div style={{ padding: '0 20px', fontSize: '11px', color: '#d0d0d0', flexShrink: 0 }}>→</div>
            </Link>
          )
        })}
      </div>

    </div>
  )
}
