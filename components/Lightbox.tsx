'use client'
import Link from 'next/link'
import type { Artwork } from '@/lib/types'
import BigArt from '@/components/BigArt'

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

const buyStyle: React.CSSProperties = {
  flex: '1 1 auto', textAlign: 'center', whiteSpace: 'nowrap', fontSize: 11, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500,
  background: '#1a1014', color: '#faf8f5', padding: '12px 18px', textDecoration: 'none',
}

/** The gallery's big look at one piece, with its name and the ask / buy buttons. */
export default function Lightbox({ artwork, onClose }: Props) {
  const color = categoryColors[artwork.collection_slug] ?? '#1a1014'

  return (
    <BigArt
      src={artwork.image_url} title={artwork.title} color={color} onClose={onClose}
      sharePath={`/gallery/${artwork.collection_slug}?art=${artwork.id}`}
      label={<>
        {artwork.collection_slug}
        {artwork.medium ? ` · ${artwork.medium}` : ''}
        {artwork.year ? ` · ${artwork.year}` : ''}
      </>}
      extra={artwork.instagram_url && (
        <a
          href={artwork.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          className="vgb-tap hover:[color:#1a1014]"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8,
            fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 400,
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
    >
      {/* What visitors can buy follows Admin → Arrange art → "In the shop" */}
      {artwork.original_available && (
        <Link href={`/inquire?piece=${encodeURIComponent(`Original: ${artwork.title}`)}`} style={{ ...buyStyle, background: '#7a3040' }}>
          Buy the original →
        </Link>
      )}
      {artwork.prints_available !== false && (
        <Link href={`/inquire?piece=${encodeURIComponent(`Print: ${artwork.title}`)}`} style={buyStyle}>
          Get a print →
        </Link>
      )}
      {artwork.prints_available === false && !artwork.original_available && (
        <span style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: '#787878', padding: '10px 0' }}>Display only</span>
      )}
    </BigArt>
  )
}
