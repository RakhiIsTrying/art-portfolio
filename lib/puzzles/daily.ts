// Daily puzzles — every visitor gets the same puzzles for the same (India-time) date.
// Word data: SCOWL word lists (see data/SCOWL-COPYRIGHT.txt).
import wordleAnswers from './data/wordle-answers.json'
import beePuzzles from './data/bee.json'
import { sudokuOk } from './rules'

const TZ = 'Asia/Kolkata'
const EPOCH = Date.UTC(2026, 9, 30) // puzzle #1 (launch day)

export type Daily = {
  date: string        // 2026-10-30
  number: number      // #1, #2, …
  sudoku: { puzzle: number[][]; solution: number[][] }
  queens: { regions: number[][]; unique: boolean; solution: number[] }   // solution: queen column for each row
  wend: { size: number; numbers: Record<string, number>; last: number; solution: number[] }  // solution: one valid path
  wordle: { answer: string }
  bee: { letters: string; center: string; answers: string[] }
}

// A new set of puzzles starts at 12:01 am India time
const ROLLOVER_MS = 60_000

export function todayKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now.getTime() - ROLLOVER_MS))
}

export const LAUNCH_DATE = '2026-10-30'
export const ARCHIVE_DAYS = 30

/** Today and the days before it that can be played (back to launch, at most a month). */
export function archiveDates(today = todayKey()) {
  const dates: string[] = []
  for (let i = 0; i < ARCHIVE_DAYS; i++) {
    const d = new Date(Date.parse(today + 'T00:00:00Z') - i * 86_400_000).toISOString().slice(0, 10)
    if (d < LAUNCH_DATE) break
    dates.push(d)
  }
  return dates
}

/** Seeded PRNG (mulberry32) from a string. */
function rngFrom(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19) }
  let a = h >>> 0
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
type Rng = () => number
const pick = <T,>(rng: Rng, arr: T[]) => arr[Math.floor(rng() * arr.length)]
function shuffle<T>(rng: Rng, arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

// ── Mini sudoku: 6×6, boxes of 2 rows × 3 columns ─────────────────────────
function sudoku(rng: Rng) {
  const digits = shuffle(rng, [1, 2, 3, 4, 5, 6])
  const rows = shuffle(rng, [0, 1, 2]).flatMap(b => shuffle(rng, [0, 1]).map(r => b * 2 + r))
  const cols = shuffle(rng, [0, 1]).flatMap(s => shuffle(rng, [0, 1, 2]).map(c => s * 3 + c))
  const base = (r: number, c: number) => (3 * (r % 2) + Math.floor(r / 2) + c) % 6
  const solution = rows.map(r => cols.map(c => digits[base(r, c)]))

  // Remove clues while the answer stays unique, keeping it a relaxed size
  const puzzle = solution.map(row => [...row])
  let givens = 36
  for (const cell of shuffle(rng, [...Array(36).keys()])) {
    if (givens <= 14) break
    const r = Math.floor(cell / 6), c = cell % 6, keep = puzzle[r][c]
    puzzle[r][c] = 0
    if (countSudoku(puzzle.map(row => [...row])) !== 1) puzzle[r][c] = keep
    else givens--
  }
  return { puzzle, solution }
}
function countSudoku(g: number[][], limit = 2): number {
  for (let i = 0; i < 36; i++) {
    const r = Math.floor(i / 6), c = i % 6
    if (g[r][c]) continue
    let n = 0
    for (let v = 1; v <= 6; v++) {
      if (sudokuOk(g, r, c, v)) { g[r][c] = v; n += countSudoku(g, limit - n); g[r][c] = 0; if (n >= limit) return n }
    }
    return n
  }
  return 1
}

// ── Queens: one per row, column and colour region; no two touching ─────────
function queens(rng: Rng, n = 7) {
  let best: { regions: number[][]; solution: number[] } | null = null
  for (let attempt = 0; attempt < 400; attempt++) {
    const cols = placeQueens(rng, n)
    if (!cols) continue
    const regions = growRegions(rng, n, cols)
    best = { regions, solution: cols }
    if (countQueens(regions, n) === 1) return { regions, unique: true, solution: cols }
  }
  return { ...best!, unique: false }
}
function placeQueens(rng: Rng, n: number): number[] | null {
  const out: number[] = []
  const go = (r: number): boolean => {
    if (r === n) return true
    for (const c of shuffle(rng, [...Array(n).keys()])) {
      if (out.includes(c) || (r > 0 && Math.abs(out[r - 1] - c) < 2)) continue
      out.push(c); if (go(r + 1)) return true; out.pop()
    }
    return false
  }
  return go(0) ? out : null
}
function growRegions(rng: Rng, n: number, cols: number[]) {
  const g = Array.from({ length: n }, () => Array(n).fill(-1))
  cols.forEach((c, r) => { g[r][c] = r })
  let left = n * n - n
  while (left > 0) {
    const r = Math.floor(rng() * n), c = Math.floor(rng() * n)
    if (g[r][c] === -1) continue
    const [dr, dc] = pick(rng, [[1, 0], [-1, 0], [0, 1], [0, -1]])
    const nr = r + dr, nc = c + dc
    if (nr < 0 || nc < 0 || nr >= n || nc >= n || g[nr][nc] !== -1) continue
    g[nr][nc] = g[r][c]; left--
  }
  return g
}
function countQueens(regions: number[][], n: number) {
  let count = 0
  const cols: number[] = [], usedC = new Set<number>(), usedR = new Set<number>()
  const go = (r: number) => {
    if (count > 1) return
    if (r === n) { count++; return }
    for (let c = 0; c < n; c++) {
      if (usedC.has(c) || usedR.has(regions[r][c]) || (r > 0 && Math.abs(cols[r - 1] - c) < 2)) continue
      usedC.add(c); usedR.add(regions[r][c]); cols.push(c)
      go(r + 1)
      usedC.delete(c); usedR.delete(regions[r][c]); cols.pop()
    }
  }
  go(0)
  return count
}

// ── Wend: draw one path through every cell, hitting the numbers in order ────
function wend(rng: Rng, size = 6) {
  const N = size * size
  let path: number[] = []
  while (path.length !== N) {
    path = [Math.floor(rng() * N)]
    const seen = new Set(path)
    const nbrs = (i: number) => {
      const r = Math.floor(i / size), c = i % size
      return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
        .filter(([a, b]) => a >= 0 && b >= 0 && a < size && b < size).map(([a, b]) => a * size + b).filter(x => !seen.has(x))
    }
    for (;;) {
      const options = nbrs(path.at(-1)!)
      if (!options.length) break
      // Warnsdorff: go where there are fewest onward moves, ties broken randomly
      const scored = shuffle(rng, options).map(o => [o, nbrs(o).length] as const)
      const min = Math.min(...scored.map(s => s[1]))
      const next = scored.find(s => s[1] === min)![0]
      path.push(next); seen.add(next)
    }
  }
  const checkpoints = [0, ...shuffle(rng, [...Array(N - 2).keys()].map(i => i + 1)).slice(0, 6).sort((a, b) => a - b), N - 1]
  const numbers: Record<string, number> = {}
  checkpoints.forEach((idx, k) => { numbers[path[idx]] = k + 1 })
  return { size, numbers, last: checkpoints.length, solution: path }
}

export function getDaily(date = todayKey()): Daily {
  const day = Math.max(0, Math.round((Date.parse(date + 'T00:00:00Z') - EPOCH) / 86_400_000))
  return {
    date,
    number: day + 1,
    sudoku: sudoku(rngFrom('sudoku:' + date)),
    queens: queens(rngFrom('queens:' + date)),
    wend: wend(rngFrom('wend:' + date)),
    wordle: { answer: wordleAnswers[day % wordleAnswers.length] },
    bee: beePuzzles[day % beePuzzles.length],
  }
}
