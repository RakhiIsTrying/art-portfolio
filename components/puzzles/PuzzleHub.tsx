'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Daily } from '@/lib/puzzles/daily'
import Sudoku from './Sudoku'
import Wordle from './Wordle'
import Queens from './Queens'
import Wend from './Wend'
import Bee from './Bee'
import Confetti from './Confetti'
import { BEE_BEN, BeeCallout, INK, PLAYFAIR, ThemeContext, useDailyState, type Theme } from './shared'

const GAMES = [
  { id: 'sudoku', name: 'Mini Sudoku',  blurb: 'Uncover a Dug-Dug drawing', icon: '🎨' },
  { id: 'wordle', name: 'Wordle',       blurb: 'Five letters, six tries',   icon: '🔤' },
  { id: 'queens', name: 'Dug-Dug Queens', blurb: 'One pup per row & colour', icon: '🐶' },
  { id: 'wend',   name: 'Walkies',      blurb: 'Walk Dug-Dug past every square', icon: '🐾' },
  { id: 'bee',    name: 'Bee’s Hive',   blurb: 'Spelling Bee with 7 letters', icon: '🐝' },
] as const
type GameId = typeof GAMES[number]['id']

/** Time until midnight in India, when the next puzzles arrive. */
function useCountdown() {
  const [left, setLeft] = useState('')
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const ist = new Date(now.getTime() + 5.5 * 3600_000)
      const next = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + 1) - 5.5 * 3600_000
      const s = Math.max(0, Math.floor((next - now.getTime()) / 1000))
      setLeft(`${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])
  return left
}

export default function PuzzleHub({ daily, art, theme }: { daily: Daily; art: { title: string; image_url: string } | null; theme: Theme }) {
  const [active, setActive] = useState<GameId>('sudoku')
  const [solved, setSolved, solvedLoaded] = useDailyState<Partial<Record<GameId, boolean>>>(daily.date, 'solved', {})
  // Confetti only for a fresh win — not when reopening a puzzle solved earlier today
  const [burst, setBurst] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const countdown = useCountdown()
  const markSolved = useCallback((g: GameId) => {
    if (solvedLoaded && !solved[g] && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBurst(b => b + 1)
      setCelebrating(true)
    }
    setSolved(s => (s[g] ? s : { ...s, [g]: true }))
  }, [setSolved, solved, solvedLoaded])
  // Coming back (or refreshing) after solving today's puzzles celebrates again, once per page load
  const greeted = useRef(false)
  useEffect(() => {
    if (!solvedLoaded || greeted.current) return
    greeted.current = true
    if (Object.values(solved).some(Boolean) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBurst(b => b + 1)
      setCelebrating(true)
    }
  }, [solvedLoaded, solved])

  useEffect(() => {
    if (!celebrating) return
    const t = setTimeout(() => setCelebrating(false), 5000)
    return () => clearTimeout(t)
  }, [celebrating, burst])
  const done = (g: GameId) => () => markSolved(g)

  const pretty = new Date(daily.date + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
  const solvedCount = GAMES.filter(g => solved[g.id]).length

  return (
    <ThemeContext.Provider value={theme}>
      {/* Date strip */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2" style={{ marginBottom: 18, textAlign: 'center' }}>
        <p style={{ fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', color: '#787878' }}>
          {pretty} · No. {daily.number} · {solvedCount}/5 solved
        </p>
        <p style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#a0a0a0' }}>
          New puzzles in <span style={{ color: INK, fontVariantNumeric: 'tabular-nums' }}>{countdown}</span>
        </p>
      </div>

      {/* Game picker */}
      <div role="tablist" className="grid grid-cols-2 sm:grid-cols-5" style={{ gap: 1, background: '#d0d0d0', border: '1px solid #d0d0d0', marginBottom: 28 }}>
        {GAMES.map(g => {
          const on = g.id === active
          return (
            <button key={g.id} role="tab" aria-selected={on} type="button" onClick={() => setActive(g.id)}
              className={g.id === 'bee' ? 'col-span-2 sm:col-span-1' : ''}
              style={{ textAlign: 'left', padding: '14px 16px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                       background: on ? BEE_BEN : '#fff', color: on ? '#fff' : INK, transition: 'background .2s' }}>
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: PLAYFAIR, fontSize: 17, fontWeight: 700 }}><span aria-hidden style={{ marginRight: 6 }}>{g.icon}</span>{g.name}</span>
                {solved[g.id] && <span aria-label="solved" style={{ fontSize: 13 }}>✓</span>}
              </span>
              <span style={{ display: 'block', fontSize: 11, fontWeight: 300, marginTop: 3, color: on ? 'rgba(255,255,255,.8)' : '#787878' }}>{g.blurb}</span>
            </button>
          )
        })}
      </div>

      {active === 'sudoku' && <Sudoku date={daily.date} puzzle={daily.sudoku.puzzle} solution={daily.sudoku.solution} art={art} onSolved={done('sudoku')} />}
      {active === 'wordle' && <Wordle date={daily.date} answer={daily.wordle.answer} onSolved={done('wordle')} />}
      {active === 'queens' && <Queens date={daily.date} regions={daily.queens.regions} solution={daily.queens.solution} onSolved={done('queens')} />}
      {active === 'wend'   && <Wend date={daily.date} size={daily.wend.size} numbers={daily.wend.numbers} last={daily.wend.last} solution={daily.wend.solution} onSolved={done('wend')} />}
      {active === 'bee'    && <Bee date={daily.date} letters={daily.bee.letters} center={daily.bee.center} answers={daily.bee.answers} onSolved={done('bee')} />}
      <BeeCallout />
      {celebrating && <Confetti burst={burst} />}
    </ThemeContext.Provider>
  )
}
