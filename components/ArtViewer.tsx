'use client'
import { useEffect } from 'react'
import { useEdge } from '@/lib/useAspects'

/** Full-screen look at a whole artwork. Closes on ✕, Esc or a click outside the art. */
export default function ArtViewer({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  const edge = useEdge(src)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" aria-label={title} onClick={onClose}
         style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(14,10,12,.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '24px 16px', cursor: 'zoom-out', animation: 'vgb-fade .25s ease both' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={title} onClick={e => e.stopPropagation()}
           style={{ maxWidth: '100%', maxHeight: 'calc(100svh - 110px)', objectFit: 'contain', display: 'block', background: edge ?? '#fff', boxShadow: '0 30px 80px rgba(0,0,0,.55)', cursor: 'default' }} />
      <p style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontStyle: 'italic', fontSize: 20, color: '#fff' }}>{title}</p>
      <button type="button" onClick={onClose} aria-label="Close"
              style={{ position: 'absolute', top: 14, right: 18, background: 'none', border: 'none', color: '#fff', fontSize: 30, lineHeight: 1, cursor: 'pointer' }}>×</button>
    </div>
  )
}
