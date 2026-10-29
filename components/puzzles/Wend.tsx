'use client'
import { useEffect, useRef } from 'react'
import { INK, Rules, SmallButton, SolvedBanner, useDailyState } from './shared'

type Props = { date: string; size: number; numbers: Record<string, number>; last: number; onSolved: () => void }

export default function Wend({ date, size, numbers, last, onSolved }: Props) {
  const N = size * size
  const [path, setPath] = useDailyState<number[]>(date, 'wend', [])
  const boardRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const start = Number(Object.keys(numbers).find(k => numbers[k] === 1))
  const solved = path.length === N && numbers[path[N - 1]] === last
  useEffect(() => { if (solved) onSolved() }, [solved, onSolved])

  const adjacent = (a: number, b: number) =>
    Math.abs(Math.floor(a / size) - Math.floor(b / size)) + Math.abs((a % size) - (b % size)) === 1

  // The next number the path must reach
  const nextNumber = 1 + path.filter(i => numbers[i] !== undefined).length

  function extend(cell: number) {
    setPath(p => {
      if (!p.length) return cell === start ? [cell] : p
      const at = p.indexOf(cell)
      if (at !== -1 && at === p.length - 2) return p.slice(0, -1) // step back
      if (at !== -1) return p                                    // already used
      if (!adjacent(p[p.length - 1], cell)) return p
      const expected = 1 + p.filter(i => numbers[i] !== undefined).length
      if (numbers[cell] !== undefined && numbers[cell] !== expected) return p
      return [...p, cell]
    })
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
    const at = path.indexOf(cell)
    if (at !== -1) setPath(path.slice(0, at + 1))   // rewind to here
    else extend(cell)
  }
  function move(e: React.PointerEvent) {
    if (!dragging.current || solved) return
    const cell = cellAt(e)
    if (cell !== null && cell !== path[path.length - 1]) extend(cell)
  }

  const centre = (i: number) => [((i % size) + .5) * (100 / size), (Math.floor(i / size) + .5) * (100 / size)]
  const inPath = new Set(path)

  return (
    <div>
      <Rules>Start at 1 and draw a single path through every square, passing the numbers in order and finishing on {last}. Drag (or tap square by square); go back over the line to undo.</Rules>

      <div ref={boardRef} onPointerDown={down} onPointerMove={move} onPointerUp={() => (dragging.current = false)}
        style={{ position: 'relative', width: 'min(100%, 420px)', aspectRatio: '1', border: `2px solid ${INK}`, background: '#fff', touchAction: 'none', userSelect: 'none', cursor: solved ? 'default' : 'pointer' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)` }}>
          {Array.from({ length: N }).map((_, i) => (
            <div key={i} style={{
              borderRight: (i % size) < size - 1 ? '1px solid #e2dcdc' : 'none',
              borderBottom: i < N - size ? '1px solid #e2dcdc' : 'none',
              background: inPath.has(i) ? 'rgba(176,120,128,.16)' : 'transparent', transition: 'background .15s',
            }} />
          ))}
        </div>

        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {path.length > 1 && (
            <polyline points={path.map(i => centre(i).join(',')).join(' ')} fill="none"
                      stroke={solved ? '#1a6060' : '#b07880'} strokeWidth={100 / size / 2.6} strokeLinecap="round" strokeLinejoin="round" />
          )}
          {Object.entries(numbers).map(([cell, num]) => {
            const [x, y] = centre(Number(cell))
            const reached = inPath.has(Number(cell))
            return (
              <g key={cell}>
                <circle cx={x} cy={y} r={100 / size / 3.4} fill={reached ? (solved ? '#1a6060' : '#7a3040') : INK} />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={100 / size / 3.4} fontWeight={700}>{num}</text>
              </g>
            )
          })}
        </svg>
      </div>

      {!solved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
          <SmallButton onClick={() => setPath(p => p.slice(0, -1))}>Undo</SmallButton>
          <SmallButton onClick={() => setPath([])}>Clear</SmallButton>
          <span style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#a0a0a0' }}>
            {path.length} / {N} · next: {Math.min(nextNumber, last)}
          </span>
        </div>
      )}
      {solved && <SolvedBanner title="What a wend!" />}
    </div>
  )
}
