'use client'
import Link from 'next/link'
import type { Artwork } from '@/lib/types'
import ArtFill from '@/components/ArtFill'

const categoryColors: Record<string, string> = {
  music:    '#7a3040',
  movies:   '#1e3a8a',
  comics:   '#1a6060',
  'bee-ben':'#4a3a7a',
  sketchbook: '#3d4f45',
}

type Props = {
  artwork: Artwork
  onClose: () => void
}

export default function Lightbox({ artwork, onClose }: Props) {
  const color = categoryColors[artwork.collection_slug] ?? '#1a1014'

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(26,16,20,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 600, background: '#fff', border: '1px solid #d0d0d0', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '1', width: '100%' }}>
          <ArtFill src={artwork.image_url} alt={artwork.title} sizes="600px" />
          {/* Category color stripe */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: color }} />
        </div>

        {/* Info bar */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #d0d0d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 400, color, marginBottom: 4 }}>
              {artwork.collection_slug}
              {artwork.medium ? ` · ${artwork.medium}` : ''}
              {artwork.year ? ` · ${artwork.year}` : ''}
            </p>
            <p style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 20, fontStyle: 'italic', fontWeight: 400, color: '#1a1014', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {artwork.title}
            </p>
            {artwork.instagram_url && (
              <a
                href={artwork.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:[color:#1a1014]"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8,
                  fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 400,
                  color: '#787878', textDecoration: 'none', transition: 'color .2s',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4.5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                View on Instagram ↗
              </a>
            )}
          </div>
          <Link
            href={artwork.prints_available === false
              ? `/inquire?piece=${encodeURIComponent(artwork.title)}`
              : `/inquire?piece=${encodeURIComponent(`Print — ${artwork.title}`)}`}
            style={{
              flexShrink: 0,
              fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500,
              background: '#1a1014', color: '#faf8f5',
              padding: '10px 18px', textDecoration: 'none',
            }}
          >
            {artwork.prints_available === false ? 'Inquire →' : 'Get a print →'}
          </Link>
        </div>
      </div>

      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 20, right: 24, fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Close ✕
      </button>
    </div>
  )
}
