'use client'
import { useEffect, useState } from 'react'

export const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'
export const INK = '#1a1014'

/** State saved in this browser for today's puzzle, so a refresh keeps progress. */
export function useDailyState<T>(date: string, game: string, initial: T) {
  const key = `vgb-puzzle:${date}:${game}`
  const [value, setValue] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw) setValue(JSON.parse(raw)) } catch {}
    setLoaded(true)
  }, [key])
  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  }, [key, value, loaded])
  return [value, setValue, loaded] as const
}

export function SolvedBanner({ title, detail }: { title: string; detail?: string }) {
  return (
    <div style={{ marginTop: 18, padding: '16px 20px', background: '#fff', border: '1px solid #d0d0d0', textAlign: 'center' }}>
      <p style={{ fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 22, color: INK }}>{title}</p>
      {detail && <p style={{ fontSize: 12, fontWeight: 300, color: '#787878', marginTop: 6 }}>{detail}</p>}
      <p style={{ fontSize: 9, letterSpacing: '.4em', textTransform: 'uppercase', color: '#a0a0a0', marginTop: 10 }}>New puzzle tomorrow</p>
    </div>
  )
}

export function Rules({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12, lineHeight: 1.7, fontWeight: 300, color: '#787878', marginBottom: 18, maxWidth: 460 }}>{children}</p>
}

export function SmallButton({ onClick, children, dark }: { onClick: () => void; children: React.ReactNode; dark?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding: '9px 14px', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer',
               border: `1px solid ${INK}`, background: dark ? INK : '#fff', color: dark ? '#fff' : INK }}>
      {children}
    </button>
  )
}
