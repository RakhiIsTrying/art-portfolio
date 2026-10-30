'use client'
import { useEffect, useRef } from 'react'
import { CENTERED, HintButton, BEE_BEN, DugDug, HONEY, INK, Rules, SmallButton, SolvedBanner, useDailyState } from './shared'

type Props = { date: string; size: number; numbers: Record<string, number>; last: number; solution: number[]; onSolved: () => void }

export default function Wend({ date, size, numbers, last, solution, onSolved }: Props) {
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
    <div className="vgb-puzzle" style={CENTERED}>
      <Rules who="dug" title="Walkies" intro="Dug-Dug wants to sniff every square on his walk."
        steps={['Start on 1 and draw one path through every square.', <>Pass the numbers in order and finish on {last}.</>, 'Drag, or tap square by square.', 'Go back over the line to undo.']} />

      <div ref={boardRef} onPointerDown={down} onPointerMove={move} onPointerUp={() => (dragging.current = false)}
        style={{ position: 'relative', width: 'min(100%, 520px)', aspectRatio: '1', border: `2px solid ${INK}`, background: '#fff', touchAction: 'none', userSelect: 'none', cursor: solved ? 'default' : 'pointer' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)` }}>
          {Array.from({ length: N }).map((_, i) => (
            <div key={i} style={{
              borderRight: (i % size) < size - 1 ? '1px solid #e2dcdc' : 'none',
              borderBottom: i < N - size ? '1px solid #e2dcdc' : 'none',
              background: inPath.has(i) ? 'rgba(232,197,90,.22)' : 'transparent', transition: 'background .15s',
            }} />
          ))}
        </div>

        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {path.length > 1 && (
            <polyline points={path.map(i => centre(i).join(',')).join(' ')} fill="none"
                      stroke={solved ? BEE_BEN : HONEY} strokeWidth={100 / size / 2.6} strokeLinecap="round" strokeLinejoin="round" />
          )}
          {Object.entries(numbers).map(([cell, num]) => {
            const [x, y] = centre(Number(cell))
            const reached = inPath.has(Number(cell))
            return (
              <g key={cell}>
                <circle cx={x} cy={y} r={100 / size / 3.4} fill={reached ? BEE_BEN : INK} />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={100 / size / 3.4} fontWeight={700}>{num}</text>
              </g>
            )
          })}
        </svg>

        {/* Dug-Dug trots along at the end of the path */}
        {path.length > 0 && (() => {
          const [x, y] = centre(path[path.length - 1])
          return (
            <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', width: `${100 / size * .78}%`, pointerEvents: 'none', transition: 'left .12s, top .12s' }}>
              <DugDug size="100%" />
            </div>
          )
        })()}
      </div>

      {!solved && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 14 }}>
          <SmallButton bee="undo" onClick={() => setPath(p => p.slice(0, -1))}>Undo</SmallButton>
          <SmallButton bee="clear" onClick={() => setPath([])}>Clear</SmallButton>
          <span style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#a0a0a0' }}>
            {path.length} / {N} · next: {Math.min(nextNumber, last)}
          </span>
        </div>
      )}
      <HintButton date={date} game="wend" disabled={solved}
        getHint={n => {
          // Clue: where the path went wrong, or which way to go next
          let same = 0
          while (same < path.length && path[same] === solution[same]) same++
          if (same < path.length) return `The walk goes wrong after square ${same}. Go back and try another way.`
          // Nothing drawn yet: talk about the first step out of the 1
          const walked = path.length ? same : 1
          const from = path.length ? path[path.length - 1] : solution[0], to = solution[walked]
          const way = to === from - size ? 'up' : to === from + size ? 'down' : to === from - 1 ? 'left' : 'right'
          if (n % 2 === 0) return path.length ? `From where Dug-Dug is now, head ${way}.` : `Start on the 1 and head ${way}.`
          // Every other hint: how far the next number is along the route
          const nextNum = 1 + path.filter(i => numbers[i] !== undefined).length
          const target = path.length ? nextNum : 2
          const at = solution.findIndex((c, k) => k >= walked && numbers[c] === target)
          return at === -1 ? `Head ${way} next.` : `Number ${target} is ${at - walked + 1} ${at - walked === 0 ? 'step' : 'steps'} away along the walk.`
        }}
        getReveal={() => {
          // One step: move Dug-Dug to the next square (backing up first if the path went wrong)
          let same = 0
          while (same < path.length && path[same] === solution[same]) same++
          const backedUp = same < path.length
          setPath(solution.slice(0, Math.min(solution.length, same + 1)))
          return backedUp ? `Backed up to square ${same} and took the right next step.` : 'Woof! One more square.'
        }} />

      {solved && <SolvedBanner title="Walkies complete! 🐾" detail="Dug-Dug is happily tired." artIndex={5} />}
    </div>
  )
}
