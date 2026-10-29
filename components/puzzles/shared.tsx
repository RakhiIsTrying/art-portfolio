'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'

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
         style={{ width: size, height: size, borderRadius: '50%', objectFit: 'contain', padding: '13%', boxSizing: 'border-box',
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
        <img src={art.image_url} alt={art.title} style={{ width: 72, height: 72, objectFit: 'contain', flexShrink: 0, background: '#f4f2ef' }} />
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

const HINT_COOLDOWN = 10 // seconds the hint button stays locked after each hint
const HINT_LOCK_KEY = 'vgb-puzzle:hint-locked-until'

/**
 * "Ask Ben" — gives a hint, then locks for 10 seconds.
 * `getHint` applies the hint (if it changes the board) and returns what Ben says.
 */
export function HintButton({ getHint, disabled }: { getHint: () => string | null; disabled?: boolean }) {
  const [message, setMessage] = useState<string | null>(null)
  const [wait, setWait] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  // The lock is shared by every puzzle and survives switching games or reloading
  const tick = () => {
    let until = 0
    try { until = Number(localStorage.getItem(HINT_LOCK_KEY)) || 0 } catch {}
    const left = Math.max(0, Math.ceil((until - Date.now()) / 1000))
    setWait(left)
    if (!left && timer.current) { clearInterval(timer.current); timer.current = null }
    return left
  }
  const startTicking = () => {
    if (timer.current) clearInterval(timer.current)
    timer.current = setInterval(tick, 250)
  }
  useEffect(() => {
    if (tick() > 0) startTicking()
    return () => { if (timer.current) clearInterval(timer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function ask() {
    if (tick() > 0 || disabled) return
    setMessage(getHint() ?? 'Hmm, nothing left to tell you — you’ve got this!')
    try { localStorage.setItem(HINT_LOCK_KEY, String(Date.now() + HINT_COOLDOWN * 1000)) } catch {}
    setWait(HINT_COOLDOWN)
    startTicking()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 16, width: 'min(100%, 420px)' }}>
      {message && (
        <div role="status" style={{ position: 'relative', alignSelf: 'stretch', background: '#fff', border: `1px solid ${BEE_BEN}`, padding: '10px 14px', fontSize: 13, color: INK, lineHeight: 1.5, textAlign: 'left' }}>
          <span style={{ fontSize: 9, letterSpacing: '.35em', textTransform: 'uppercase', color: BEE_BEN, display: 'block', marginBottom: 3 }}>Ben says</span>
          {message}
          <span aria-hidden style={{ position: 'absolute', bottom: -7, left: '50%', width: 12, height: 12, background: '#fff', borderRight: `1px solid ${BEE_BEN}`, borderBottom: `1px solid ${BEE_BEN}`, transform: 'translateX(-50%) rotate(45deg)' }} />
        </div>
      )}
      {disabled ? (
        <span style={{ padding: '9px 16px', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', border: '1px solid #d0d0d0', color: '#787878', background: '#fff' }}>
          ✓ Solved — no hints needed
        </span>
      ) : (
        <button type="button" onClick={ask} disabled={wait > 0}
          style={{ padding: '9px 16px', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontFamily: 'inherit',
                   cursor: wait > 0 ? 'not-allowed' : 'pointer', border: `1px solid ${HONEY}`, background: wait > 0 ? '#f4efe0' : HONEY, color: INK, opacity: wait > 0 ? .7 : 1 }}>
          {wait > 0 ? `Ben is thinking… ${wait}s` : '💡 Ask Ben for a hint'}
        </button>
      )}
    </div>
  )
}
