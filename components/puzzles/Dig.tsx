'use client'
import { useEffect, useRef, useState } from 'react'
import { CENTERED, HintButton, BEE_BEN, HONEY, INK, PLAYFAIR, Rules, SmallButton, SolvedBanner, callBee, useDailyState } from './shared'

type Word = { word: string; cells: number[] }
type Props = { date: string; size: number; theme: string; letters: string; words: Word[]; onSolved: () => void }

// One colour per found word
const COLOURS = ['#c9a3e0', '#f2c97d', '#9fd4b5', '#f4a6a6', '#9ec3ee', '#e8b48f']

export default function Dig({ date, size, theme, letters, words, onSolved }: Props) {
  const N = size * size
  const [found, setFound] = useDailyState<Word[]>(date, 'dig', [])
  const [path, setPath] = useState<number[]>([])
  // Ben's clue: which hidden word, and how many of its first letters are lit
  const [clue, setClue] = useDailyState<{ word: number; show: number } | null>(date, 'dig-clue', null)
  const [flash, setFlash] = useState<string | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const solved = found.length === words.length
  useEffect(() => { if (solved) onSolved() }, [solved, onSolved])

  const owner = new Map<number, number>()          // cell → index of the found word using it
  found.forEach((f, i) => f.cells.forEach(c => owner.set(c, i)))
  const left = words.map((w, i) => i).filter(i => !found.some(f => f.word === words[i].word))
  const spelled = path.map(i => letters[i]).join('')

  const adjacent = (a: number, b: number) =>
    Math.abs(Math.floor(a / size) - Math.floor(b / size)) + Math.abs((a % size) - (b % size)) === 1

  function say(m: string) { setFlash(m); setTimeout(() => setFlash(null), 1400) }

  // A traced word locks in as soon as it spells one that's still hidden
  function check(p: number[]) {
    const w = p.map(i => letters[i]).join('')
    const hit = left.find(i => words[i].word === w)
    if (hit === undefined) return false
    setFound(f => [...f, { word: w, cells: p }])
    setPath([])
    if (clue && words[clue.word].word === w) setClue(null)
    say(['Dug-Dug dug it up! 🦴', 'Found one!', 'Nice digging!'][found.length % 3])
    return true
  }

  function extend(cell: number) {
    if (owner.has(cell)) return
    const p = path
    if (!p.length) return setPath([cell])
    const at = p.indexOf(cell)
    if (at !== -1 && at === p.length - 2) return setPath(p.slice(0, -1))   // step back
    if (at !== -1) return
    if (!adjacent(p[p.length - 1], cell)) return setPath([cell])          // start again from here
    const next = [...p, cell]
    if (!check(next)) setPath(next)
  }

  function cellAt(e: React.PointerEvent) {
    const box = boardRef.current!.getBoundingClientRect()
    const c = Math.floor(((e.clientX - box.left) / box.width) * size)
    const r = Math.floor(((e.clientY - box.top) / box.height) * size)
    return r < 0 || c < 0 || r >= size || c >= size ? null : r * size + c
  }
  function down(e: React.PointerEvent) {
    if (solved) return
    const cell = cellAt(e)
    if (cell === null) return
    dragging.current = true
    try { boardRef.current!.setPointerCapture(e.pointerId) } catch {}
    if (path.length && path[path.length - 1] === cell) setPath(p => p.slice(0, -1))   // tap the last letter to take it back
    else extend(cell)
  }
  function move(e: React.PointerEvent) {
    if (!dragging.current || solved) return
    const cell = cellAt(e)
    if (cell !== null && cell !== path[path.length - 1]) extend(cell)
  }
  function up() {
    dragging.current = false
    if (path.length > 2 && !left.some(i => words[i].word === spelled)) {
      // Long enough to be a guess and not a hidden word: let them know, keep it for tapping on
      if (!left.some(i => words[i].word.startsWith(spelled))) say('Not one of today’s words')
    }
  }

  function release(i: number) {
    setFound(f => f.filter((_, k) => k !== i))
    callBee('undo')
  }

  const centre = (i: number) => [((i % size) + .5) * (100 / size), (Math.floor(i / size) + .5) * (100 / size)]
  const lit = new Set(clue ? words[clue.word].cells.slice(0, clue.show) : [])

  return (
    <div style={CENTERED}>
      <Rules>Help Dug-Dug dig up today’s words! Drag through neighbouring letters (up, down, left or right) to spell a word. Every letter is part of exactly one word. Tap a found word below to put it back.</Rules>

      <p style={{ fontSize: 11, letterSpacing: '.35em', textTransform: 'uppercase', color: '#787878', marginBottom: 4 }}>Today’s theme</p>
      <p style={{ fontFamily: PLAYFAIR, fontSize: 24, fontWeight: 700, color: INK, marginBottom: 14 }}>{theme}</p>

      {/* Current word, or a message */}
      <div style={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        {flash
          ? <span style={{ fontSize: 12, background: INK, color: '#fff', padding: '5px 10px' }}>{flash}</span>
          : <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: INK }}>{spelled}</span>}
      </div>

      <div ref={boardRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{ position: 'relative', width: 'min(100%, 460px)', aspectRatio: '1', border: `2px solid ${INK}`, background: '#fff', touchAction: 'none', userSelect: 'none', cursor: solved ? 'default' : 'pointer' }}>
        {/* Found words and the current trace */}
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {found.map((f, i) => f.cells.length > 1 && (
            <polyline key={i} points={f.cells.map(c => centre(c).join(',')).join(' ')} fill="none" stroke={COLOURS[i % COLOURS.length]}
                      strokeWidth={100 / size / 1.6} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {path.length > 1 && (
            <polyline points={path.map(c => centre(c).join(',')).join(' ')} fill="none" stroke={HONEY}
                      strokeWidth={100 / size / 1.9} strokeLinecap="round" strokeLinejoin="round" opacity={.85} />
          )}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, gridTemplateRows: `repeat(${size}, 1fr)` }}>
          {Array.from({ length: N }).map((_, i) => {
            const mine = owner.get(i)
            const inPath = path.includes(i)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{
                  width: '70%', aspectRatio: '1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'clamp(18px, 5.5vw, 28px)', fontWeight: 700, textTransform: 'uppercase', color: INK,
                  background: mine !== undefined ? COLOURS[mine % COLOURS.length] : inPath ? HONEY : lit.has(i) ? '#f3d9a8' : 'transparent',
                  outline: lit.has(i) && mine === undefined ? `2px dashed ${BEE_BEN}` : 'none', outlineOffset: 2,
                  transition: 'background .15s', position: 'relative',
                }}>
                  {letters[i]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* The hidden words: only their lengths until found */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 16, width: 'min(100%, 560px)' }}>
        {words.map((w, i) => {
          const fi = found.findIndex(f => f.word === w.word)
          const isFound = fi !== -1
          return (
            <button key={i} type="button" disabled={!isFound || solved} onClick={() => isFound && release(fi)}
              title={isFound && !solved ? 'Tap to put this word back' : undefined}
              style={{ display: 'flex', gap: 3, padding: 4, border: 'none', background: 'none', cursor: isFound && !solved ? 'pointer' : 'default' }}>
              {[...w.word].map((ch, k) => (
                <span key={k} style={{ width: 24, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, textTransform: 'uppercase',
                  background: isFound ? COLOURS[fi % COLOURS.length] : '#fff', border: `1px solid ${isFound ? 'transparent' : '#d0d0d0'}`, color: INK }}>
                  {isFound ? ch : ''}
                </span>
              ))}
            </button>
          )
        })}
      </div>

      {!solved && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 }}>
          <SmallButton bee="clear" onClick={() => setPath([])}>Clear word</SmallButton>
          <SmallButton bee="reset" onClick={() => { setFound([]); setPath([]) }}>Start over</SmallButton>
          <span style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#a0a0a0' }}>{found.length} / {words.length} found</span>
        </div>
      )}

      <HintButton date={date} game="dig" disabled={solved}
        getHint={n => {
          // Ben lights up one word's first letter, then two, then three. Dug-Dug's reveal then shows it all.
          if (!left.length) return null
          const step = n % 3
          let target = clue?.word
          if (step === 0 || target === undefined || !left.includes(target)) target = left[0]
          setClue({ word: target, show: step + 1 })
          const w = words[target].word
          return step === 0
            ? `Look for a ${w.length}-letter word. Ben circled where it starts.`
            : `Same word, Ben circled its first ${step + 1} letters.`
        }}
        getReveal={() => {
          // Lights up the whole of Ben's word for them to trace
          const target = clue && left.includes(clue.word) ? clue.word : null
          if (target === null) return 'Ask Ben for a hint first, then I’ll dig up his word!'
          setClue({ word: target, show: words[target].word.length })
          return `Ben’s word is lit up on the board: trace “${words[target].word.toUpperCase()}” to add it!`
        }} />

      {solved && <SolvedBanner title="All dug up! 🦴" detail={`Every ${theme.toLowerCase()} word found.`} artIndex={4} />}
    </div>
  )
}
