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
/** Time until 12:01 am India time, when the next puzzles arrive; reloads the page then if asked to. */
function useCountdown(reloadAtZero: boolean) {
  const [left, setLeft] = useState('')
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const ist = new Date(now.getTime() + 5.5 * 3600_000 - 60_000)
      const next = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + 1) - 5.5 * 3600_000 + 60_000
      const s = Math.max(0, Math.floor((next - now.getTime()) / 1000))
      setLeft(`${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`)
      if (s === 0 && reloadAtZero) setTimeout(() => window.location.reload(), 1500)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [reloadAtZero])
  return left
}

/** Past days on the left: click a date to play that day; shows how many you solved. */
function Archive({ dates, current, today }: { dates: string[]; current: string; today: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  useEffect(() => {
    const c: Record<string, number> = {}
    for (const d of dates) {
      try { c[d] = Object.values(JSON.parse(localStorage.getItem(`vgb-puzzle:${d}:solved`) ?? '{}')).filter(Boolean).length } catch { c[d] = 0 }
    }
    setCounts(c)
  }, [dates, current])
  const label = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  const weekday = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' })

  return (
    <nav aria-label="Past puzzles" className="no-scrollbar flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible lg:sticky lg:top-[60px]">
      <p className="hidden lg:block" style={{ fontSize: 9, letterSpacing: '.4em', textTransform: 'uppercase', color: '#787878', marginBottom: 8 }}>Past month</p>
      {dates.map(d => {
        const on = d === current
        const n = counts[d] ?? 0
        return (
          <a key={d} href={d === today ? '/puzzles' : `/puzzles?date=${d}`} aria-current={on ? 'page' : undefined}
             style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 10px', textDecoration: 'none',
                      background: on ? BEE_BEN : '#fff', color: on ? '#fff' : INK, border: `1px solid ${on ? BEE_BEN : '#e0dcdc'}` }}>
            <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', opacity: .65, marginRight: 6 }}>{d === today ? 'Today' : weekday(d)}</span>
              {label(d)}
            </span>
            <span style={{ fontSize: 10, whiteSpace: 'nowrap', color: on ? '#fff' : n === 5 ? '#3f8f4f' : '#a0a0a0' }}>{n === 5 ? '★ 5/5' : `${n}/5`}</span>
          </a>
        )
      })}
    </nav>
  )
}

type HubProps = { daily: Daily; art: { title: string; image_url: string } | null; theme: Theme; dates: string[]; today: string }

export default function PuzzleHub({ daily, art, theme, dates, today }: HubProps) {
  const isToday = daily.date === today
  // Remember which puzzle was open, so a refresh comes back to it
  const [active, setActive] = useDailyState<GameId>(daily.date, 'open-tab', 'sudoku')
  const [solved, setSolved, solvedLoaded] = useDailyState<Partial<Record<GameId, boolean>>>(daily.date, 'solved', {})
  // Confetti only for a fresh win — not when reopening a puzzle solved earlier today
  const [burst, setBurst] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const countdown = useCountdown(isToday)
  // Confetti for each puzzle: when it's solved, and whenever a solved puzzle is opened (or the page refreshed on it)
  const celebrate = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setBurst(b => b + 1)
    setCelebrating(true)
  }, [])
  const markSolved = useCallback((g: GameId) => {
    if (solvedLoaded && !solved[g]) celebrate()
    setSolved(s => (s[g] ? s : { ...s, [g]: true }))
  }, [setSolved, solved, solvedLoaded, celebrate])
  useEffect(() => {
    if (solvedLoaded && solved[active]) celebrate()
    // Only when a puzzle is opened, not every time progress changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, solvedLoaded])

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
      <div className="grid lg:grid-cols-[180px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
      <Archive dates={dates} current={daily.date} today={today} />
      <div style={{ minWidth: 0 }}>
      {/* Date strip */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2" style={{ marginBottom: 18, textAlign: 'center' }}>
        <p style={{ fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', color: '#787878' }}>
          {pretty} · No. {daily.number} · {solvedCount}/5 solved
        </p>
        {isToday ? (
          <p style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#a0a0a0' }}>
            New puzzles in <span style={{ color: INK, fontVariantNumeric: 'tabular-nums' }}>{countdown}</span>
          </p>
        ) : (
          <a href="/puzzles" style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: BEE_BEN }}>
            Playing a past day · Back to today →
          </a>
        )}
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
      </div>
      </div>
      <BeeCallout />
      {celebrating && <Confetti burst={burst} />}
    </ThemeContext.Provider>
  )
}
