'use client'

import Link from 'next/link'

const categories = [
  { label: 'Music',   color: '#7a3040', href: '/gallery?cat=music'   },
  { label: 'Movies',  color: '#1e3a8a', href: '/gallery?cat=movies'  },
  { label: 'Comics',  color: '#1a6060', href: '/gallery?cat=comics'  },
  { label: 'Paper',   color: '#7a5020', href: '/gallery?cat=paper'   },
]

export default function Hero() {
  return (
    <section style={{
      display: 'grid',
      gridTemplateColumns: '52px 1fr 1fr',
      height: 'calc(100svh - 44px - 38px)',
      minHeight: '420px',
      maxHeight: '660px',
      background: '#e6e6e6',
    }}>

      {/* Sidebar — one coloured stripe per category */}
      <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #d0d0d0', overflow: 'hidden' }}>
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
              fontSize: '6.5px', letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 300,
              transform: 'rotate(180deg)',
              color: 'rgba(255,255,255,.7)',
            }}>
              {cat.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Art panel */}
      <div style={{ position: 'relative', borderRight: '1px solid #d0d0d0', overflow: 'hidden', background: '#141010' }}>
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

        <span style={{
          position: 'absolute', top: 18, left: 18,
          fontSize: '7px', letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 400,
          color: 'rgba(255,255,255,.28)',
        }}>
          Latest Work
        </span>

        {/* Glowing rose dot */}
        <span style={{
          position: 'absolute', top: 16, right: 18,
          width: 7, height: 7, borderRadius: '50%',
          background: '#7a3040',
          boxShadow: '0 0 12px rgba(122,48,64,.6)',
          display: 'block',
        }} />

        <span style={{
          position: 'absolute', bottom: 18, right: 18,
          fontSize: '12px', fontWeight: 300, letterSpacing: '.1em',
          color: 'rgba(255,255,255,.14)',
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
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        background: '#e6e6e6',
      }}>
        <div>
          <p style={{
            fontSize: '7px', letterSpacing: '.55em', textTransform: 'uppercase', fontWeight: 400,
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
            fontSize: '10px', lineHeight: 1.8, fontWeight: 300, color: '#787878',
            marginBottom: 20,
          }}>
            Pop culture art — music, cinema and comics,<br />
            through an original hand-crafted lens.
          </p>
        </div>

        {/* Category tag chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {categories.map(({ label, color, href }) => (
            <Link
              key={label}
              href={href}
              style={{
                display: 'flex', alignItems: 'stretch', overflow: 'hidden',
                textDecoration: 'none',
              }}
            >
              <div style={{ width: 10, flexShrink: 0, background: color }} />
              <div style={{
                padding: '7px 12px',
                fontSize: '8px', letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300,
                color: '#1a1014', borderBottom: '1px solid #d0d0d0', flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#e6e6e6',
              }}>
                {label}
                <span style={{ fontSize: '7px', fontWeight: 300, color: '#a0a0a0', letterSpacing: '.1em' }}>
                  →
                </span>
              </div>
            </Link>
          ))}

          <div style={{ marginTop: 16 }}>
            <Link
              href="/gallery"
              style={{
                display: 'inline-block',
                fontSize: '8px', letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 400,
                color: '#1a1014', borderBottom: '1px solid #1a1014', paddingBottom: 1,
                textDecoration: 'none',
              }}
            >
              View Full Gallery →
            </Link>
          </div>
        </div>
      </div>

    </section>
  )
}
