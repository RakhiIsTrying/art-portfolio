/** Little drawings of each puzzle, for the tabs. */
const INK = '#1a1014'

export function GameIcon({ id, size = 30 }: { id: string; size?: number }) {
  const box = { width: size, height: size, display: 'block', flexShrink: 0 } as const
  switch (id) {
    // Bee-doku: a sudoku grid with a few numbers
    case 'sudoku':
      return (
        <svg viewBox="0 0 30 30" style={box} aria-hidden>
          <rect x="1.5" y="1.5" width="27" height="27" rx="4" fill="#fff8e1" stroke={INK} strokeWidth="2" />
          <path d="M10.5 1.5v27M19.5 1.5v27M1.5 10.5h27M1.5 19.5h27" stroke={INK} strokeWidth="1" opacity=".35" />
          <rect x="10.5" y="10.5" width="9" height="9" fill="#e8c55a" />
          <text x="6" y="9" fontSize="7" fontWeight="800" textAnchor="middle" fill={INK}>1</text>
          <text x="15" y="18" fontSize="7" fontWeight="800" textAnchor="middle" fill={INK}>6</text>
          <text x="24" y="27" fontSize="7" fontWeight="800" textAnchor="middle" fill="#4a3a7a">3</text>
        </svg>
      )
    // Ben's Dash: green, yellow and red letter tiles
    case 'wordle':
      return (
        <svg viewBox="0 0 30 30" style={box} aria-hidden>
          {[['#3f8f4f', 'B'], ['#d9a521', 'E'], ['#b8433b', 'N']].map(([c, l], i) => (
            <g key={i} transform={`translate(${1 + i * 9.6} ${i === 1 ? 6 : 9}) rotate(${(i - 1) * 6} 4.5 6)`}>
              <rect width="9" height="12" rx="1.6" fill={c} />
              <text x="4.5" y="9" fontSize="8" fontWeight="800" textAnchor="middle" fill="#fff">{l}</text>
            </g>
          ))}
          <path d="M3 25.5h24" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 3.5" />
        </svg>
      )
    // Dug-Dug Kings: coloured regions with a crown
    case 'queens':
      return (
        <svg viewBox="0 0 30 30" style={box} aria-hidden>
          <rect x="1.5" y="1.5" width="27" height="27" rx="4" fill="#c9e6dd" stroke={INK} strokeWidth="2" />
          <path d="M1.5 15.5h13v13h-9a4 4 0 0 1-4-4z" fill="#e8c6e0" />
          <path d="M19.5 1.5h5a4 4 0 0 1 4 4v10h-9z" fill="#c4cdf0" />
          <path d="M8 13l2-6 3 4 2-5 2 5 3-4 2 6z" fill="#e8c55a" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
          <rect x="8" y="13" width="14" height="2.5" rx=".8" fill="#e8c55a" stroke={INK} strokeWidth="1.3" />
          <circle cx="24" cy="23" r="2.6" fill={INK} />
        </svg>
      )
    // Bee's Hive: honeycomb with a gold centre
    case 'bee': {
      const hex = (cx: number, cy: number, fill: string) => {
        const r = 5.2
        const pts = [0, 60, 120, 180, 240, 300].map(a => `${cx + r * Math.cos((a * Math.PI) / 180)},${cy + r * Math.sin((a * Math.PI) / 180)}`).join(' ')
        return <polygon key={`${cx}-${cy}`} points={pts} fill={fill} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      }
      const around = [[0, -9], [7.8, -4.5], [7.8, 4.5], [0, 9], [-7.8, 4.5], [-7.8, -4.5]]
      return (
        <svg viewBox="0 0 30 30" style={box} aria-hidden>
          {around.map(([dx, dy]) => hex(15 + dx, 15 + dy, '#fff3c4'))}
          {hex(15, 15, '#e8c55a')}
        </svg>
      )
    }
    // Benathon: a running route through checkpoints to a flag
    case 'wend':
      return (
        <svg viewBox="0 0 30 30" style={box} aria-hidden>
          <rect x="1.5" y="1.5" width="27" height="27" rx="4" fill="#fbf1e6" stroke={INK} strokeWidth="2" />
          <path d="M7 7h16v8H7v8h14" fill="none" stroke="#d9935a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7" cy="7" r="3.4" fill={INK} />
          <text x="7" y="9.2" fontSize="5.5" fontWeight="800" textAnchor="middle" fill="#fff">1</text>
          <circle cx="23" cy="15" r="3.4" fill="#a0521d" />
          <text x="23" y="17.2" fontSize="5.5" fontWeight="800" textAnchor="middle" fill="#fff">2</text>
          <path d="M22 26v-8" stroke={INK} strokeWidth="1.4" />
          <path d="M22 18h5l-1.6 2 1.6 2h-5z" fill="#b8433b" />
        </svg>
      )
    // Dug's Dig: a letter grid with DIG and BONE traced
    case 'dig':
      return (
        <svg viewBox="0 0 30 30" style={box} aria-hidden>
          <rect x="1.5" y="1.5" width="27" height="27" rx="4" fill="#f3e7d6" stroke={INK} strokeWidth="2" />
          <path d="M7 7h16" fill="none" stroke="#c9a3e0" strokeWidth="6" strokeLinecap="round" />
          <path d="M7 15h16v8" fill="none" stroke="#f2c97d" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          {[['D', 7, 7], ['I', 15, 7], ['G', 23, 7], ['B', 7, 15], ['O', 15, 15], ['N', 23, 15], ['P', 7, 23], ['S', 15, 23], ['E', 23, 23]].map(([l, x, y]) => (
            <text key={`${x}-${y}`} x={x} y={Number(y) + 2.6} fontSize="7" fontWeight="800" textAnchor="middle" fill={INK}>{l}</text>
          ))}
        </svg>
      )
    default:
      return null
  }
}
