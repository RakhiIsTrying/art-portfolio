'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import type { Artwork } from '@/lib/types'
import ArtFill from '@/components/ArtFill'
import { useAspect } from '@/lib/useAspects'

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

/**
 * A big look at one piece: the whole artwork as large as the screen allows, with its
 * name and the ask / buy buttons underneath. Closes on ✕, Esc or a click outside.
 */
export default function Lightbox({ artwork, onClose }: Props) {
  const color = categoryColors[artwork.collection_slug] ?? '#1a1014'
  // The art's own shape (width ÷ height), so the picture is never cropped
  const aspect = useAspect(artwork.image_url) ?? 1

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div
      role="dialog" aria-modal="true" aria-label={artwork.title}
      className="vgb-lb"
      style={{ '--lb-aspect': aspect, position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(14,10,12,.94)', display: 'flex', overflowY: 'auto', animation: 'vgb-fade .25s ease both' } as React.CSSProperties}
      onClick={onClose}
    >
      {/* Sizes and the side-by-side layout on wide screens live in globals.css (.vgb-lb) */}
      <div
        className="vgb-lb-card"
        style={{ margin: 'auto', background: '#fff', boxShadow: '0 30px 80px rgba(0,0,0,.55)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* The artwork, whole */}
        <div className="vgb-lb-art" style={{ position: 'relative' }}>
          <ArtFill src={artwork.image_url} alt={artwork.title} sizes="(max-width: 700px) 100vw, 1320px" priority />
        </div>

        {/* Name and buttons: beside the art on wide screens, underneath it on phones */}
        <div className="vgb-lb-info" style={{ borderColor: color }}>
          <div className="vgb-lb-text">
            <p style={{ fontSize: 11, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 400, color, marginBottom: 4 }}>
              {artwork.collection_slug}
              {artwork.medium ? ` · ${artwork.medium}` : ''}
              {artwork.year ? ` · ${artwork.year}` : ''}
            </p>
            <p style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 20, fontStyle: 'italic', fontWeight: 400, color: '#1a1014', lineHeight: 1.2 }}>
              {artwork.title}
            </p>
            {artwork.instagram_url && (
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
          </div>
          {/* What visitors can buy follows Admin → Arrange art → "In the shop" */}
          <div className="vgb-lb-buy">
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
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={e => { e.stopPropagation(); onClose() }}
        style={{ position: 'fixed', top: 6, right: 8, padding: '12px 14px', fontSize: 11, letterSpacing: '.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,.8)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Close ✕
      </button>
    </div>
  )
}
