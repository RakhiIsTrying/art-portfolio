'use client'
import { useEffect } from 'react'
import { CENTERED, HintButton, DugDug, INK, Rules, SmallButton, SolvedBanner, useDailyState } from './shared'

// Soft versions of the site's palette, one per colour region
const REGION_COLORS = ['#e7c3c9', '#c4cfe9', '#bfe0dc', '#d9cfe9', '#ead5b5', '#cfe0bf', '#e9d0e4', '#f0e2a8']
const REGION_NAMES  = ['pink', 'blue', 'mint', 'lilac', 'sand', 'green', 'rose', 'yellow']

type Cell = 0 | 1 | 2 // empty, ×, queen

export default function Queens({ date, regions, solution, onSolved }: { date: string; regions: number[][]; solution: number[]; onSolved: () => void }) {
  const n = regions.length
  const empty = () => Array.from({ length: n }, () => Array<Cell>(n).fill(0))
  const [board, setBoard] = useDailyState<Cell[][]>(date, 'queens', empty())

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

  const edge = (r: number, c: number, dr: number, dc: number) => {
    const nr = r + dr, nc = c + dc
    return nr < 0 || nc < 0 || nr >= n || nc >= n || regions[nr][nc] !== regions[r][c] ? `2px solid ${INK}` : '1px solid rgba(26,16,20,.18)'
  }

  return (
    <div style={CENTERED}>
      <Rules>Place one Dug-Dug in every row, every column and every colour. No two pups can touch, not even diagonally (he doesn’t share treats). Tap once for ×, twice for Dug-Dug.</Rules>

      {/* Fixed rows and columns, so placing a piece never changes the board's size */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${n}, minmax(0, 1fr))`, width: 'min(100%, 420px)', aspectRatio: '1', border: `2px solid ${INK}` }}>
        {board.map((row, r) => row.map((v, c) => (
          <button key={`${r}-${c}`} type="button" onClick={() => tap(r, c)} aria-label={`Row ${r + 1} column ${c + 1}`}
            style={{
              position: 'relative', overflow: 'hidden', minWidth: 0, minHeight: 0,
              padding: 0, cursor: solved ? 'default' : 'pointer', fontFamily: 'inherit',
              background: REGION_COLORS[regions[r][c] % REGION_COLORS.length],
              borderTop: r === 0 ? 'none' : edge(r, c, -1, 0), borderLeft: c === 0 ? 'none' : edge(r, c, 0, -1),
              borderRight: 'none', borderBottom: 'none',
              fontSize: 'clamp(18px, 5vw, 28px)', lineHeight: 1,
              color: v === 2 && clashes.has(`${r},${c}`) ? '#b3261e' : INK,
            }}>
            {v === 2 ? <span style={{ position: 'absolute', inset: '7%' }}><DugDug size="100%" ring={clashes.has(`${r},${c}`) ? '#b3261e' : undefined} /></span> : v === 1 ? <span style={{ fontSize: '.55em', opacity: .45 }}>✕</span> : ''}
          </button>
        )))}
      </div>

      {!solved && (
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
          <SmallButton bee="clear" onClick={() => setBoard(empty())}>Clear</SmallButton>
        </div>
      )}
      <HintButton date={date} game="queens" disabled={solved}
        getHint={n => {
          // Clue: which row Dug-Dug goes in for one colour area
          const open = solution.map((c, row) => row).filter(row => board[row][solution[row]] !== 2)
          if (!open.length) return 'Every Dug-Dug is in place — check none of them are touching!'
          const r = open[n % open.length]
          return `In the ${REGION_NAMES[regions[r][solution[r]] % REGION_NAMES.length]} area, Dug-Dug goes in row ${r + 1}.`
        }}
        getReveal={() => {
          // One step: move Dug-Dug to his right square in one row
          const r = solution.findIndex((c, row) => board[row][c] !== 2 || board[row].filter(v => v === 2).length > 1)
          if (r === -1) return null
          const c = solution[r]
          setBoard(b => b.map((row, i) => row.map((v, j) => (i === r ? (j === c ? 2 : v === 2 ? 0 : v) : v))))
          return `Woof! I belong in row ${r + 1}, column ${c + 1}.`
        }} />

      {solved && <SolvedBanner title="Every pup in place! 🐾" artIndex={4} />}
    </div>
  )
}
