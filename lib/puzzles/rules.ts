// Puzzle rules shared by the daily generator and the games (no word data, safe for the browser)

/** Can v go at row r, column c of a 6×6 sudoku (boxes of 2 rows × 3 columns)? */
export function sudokuOk(g: number[][], r: number, c: number, v: number) {
  for (let k = 0; k < 6; k++) if ((k !== c && g[r][k] === v) || (k !== r && g[k][c] === v)) return false
  const br = r - (r % 2), bc = c - (c % 3)
  for (let i = br; i < br + 2; i++) for (let j = bc; j < bc + 3; j++) if ((i !== r || j !== c) && g[i][j] === v) return false
  return true
}
