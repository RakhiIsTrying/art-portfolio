'use client'
import { useState } from 'react'
import { shareLink } from '@/lib/nativeApp'

/** "Share" for one piece: the share sheet on phones and in the app, a copied link elsewhere. */
export default function ShareButton({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const result = await shareLink({ title, text: `${title}, by Van Gone Broke`, url: new URL(path, location.origin).toString() })
    if (result === 'copied') { setCopied(true); setTimeout(() => setCopied(false), 2200) }
  }
  return (
    <button type="button" onClick={share} className="vgb-tap hover:[color:#1a1014]"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, marginRight: 18, padding: 0, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
               fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 400, color: copied ? '#3f8f4f' : '#787878', transition: 'color .2s' }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 3v12M7 8l5-5 5 5M5 13v7h14v-7" />
      </svg>
      {copied ? 'Link copied ✓' : 'Share'}
    </button>
  )
}
