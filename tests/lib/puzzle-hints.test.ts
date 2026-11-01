import { describe, it, expect } from 'vitest'
import { kingsHint, kingsTarget, nextClue, revealClue, wordleHint, type WordClue } from '@/lib/puzzles/rules'

describe('wordleHint', () => {
  it('never names a letter already guessed', () => {
    expect(wordleHint('crane', ['cloud'], [], 0)).toBe('The word contains “R”.')
  })

  it('never names a letter Dug-Dug already revealed', () => {
    expect(wordleHint('crane', ['cloud'], [1, 2], 0)).toBe('The word contains “N”.')
  })

  it('never says a letter is not in a spot they already tried it in', () => {
    // Every letter found, with R, A and N each already tried in some wrong spots
    const guesses = ['nacre']
    for (let n = 0; n < 12; n++) {
      const hint = wordleHint('crane', guesses, [], n)!
      const [, letter, spot] = hint.match(/“(.)” is not letter (\d)/)!
      expect(guesses[0][Number(spot) - 1]).not.toBe(letter.toLowerCase())
    }
  })

  it('never talks about a spot that is already right', () => {
    for (let n = 0; n < 12; n++) {
      // C and A are right; R, N and E have each been tried somewhere wrong
      const hint = wordleHint('crane', ['cearn'], [], n)!
      const spot = Number(hint.match(/letter (\d)/)![1])
      expect([1, 3]).not.toContain(spot)
    }
  })

  it('stays quiet when the remaining letters have already been tried in each other’s spots', () => {
    expect(wordleHint('crane', ['carne'], [], 0)).toBeNull()
  })

  it('has nothing to say when every spot is known', () => {
    expect(wordleHint('crane', ['crown', 'brane'], [], 0)).toBeNull()
    expect(wordleHint('crane', [], [0, 1, 2, 3, 4], 0)).toBeNull()
  })
})

describe('nextClue', () => {
  const left = ['honey', 'hive', 'comb']

  it('starts on a word still to find, preferring the one asked for', () => {
    expect(nextClue(null, left)).toEqual({ word: 'honey', show: 1, told: ['honey'] })
    expect(nextClue(null, left, 'comb')?.word).toBe('comb')
  })

  it('builds up the same word, one letter at a time, then moves on', () => {
    let clue = nextClue(null, left)!
    clue = nextClue(clue, left)!
    expect(clue).toMatchObject({ word: 'honey', show: 2 })
    clue = nextClue(clue, left)!
    expect(clue).toMatchObject({ word: 'honey', show: 3 })
    expect(nextClue(clue, left)).toMatchObject({ word: 'hive', show: 1 })
  })

  it('starts afresh on another word when the current one gets found', () => {
    const clue: WordClue = { word: 'honey', show: 2, told: ['honey'] }
    expect(nextClue(clue, ['hive', 'comb'])).toMatchObject({ word: 'hive', show: 1 })
  })

  it('moves on after a reveal instead of hinting the same word', () => {
    const clue: WordClue = { word: 'honey', show: 5, told: ['honey'] }
    expect(nextClue(clue, left)).toMatchObject({ word: 'hive', show: 1 })
  })

  it('never spells out a whole short word', () => {
    let clue = nextClue(null, ['bee'])!
    clue = nextClue(clue, ['bee'])!
    expect(clue.show).toBe(2)
    expect(nextClue(clue, ['bee'])).toMatchObject({ word: 'bee', show: 1 })
  })

  it('goes round again once every word has been clued, without repeating the current one', () => {
    const clue: WordClue = { word: 'comb', show: 3, told: ['honey', 'hive', 'comb'] }
    expect(nextClue(clue, left)).toEqual({ word: 'honey', show: 1, told: ['honey'] })
  })

  it('returns null when everything is found', () => {
    expect(nextClue({ word: 'honey', show: 1, told: ['honey'] }, [])).toBeNull()
  })
})

describe('revealClue', () => {
  const left = ['honey', 'hive']

  it('reveals the word behind the latest hint', () => {
    expect(revealClue({ word: 'hive', show: 3, told: ['hive'] }, left)).toEqual({ word: 'hive', show: 4, told: ['hive'] })
  })

  it('reveals another word if the hinted one has been found', () => {
    expect(revealClue({ word: 'comb', show: 3, told: ['comb'] }, left)).toEqual({ word: 'honey', show: 5, told: ['comb', 'honey'] })
  })

  it('does not reveal the same word twice', () => {
    expect(revealClue({ word: 'honey', show: 5, told: ['honey'] }, left)).toMatchObject({ word: 'hive', show: 4 })
  })

  it('works without an earlier hint', () => {
    expect(revealClue(null, left)).toMatchObject({ word: 'honey', show: 5 })
  })

  it('returns null when everything is found', () => {
    expect(revealClue({ word: 'honey', show: 5, told: [] }, [])).toBeNull()
  })
})

describe('kingsHint', () => {
  const solution = [1, 3, 0, 2]
  const empty = () => Array.from({ length: 4 }, () => [0, 0, 0, 0])

  it('marks a right square when no pup is misplaced', () => {
    expect(kingsHint(empty(), solution, [])).toEqual({ r: 0, c: 1 })
  })

  it('points out a misplaced pup first', () => {
    const board = empty(); board[2][3] = 2
    expect(kingsHint(board, solution, [])).toEqual({ r: 2, c: 3 })
  })

  it('moves on to the next misplaced pup, then to a right square', () => {
    const board = empty(); board[0][0] = 2; board[2][3] = 2
    expect(kingsHint(board, solution, [{ r: 0, c: 0 }])).toEqual({ r: 2, c: 3 })
    expect(kingsHint(board, solution, [{ r: 0, c: 0 }, { r: 2, c: 3 }])).toEqual({ r: 0, c: 1 })
  })

  it('skips pups already in the right place and squares already marked', () => {
    const board = empty(); board[0][1] = 2
    expect(kingsHint(board, solution, [{ r: 1, c: 3 }])).toEqual({ r: 2, c: 0 })
  })

  it('ignores crosses', () => {
    const board = empty(); board[0][0] = 1
    expect(kingsHint(board, solution, [])).toEqual({ r: 0, c: 1 })
  })

  it('has nothing to add once every remaining square is marked', () => {
    const marks = solution.map((c, r) => ({ r, c }))
    expect(kingsHint(empty(), solution, marks)).toBeNull()
  })
})

describe('kingsTarget', () => {
  // One colour per row, which allows exactly two solutions on a 4×4 board
  const regions = [[0, 0, 0, 0], [1, 1, 1, 1], [2, 2, 2, 2], [3, 3, 3, 3]]
  const solution = [1, 3, 0, 2]
  const empty = () => Array.from({ length: 4 }, () => [0, 0, 0, 0])

  it('keeps the day’s solution on an empty board', () => {
    expect(kingsTarget(regions, empty(), solution)).toEqual(solution)
  })

  it('follows the other valid solution when the player’s pups fit it', () => {
    const board = empty(); board[0][2] = 2
    expect(kingsTarget(regions, board, solution)).toEqual([2, 0, 3, 1])
  })

  it('keeps the day’s solution when a pup fits neither', () => {
    const board = empty(); board[0][0] = 2
    expect(kingsTarget(regions, board, solution)).toEqual(solution)
  })
})
