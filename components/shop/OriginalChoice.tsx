'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Artwork } from '@/lib/types'

/** For an original: ask whether they want to enquire about the original or shop prints of it. */
export default function OriginalChoice({ artwork, children }: { artwork: Artwork; children: (open: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const printable = artwork.prints_available !== false
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const choice: React.CSSProperties = { display: 'block', padding: '14px 16px', textDecoration: 'none', textAlign: 'left' }
  return (
    <>
      {children(() => setOpen(true))}
      {open && (
        <div role="dialog" aria-modal="true" aria-label={`${artwork.title}: buy or ask`} onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(26,16,20,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 400, background: '#fff', boxShadow: '0 24px 60px rgba(0,0,0,.35)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 16, borderBottom: '1px solid #ebe8e8' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={artwork.image_url} alt="" style={{ width: 64, height: 64, objectFit: 'contain', background: '#f4f2ef', flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#b0552f', marginBottom: 4 }}>Original · 1/1</p>
                <p style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontStyle: 'italic', fontSize: 20, lineHeight: 1.2, color: '#1a1014', whiteSpace: 'normal' }}>{artwork.title}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: 20, lineHeight: 1, cursor: 'pointer', color: '#787878' }}>×</button>
            </div>
            <p style={{ padding: '14px 16px 4px', fontSize: 13, color: '#787878' }}>What would you like to do?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 16px 16px' }}>
              <Link href={`/inquire?piece=${encodeURIComponent(`Original: ${artwork.title}`)}`} style={{ ...choice, background: '#1a1014', color: '#fff' }}>
                <span style={{ display: 'block', fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 500 }}>Ask about the original →</span>
                <span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 4, whiteSpace: 'normal' }}>The hand-made piece itself. I’ll reply with the price.</span>
              </Link>
              {printable && (
                <Link href={`/shop?piece=${encodeURIComponent(artwork.title)}#prints`} style={{ ...choice, border: '1px solid #1a1014', color: '#1a1014' }}>
                  <span style={{ display: 'block', fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 500 }}>Shop prints &amp; cards →</span>
                  <span style={{ display: 'block', fontSize: 12, color: '#787878', marginTop: 4, whiteSpace: 'normal' }}>Order a print or greeting card of this piece.</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
