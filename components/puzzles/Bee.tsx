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
  // The word behind Bee's latest hint; Dug-Dug's reveal gives exactly this word
  const [benWord, setBenWord] = useDailyState<string | null>(date, 'bee-ben-word', null)
  const [outer, setOuter] = useState(() => [...letters].filter(l => l !== center))
  const [word, setWord] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [fresh, setFresh] = useState<string | null>(null)   // the word just found, so it pops into the jar
  // Dug-Dug's reveal: which word he's sniffing out, and a key to restart the animation
  const [sniff, setSniff] = useState<{ word: string; key: number } | null>(null)

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
    setFresh(w)
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
    <div className="vgb-puzzle" style={CENTERED}>
      <Rules who="bee" title="Bee’s Hive" intro="Help Bee fill the hive with words!"
        steps={['Make words of 4 or more letters from the hive.', 'Every word must use the centre (gold) letter. Letters can repeat.', 'A pangram uses all seven letters, for bonus points.', 'Reach Genius to solve.']} />

      {/* Rank */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 auto 16px', width: 'min(100%, 520px)' }}>
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
                <button key={sniff && sniff.word.includes(l) ? `${l}-${sniff.key}` : l} type="button" onClick={() => setWord(w => w + l)}
                  className={sniff && sniff.word.includes(l) ? 'vgb-motion' : undefined}
                  style={{
                    animation: sniff && sniff.word.includes(l) ? `vgb-sniff .55s ease ${0.3 + sniff.word.indexOf(l) * 0.22}s 2 both` : undefined,
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

        {/* Found words: Bee's honey jar */}
        <div style={{ position: 'relative', width: 'min(100%, 620px)', padding: '16px 16px 18px', borderRadius: 14, textAlign: 'center',
                      background: 'linear-gradient(180deg, #fff8e1 0%, #fdeec0 100%)', border: '2px solid #e8c55a', boxShadow: 'inset 0 -10px 0 rgba(232,197,90,.18), 0 8px 20px rgba(184,137,46,.15)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/puzzles/bee.png" alt="" aria-hidden style={{ position: 'absolute', right: 10, top: -34, height: 58, filter: 'drop-shadow(0 0 2px #fff) drop-shadow(0 4px 6px rgba(0,0,0,.18))' }} />
          <p style={{ fontFamily: PLAYFAIR, fontSize: 18, fontWeight: 700, color: '#8a6414', marginBottom: 2 }}>🍯 Bee’s honey jar</p>
          <p style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#a78a3c', marginBottom: 12 }}>
            {found.length} of {answers.length} {answers.length === 1 ? 'word' : 'words'} · {score} {score === 1 ? 'point' : 'points'}
          </p>
          {found.length === 0 && <p style={{ fontSize: 13, fontStyle: 'italic', color: '#a78a3c' }}>Empty for now. Every word you find drips in here!</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {[...found].sort().map(w => {
              const pangram = isPangram(w, letters)
              return (
                <span key={w} className="vgb-motion" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 8px 5px 10px', borderRadius: 999,
                  fontSize: 14, fontWeight: 700, textTransform: 'capitalize', color: INK, whiteSpace: 'nowrap',
                  background: pangram ? 'linear-gradient(135deg, #ffe680 0%, #f2b632 50%, #ffe680 100%)' : '#fff',
                  border: `1.5px solid ${pangram ? '#c9901a' : '#ecd48a'}`, boxShadow: pangram ? '0 3px 0 #c9901a' : '0 2px 0 #ecd48a',
                  animation: w === fresh ? 'vgb-tile-pop .55s cubic-bezier(.2,1.5,.4,1) both' : undefined,
                }}>
                  {pangram && <span aria-label="pangram">🐝</span>}
                  {w}
                  <span style={{ fontSize: 10, fontWeight: 700, color: pangram ? INK : '#8a6414', background: pangram ? 'rgba(255,255,255,.55)' : '#fdf0c4', borderRadius: 999, padding: '1px 6px' }}>
                    +{points(w, letters)}
                  </span>
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <HintButton host="bee" date={date} game="bee" disabled={genius && found.length === answers.length}
        getHint={n => {
          // Bee builds up one word over three hints: first letter, then two, then three. Dug-Dug's reveal then gives it.
          const left = answers.filter(w => !found.includes(w))
          if (!left.length) return null
          const step = n % 3
          let w = benWord
          if (step === 0 || !w || found.includes(w)) {
            const pangram = left.find(x => isPangram(x, letters))
            w = n === 0 && pangram ? pangram : left[Math.floor(n / 3) % left.length]
            setBenWord(w)
          }
          const start = w.slice(0, step + 1).toUpperCase()
          const what = isPangram(w, letters) ? 'There’s a pangram (uses all seven letters)' : `Try a ${w.length}-letter word`
          return step === 0
            ? `${what}${isPangram(w, letters) ? `: ${w.length} letters,` : ''} starting with “${start}”.`
            : `Same word, it starts with “${start}”…`
        }}
        getReveal={() => {
          // The answer to Bee's latest hint, for them to type in (never a new word)
          if (!benWord) return 'Ask Bee for a hint first, then I’ll sniff out the word!'
          if (found.includes(benWord)) return `You already found Bee’s word, “${benWord.toUpperCase()}”! Ask Bee for a new hint.`
          setSniff({ word: benWord, key: Date.now() })
          setTimeout(() => setSniff(null), 4000)
          return { text: 'Sniff sniff… Dug-Dug sniffed out Bee’s word! Type it in to add it:', word: benWord }
        }} />

      {genius && <SolvedBanner title="Genius! Bee is buzzing 🐝" detail={`${found.length} words, ${score} points. Keep going to find them all.`} artIndex={6} />}
    </div>
  )
}
