'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CENTERED, HintButton, HONEY, INK, PLAYFAIR, Rules, SmallButton, SolvedBanner, useDailyState } from './shared'

type Props = { date: string; letters: string; center: string; answers: string[]; onSolved: () => void }

const RANKS: [string, number][] = [
  ['Beginner', 0], ['Good Start', .02], ['Moving Up', .05], ['Good', .08], ['Solid', .15],
  ['Nice', .25], ['Great', .4], ['Amazing', .5], ['Genius', .7],
]
const isPangram = (w: string, letters: string) => new Set(w).size === letters.length && [...letters].every(l => w.includes(l))
const points = (w: string, letters: string) => (w.length === 4 ? 1 : w.length) + (isPangram(w, letters) ? 7 : 0)

export default function Bee({ date, letters, center, answers, onSolved }: Props) {
  const [found, setFound] = useDailyState<string[]>(date, 'bee', [])
  const [outer, setOuter] = useState(() => [...letters].filter(l => l !== center))
  const [word, setWord] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const max = useMemo(() => answers.reduce((s, w) => s + points(w, letters), 0), [answers, letters])
  const score = found.reduce((s, w) => s + points(w, letters), 0)
  const rankIndex = RANKS.reduce((best, [, f], i) => (score >= Math.round(f * max) ? i : best), 0)
  const genius = rankIndex === RANKS.length - 1

  useEffect(() => { if (genius) onSolved() }, [genius, onSolved])

  const flash = (m: string) => { setMessage(m); setTimeout(() => setMessage(null), 1500) }

  const submit = useCallback(() => {
    const w = word
    setWord('')
    if (w.length < 4) return flash('Too short')
    if (!w.includes(center)) return flash('Missing centre letter')
    if ([...w].some(l => !letters.includes(l))) return flash('Bad letters')
    if (found.includes(w)) return flash('Already found')
    if (!answers.includes(w)) return flash('Not in word list')
    setFound(f => [...f, w])
    flash(isPangram(w, letters) ? 'Pangram! 🐝' : w.length === 4 ? 'Good!' : w.length < 7 ? 'Nice!' : 'Awesome!')
  }, [word, center, letters, found, answers, setFound])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Enter') submit()
      else if (e.key === 'Backspace') setWord(w => w.slice(0, -1))
      else if (/^[a-zA-Z]$/.test(e.key)) setWord(w => (w + e.key.toLowerCase()).slice(0, 19))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [submit])

  // Honeycomb: centre plus six around it
  const HEX = [[0, -1], [.87, -.5], [.87, .5], [0, 1], [-.87, .5], [-.87, -.5]]

  return (
    <div style={CENTERED}>
      <Rules>Help Bee fill the hive! Make words of 4+ letters that use the centre letter. Letters can repeat. A pangram uses all seven. Reach Genius to solve.</Rules>

      {/* Rank */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 auto 16px', width: 'min(100%, 420px)' }}>
        <span style={{ fontFamily: PLAYFAIR, fontWeight: 700, fontSize: 16, color: INK, minWidth: 92 }}>{RANKS[rankIndex][0]}</span>
        <div style={{ flex: 1, height: 2, background: '#d0d0d0', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: 2, width: `${Math.min(100, (score / (RANKS.at(-1)![1] * max)) * 100)}%`, background: '#b8892e', transition: 'width .4s' }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>{score}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
        <div>
          {/* Current word */}
          <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', position: 'relative' }}>
            {message
              ? <span style={{ fontSize: 12, fontWeight: 400, textTransform: 'none', background: INK, color: '#fff', padding: '5px 10px' }}>{message}</span>
              : word ? [...word].map((l, i) => <span key={i} style={{ color: l === center ? '#b8892e' : letters.includes(l) ? INK : '#c0c0c0' }}>{l}</span>)
              : <span style={{ width: 2, height: 28, background: '#b8892e', animation: 'vgb-pulse 1s infinite' }} />}
          </div>

          {/* Honeycomb */}
          <div style={{ position: 'relative', width: 270, height: 270, margin: '10px auto' }}>
            {[center, ...outer].map((l, i) => {
              const [dx, dy] = i === 0 ? [0, 0] : HEX[i - 1]
              return (
                <button key={l} type="button" onClick={() => setWord(w => w + l)}
                  style={{
                    position: 'absolute', left: 135 + dx * 84 - 46, top: 135 + dy * 84 - 40, width: 92, height: 80,
                    clipPath: 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 26, fontWeight: 700, textTransform: 'uppercase',
                    background: i === 0 ? HONEY : '#e6e1e1', color: INK,
                  }}>
                  {l}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <SmallButton bee="erase" onClick={() => setWord(w => w.slice(0, -1))}>Delete</SmallButton>
            <SmallButton onClick={() => setOuter(o => [...o].sort(() => Math.random() - .5))}>⟳</SmallButton>
            <SmallButton dark onClick={submit}>Enter</SmallButton>
          </div>
        </div>

        {/* Found words */}
        <div style={{ border: '1px solid #d0d0d0', background: '#fff', padding: '14px 16px', minHeight: 120, width: 'min(100%, 520px)', textAlign: 'left' }}>
          <p style={{ fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', color: '#a0a0a0', marginBottom: 10 }}>
            You found {found.length} of {answers.length} {found.length === 1 ? 'word' : 'words'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>
            {[...found].sort().map(w => (
              <span key={w} style={{ fontSize: 13, textTransform: 'capitalize', color: INK, fontWeight: isPangram(w, letters) ? 700 : 300, borderBottom: '1px solid #ebebeb' }}>
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>

      <HintButton date={date} game="bee" disabled={genius && found.length === answers.length}
        getHint={n => {
          // Clue: length and first two letters of a word not found yet (pangrams first)
          const left = answers.filter(w => !found.includes(w))
          if (!left.length) return null
          const pangram = left.find(x => isPangram(x, letters))
          const w = n === 0 && pangram ? pangram : left[n % left.length]
          return isPangram(w, letters)
            ? `There’s a pangram (uses all seven letters): ${w.length} letters, starting with “${w.slice(0, 2).toUpperCase()}”.`
            : `Try a ${w.length}-letter word starting with “${w.slice(0, 2).toUpperCase()}”.`
        }}
        getReveal={() => {
          // One step: give a whole word
          const left = answers.filter(w => !found.includes(w))
          if (!left.length) return null
          const w = left.find(x => !isPangram(x, letters)) ?? left[0]
          setFound(f => [...f, w])
          return `Here’s one: “${w.toUpperCase()}”. Added to your words!`
        }} />

      {genius && <SolvedBanner title="Genius! Bee is buzzing 🐝" detail={`${found.length} words, ${score} points. Keep going to find them all.`} artIndex={6} />}
    </div>
  )
}
