'use client'

import Link from 'next/link'
import type { Artwork } from '@/lib/types'
import type { Cutout } from '@/lib/settings'
import ArtFill from '@/components/ArtFill'

const categories = [
  { label: 'Music',   color: '#7a3040', href: '/gallery/music'   },
  { label: 'Movies',  color: '#1e3a8a', href: '/gallery/movies'  },
  { label: 'Comics',  color: '#1a6060', href: '/gallery/comics'  },
  { label: 'Sketch',  color: '#3d4f45', href: '/gallery/sketchbook'  },
]

type HeroProps = {
  latest?: Artwork
  label?: string
  /** Numbers for the tiles: total works, cheapest print, Print Club price */
  stats?: { works: number; printFrom: string; clubPrice: string }
  cutouts?: Record<string, Cutout | null>
  /** Front-page Originals tile: the featured original (shown whole, framed) and a flower cut-out */
  originalsTile?: { featured: { title: string; url: string } | null; flower: Cutout | null }
  /** Cut-out on the front-page Prints & cards tile */
  printsCutout?: Cutout | null
}

export default function Hero({ latest, label = 'Latest Work', stats, cutouts, originalsTile, printsCutout }: HeroProps) {
  return (
    // Phones: art on top at full width, words underneath. Tablets and up: side by side.
    <section className="grid grid-cols-1 md:grid-cols-[52px_1fr_1fr] md:h-[calc(100svh-82px)] md:min-h-[420px] md:max-h-[660px]"
      style={{ background: '#e6e6e6' }}>

      {/* Sidebar, one coloured stripe per category */}
      <div className="hidden md:flex" style={{ flexDirection: 'column', borderRight: '1px solid #d0d0d0', overflow: 'hidden' }}>
        {categories.map((cat, i) => (
          <Link
            key={cat.label}
            href={cat.href}
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: cat.color,
              textDecoration: 'none',
              transition: 'filter .2s',
              borderBottom: i < categories.length - 1 ? '1px solid rgba(255,255,255,.08)' : 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
          >
            <span style={{
              writingMode: 'vertical-rl',
              fontSize: 8, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 300,
              transform: 'rotate(180deg)',
              color: 'rgba(255,255,255,.7)',
            }}>
              {cat.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Art panel */}
      <div className="h-[min(110vw,560px)] md:h-auto" style={{ position: 'relative', borderRight: '1px solid #d0d0d0', overflow: 'hidden', background: '#141010' }}>
        {/* Atmospheric gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(ellipse at 55% 28%, rgba(122,48,64,.32) 0%, transparent 50%),
            radial-gradient(ellipse at 22% 72%, rgba(30,58,138,.28) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 65%, rgba(26,96,96,.25) 0%, transparent 45%),
            linear-gradient(148deg, #221218 0%, #0e1622 55%, #101c1c 100%)
          `,
        }} />

        {latest && (
          <Link href={`/gallery/${latest.collection_slug}`} aria-label={`${latest.title}, view collection`} className="group" style={{ position: 'absolute', inset: 0, display: 'block' }}>
            <ArtFill src={latest.image_url} alt={latest.title} priority sizes="(max-width: 768px) 100vw, 50vw" fallback="transparent" />
            {/* Scrims keep the labels legible over any artwork */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(20,16,16,.55) 0%, transparent 22%, transparent 70%, rgba(20,16,16,.75) 100%)' }} />
            <p style={{
              position: 'absolute', bottom: 22, left: 18, right: 70,
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: 20, fontStyle: 'italic', fontWeight: 400, color: '#fff', lineHeight: 1.2,
            }}>
              {latest.title}
            </p>
          </Link>
        )}

        <span style={{
          position: 'absolute', top: 18, left: 18, pointerEvents: 'none',
          fontSize: 9, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 400,
          color: latest ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.28)',
        }}>
          {label}
        </span>

        {/* Glowing rose dot */}
        <span style={{
          position: 'absolute', top: 16, right: 18, pointerEvents: 'none',
          width: 7, height: 7, borderRadius: '50%',
          background: '#7a3040',
          boxShadow: '0 0 12px rgba(122,48,64,.6)',
          display: 'block',
        }} />

        <span style={{
          position: 'absolute', bottom: 18, right: 18, pointerEvents: 'none',
          fontSize: 12, fontWeight: 300, letterSpacing: '.1em',
          color: latest ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.14)',
        }}>
          2026
        </span>

        {/* Category stripe at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #7a3040 25%, #1e3a8a 25% 50%, #1a6060 50% 75%, #7a5020 75%)',
        }} />
      </div>

      {/* Content panel */}
      <div style={{
        padding: '28px 26px 22px',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
        background: '#e6e6e6',
      }}>
        <div>
          <p style={{
            fontSize: 10, letterSpacing: '.55em', textTransform: 'uppercase', fontWeight: 400,
            color: '#7a3040', marginBottom: 10,
          }}>
            ✦ Welcome to the studio
          </p>

          <h1>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 700,
              lineHeight: .95, textTransform: 'uppercase', letterSpacing: '.04em',
              color: '#1a1014',
            }}>
              Van Gone
            </span>
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 400, fontStyle: 'italic',
              lineHeight: 1.05, color: '#b07880',
            }}>
              Broke
            </span>
          </h1>

          <div style={{ width: 28, height: 1, background: '#7a3040', margin: '16px 0' }} />

          <p style={{
            fontSize: 13, lineHeight: 1.8, fontWeight: 300, color: '#787878',
            marginBottom: 20,
          }}>
            Pop culture art: music, cinema and comics, through an original hand-crafted lens.
          </p>
        </div>

        {/* Where to next, four colour tiles, each with a cut-out peeking in */}
        <div className="grid grid-cols-2 grid-rows-3" style={{ gap: 8, marginTop: 22, flex: 1, minHeight: 300 }}>
          {[
            { href: '/originals', label: 'Originals for sale', sub: 'One of one, ask for price', color: '#b0552f', img: cutouts?.['bee-ben']?.url, extra: true },
            { href: '/gallery', label: 'Explore the gallery', sub: stats ? `${stats.works} works` : 'All collections', color: '#7a3040', img: cutouts?.music?.url ?? cutouts?.comics?.url },
            { href: '/shop', label: 'Prints & cards', sub: stats ? `From ${stats.printFrom}` : 'Originals & prints', color: '#1a1014', img: printsCutout?.url ?? cutouts?.comics?.url },
            { href: '/print-club', label: 'Print Club', sub: stats ? `${stats.clubPrice} / month` : 'A print every month', color: '#9a5a64', img: cutouts?.movies?.url ?? cutouts?.comics?.url },
            { href: '/puzzles', label: 'Daily puzzles', sub: '5 new every day', color: '#4a3a7a', img: '/puzzles/dugdug.png', friends: true },
          ].map(t => (
            <Link key={t.href} href={t.href} className={`group ${'extra' in t ? 'col-span-2' : ''}`}
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 110,
                       padding: '12px 14px', background: t.color, color: '#fff', textDecoration: 'none', overflow: 'hidden' }}>
              {/* Puzzles tile: Bee, Ben and Dug-Dug together */}
              {'friends' in t && (
                <span aria-hidden className="vgb-motion transition-transform duration-500 group-hover:-translate-y-1" style={{ position: 'absolute', right: 8, top: 8, height: '72%', width: '64%', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                  {['/puzzles/bee.png', '/puzzles/ben.png', '/puzzles/dugdug.png'].map((src, k) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt="" style={{ height: k === 2 ? '72%' : '100%', marginLeft: k ? '-9%' : 0, objectFit: 'contain', filter: 'drop-shadow(0 6px 8px rgba(0,0,0,.35))', position: 'relative', zIndex: k === 2 ? 3 : 1 }} />
                  ))}
                </span>
              )}
              {/* Originals tile: the featured original, framed, with a flower beside it */}
              {'extra' in t && (
                <span aria-hidden className="vgb-motion transition-transform duration-500 group-hover:-translate-y-1" style={{ position: 'absolute', right: 8, top: 8, height: '84%', width: '58%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4%' }}>
                  {originalsTile?.featured && (
                    <span style={{ height: '92%', maxWidth: '52%', background: '#fff', padding: 4, transform: 'rotate(-3deg)', boxShadow: '0 8px 14px rgba(0,0,0,.35)', display: 'flex' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={originalsTile.featured.url} alt="" style={{ height: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </span>
                  )}
                  {originalsTile?.flower && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={originalsTile.flower.url} alt="" style={{ height: '100%', maxWidth: '44%', objectFit: 'contain', transform: 'rotate(3deg)', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,.35))' }} />
                  )}
                </span>
              )}
              {t.img && !('friends' in t) && !('extra' in t) && (
                // eslint-disable-next-line @next/next/no-img-element
                <span aria-hidden className="vgb-motion transition-transform duration-500 group-hover:-translate-y-1" style={{ position: 'absolute', right: 8, top: 8, height: '72%', width: '50%', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                  <img src={t.img} alt="" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 6px 8px rgba(0,0,0,.35))' }} />
                </span>
              )}
              <span style={{ position: 'relative', zIndex: 4, fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif', fontSize: 'clamp(14px, 1.5vw, 21px)', fontWeight: 700, lineHeight: 1.15, whiteSpace: 'nowrap', textShadow: '0 1px 8px rgba(0,0,0,.45)' }}>
                {t.label}
              </span>
              <span style={{ position: 'relative', zIndex: 4, fontSize: 10, letterSpacing: '.12em', color: 'rgba(255,255,255,.72)', marginTop: 3, display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                {t.sub}<span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

    </section>
  )
}
