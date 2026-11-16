'use client'
import { useEffect } from 'react'
import ArtFill from '@/components/ArtFill'
import { useAspect } from '@/lib/useAspects'

type Props = {
  src: string
  title: string
  /** Small line above the name, e.g. "Sketchbook · Pencil · 2026" */
  label: React.ReactNode
  /** Colour of the label and of the line between the art and its name */
  color: string
  onClose: () => void
  /** Anything that sits under the name (a link, a short note) */
  extra?: React.ReactNode
  /** The ask / buy buttons */
  children: React.ReactNode
  /** Leaves more room under the art on phones, for buttons that carry a line of explanation */
  roomy?: boolean
}

/**
 * A big look at one piece: the whole artwork as large as the screen allows, with its name and
 * the ask / buy buttons beside it (wide screens) or underneath (phones).
 * Closes on Close, Esc or a click outside. Sizes live in globals.css (.vgb-lb).
 */
export default function BigArt({ src, title, label, color, onClose, extra, children, roomy }: Props) {
  // The art's own shape (width ÷ height), so the picture is never cropped
  const aspect = useAspect(src) ?? 1

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div
      role="dialog" aria-modal="true" aria-label={title}
      className={roomy ? 'vgb-lb vgb-lb-roomy' : 'vgb-lb'}
      style={{ '--lb-aspect': aspect, position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(14,10,12,.94)', display: 'flex', overflowY: 'auto', animation: 'vgb-fade .25s ease both' } as React.CSSProperties}
      onClick={onClose}
    >
      <div
        className="vgb-lb-card"
        style={{ margin: 'auto', background: '#fff', boxShadow: '0 30px 80px rgba(0,0,0,.55)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* The artwork, whole */}
        <div className="vgb-lb-art" style={{ position: 'relative' }}>
          <ArtFill src={src} alt={title} sizes="(max-width: 700px) 100vw, 1320px" priority />
        </div>

        <div className="vgb-lb-info" style={{ borderColor: color }}>
          <div className="vgb-lb-text">
            <p style={{ fontSize: 11, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 400, color, marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 20, fontStyle: 'italic', fontWeight: 400, color: '#1a1014', lineHeight: 1.2 }}>
              {title}
            </p>
            {extra}
          </div>
          <div className="vgb-lb-buy">{children}</div>
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
