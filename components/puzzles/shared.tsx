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

export const DUG_DUG = '/puzzles/dugdug.png'   // Dug-Dug's cut-out, from Happy Pupper Dug-Dug

/** Dug-Dug's cut-out. `ring` outlines him (e.g. red when two pups clash). */
export function DugDug({ size, ring }: { size: number | string; ring?: string }) {
  const outline = ring ?? '#fff'
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={DUG_DUG} alt="Dug-Dug" draggable={false}
         style={{ width: size, height: size, objectFit: 'contain', display: 'block', pointerEvents: 'none',
                  filter: `drop-shadow(1px 0 0 ${outline}) drop-shadow(-1px 0 0 ${outline}) drop-shadow(0 1px 0 ${outline}) drop-shadow(0 -1px 0 ${outline}) drop-shadow(0 3px 4px rgba(26,16,20,.3))` }} />
  )
}

export function SolvedBanner({ title, detail, artIndex = 0 }: { title: string; detail?: string; artIndex?: number }) {
  const { arts } = useTheme()
  const art = arts.length ? arts[artIndex % arts.length] : null
  return (
    <div style={{ marginTop: 22, width: 'min(100%, 520px)', background: '#fff', border: `1px solid #d0d0d0`, borderTop: `3px solid ${BEE_BEN}`, display: 'flex', alignItems: 'center', gap: 14, padding: 14, textAlign: 'left' }}>
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

/** Keeps names like “Dug-Dug” from splitting across two lines (non-breaking hyphen). */
const keepTogether = (node: React.ReactNode): React.ReactNode =>
  typeof node === 'string' ? node.replace(/Dug-Dug/g, 'Dug\u2011Dug') : Array.isArray(node) ? node.map(keepTogether) : node

export function Rules({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12.5, lineHeight: 1.7, fontWeight: 300, color: '#787878', margin: '0 auto 18px', maxWidth: 780, textAlign: 'center' }}>{keepTogether(children)}</p>
}

export function SmallButton({ onClick, children, dark, bee }: { onClick: () => void; children: React.ReactNode; dark?: boolean; bee?: keyof typeof BEE_LINES }) {
  return (
    <button type="button" onClick={() => { onClick(); if (bee) callBee(bee) }}
      style={{ padding: '9px 14px', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer',
               border: `1px solid ${dark ? BEE_BEN : INK}`, background: dark ? BEE_BEN : '#fff', color: dark ? '#fff' : INK }}>
      {children}
    </button>
  )
}

const HINT_COOLDOWN = 10 // seconds the hint button stays locked after each hint
const HINT_LOCK_KEY = 'vgb-puzzle:hint-locked-until'
const BEN = '/puzzles/ben.png'   // Ben's cut-out, from his Cozy Portrait
export const BEN_IMG = BEN
const AUTUMN = '#a0521d'
const AUTUMN_DARK = '#7a3b16'

const HINTS_PER_REVEAL = 3 // every 3 hints unlock one reveal

type HintProps = {
  date: string
  game: string
  /** Gives a clue (without changing the board) and returns what Ben says; `n` = hints given so far, to vary the clue */
  getHint: (n: number) => string | null
  /** Does one step of the answer and returns what Dug-Dug says */
  getReveal: () => string | null
  disabled?: boolean
}

/**
 * "Ask Ben" gives a clue, then locks for 10 seconds (shared by every puzzle).
 * Every 3 hints unlock a "Reveal" from Dug-Dug, which does one step of the answer.
 */
export function HintButton({ date, game, getHint, getReveal, disabled }: HintProps) {
  const [said, setSaid] = useState<{ who: 'ben' | 'dug'; text: string } | null>(null)
  const [wait, setWait] = useState(0)
  const [count, setCount] = useState(0)
  const [used, setUsed] = useDailyState(date, `${game}-help`, { hints: 0, reveals: 0 })
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const revealsReady = Math.floor(used.hints / HINTS_PER_REVEAL) - used.reveals
  const toNext = HINTS_PER_REVEAL - (used.hints % HINTS_PER_REVEAL)

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
    setSaid({ who: 'ben', text: getHint(used.hints) ?? 'Hmm, nothing left to tell you — you’ve got this!' })
    setCount(c => c + 1)
    setUsed(u => ({ ...u, hints: u.hints + 1 }))
    try { localStorage.setItem(HINT_LOCK_KEY, String(Date.now() + HINT_COOLDOWN * 1000)) } catch {}
    setWait(HINT_COOLDOWN)
    startTicking()
  }

  function reveal() {
    if (revealsReady < 1 || disabled) return
    setSaid({ who: 'dug', text: getReveal() ?? 'Woof! Nothing left to reveal.' })
    setCount(c => c + 1)
    setUsed(u => ({ ...u, reveals: u.reveals + 1 }))
  }

  const dug = said?.who === 'dug'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 18, width: 'min(100%, 520px)' }}>
      {said && (
        // Pops out each time someone speaks (the key restarts the animation)
        <div key={count} role="status" className="vgb-motion"
             style={{ position: 'relative', alignSelf: 'stretch', marginTop: 34, padding: '14px 16px 14px 96px', textAlign: 'left',
                      background: dug ? `linear-gradient(135deg, ${BEE_BEN} 0%, #2f2452 100%)` : `linear-gradient(135deg, ${AUTUMN} 0%, ${AUTUMN_DARK} 100%)`,
                      color: '#fbf1e4', boxShadow: '0 14px 30px rgba(26,16,20,.3)', borderRadius: 4,
                      transformOrigin: '50% 100%', animation: 'vgb-pop .45s cubic-bezier(.2,1.4,.4,1) both' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dug ? DUG_DUG : BEN} alt={dug ? 'Dug-Dug' : 'Ben'}
               style={{ position: 'absolute', left: 6, bottom: 0, height: dug ? 92 : 108, filter: 'drop-shadow(0 0 2px #fbf1e4) drop-shadow(0 6px 10px rgba(0,0,0,.25))' }} />
          <span style={{ fontSize: 9, letterSpacing: '.35em', textTransform: 'uppercase', color: dug ? HONEY : '#f3c98b', display: 'block', marginBottom: 4 }}>
            {dug ? 'Dug-Dug reveals' : 'Ben says'}
          </span>
          <span style={{ fontSize: 13, lineHeight: 1.55 }}>{said.text}</span>
          <span aria-hidden style={{ position: 'absolute', bottom: -7, left: '50%', width: 14, height: 14, background: dug ? '#2f2452' : AUTUMN_DARK, transform: 'translateX(-50%) rotate(45deg)' }} />
        </div>
      )}
      {disabled ? (
        <span style={{ padding: '9px 16px', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', border: '1px solid #d0d0d0', color: '#787878', background: '#fff' }}>
          ✓ Solved — no hints needed
        </span>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            <button type="button" onClick={ask} disabled={wait > 0} className="hover:-translate-y-0.5"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 18px 6px 8px', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontFamily: 'inherit',
                       cursor: wait > 0 ? 'not-allowed' : 'pointer', border: 'none', borderRadius: 999,
                       background: wait > 0 ? '#ead9c6' : AUTUMN, color: wait > 0 ? AUTUMN_DARK : '#fbf1e4', boxShadow: wait > 0 ? 'none' : '0 6px 16px rgba(122,59,22,.3)', transition: 'transform .15s, background .3s' }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#fbf1e4', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BEN} alt="" style={{ height: 40, marginBottom: -4, filter: wait > 0 ? 'grayscale(1)' : 'none' }} />
              </span>
              {wait > 0 ? `Ben is thinking… ${wait}s` : 'Ask Ben for a hint'}
            </button>

            {revealsReady > 0 && (
              <button type="button" onClick={reveal} className="hover:-translate-y-0.5 vgb-motion"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 18px 4px 6px', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontFamily: 'inherit',
                         cursor: 'pointer', border: 'none', borderRadius: 999, background: BEE_BEN, color: '#fff', boxShadow: '0 6px 16px rgba(74,58,122,.35)',
                         transition: 'transform .15s', animation: 'vgb-pop .45s cubic-bezier(.2,1.4,.4,1) both' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={DUG_DUG} alt="" style={{ height: 38, filter: 'drop-shadow(0 0 1px #fff)' }} />
                Reveal{revealsReady > 1 ? ` ×${revealsReady}` : ''}
              </button>
            )}
          </div>
          {revealsReady < 1 && (
            <p style={{ fontSize: 10, letterSpacing: '.2em', color: '#a0a0a0' }}>
              🐾 Dug-Dug’s reveal unlocks in {toNext} more {toNext === 1 ? 'hint' : 'hints'}
            </p>
          )}
        </>
      )}
    </div>
  )
}

// ── Bee calls out every erase / reset ─────────────────────────────────────
export const BEE = '/puzzles/bee.png'   // Bee's cut-out, from the Day 2 "Me & Dug-Dug" drawing
export const BEE_LINES = {
  erase: ['Erased! Pick another one.', 'Poof — gone!', 'Rubbed it out for you.'],
  reset: ['Fresh start! You’ve got this.', 'Wiped clean — round two!', 'Back to the beginning!'],
  clear: ['Board cleared — Dug-Dug’s waiting!', 'All clear!', 'Clean slate, let’s go!'],
  undo:  ['Back one step!', 'Rewind!', 'Oops, undone.'],
}

/** Ask Bee to pop up and call out an action (shown by <BeeCallout />). */
export function callBee(kind: keyof typeof BEE_LINES) {
  const lines = BEE_LINES[kind]
  window.dispatchEvent(new CustomEvent('vgb-bee', { detail: lines[Math.floor(Math.random() * lines.length)] }))
}

export function BeeCallout() {
  const [said, setSaid] = useState<{ text: string; n: number } | null>(null)
  const hide = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const onBee = (e: Event) => {
      const text = (e as CustomEvent<string>).detail
      setSaid(prev => ({ text, n: (prev?.n ?? 0) + 1 }))
      if (hide.current) clearTimeout(hide.current)
      hide.current = setTimeout(() => setSaid(null), 2400)
    }
    window.addEventListener('vgb-bee', onBee)
    return () => { window.removeEventListener('vgb-bee', onBee); if (hide.current) clearTimeout(hide.current) }
  }, [])
  if (!said) return null
  return (
    <div key={said.n} aria-live="polite" className="vgb-motion"
         style={{ position: 'fixed', right: 16, bottom: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', gap: 4, pointerEvents: 'none',
                  animation: 'vgb-bee-in .4s cubic-bezier(.2,1.3,.4,1) both' }}>
      <div style={{ marginBottom: 96, padding: '10px 14px', maxWidth: 200, background: '#fff', color: INK, fontSize: 13, lineHeight: 1.4,
                    border: `2px solid ${BEE_BEN}`, borderRadius: 14, borderBottomRightRadius: 2, boxShadow: '0 10px 24px rgba(26,16,20,.18)' }}>
        <span style={{ display: 'block', fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: BEE_BEN, marginBottom: 2 }}>Bee</span>
        {said.text}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BEE} alt="Bee" style={{ height: 170, display: 'block', filter: 'drop-shadow(0 6px 12px rgba(26,16,20,.25))' }} />
    </div>
  )
}
