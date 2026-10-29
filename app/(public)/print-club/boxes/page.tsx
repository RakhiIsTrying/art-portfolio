import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { monthLabel } from '@/lib/printClubExport'
import { CATEGORY_COLORS } from '@/components/shop/ShopCard'
import BoxMedia from '@/components/club/BoxMedia'
import type { Artwork, ClubBox } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Club Boxes — Van Gone Broke Print Club',
  description: 'Every month’s Print Club box — photos, unboxing videos and the prints inside.',
}

const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'

export default async function ClubBoxesPage() {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.from('club_boxes').select('*').order('month', { ascending: false })
  const boxes = (data ?? []) as ClubBox[]

  const ids = [...new Set(boxes.flatMap(b => b.artwork_ids))]
  const { data: arts } = ids.length
    ? await supabase.from('artworks').select('*').in('id', ids)
    : { data: [] }
  const byId = new Map(((arts ?? []) as Artwork[]).map(a => [a.id, a]))

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }} className="px-5 md:px-9 pt-10 pb-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6" style={{ paddingBottom: 28, borderBottom: '1px solid #d0d0d0', marginBottom: 8 }}>
        <div>
          <Link href="/print-club" style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0', textDecoration: 'none', display: 'block', marginBottom: 14 }}>
            ← Print Club
          </Link>
          <h1>
            <span style={{ display: 'block', fontFamily: PLAYFAIR, fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', lineHeight: .95, color: '#1a1014' }}>
              Club
            </span>
            <span style={{ display: 'block', fontFamily: PLAYFAIR, fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.05, color: '#b07880' }}>
              Boxes
            </span>
          </h1>
        </div>
        <div style={{ maxWidth: 360 }}>
          <p style={{ fontSize: 13, lineHeight: 1.8, fontWeight: 300, color: '#787878', marginBottom: 14 }}>
            What went out to members each month: the prints, the packaging and the unboxing.
          </p>
          <Link href="/print-club" className="hover:[background:#7a3040]"
                style={{ display: 'inline-block', padding: '11px 18px', fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 500, background: '#1a1014', color: '#fff', textDecoration: 'none', transition: 'background .25s' }}>
            Join the club →
          </Link>
        </div>
      </div>

      {/* Month index */}
      {boxes.length > 1 && (
        <nav className="no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '16px 0' }}>
          {boxes.map(b => (
            <a key={b.id} href={`#${b.month}`}
               style={{ flexShrink: 0, padding: '7px 12px', border: '1px solid #d0d0d0', background: '#fff', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#1a1014', textDecoration: 'none' }}>
              {monthLabel(b.month)}
            </a>
          ))}
        </nav>
      )}

      {boxes.length === 0 && (
        <p style={{ fontSize: 11, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0', padding: '48px 0' }}>
          The first box is on its way — check back soon.
        </p>
      )}

      {boxes.map((box, bi) => {
        const [name, year] = monthLabel(box.month).split(' ')
        const inside = box.artwork_ids.map(id => byId.get(id)).filter((a): a is Artwork => !!a)
        return (
          <section key={box.id} id={box.month} className="grid md:grid-cols-[300px_1fr] gap-8 md:gap-12"
                   style={{ padding: '40px 0', borderBottom: bi < boxes.length - 1 ? '1px solid #d0d0d0' : 'none', scrollMarginTop: 80 }}>

            {/* Month + what was inside */}
            <div className="md:sticky md:top-24 self-start">
              <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040', marginBottom: 8 }}>
                Box № {String(boxes.length - bi).padStart(2, '0')}
              </p>
              <h2 style={{ marginBottom: 14 }}>
                <span style={{ fontFamily: PLAYFAIR, fontSize: 40, fontWeight: 400, fontStyle: 'italic', color: '#1a1014', lineHeight: 1 }}>{name}</span>
                <span style={{ marginLeft: 10, fontSize: 11, letterSpacing: '.4em', fontWeight: 300, color: '#a0a0a0' }}>{year}</span>
              </h2>
              {box.note && (
                <p style={{ fontSize: 13, lineHeight: 1.8, fontWeight: 300, color: '#787878', marginBottom: 20, whiteSpace: 'pre-line' }}>{box.note}</p>
              )}

              {inside.length > 0 && (
                <>
                  <p style={{ fontSize: 9, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#1a1014', paddingBottom: 8, borderBottom: '1px solid #d0d0d0' }}>
                    Prints in this box
                  </p>
                  <ul style={{ listStyle: 'none' }}>
                    {inside.map(art => (
                      <li key={art.id}>
                        <Link href={`/gallery/${art.collection_slug}?art=${art.id}`} className="group"
                              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #ebebeb', textDecoration: 'none' }}>
                          <span style={{ position: 'relative', width: 44, height: 44, flexShrink: 0, background: '#fff', borderLeft: `3px solid ${CATEGORY_COLORS[art.collection_slug] ?? '#1a1014'}` }}>
                            <Image src={art.image_url} alt="" fill sizes="44px" className="object-cover" />
                          </span>
                          <span style={{ flex: 1, fontSize: 13, color: '#1a1014' }}>{art.title}</span>
                          <span className="transition-transform group-hover:translate-x-1" style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#a0a0a0' }}>
                            Gallery →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Unboxing + photos */}
            {box.video_url || box.photo_urls.length ? (
              <BoxMedia month={monthLabel(box.month)} videoUrl={box.video_url} photos={box.photo_urls} />
            ) : (
              <p style={{ fontSize: 11, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0' }}>Photos coming soon.</p>
            )}
          </section>
        )
      })}
    </div>
  )
}
