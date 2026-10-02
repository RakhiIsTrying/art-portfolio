import { describe, it, expect } from 'vitest'
import { COLLECTIONS, getCollection } from '@/lib/collections'

describe('getCollection', () => {
  it('returns collection by slug', () => {
    const c = getCollection('music')
    expect(c?.name).toBe('Music & Pop Culture')
    expect(c?.icon_emoji).toBe('🎵')
  })

  it('returns undefined for unknown slug', () => {
    expect(getCollection('unknown')).toBeUndefined()
  })

  it('has exactly 5 collections', () => {
    expect(COLLECTIONS).toHaveLength(5)
  })
})
