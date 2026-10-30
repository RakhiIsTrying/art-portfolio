'use client'
import { useEffect, useRef, useState } from 'react'
import { sudokuOk } from '@/lib/puzzles/rules'
import { CENTERED, DUG_DUG, HintButton, BEE_BEN, INK, Rules, SmallButton, SolvedBanner, useDailyState } from './shared'
import ArtFill from '@/components/ArtFill'

type Props = {
  date: string
  puzzle: number[][]
  solution: number[][]
  art: { title: string; image_url: string } | null
  onSolved: () => void
}

export default function Sudoku({ date, puzzle, solution, art, onSolved }: Props) {
  const [grid, setGrid, loaded] = useDailyState<number[][]>(date, 'sudoku', puzzle)
  const [sel, setSel] = useDailyState<[number, number] | null>(date, 'sudoku-sel', null)
  const solved = grid.every((row, r) => row.every((v, c) => v === solution[r][c]))

  useEffect(() => { if (solved) onSolved() }, [solved, onSolved])

  // Rows, columns and 2×3 boxes filled in correctly
  const rowDone = (r: number) => grid[r].every((v, c) => v === solution[r][c])
  const colDone = (c: number) => grid.every((row, r) => row[c] === solution[r][c])
  const BOXES = [0, 2, 4].flatMap(br => [0, 3].map(bc => [br, bc] as const))
  const boxDone = (b: number) => { const [br, bc] = BOXES[b]; return [0, 1].every(i => [0, 1, 2].every(j => grid[br + i][bc + j] === solution[br + i][bc + j])) }
  const done = { row: [0, 1, 2, 3, 4, 5].filter(rowDone), col: [0, 1, 2, 3, 4, 5].filter(colDone), box: [0, 1, 2, 3, 4, 5].filter(boxDone) }
  const cellDone = (r: number, c: number) => done.row.includes(r) || done.col.includes(c) || done.box.includes(BOXES.findIndex(([br, bc]) => r >= br && r < br + 2 && c >= bc && c < bc + 3))

  // When one is newly completed, Dug-Dug runs across a row, slides down a column or circles a box
  type Run = { id: number; kind: 'row' | 'col' | 'box'; index: number }
  const [runs, setRuns] = useState<Run[]>([])
  const prevDone = useRef<string[] | null>(null)
  const key = [...done.row.map(i => `row${i}`), ...done.col.map(i => `col${i}`), ...done.box.map(i => `box${i}`)]
  useEffect(() => {
    if (!loaded) return
    const prev = prevDone.current
    prevDone.current = key
    if (!prev || solved) return     // nothing on first load; the win has its own celebration
    const fresh = key.filter(k => !prev.includes(k))
    if (!fresh.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const added = fresh.map((k, n) => ({ id: Date.now() + n, kind: k.slice(0, 3) as Run['kind'], index: Number(k.slice(3)) }))
    setRuns(r => [...r, ...added])
    const ids = added.map(a => a.id)
    setTimeout(() => setRuns(r => r.filter(x => !ids.includes(x.id))), 1700)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key.join(), loaded])

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

      <div style={{ position: 'relative', width: 'min(100%, 520px)', aspectRatio: '1', background: '#fff', border: `2px solid ${INK}` }}>
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
                  background: solved ? 'transparent' : isSel ? 'rgba(232,197,90,.7)' : cellDone(r, c) ? 'rgba(63,143,79,.22)' : peer ? 'rgba(255,255,255,.62)' : 'rgba(255,255,255,.45)',
                  color: conflict(r, c) ? '#b3261e' : given ? INK : BEE_BEN,
                  fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: given ? 700 : 400,
                  opacity: solved ? 0 : 1, transition: 'opacity 1s ease, background .15s',
                }}>
                {v || ''}
              </button>
            )
          }))}
        </div>

        {/* Dug-Dug celebrating a finished row / column / box */}
        {runs.map(run => {
          const cell = 100 / 6
          if (run.kind === 'box') {
            const [br, bc] = BOXES[run.index]
            return (
              <div key={run.id} style={{ position: 'absolute', left: `${(bc + 1.5) * cell}%`, top: `${(br + 1) * cell}%`, width: 0, height: 0, pointerEvents: 'none' }}>
                <div className="vgb-motion" style={{ position: 'absolute', animation: 'vgb-orbit 1.5s linear both' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={DUG_DUG} alt="" className="vgb-motion" style={{ position: 'absolute', width: 46, left: 26, top: -23, animation: 'vgb-orbit-counter 1.5s linear both', filter: 'drop-shadow(0 3px 4px rgba(26,16,20,.35))' }} />
                </div>
              </div>
            )
          }
          const style: React.CSSProperties = run.kind === 'row'
            ? { top: `${run.index * cell}%`, height: `${cell}%`, left: 0, animation: 'vgb-run-across 1.5s ease-in-out both' }
            : { left: `${run.index * cell}%`, width: `${cell}%`, top: 0, animation: 'vgb-slide-down 1.5s ease-in both' }
          return (
            <div key={run.id} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              <div className="vgb-motion" style={{ position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center', width: `${cell}%`, aspectRatio: '1', ...style }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={DUG_DUG} alt="" style={{ width: '85%', filter: 'drop-shadow(0 3px 4px rgba(26,16,20,.35))', transform: run.kind === 'col' ? 'rotate(-12deg)' : undefined }} />
              </div>
            </div>
          )
        })}
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

      <HintButton date={date} game="sudoku" disabled={solved}
        getHint={n => {
          // Clue: point out a mistake's row, or a square where only one number fits
          const wrong = grid.flatMap((row, r) => row.map((v, c) => ({ r, c, v }))).find(({ r, c, v }) => !puzzle[r][c] && v && v !== solution[r][c])
          if (wrong) return `Something in row ${wrong.r + 1} isn’t right. Take another look.`
          const empties = grid.flatMap((row, r) => row.map((v, c) => ({ r, c, v }))).filter(({ v }) => !v)
            .map(({ r, c }) => ({ r, c, n: [1, 2, 3, 4, 5, 6].filter(v => sudokuOk(grid, r, c, v)).length }))
            .sort((a, b) => a.n - b.n)
          // Easiest squares first; each new hint points somewhere different
          const t = empties[n % Math.max(1, Math.min(3, empties.length))]
          if (!t) return null
          setSel([t.r, t.c])
          return t.n === 1
            ? `Look at row ${t.r + 1}, column ${t.c + 1} (I’ve selected it). Only one number can go there.`
            : `Try row ${t.r + 1}, column ${t.c + 1} next (I’ve selected it).`
        }}
        getReveal={() => {
          // One step: fix a wrong number, or fill the selected / an empty square
          const cells = grid.flatMap((row, r) => row.map((v, c) => ({ r, c, v }))).filter(({ r, c }) => !puzzle[r][c])
          const wrong = cells.find(({ r, c, v }) => v && v !== solution[r][c])
          const empty = cells.filter(({ v }) => !v)
          const target = wrong ?? empty.find(({ r, c }) => sel?.[0] === r && sel?.[1] === c) ?? empty[0]
          if (!target) return null
          const { r, c } = target
          setGrid(g => g.map((row, i) => row.map((x, j) => (i === r && j === c ? solution[r][c] : x))))
          setSel([r, c])
          return wrong
            ? `Row ${r + 1}, column ${c + 1} is ${solution[r][c]}, not ${wrong.v}. Fixed!`
            : `Row ${r + 1}, column ${c + 1} is ${solution[r][c]}. Filled in!`
        }} />

      {solved && <SolvedBanner title="Solved! Dug-Dug is wagging 🐾" detail={art ? `Today’s drawing: ${art.title}` : undefined} artIndex={1} />}
    </div>
  )
}
