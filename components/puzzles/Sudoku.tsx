'use client'
import { useEffect } from 'react'
import { CENTERED, HintButton, BEE_BEN, INK, Rules, SmallButton, SolvedBanner, useDailyState } from './shared'
import ArtFill from '@/components/ArtFill'

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
    <div style={CENTERED}>
      <Rules>Fill the grid so every row, column and 2×3 box has the numbers 1–6. Solve it to uncover today’s Bee, Ben &amp; Dug-Dug drawing.</Rules>

      <div style={{ position: 'relative', width: 'min(100%, 420px)', aspectRatio: '1', background: '#fff', border: `2px solid ${INK}` }}>
        {art && (
          <ArtFill src={art.image_url} alt={solved ? art.title : ''} sizes="420px" style={{ opacity: solved ? 1 : .35, transition: 'opacity 1.2s ease, background .4s' }} />
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
                  background: solved ? 'transparent' : isSel ? 'rgba(232,197,90,.7)' : peer ? 'rgba(255,255,255,.62)' : 'rgba(255,255,255,.45)',
                  color: conflict(r, c) ? '#b3261e' : given ? INK : BEE_BEN,
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
        <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <button key={n} type="button" onClick={() => put(n)}
              style={{ width: 48, height: 48, fontSize: 20, fontFamily: 'inherit', cursor: 'pointer', border: `1px solid ${INK}`, background: '#fff', color: INK }}>
              {n}
            </button>
          ))}
          <SmallButton bee="erase" onClick={() => put(0)}>Erase</SmallButton>
          <SmallButton bee="reset" onClick={() => setGrid(puzzle)}>Reset</SmallButton>
        </div>
      )}

      <HintButton disabled={solved} getHint={() => {
        // Fix a wrong number first; otherwise fill in an empty square
        const cells = grid.flatMap((row, r) => row.map((v, c) => ({ r, c, v }))).filter(({ r, c }) => !puzzle[r][c])
        const wrong = cells.find(({ r, c, v }) => v && v !== solution[r][c])
        const empty = cells.filter(({ v }) => !v)
        const target = wrong ?? empty[Math.floor(Math.random() * empty.length)]
        if (!target) return null
        const { r, c } = target
        setGrid(g => g.map((row, i) => row.map((x, j) => (i === r && j === c ? solution[r][c] : x))))
        setSel([r, c])
        return wrong
          ? `Row ${r + 1}, column ${c + 1} should be ${solution[r][c]}, not ${wrong.v}. I fixed it for you.`
          : `Row ${r + 1}, column ${c + 1} is a ${solution[r][c]}. I’ve filled it in.`
      }} />

      {solved && <SolvedBanner title="Solved! Dug-Dug is wagging 🐾" detail={art ? `Today’s drawing: ${art.title}` : undefined} artIndex={1} />}
    </div>
  )
}
