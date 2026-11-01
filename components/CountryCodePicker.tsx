'use client'
import { useEffect, useRef, useState } from 'react'
import { flagOf, searchCountries, type Country } from '@/lib/countries'

/** The phone field's country code: opens a scrolling list you can search by country name. */
export default function CountryCodePicker({ value, onChange }: { value: Country; onChange: (c: Country) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const box = useRef<HTMLDivElement>(null)
  const matches = searchCountries(search)

  useEffect(() => {
    if (!open) return
    const outside = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', outside)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', outside); window.removeEventListener('keydown', onKey) }
  }, [open])

  const pick = (c: Country) => { onChange(c); setOpen(false); setSearch('') }

  return (
    <div ref={box} style={{ position: 'relative', flexShrink: 0 }}>
      <button type="button" onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open} aria-label={`Country code: ${value.name} ${value.dial}`}
        style={{ display: 'flex', alignItems: 'center', gap: 5, height: '100%', padding: '7px 8px 7px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #d0d0d0', fontFamily: 'inherit', fontSize: 13, fontWeight: 300, color: '#1a1014', cursor: 'pointer', whiteSpace: 'nowrap' }}>
        <span aria-hidden>{flagOf(value.iso)}</span>{value.dial}<span aria-hidden style={{ fontSize: 9, color: '#787878' }}>▾</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', left: 0, top: '100%', zIndex: 30, width: 270, maxWidth: 'calc(100vw - 72px)', background: '#fff', border: '1px solid #1a1014', boxShadow: '0 14px 30px rgba(26,16,20,.2)' }}>
          {/* 16px stops iPhones zooming in on focus */}
          <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search country" aria-label="Search country" autoComplete="off"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (matches[0]) pick(matches[0]) } }}
            style={{ width: '100%', padding: '9px 10px', border: 'none', borderBottom: '1px solid #d0d0d0', outline: 'none', fontFamily: 'inherit', fontSize: 16, fontWeight: 300, color: '#1a1014', background: 'transparent' }} />
          <ul role="listbox" aria-label="Countries" style={{ listStyle: 'none', maxHeight: 230, overflowY: 'auto', margin: 0, padding: 0 }}>
            {matches.map(c => (
              <li key={c.iso} role="option" aria-selected={c.iso === value.iso}>
                <button type="button" onClick={() => pick(c)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 10px', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: 13, fontWeight: 300, color: '#1a1014', background: c.iso === value.iso ? '#f3f0fa' : 'transparent' }}>
                  <span aria-hidden>{flagOf(c.iso)}</span>
                  <span style={{ flex: 1, minWidth: 0, whiteSpace: 'normal' }}>{c.name}</span>
                  <span style={{ color: '#787878' }}>{c.dial}</span>
                </button>
              </li>
            ))}
            {!matches.length && <li style={{ padding: '10px', fontSize: 12, fontWeight: 300, color: '#787878' }}>No country found</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
