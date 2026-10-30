'use client'
import Link from 'next/link'
import { COLLECTIONS, categoryColors, categoryDesc } from '@/lib/collections'
import type { Cutout } from '@/lib/settings'

/** Browse Collections: one colour block per collection, with a cut-out of its art popping out. */
export default function CollectionsStrip({ cutouts = {} }: { cutouts?: Record<string, Cutout | null> }) {
  return (
    // One per row on small phones, two on big phones / iPad portrait, three on iPad landscape, all five on computers
    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {COLLECTIONS.map((col) => {
        const color = categoryColors[col.slug] ?? '#1a1014'
        const desc  = categoryDesc[col.slug] ?? ''
        const cut = cutouts[col.slug]

        return (
          <Link
            key={col.slug}
            href={`/gallery/${col.slug}`}
            className="group"
            style={{
              position: 'relative',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              padding: '24px 20px 20px',
              minHeight: 260,
              background: color,
              borderRight: '1px solid rgba(255,255,255,.08)',
              textDecoration: 'none',
              overflow: 'hidden',
            }}
          >
            {/* Soft spotlight behind the cut-out */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,.22) 0%, rgba(255,255,255,.06) 38%, transparent 62%)',
            }} />

            {/* The cut-out */}
            {cut && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cut.url} alt={cut.title} title={cut.title}
                className="vgb-motion transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.04]"
                style={{
                  position: 'absolute', top: 14, left: 0, right: 0, margin: '0 auto',
                  height: 'calc(100% - 92px)', maxWidth: '88%', objectFit: 'contain',
                  filter: 'drop-shadow(0 14px 18px rgba(0,0,0,.35))',
                }} />
            )}

            {/* Name */}
            <span style={{
              position: 'relative',
              fontSize: 11, fontWeight: 500, letterSpacing: '.4em', textTransform: 'uppercase',
              color: '#fff', display: 'block', marginBottom: 6, lineHeight: 1.3, whiteSpace: 'normal',
            }}>
              {col.name}
            </span>

            {/* Description */}
            <span style={{
              position: 'relative',
              fontSize: 10, fontWeight: 300, letterSpacing: '.15em',
              color: 'rgba(255,255,255,.6)', display: 'block',
            }}>
              {desc}
            </span>

            <span className="transition-transform group-hover:translate-x-1" style={{ position: 'absolute', bottom: 18, right: 18, fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
              →
            </span>
          </Link>
        )
      })}
    </div>
  )
}
