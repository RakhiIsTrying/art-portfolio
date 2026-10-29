'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'
export const INK = '#1a1014'
export const BEE_BEN = '#4a3a7a'   // Bee, Ben & Dug-Dug purple
export const HONEY = '#e8c55a'
export const CENTERED: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }

/** Dug-Dug's portrait plus a pool of Bee-Ben drawings for the puzzles to use. */
export type Theme = { mascot: string | null; arts: { title: string; image_url: string }[] }
export const ThemeContext = createContext<Theme>({ mascot: null, arts: [] })
export const useTheme = () => useContext(ThemeContext)

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

/** Dug-Dug's face in a circle (falls back to a paw). */
export function DugDug({ size, ring }: { size: number | string; ring?: string }) {
  const { mascot } = useTheme()
  return mascot ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={mascot} alt="Dug-Dug" draggable={false}
         style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 18%',
                  background: '#fff', boxShadow: `0 0 0 2px ${ring ?? '#fff'}`, display: 'block', pointerEvents: 'none' }} />
  ) : <span style={{ fontSize: typeof size === 'number' ? size * .7 : size }}>🐾</span>
}

export function SolvedBanner({ title, detail, artIndex = 0 }: { title: string; detail?: string; artIndex?: number }) {
  const { arts } = useTheme()
  const art = arts.length ? arts[artIndex % arts.length] : null
  return (
    <div style={{ marginTop: 22, width: 'min(100%, 420px)', background: '#fff', border: `1px solid #d0d0d0`, borderTop: `3px solid ${BEE_BEN}`, display: 'flex', alignItems: 'center', gap: 14, padding: 14, textAlign: 'left' }}>
      {art && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art.image_url} alt={art.title} style={{ width: 72, height: 72, objectFit: 'cover', flexShrink: 0 }} />
      )}
      <div>
        <p style={{ fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 21, color: INK, lineHeight: 1.2 }}>{title}</p>
        {detail && <p style={{ fontSize: 12, fontWeight: 300, color: '#787878', marginTop: 4 }}>{detail}</p>}
        <p style={{ fontSize: 9, letterSpacing: '.35em', textTransform: 'uppercase', color: BEE_BEN, marginTop: 8 }}>🐾 New puzzle tomorrow</p>
      </div>
    </div>
  )
}

export function Rules({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12, lineHeight: 1.7, fontWeight: 300, color: '#787878', margin: '0 auto 18px', maxWidth: 440, textAlign: 'center' }}>{children}</p>
}

export function SmallButton({ onClick, children, dark }: { onClick: () => void; children: React.ReactNode; dark?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding: '9px 14px', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer',
               border: `1px solid ${dark ? BEE_BEN : INK}`, background: dark ? BEE_BEN : '#fff', color: dark ? '#fff' : INK }}>
      {children}
    </button>
  )
}
