'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import { INK, Rules, SmallButton, SolvedBanner, useDailyState } from './shared'

type Props = {
  date: string
  puzzle: number[][]
  solution: number[][]
  art: { title: string; image_url: string } | null
  onSolved: () => void
}

export default function Sudoku({ date, puzzle, solution, art, onSolved }: Props) {
  const [grid, setGrid] = useDailyState<number[][]>(date, 'sudoku', puzzle)
  const [sel, setSel] = useDailyState<[number, number] | null>(date, 'sudoku-sel', null)
  const solved = grid.every((row, r) => row.every((v, c) => v === solution[r][c]))

  useEffect(() => { if (solved) onSolved() }, [solved, onSolved])

  const conflict = (r: number, c: number) => {
    const v = grid[r][c]
    if (!v) return false
    for (let k = 0; k < 6; k++) if ((k !== c && grid[r][k] === v) || (k !== r && grid[k][c] === v)) return true
    const br = r - (r % 2), bc = c - (c % 3)
    for (let i = br; i < br + 2; i++) for (let j = bc; j < bc + 3; j++) if ((i !== r || j !== c) && grid[i][j] === v) return true
    return false
  }

  function put(v: number) {
    if (!sel || solved) return
    const [r, c] = sel
    if (puzzle[r][c]) return
    setGrid(g => g.map((row, i) => row.map((x, j) => (i === r && j === c ? v : x))))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!sel) return
      if (/^[1-6]$/.test(e.key)) put(Number(e.key))
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') put(0)
      else if (e.key.startsWith('Arrow')) {
        const [r, c] = sel
        const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key]!
        setSel([(r + d[0] + 6) % 6, (c + d[1] + 6) % 6]); e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div>
      <Rules>Fill the grid so every row, column and 2×3 box has the numbers 1–6. Solve it to reveal today’s artwork{art ? '' : ''}.</Rules>

      <div style={{ position: 'relative', width: 'min(100%, 420px)', aspectRatio: '1', background: '#fff', border: `2px solid ${INK}` }}>
        {art && (
          <Image src={art.image_url} alt={solved ? art.title : ''} fill sizes="420px" className="object-cover"
                 style={{ opacity: solved ? 1 : .35, transition: 'opacity 1.2s ease' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridTemplateRows: 'repeat(6, 1fr)' }}>
          {grid.map((row, r) => row.map((v, c) => {
            const given = !!puzzle[r][c]
            const isSel = sel?.[0] === r && sel?.[1] === c
            const peer = sel && !isSel && (sel[0] === r || sel[1] === c)
            return (
              <button key={`${r}-${c}`} type="button" onClick={() => setSel([r, c])} aria-label={`Row ${r + 1} column ${c + 1}`}
                style={{
                  border: 'none', padding: 0, cursor: given || solved ? 'default' : 'pointer', fontFamily: 'inherit',
                  borderRight: c === 5 ? 'none' : `${c === 2 ? 2 : 1}px solid ${c === 2 ? INK : 'rgba(26,16,20,.25)'}`,
                  borderBottom: r === 5 ? 'none' : `${r % 2 === 1 ? 2 : 1}px solid ${r % 2 === 1 ? INK : 'rgba(26,16,20,.25)'}`,
                  background: solved ? 'transparent' : isSel ? 'rgba(176,120,128,.55)' : peer ? 'rgba(255,255,255,.62)' : 'rgba(255,255,255,.45)',
                  color: conflict(r, c) ? '#b3261e' : given ? INK : '#1e3a8a',
                  fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: given ? 700 : 400,
                  opacity: solved ? 0 : 1, transition: 'opacity 1s ease, background .15s',
                }}>
                {v || ''}
              </button>
            )
          }))}
        </div>
      </div>

      {!solved && (
        <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <button key={n} type="button" onClick={() => put(n)}
              style={{ width: 48, height: 48, fontSize: 20, fontFamily: 'inherit', cursor: 'pointer', border: `1px solid ${INK}`, background: '#fff', color: INK }}>
              {n}
            </button>
          ))}
          <SmallButton onClick={() => put(0)}>Erase</SmallButton>
          <SmallButton onClick={() => setGrid(puzzle)}>Reset</SmallButton>
        </div>
      )}

      {solved && <SolvedBanner title="Solved!" detail={art ? `Today’s art: ${art.title}` : undefined} />}
    </div>
  )
}
