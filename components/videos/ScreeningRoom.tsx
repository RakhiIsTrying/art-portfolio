'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Video } from '@/lib/types'
import VideoTile, { PLAYFAIR } from './VideoTile'
import VideoTheater from './VideoTheater'
import InstagramLink from './InstagramLink'

// Filter tabs, in display order — colours match the site's category stripes
const FILTERS = [
  { slug: 'movies',  label: 'Movie Art',         color: '#1e3a8a' },
  { slug: 'music',   label: 'Music',             color: '#7a3040' },
  { slug: 'comics',  label: 'Comics',            color: '#1a6060' },
  { slug: 'paper',   label: 'Paper Art',         color: '#7a5020' },
  { slug: 'bee-ben', label: 'Bee Ben & Dug-Dug', color: '#4a3a7a' },
]

export default function ScreeningRoom({ videos: all }: { videos: Video[] }) {
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState<number | null>(null)
  const featuredRef = useRef<HTMLVideoElement>(null)
  const featured = all[0]

  const tabs = FILTERS
    .map(f => ({ ...f, count: all.filter(v => v.category === f.slug).length }))
    .filter(f => f.count > 0)
  const videos = filter === 'all' ? all : all.filter(v => v.category === filter)

  const navigate = useCallback((delta: number) => {
    setOpen(i => (i === null ? i : (i + delta + videos.length) % videos.length))
  }, [videos.length])

  const openFeatured = () => {
    setFilter('all')
    setOpen(0)
  }
  const close = useCallback(() => setOpen(null), [])

  // The hero reel loops silently — unless the viewer prefers reduced motion,
  // and paused while the theater is open
  useEffect(() => {
    const v = featuredRef.current
    if (!v) return
    if (open !== null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) v.pause()
    else v.play().catch(() => {})
  }, [open])

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: `
        radial-gradient(ellipse at 78% 18%, rgba(122,48,64,.28) 0%, transparent 45%),
        radial-gradient(ellipse at 8% 60%, rgba(30,58,138,.22) 0%, transparent 45%),
        radial-gradient(ellipse at 90% 85%, rgba(26,96,96,.18) 0%, transparent 40%),
        #110d0f
      `,
    }}>
      {/* Category stripe */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #7a3040 25%, #1e3a8a 25% 50%, #1a6060 50% 75%, #7a5020 75%)' }} />

      <div style={{ maxWidth: 1240, margin: '0 auto' }} className="px-5 md:px-10 pt-12 md:pt-16 pb-20">

        {/* ── Now showing ── */}
        {featured && (
          <section className="grid md:grid-cols-[1fr_auto] items-center gap-10 md:gap-16" style={{ marginBottom: 72 }}>
            <div className="vgb-motion" style={{ animation: 'vgb-rise .9s cubic-bezier(.2,.7,.2,1) both' }}>
              <p style={{ fontSize: 10, letterSpacing: '.55em', textTransform: 'uppercase', fontWeight: 400, color: '#b07880', marginBottom: 18 }}>
                ✦ Watch · {String(all.length).padStart(2, '0')} reels
              </p>
              <h1 style={{ marginBottom: 24 }}>
                <span style={{
                  display: 'block', fontFamily: PLAYFAIR, fontWeight: 700, textTransform: 'uppercase',
                  fontSize: 'clamp(44px, 7vw, 96px)', lineHeight: .92, letterSpacing: '.03em', color: '#f3eeee',
                }}>
                  Moving
                </span>
                <span style={{
                  display: 'block', fontFamily: PLAYFAIR, fontWeight: 400, fontStyle: 'italic',
                  fontSize: 'clamp(44px, 7vw, 96px)', lineHeight: 1.05, color: '#b07880',
                }}>
                  Pictures
                </span>
              </h1>
              <p style={{ maxWidth: 420, fontSize: 14, lineHeight: 1.8, fontWeight: 300, color: 'rgba(255,255,255,.55)', marginBottom: 44 }}>
                Speed paints, fan art and the continuing adventures of Dug-Dug — drawn by hand, set in motion.
              </p>

              <div style={{ borderTop: '1px solid rgba(255,255,255,.12)', paddingTop: 22, maxWidth: 420 }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 9, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: 'rgba(255,255,255,.5)', marginBottom: 10 }}>
                  <span className="vgb-motion" style={{ width: 6, height: 6, borderRadius: '50%', background: '#b07880', boxShadow: '0 0 10px rgba(176,120,128,.8)', animation: 'vgb-pulse 1.8s ease-in-out infinite' }} />
                  Now showing
                </p>
                <p style={{ fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 26, lineHeight: 1.15, color: '#fff', marginBottom: 6 }}>
                  {featured.title}
                </p>
                {featured.description && (
                  <p style={{ fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,.5)', marginBottom: 20 }}>
                    {featured.description}
                  </p>
                )}
                <button
                  onClick={openFeatured}
                  className="hover:[background:#fff] hover:[color:#1a1014]"
                  style={{
                    fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 500,
                    color: '#fff', background: 'transparent', border: '1px solid rgba(255,255,255,.6)',
                    padding: '12px 20px', cursor: 'pointer', fontFamily: 'inherit', transition: 'background .25s, color .25s',
                  }}
                >
                  ▶&nbsp;&nbsp;Watch with sound
                </button>
                {featured.instagram_url && (
                  <div style={{ marginTop: 20 }}><InstagramLink href={featured.instagram_url} /></div>
                )}
              </div>
            </div>

            <button
              onClick={openFeatured}
              aria-label={`Play ${featured.title}`}
              className="group vgb-motion justify-self-center"
              style={{
                position: 'relative', padding: 0, border: 'none', cursor: 'pointer', background: '#000',
                height: 'clamp(380px, 68svh, 620px)', aspectRatio: '9/16', overflow: 'hidden',
                boxShadow: '0 50px 120px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.08)',
                animation: 'vgb-rise 1s .15s cubic-bezier(.2,.7,.2,1) both',
              }}
            >
              {featured.video_url ? (
                <video
                  ref={featuredRef}
                  src={featured.video_url}
                  poster={featured.thumbnail_url ?? undefined}
                  muted loop playsInline preload="auto"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : featured.thumbnail_url && (
                <Image src={featured.thumbnail_url} alt="" fill priority unoptimized className="object-cover" />
              )}
              <div className="vgb-motion opacity-0 group-hover:opacity-100" style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(14,10,12,.35)', transition: 'opacity .3s',
              }}>
                <span style={{
                  width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(255,255,255,.8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, paddingLeft: 4,
                  backdropFilter: 'blur(6px)',
                }}>
                  ▶
                </span>
              </div>
            </button>
          </section>
        )}

        {/* ── Filter tabs ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,.12)' }}>
          <div role="tablist" aria-label="Filter reels" className="no-scrollbar" style={{ display: 'flex', gap: 28, overflowX: 'auto' }}>
            {[{ slug: 'all', label: 'All Reels', color: '#b07880', count: all.length }, ...tabs].map(t => {
              const active = filter === t.slug
              return (
                <button
                  key={t.slug}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(t.slug)}
                  className="hover:[color:#fff]"
                  style={{
                    flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: 7,
                    padding: '0 0 13px', marginBottom: -1, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 11, fontWeight: 500, letterSpacing: '.35em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                    color: active ? '#fff' : 'rgba(255,255,255,.45)',
                    borderBottom: `2px solid ${active ? t.color : 'transparent'}`,
                    transition: 'color .2s, border-color .3s',
                  }}
                >
                  {t.label}
                  <span style={{ fontSize: 9, fontWeight: 300, letterSpacing: '.1em', color: active ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.3)' }}>
                    {String(t.count).padStart(2, '0')}
                  </span>
                </button>
              )
            })}
          </div>
          <span className="hidden lg:inline" style={{ flexShrink: 0, paddingBottom: 14, fontSize: 10, fontWeight: 300, letterSpacing: '.25em', color: 'rgba(255,255,255,.4)' }}>
            Hover to preview · click to watch
          </span>
        </div>

        <div key={filter} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {videos.map((v, i) => (
            <VideoTile key={v.id} video={v} index={i} onOpen={() => setOpen(i)} />
          ))}
        </div>
      </div>

      {open !== null && (
        <VideoTheater videos={videos} index={open} onClose={close} onNavigate={navigate} onSelect={setOpen} />
      )}
    </div>
  )
}
