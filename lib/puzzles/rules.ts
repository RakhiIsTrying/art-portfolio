// Puzzle rules shared by the daily generator and the games (no word data, safe for the browser)

/** Can v go at row r, column c of a 6×6 sudoku (boxes of 2 rows × 3 columns)? */
export function sudokuOk(g: number[][], r: number, c: number, v: number) {
  for (let k = 0; k < 6; k++) if ((k !== c && g[r][k] === v) || (k !== r && g[k][c] === v)) return false
  const br = r - (r % 2), bc = c - (c % 3)
  for (let i = br; i < br + 2; i++) for (let j = bc; j < bc + 3; j++) if ((i !== r || j !== c) && g[i][j] === v) return false
  return true
}

/** A host's clue: which word, how many of its first letters are shown (all of them once revealed), and the words clued so far. */
export type WordClue = { word: string; show: number; told: string[] }

// Hints stop short of the whole word, which is what the reveal is for
const clueLimit = (word: string) => Math.min(3, word.length - 1)

function freshClue(clue: WordClue | null, left: string[], show: (word: string) => number, prefer?: string): WordClue {
  const untold = left.filter(w => !clue?.told.includes(w))
  // Every word has had a turn: go round again, moving on from the current one if possible
  const others = left.filter(w => w !== clue?.word)
  const pool = untold.length ? untold : others.length ? others : left
  const word = prefer && pool.includes(prefer) ? prefer : pool[0]
  return { word, show: show(word), told: [...(untold.length ? clue?.told ?? [] : []), word] }
}

/** The next hint: another letter of the current word, or a word still to find. Null when none are left. */
export function nextClue(clue: WordClue | null, left: string[], prefer?: string): WordClue | null {
  if (!left.length) return null
  if (clue && left.includes(clue.word) && clue.show < clueLimit(clue.word)) return { ...clue, show: clue.show + 1 }
  return freshClue(clue, left, () => 1, prefer)
}

/** The next reveal: the word behind the latest hint, or a new one if that's been found or already revealed. */
export function revealClue(clue: WordClue | null, left: string[]): WordClue | null {
  if (!left.length) return null
  if (clue && left.includes(clue.word) && clue.show < clue.word.length) return { ...clue, show: clue.word.length }
  return freshClue(clue, left, w => w.length)
}

/** A Ben's Dash clue the player can't already see from their guesses or Dug-Dug's reveals. Null when there's nothing new to say. */
export function wordleHint(answer: string, guesses: string[], revealed: number[], n: number): string | null {
  const spots = [...answer].map((_, i) => i)
  const known = spots.filter(i => revealed.includes(i) || guesses.some(g => g[i] === answer[i]))
  const open = spots.filter(i => !known.includes(i))

  // A letter that hasn't shown up yet
  const missing = [...new Set(answer)].filter(l => !guesses.some(g => g.includes(l)) && !known.some(i => answer[i] === l))
  if (missing.length) return `The word contains “${missing[n % missing.length].toUpperCase()}”.`

  // All letters found: a spot one of them isn't in, that they haven't already tried
  const unplaced = [...new Set(open.map(i => answer[i]))]
  const notHere = unplaced.flatMap(l => open.filter(i => answer[i] !== l && !guesses.some(g => g[i] === l)).map(i => ({ l, i })))
  if (!notHere.length) return null
  const m = notHere[n % notHere.length]
  return `“${m.l.toUpperCase()}” is not letter ${m.i + 1}.`
}

/** A square marked by a Dug-Dug Kings hint. Whether it's a right or wrong spot comes from comparing it with the solution. */
export type KingsMark = { r: number; c: number }

/**
 * The next square for a Dug-Dug Kings hint: a misplaced pup not yet pointed out, otherwise
 * a right square not yet marked. Null when every remaining square has already been marked.
 * The board holds 2 where a pup is placed.
 */
export function kingsHint(board: number[][], solution: number[], marks: KingsMark[]): KingsMark | null {
  const marked = (r: number, c: number) => marks.some(m => m.r === r && m.c === c)
  for (let r = 0; r < board.length; r++) for (let c = 0; c < board[r].length; c++) {
    if (board[r][c] === 2 && solution[r] !== c && !marked(r, c)) return { r, c }
  }
  const r = solution.findIndex((c, row) => board[row][c] !== 2 && !marked(row, c))
  return r === -1 ? null : { r, c: solution[r] }
}

/** The valid Dug-Dug Kings solution closest to the player's pups, as some days have more than one. Ties keep the day's own solution. */
export function kingsTarget(regions: number[][], board: number[][], solution: number[]): number[] {
  const n = regions.length
  const overlap = (cols: number[]) => cols.filter((c, r) => board[r][c] === 2).length
  let best = solution
  const cols: number[] = []
  const place = (r: number) => {
    if (r === n) { if (overlap(cols) > overlap(best)) best = [...cols]; return }
    for (let c = 0; c < n; c++) {
      const clash = cols.some((q, i) => q === c || regions[i][q] === regions[r][c] || (i === r - 1 && Math.abs(q - c) <= 1))
      if (clash) continue
      cols.push(c); place(r + 1); cols.pop()
    }
  }
  place(0)
  return best
}
