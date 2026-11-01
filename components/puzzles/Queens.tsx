'use client'
import { useEffect, useMemo, useRef } from 'react'
import { kingsHint, kingsTarget, type KingsMark } from '@/lib/puzzles/rules'
import { CENTERED, HintButton, DugDug, INK, Rules, SmallButton, SolvedBanner, useDailyState } from './shared'

// Soft versions of the site's palette, one per colour region
const REGION_COLORS = ['#e7c3c9', '#c4cfe9', '#bfe0dc', '#d9cfe9', '#ead5b5', '#cfe0bf', '#e9d0e4', '#f0e2a8']
const REGION_NAMES  = ['pink', 'blue', 'mint', 'lilac', 'sand', 'green', 'rose', 'yellow']

type Cell = 0 | 1 | 2 // empty, ×, queen

export default function Queens({ date, regions, solution, onSolved }: { date: string; regions: number[][]; solution: number[]; onSolved: () => void }) {
  const n = regions.length
  const empty = () => Array.from({ length: n }, () => Array<Cell>(n).fill(0))
  const [board, setBoard] = useDailyState<Cell[][]>(date, 'queens', empty())
  const [marks, setMarks] = useDailyState<KingsMark[]>(date, 'queens-marks', [])
  const boardRef = useRef<HTMLDivElement>(null)

  // What hints and reveals work towards: some days have more than one valid answer
  const target = useMemo(() => kingsTarget(regions, board, solution), [regions, board, solution])

  const queens: [number, number][] = []
  board.forEach((row, r) => row.forEach((v, c) => { if (v === 2) queens.push([r, c]) }))

  const clashes = new Set<string>()
  for (let i = 0; i < queens.length; i++) for (let j = i + 1; j < queens.length; j++) {
    const [a, b] = [queens[i], queens[j]]
    const touching = Math.abs(a[0] - b[0]) <= 1 && Math.abs(a[1] - b[1]) <= 1
    if (a[0] === b[0] || a[1] === b[1] || regions[a[0]][a[1]] === regions[b[0]][b[1]] || touching) {
      clashes.add(a.join()); clashes.add(b.join())
    }
  }
  const solved = queens.length === n && clashes.size === 0

  useEffect(() => { if (solved) onSolved() }, [solved, onSolved])

  const tap = (r: number, c: number) => {
    if (solved) return
    setBoard(b => b.map((row, i) => row.map((v, j) => (i === r && j === c ? (((v + 1) % 3) as Cell) : v))))
  }

  // Hints: green where a pup should go (until he's there), red on a misplaced pup (until he's moved)
  const shadeFor = (r: number, c: number) => {
    if (!marks.some(m => m.r === r && m.c === c)) return null
    if (target[r] === c) return board[r][c] === 2 ? null : 'right'
    return board[r][c] === 2 ? 'wrong' : null
  }

  // On phones a shaded square can be off screen or under the sticky nav
  const showRow = (r: number) => {
    const box = boardRef.current!.getBoundingClientRect()
    const nav = document.querySelector('nav')?.offsetHeight ?? 0
    const top = box.top + (r * box.height) / n
    if (top >= nav && top + box.height / n <= window.innerHeight) return
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollBy({ top: top - nav - 12, behavior: calm ? 'auto' : 'smooth' })
  }

  const edge = (r: number, c: number, dr: number, dc: number) => {
    const nr = r + dr, nc = c + dc
    return nr < 0 || nc < 0 || nr >= n || nc >= n || regions[nr][nc] !== regions[r][c] ? `2px solid ${INK}` : '1px solid rgba(26,16,20,.18)'
  }

  return (
    <div className="vgb-puzzle" style={CENTERED}>
      <Rules who="dug" title="Dug-Dug Kings" intro="Crown Dug-Dug king of every row, column and colour. One royal pup per kingdom!"
        steps={['Place one Dug-Dug in every row, every column and every colour.', 'No two pups can touch, not even diagonally (he doesn’t share treats).', 'Tap once for ×, twice for Dug-Dug, three times to clear.']} />

      {/* Fixed rows and columns, so placing a piece never changes the board's size */}
      <div ref={boardRef} style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`, width: 'min(100%, 520px)', aspectRatio: '1', border: `2px solid ${INK}` }}>
        {board.map((row, r) => row.map((v, c) => {
          const shade = shadeFor(r, c)
          return (
          <button key={`${r}-${c}`} type="button" onClick={() => tap(r, c)}
            aria-label={`Row ${r + 1} column ${c + 1}${shade === 'right' ? ', Dug-Dug goes here' : shade === 'wrong' ? ', this Dug-Dug is in the wrong place' : ''}`}
            style={{
              position: 'relative', overflow: 'hidden', minWidth: 0, minHeight: 0,
              padding: 0, cursor: solved ? 'default' : 'pointer', fontFamily: 'inherit',
              background: REGION_COLORS[regions[r][c] % REGION_COLORS.length],
              borderTop: r === 0 ? 'none' : edge(r, c, -1, 0), borderLeft: c === 0 ? 'none' : edge(r, c, 0, -1),
              borderRight: 'none', borderBottom: 'none',
              fontSize: 'clamp(18px, 5vw, 28px)', lineHeight: 1,
              color: v === 2 && clashes.has(`${r},${c}`) ? '#b3261e' : INK,
            }}>
            {shade && <span aria-hidden style={{ position: 'absolute', inset: 0, background: shade === 'right' ? 'rgba(63,143,79,.65)' : 'rgba(179,38,30,.45)', boxShadow: `inset 0 0 0 3px ${shade === 'right' ? '#3f8f4f' : '#b3261e'}` }} />}
            {v === 2 ? <span style={{ position: 'absolute', inset: '7%' }}><DugDug size="100%" ring={clashes.has(`${r},${c}`) ? '#b3261e' : undefined} /></span> : v === 1 ? <span style={{ fontSize: '.55em', opacity: .45 }}>✕</span> : ''}
          </button>
          )
        }))}
      </div>

      {!solved && (
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
          <SmallButton bee="clear" onClick={() => setBoard(empty())}>Clear</SmallButton>
        </div>
      )}
      <HintButton host="dug" date={date} game="queens" disabled={solved}
        getHint={() => {
          // Clue: shade a misplaced pup red, otherwise a square where a pup belongs green
          const next = kingsHint(board, target, marks)
          if (!next) return null
          setMarks(m => [...m, next])
          showRow(next.r)
          return target[next.r] === next.c
            ? `Woof! One of me belongs in the ${REGION_NAMES[regions[next.r][next.c] % REGION_NAMES.length]} square I’ve shaded green.`
            : 'Woof! The pup I’ve shaded red is in the wrong place.'
        }}
        getReveal={() => {
          // One step: move Dug-Dug to his right square in one row
          const r = target.findIndex((c, row) => board[row][c] !== 2 || board[row].filter(v => v === 2).length > 1)
          if (r === -1) return null
          const c = target[r]
          const placed = board[r][c] === 2
          setBoard(b => b.map((row, i) => row.map((v, j) => (i === r ? (j === c ? 2 : v === 2 ? 0 : v) : v))))
          return placed
            ? `Woof! Row ${r + 1} only needs the pup in column ${c + 1}, so I moved the extra one.`
            : `Woof! I belong in row ${r + 1}, column ${c + 1}.`
        }} />

      {solved && <SolvedBanner title="Long live the Dug-Dug Kings! 👑" artIndex={4} />}
    </div>
  )
}
