import type { Metadata } from 'next'
import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { COLLECTIONS, categoryColors, categoryDesc } from '@/lib/collections'
import { arrange, getSettings, randomCutouts } from '@/lib/settings'
import type { Artwork } from '@/lib/types'
import ArtFill from '@/components/ArtFill'

// New cut-outs on every visit
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gallery — Van Gone Broke',
  description: 'Music, movies, comics & anime, Bee, Ben & Dug-Dug, and the sketchbook — every collection in one place.',
}

const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'
// Three pieces fanned out like prints on a table
const FAN = [
  { rotate: -10, x: '-34%', y: '8%', z: 1 },
  { rotate: 7,   x: '30%',  y: '4%', z: 2 },
  { rotate: -2,  x: '0%',   y: '-4%', z: 3 },
]

export default async function GalleryPage() {
  const supabase = await getSupabaseServerClient()
  const settings = await getSettings()
  const cutouts = await randomCutouts()
  const { data } = await supabase.from('artworks').select('*').order('created_at', { ascending: false })
  const all = (data ?? []) as Artwork[]
  const collections = COLLECTIONS.map(col => {
    const arranged = arrange(all.filter(a => a.collection_slug === col.slug), settings.artworkOrder[col.slug])
    return { ...col, pieces: arranged.slice(0, 3), total: arranged.length, color: categoryColors[col.slug] ?? '#1a1014', desc: categoryDesc[col.slug] ?? '', cut: cutouts[col.slug] }
  })

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-8 pt-8 sm:pt-12 pb-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5" style={{ marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: '.5em', textTransform: 'uppercase', color: '#7a3040', marginBottom: 12 }}>✦ Browse</p>
          <h1>
            <span style={{ display: 'block', fontFamily: PLAYFAIR, fontSize: 'clamp(42px, 7vw, 84px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', lineHeight: .92, color: '#1a1014' }}>The</span>
            <span style={{ display: 'block', fontFamily: PLAYFAIR, fontSize: 'clamp(42px, 7vw, 84px)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.02, color: '#b07880' }}>Gallery</span>
          </h1>
        </div>
        <div style={{ maxWidth: 380 }}>
          <p style={{ fontSize: 14, lineHeight: 1.8, fontWeight: 300, color: '#787878', marginBottom: 14 }}>
            {all.length} pieces across five collections — pop culture, original characters and a sketchbook of everything in between.
          </p>
          {/* Quick jump */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {collections.map(c => (
              <a key={c.slug} href={`/gallery/${c.slug}`}
                 style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#fff', border: '1px solid #e0dcdc', fontSize: 11, color: '#1a1014', textDecoration: 'none' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />{c.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Collections — the first one wide, the rest in pairs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {collections.map((c, i) => (
          <Link key={c.slug} href={`/gallery/${c.slug}`}
            className={`group grid ${i === 0 ? 'md:col-span-2 md:grid-cols-[1fr_1.1fr]' : ''}`}
            style={{ position: 'relative', background: c.color, color: '#fff', textDecoration: 'none', overflow: 'hidden', minHeight: i === 0 ? 360 : 320 }}>
            {/* Glow */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 75% 35%, rgba(255,255,255,.18) 0%, transparent 55%)' }} />

            {/* Words */}
            <div style={{ position: 'relative', zIndex: 4, padding: 'clamp(22px, 3vw, 34px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 18 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', marginBottom: 10 }}>
                  {String(i + 1).padStart(2, '0')} · {c.total} {c.total === 1 ? 'piece' : 'pieces'}
                </p>
                <h2 style={{ fontFamily: PLAYFAIR, fontSize: i === 0 ? 'clamp(28px, 4.4vw, 56px)' : 'clamp(22px, 2.5vw, 34px)', fontWeight: 700, lineHeight: 1.02, whiteSpace: 'nowrap', textShadow: '0 2px 14px rgba(0,0,0,.35)' }}>{c.name}</h2>
                <p style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,.72)', marginTop: 10 }}>{c.desc}</p>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500 }}>
                Explore <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </span>
            </div>

            {/* Fanned prints + cut-out */}
            <div className={i === 0 ? 'relative min-h-[300px]' : ''} style={i === 0 ? undefined : { position: 'absolute', right: 0, top: 0, bottom: 0, width: '52%' }}>
              {c.pieces.map((art, k) => {
                const f = FAN[k + (FAN.length - c.pieces.length)]
                return (
                  <div key={art.id} className="vgb-motion transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    style={{ position: 'absolute', left: '50%', top: '50%', width: i === 0 ? '36%' : '52%', aspectRatio: '4/5', zIndex: f.z,
                             transform: `translate(calc(-50% + ${f.x}), calc(-50% + ${f.y})) rotate(${f.rotate}deg)`,
                             background: '#fff', padding: '4%', boxShadow: '0 16px 34px rgba(0,0,0,.35)' }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <ArtFill src={art.image_url} sizes="240px" />
                    </div>
                  </div>
                )
              })}
              {c.cut && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.cut.url} alt={c.cut.title} title={c.cut.title}
                  className="vgb-motion transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:-rotate-2"
                  style={{ position: 'absolute', right: '2%', bottom: 0, zIndex: 5, height: i === 0 ? '78%' : '66%', maxWidth: '62%', objectFit: 'contain',
                           filter: 'drop-shadow(0 14px 18px rgba(0,0,0,.45))' }} />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
