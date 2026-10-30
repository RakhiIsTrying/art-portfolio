'use client'
import { useCallback, useEffect, useState } from 'react'
import { CENTERED, HintButton, callBee, INK, Rules, SolvedBanner, useDailyState } from './shared'

type Mark = 'hit' | 'near' | 'miss'
const COLORS: Record<Mark, string> = { hit: '#3f8f4f', near: '#d9a521', miss: '#b8433b' }
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

/** Wordle colouring, handling repeated letters correctly. */
function score(guess: string, answer: string): Mark[] {
  const marks: Mark[] = Array(5).fill('miss')
  const left: Record<string, number> = {}
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) marks[i] = 'hit'
    else left[answer[i]] = (left[answer[i]] ?? 0) + 1
  }
  for (let i = 0; i < 5; i++) {
    if (marks[i] !== 'hit' && left[guess[i]]) { marks[i] = 'near'; left[guess[i]]-- }
  }
  return marks
}

let wordsPromise: Promise<Set<string>> | null = null
const loadWords = () =>
  (wordsPromise ??= fetch('/puzzles/wordle-words.txt').then(r => r.text()).then(t => new Set(t.split('\n'))))

export default function Wordle({ date, answer, onSolved }: { date: string; answer: string; onSolved: () => void }) {
  const [guesses, setGuesses] = useDailyState<string[]>(date, 'wordle', [])
  const [current, setCurrent] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [hinted, setHinted] = useDailyState<number[]>(date, 'wordle-hints', [])

  const won = guesses.includes(answer)
  const lost = !won && guesses.length >= 6
  const done = won || lost

  useEffect(() => { if (won) onSolved() }, [won, onSolved])
  useEffect(() => { loadWords() }, [])

  const flash = (msg: string) => {
    setMessage(msg); setShake(true)
    setTimeout(() => setShake(false), 450); setTimeout(() => setMessage(null), 1600)
  }

  const press = useCallback(async (key: string) => {
    if (done) return
    if (key === 'enter') {
      if (current.length < 5) return flash('Not enough letters')
      const words = await loadWords()
      if (!words.has(current)) return flash('Not in word list')
      setGuesses(g => [...g, current]); setCurrent('')
    } else if (key === 'back') setCurrent(c => c.slice(0, -1))
    else if (/^[a-z]$/.test(key) && current.length < 5) setCurrent(c => c + key)
  }, [current, done, setGuesses])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Enter') press('enter')
      else if (e.key === 'Backspace') press('back')
      else if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toLowerCase())
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press])

  // Best mark seen for each letter, for the keyboard
  const keyMarks: Record<string, Mark> = {}
  const rank = { miss: 0, near: 1, hit: 2 }
  for (const g of guesses) score(g, answer).forEach((m, i) => {
    if (!keyMarks[g[i]] || rank[m] > rank[keyMarks[g[i]]]) keyMarks[g[i]] = m
  })

  const rows = [...guesses, ...(done ? [] : [current])]
  while (rows.length < 6) rows.push('')

  return (
    <div className="vgb-puzzle" style={CENTERED}>
      <Rules who="ben" title="Ben’s Dash" intro="Ben’s favourite sprint: a five-letter word, six tries. On your marks, get set, guess!"
        steps={['Type a five-letter word and press Enter.',
                <>Tiles turn <b style={{ color: COLORS.hit }}>green</b> for the right letter in the right spot.</>,
                <><b style={{ color: COLORS.near }}>Yellow</b> means it’s in the word, just somewhere else.</>,
                <><b style={{ color: COLORS.miss }}>Red</b> means it’s not in the word at all.</>]} />

      <div style={{ position: 'relative', display: 'grid', gap: 5, width: 'min(100%, 380px)' }}>
        {message && (
          <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translate(-50%, -100%)', background: INK, color: '#fff', fontSize: 11, padding: '6px 12px', whiteSpace: 'nowrap', zIndex: 2 }}>
            {message}
          </div>
        )}
        {rows.map((word, r) => {
          const submitted = r < guesses.length
          const marks = submitted ? score(word, answer) : null
          return (
            <div key={r} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5,
                                  animation: shake && r === guesses.length ? 'vgb-shake .4s' : undefined }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{
                  aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, fontWeight: 700, textTransform: 'uppercase',
                  border: marks ? 'none' : `2px solid ${word[i] ? '#787878' : '#d0d0d0'}`,
                  background: marks ? COLORS[marks[i]] : '#fff', color: marks ? '#fff' : INK,
                  transition: `background .3s ${i * .12}s`,
                }}>
                  {word[i] ?? ''}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {!done && (
        <div style={{ display: 'grid', gap: 6, marginTop: 18, width: 'min(100%, 560px)' }}>
          {ROWS.map((row, i) => (
            <div key={row} style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
              {i === 2 && <Key label="Enter" wide onClick={() => press('enter')} />}
              {[...row].map(k => <Key key={k} label={k} mark={keyMarks[k]} onClick={() => press(k)} />)}
              {i === 2 && <Key label="⌫" wide onClick={() => { press('back'); callBee('erase') }} />}
            </div>
          ))}
        </div>
      )}

      <HintButton date={date} game="wordle" disabled={done}
        getHint={n => {
          // Clue: a letter that's in the word but hasn't shown up yet
          const seen = new Set(guesses.flatMap(g => [...g].filter(l => answer.includes(l))))
          const missing = [...new Set(answer)].filter(l => !seen.has(l))
          if (missing.length) return `The word contains “${missing[n % missing.length].toUpperCase()}”.`
          // All letters found: say where one isn't, to help with order
          const misplaced = guesses.flatMap(g => [...g].map((l, i) => ({ l, i }))).filter(({ l, i }) => answer.includes(l) && answer[i] !== l)
          if (!misplaced.length) return 'You’ve found every letter. Now work out their order!'
          const m = misplaced[n % misplaced.length]
          return `“${m.l.toUpperCase()}” is not letter ${m.i + 1}.`
        }}
        getReveal={() => {
          // One step: put a letter in its right spot
          const known = new Set([...hinted, ...[0, 1, 2, 3, 4].filter(i => guesses.some(g => g[i] === answer[i]))])
          const i = [0, 1, 2, 3, 4].find(p => !known.has(p))
          if (i === undefined) return 'Every letter is already in place. Just type it in!'
          setHinted(h => [...h, i])
          return `Letter ${i + 1} is “${answer[i].toUpperCase()}”.`
        }} />

      {won && <SolvedBanner title="Personal best! Ben approves 🏃" detail={`Got it in ${guesses.length} ${guesses.length === 1 ? 'try' : 'tries'}.`} artIndex={2} />}
      {lost && <SolvedBanner title={`The word was “${answer.toUpperCase()}”`} detail="Ben says: rest up, new race tomorrow." artIndex={3} />}
    </div>
  )
}

function Key({ label, onClick, mark, wide }: { label: string; onClick: () => void; mark?: Mark; wide?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        flex: wide ? 1.5 : 1, height: 50, minWidth: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        fontSize: wide ? 11 : 15, fontWeight: 600, textTransform: 'uppercase',
        background: mark ? COLORS[mark] : '#d8d4d4', color: mark ? '#fff' : INK,
      }}>
      {label}
    </button>
  )
}
