'use client'
import Image from 'next/image'
import Link from 'next/link'
import type { Artwork } from '@/lib/types'

const categoryColors: Record<string, string> = {
  music:    '#7a3040',
  movies:   '#1e3a8a',
  comics:   '#1a6060',
  'bee-ben':'#4a3a7a',
  paper:    '#7a5020',
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
          <Image
            src={artwork.image_url}
            alt={artwork.title}
            fill
            className="object-contain"
            sizes="600px"
          />
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
          </div>
          <Link
            href={`/inquire?piece=${encodeURIComponent(artwork.title)}`}
            style={{
              flexShrink: 0,
              fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500,
              background: '#1a1014', color: '#faf8f5',
              padding: '10px 18px', textDecoration: 'none',
            }}
          >
            Inquire →
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
