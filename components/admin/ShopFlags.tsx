'use client'
import { useState, useTransition } from 'react'
import { toggleShopFlag } from '@/app/admin/(shell)/artworks/actions'

type Field = 'prints_available' | 'original_available'

/** Prints / Original switches for one artwork. They flip straight away and save in the background. */
export default function ShopFlags({ id, prints, original }: { id: string; prints: boolean; original: boolean }) {
  const [on, setOn] = useState<Record<Field, boolean>>({ prints_available: prints, original_available: original })
  const [error, setError] = useState(false)
  const [, start] = useTransition()

  function flip(field: Field) {
    const next = !on[field]
    setOn(s => ({ ...s, [field]: next }))
    setError(false)
    start(async () => {
      try { await toggleShopFlag(id, field, next) }
      catch { setOn(s => ({ ...s, [field]: !next })); setError(true) }   // put it back if saving failed
    })
  }

  return (
    <>
      {([['prints_available', 'Prints'], ['original_available', 'Original']] as const).map(([field, label]) => (
        <button key={field} type="button" onClick={() => flip(field)} aria-pressed={on[field]}
          title={`${on[field] ? 'Remove from' : 'Add to'} shop`}
          style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 400, color: on[field] ? '#fff' : '#a0a0a0', background: on[field] ? '#1a1014' : 'none', border: `1px solid ${on[field] ? '#1a1014' : '#d0d0d0'}`, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
          {on[field] ? '✓ ' : ''}{label}
        </button>
      ))}
      {error && <span role="alert" style={{ fontSize: 11, color: '#7a3040' }}>Not saved, try again</span>}
    </>
  )
}
