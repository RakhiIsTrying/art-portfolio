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
    <div style={{ marginTop: 22, width: 'min(100%, 520px)', background: '#fff', border: `1px solid #d0d0d0`, borderTop: `3px solid ${BEE_BEN}`, display: 'flex', alignItems: 'center', gap: 14, padding: 14, justifyContent: 'center', textAlign: 'center' }}>
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

const HOST = {
  bee: { img: '/puzzles/bee.png', name: 'Bee', accent: '#e8c55a', ink: '#8a6414', wash: '#fdf6e3' },
  ben: { img: '/puzzles/ben.png', name: 'Ben', accent: '#a0521d', ink: '#7a3b16', wash: '#fbf1e6' },
  dug: { img: '/puzzles/dugdug.png', name: 'Dug-Dug', accent: '#4a3a7a', ink: '#4a3a7a', wash: '#f3f0fa' },
} as const

/** "How to play": a card hosted by Bee, Ben or Dug-Dug. Sits beside the puzzle on wide screens, above it otherwise. */
export function Rules({ who, title, intro, steps }: { who: keyof typeof HOST; title: string; intro?: React.ReactNode; steps: React.ReactNode[] }) {
  const h = HOST[who]
  return (
    <aside className="vgb-side-left" aria-label={`How to play ${title}`}
      style={{ position: 'relative', width: 'min(100%, 560px)', margin: '22px auto 22px', padding: '18px 18px 16px', background: h.wash,
               border: `1px solid ${h.accent}55`, borderTop: `4px solid ${h.accent}`, boxShadow: '0 10px 24px rgba(26,16,20,.07)', textAlign: 'left' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={h.img} alt={h.name} style={{ position: 'absolute', right: 8, top: -34, height: 62, filter: 'drop-shadow(0 0 2px #fff) drop-shadow(0 5px 8px rgba(26,16,20,.2))' }} />
      <p style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: h.ink, fontWeight: 600, paddingRight: 50, whiteSpace: 'nowrap' }}>How to play</p>
      <p style={{ fontFamily: PLAYFAIR, fontSize: 'clamp(19px, 1.6vw, 22px)', fontWeight: 700, color: INK, lineHeight: 1.15, margin: '6px 0 8px', whiteSpace: 'nowrap' }}>{title}</p>
      {intro && <p style={{ fontSize: 13, fontStyle: 'italic', color: '#6a5e5e', marginBottom: 10, lineHeight: 1.5, whiteSpace: 'normal' }}>{keepTogether(intro)}</p>}
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((st, i) => (
          <li key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 12.5, lineHeight: 1.5, color: '#3a2e30', whiteSpace: 'normal' }}>
            <span aria-hidden style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: h.accent, color: who === 'bee' ? INK : '#fff',
                                       fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{i + 1}</span>
            <span>{keepTogether(st)}</span>
          </li>
        ))}
      </ol>
    </aside>
  )
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
  /** Does one step of the answer and returns what Dug-Dug says (optionally a word to show off as tiles) */
  getReveal: () => string | { text: string; word: string } | null
  disabled?: boolean
  /** Who gives the hints: the puzzle's own host. Reveals are always Dug-Dug's. */
  host?: keyof typeof HOST
}

/**
 * "Ask Ben" gives a clue, then locks for 10 seconds (shared by every puzzle).
 * Every 3 hints unlock a "Reveal" from Dug-Dug, which does one step of the answer.
 */
export function HintButton({ date, game, getHint, getReveal, disabled, host = 'ben' }: HintProps) {
  const h = HOST[host]
  // Each host's hint colours (Dug-Dug's hints are a lighter purple than his reveals)
  const HINT = { bee: ['#e8c55a', '#c9a033', INK], ben: [AUTUMN, AUTUMN_DARK, '#fbf1e4'], dug: ['#7b6bb0', '#5a4a8c', '#fff'] }[host]
  const [said, setSaid] = useState<{ who: 'host' | 'dug'; text: string; word?: string } | null>(null)
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
    setSaid({ who: 'host', text: getHint(used.hints) ?? 'Hmm, nothing left to tell you. You’ve got this!' })
    setCount(c => c + 1)
    setUsed(u => ({ ...u, hints: u.hints + 1 }))
    try { localStorage.setItem(HINT_LOCK_KEY, String(Date.now() + HINT_COOLDOWN * 1000)) } catch {}
    setWait(HINT_COOLDOWN)
    startTicking()
  }

  function reveal() {
    if (revealsReady < 1 || disabled) return
    const r = getReveal()
    setSaid(typeof r === 'string' ? { who: 'dug', text: r } : r ? { who: 'dug', ...r } : { who: 'dug', text: 'Woof! Nothing left to reveal.' })
    setCount(c => c + 1)
    setUsed(u => ({ ...u, reveals: u.reveals + 1 }))
  }

  const dug = said?.who === 'dug'
  return (
    <div className="vgb-side-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 18, width: 'min(100%, 520px)' }}>
      {said && (
        // Pops out each time someone speaks (the key restarts the animation)
        <div key={count} role="status" className="vgb-motion vgb-bubble"
             style={{ position: 'relative', alignSelf: 'stretch', marginTop: 34, padding: '14px 16px 14px 96px', textAlign: 'center',
                      background: dug ? `linear-gradient(135deg, ${BEE_BEN} 0%, #2f2452 100%)` : `linear-gradient(135deg, ${HINT[0]} 0%, ${HINT[1]} 100%)`,
                      color: dug ? '#fbf1e4' : HINT[2], boxShadow: '0 14px 30px rgba(26,16,20,.3)', borderRadius: 4,
                      transformOrigin: '50% 100%', animation: 'vgb-pop .45s cubic-bezier(.2,1.4,.4,1) both' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dug ? DUG_DUG : h.img} alt={dug ? 'Dug-Dug' : h.name}
               className={dug ? 'vgb-motion vgb-bubble-img' : 'vgb-bubble-img'}
               style={{ position: 'absolute', left: 6, bottom: 0, height: dug || host === 'dug' ? 92 : 108, filter: 'drop-shadow(0 0 2px #fbf1e4) drop-shadow(0 6px 10px rgba(0,0,0,.25))',
                        animation: dug && said.word ? 'vgb-hop .7s ease-out .1s 2 both' : undefined }} />
          <span style={{ fontSize: 9, letterSpacing: '.35em', textTransform: 'uppercase', color: dug ? HONEY : host === 'bee' ? '#6b4d0e' : host === 'dug' ? HONEY : '#f3c98b', display: 'block', marginBottom: 4 }}>
            {dug ? 'Dug-Dug reveals' : `${h.name} says`}
          </span>
          <span style={{ fontSize: 13, lineHeight: 1.55 }}>{said.text}</span>
          {said.word && (
            <span style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4, marginTop: 10 }} aria-label={said.word}>
              {[...said.word].map((ch, i) => (
                <span key={i} className="vgb-motion" style={{ width: 28, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: HONEY, color: INK,
                  fontSize: 17, fontWeight: 800, textTransform: 'uppercase', borderRadius: 4, boxShadow: '0 3px 0 #b8892e',
                  animation: `vgb-tile-pop .5s cubic-bezier(.2,1.5,.4,1) ${0.25 + i * 0.12}s both` }}>{ch}</span>
              ))}
            </span>
          )}
          <span aria-hidden style={{ position: 'absolute', bottom: -7, left: '50%', width: 14, height: 14, background: dug ? '#2f2452' : HINT[1], transform: 'translateX(-50%) rotate(45deg)' }} />
        </div>
      )}
      {disabled ? (
        <span style={{ padding: '9px 16px', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', border: '1px solid #d0d0d0', color: '#787878', background: '#fff' }}>
          ✓ Solved, no hints needed
        </span>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            <button type="button" onClick={ask} disabled={wait > 0} className="hover:-translate-y-0.5"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 18px 6px 8px', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontFamily: 'inherit',
                       cursor: wait > 0 ? 'not-allowed' : 'pointer', border: 'none', borderRadius: 999,
                       background: wait > 0 ? '#e6e1e1' : HINT[0], color: wait > 0 ? '#787878' : HINT[2], boxShadow: wait > 0 ? 'none' : `0 6px 16px ${HINT[1]}55`, transition: 'transform .15s, background .3s' }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#fbf1e4', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.img} alt="" style={{ height: 40, marginBottom: -4, filter: wait > 0 ? 'grayscale(1)' : 'none' }} />
              </span>
              {wait > 0 ? `${h.name} is thinking… ${wait}s` : `Ask ${h.name} for a hint`}
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
  erase: ['Erased! Pick another one.', 'Poof, gone!', 'Rubbed it out for you.'],
  reset: ['Fresh start! You’ve got this.', 'Wiped clean, round two!', 'Back to the beginning!'],
  clear: ['Board cleared! Dug-Dug’s waiting.', 'All clear!', 'Clean slate, let’s go!'],
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
