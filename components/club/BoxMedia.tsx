'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

/** Unboxing video + photo grid for one month, with a full-screen photo viewer. */
export default function BoxMedia({ month, videoUrl, photos }: { month: string; videoUrl: string | null; photos: string[] }) {
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen(i => (i! + 1) % photos.length)
      if (e.key === 'ArrowLeft')  setOpen(i => (i! - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, photos.length])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {videoUrl && (
        <div style={{ position: 'relative', background: '#1a1014' }}>
          <video src={videoUrl} controls playsInline preload="metadata" poster={photos[0]}
                 style={{ width: '100%', maxHeight: '70vh', display: 'block', background: '#1a1014' }} />
          <span style={{ position: 'absolute', top: 12, left: 12, padding: '5px 10px', fontSize: 9, letterSpacing: '.4em', textTransform: 'uppercase', background: '#fff', color: '#1a1014', pointerEvents: 'none' }}>
            ▶ Unboxing
          </span>
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4" style={{ gap: 6 }}>
          {photos.map((url, i) => (
            <button key={url} type="button" onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1}`}
                    className="group" style={{ position: 'relative', aspectRatio: '1', padding: 0, border: 'none', cursor: 'zoom-in', overflow: 'hidden', background: '#d0d0d0' }}>
              <Image src={url} alt={`${month} box, photo ${i + 1}`} fill sizes="(max-width: 640px) 33vw, 200px"
                     className="object-contain" />
            </button>
          ))}
        </div>
      )}

      {open !== null && (
        <div role="dialog" aria-modal="true" onClick={() => setOpen(null)}
             style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(26,16,20,.94)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 'min(92vw, 1000px)', height: '82vh' }} onClick={e => e.stopPropagation()}>
            <Image src={photos[open]} alt={`${month} box, photo ${open + 1}`} fill sizes="92vw" className="object-contain" />
          </div>
          {photos.length > 1 && (
            <>
              <ViewerButton side="left"  label="Previous" onClick={() => setOpen((open - 1 + photos.length) % photos.length)}>‹</ViewerButton>
              <ViewerButton side="right" label="Next"     onClick={() => setOpen((open + 1) % photos.length)}>›</ViewerButton>
            </>
          )}
          <p style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 10, letterSpacing: '.4em', color: 'rgba(255,255,255,.6)' }}>
            {open + 1} / {photos.length}
          </p>
          <button type="button" onClick={() => setOpen(null)} aria-label="Close"
                  style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer' }}>×</button>
        </div>
      )}
    </div>
  )
}

function ViewerButton({ side, label, onClick, children }: { side: 'left' | 'right'; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={e => { e.stopPropagation(); onClick() }}
            style={{ position: 'absolute', [side]: 12, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer' }}>
      {children}
    </button>
  )
}
