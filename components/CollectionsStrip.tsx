'use client'
import Link from 'next/link'
import { COLLECTIONS } from '@/lib/collections'

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

export default function CollectionsStrip() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLLECTIONS.length}, 1fr)` }}>
      {COLLECTIONS.map((col) => {
        const color = categoryColors[col.slug] ?? '#1a1014'
        const desc  = categoryDesc[col.slug] ?? ''

        return (
          <Link
            key={col.slug}
            href={`/gallery/${col.slug}`}
            style={{
              position: 'relative',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              padding: '24px 20px 20px',
              minHeight: 180,
              background: color,
              borderRight: '1px solid rgba(255,255,255,.08)',
              textDecoration: 'none',
              overflow: 'hidden',
              transition: 'filter .2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.18)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
          >
            {/* Subtle radial glow */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.1) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />

            {/* Name */}
            <span style={{
              fontSize: '8px', fontWeight: 500, letterSpacing: '.4em', textTransform: 'uppercase',
              color: '#fff', display: 'block', marginBottom: 6, lineHeight: 1.3,
            }}>
              {col.name}
            </span>

            {/* Description */}
            <span style={{
              fontSize: '7px', fontWeight: 300, letterSpacing: '.15em',
              color: 'rgba(255,255,255,.5)', display: 'block',
            }}>
              {desc}
            </span>

            {/* Bottom arrow */}
            <span style={{
              position: 'absolute', bottom: 16, right: 16,
              fontSize: '10px', color: 'rgba(255,255,255,.35)',
            }}>
              →
            </span>
          </Link>
        )
      })}
    </div>
  )
}
