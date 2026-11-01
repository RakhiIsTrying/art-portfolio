import { describe, it, expect } from 'vitest'
import { nextClue, revealClue, wordleHint, type WordClue } from '@/lib/puzzles/rules'

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
