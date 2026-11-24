'use client'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import type { Artwork } from '@/lib/types'
import BigArt from '@/components/BigArt'

const choice: React.CSSProperties = { flex: '1 1 auto', display: 'block', padding: '12px 16px', textDecoration: 'none', textAlign: 'left' }
const choiceTitle: React.CSSProperties = { display: 'block', fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 500 }
const choiceNote: React.CSSProperties = { display: 'block', fontSize: 12, marginTop: 4, whiteSpace: 'normal' }

/** For an original: shows the piece big, with the choice to ask about the original or shop prints of it. */
export default function OriginalChoice({ artwork, children }: { artwork: Artwork; children: (open: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const printable = artwork.prints_available !== false

  return (
    <>
      {children(() => setOpen(true))}
      {open && (
        <BigArt src={artwork.image_url} title={artwork.title} label="Original · 1/1" color="#b0552f" onClose={close} roomy
                sharePath={`/gallery/${artwork.collection_slug}?art=${artwork.id}`}>
          <Link href={`/inquire?piece=${encodeURIComponent(`Original: ${artwork.title}`)}`} onClick={close} style={{ ...choice, background: '#1a1014', color: '#fff' }}>
            <span style={choiceTitle}>Ask about the original →</span>
            <span style={{ ...choiceNote, color: 'rgba(255,255,255,.7)' }}>The hand-made piece itself. I’ll reply with the price.</span>
          </Link>
          {printable && (
            <Link href={`/shop?piece=${encodeURIComponent(artwork.title)}#prints`} onClick={close} style={{ ...choice, border: '1px solid #1a1014', color: '#1a1014' }}>
              <span style={choiceTitle}>Shop prints &amp; cards →</span>
              <span style={{ ...choiceNote, color: '#787878' }}>Order a print or greeting card of this piece.</span>
            </Link>
          )}
        </BigArt>
      )}
    </>
  )
}
