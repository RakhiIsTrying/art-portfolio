import { describe, it, expect } from 'vitest'
import { ALL_COUNTRIES, findCountry, flagOf, searchCountries } from '@/lib/countries'

describe('countries', () => {
  it('has every code the picker needs', () => {
    expect(ALL_COUNTRIES.length).toBeGreaterThan(200)
    expect(new Set(ALL_COUNTRIES.map(c => c.iso)).size).toBe(ALL_COUNTRIES.length)
    expect(ALL_COUNTRIES.every(c => /^\+\d+$/.test(c.dial) && c.name)).toBe(true)
  })

  it('searches by name, starts-with first, and by other names and dialling codes', () => {
    expect(searchCountries('ind')[0].name).toBe('India')
    expect(searchCountries('ger').map(c => c.name)).toContain('Germany')
    expect(searchCountries('turkiye')[0].iso).toBe('TR')
    expect(searchCountries('uk').map(c => c.iso)).toContain('GB')
    expect(searchCountries('+91').map(c => c.iso)).toContain('IN')
    expect(searchCountries('zzzz')).toEqual([])
    expect(searchCountries('')).toHaveLength(ALL_COUNTRIES.length)
  })

  it('recognises a typed shipping country', () => {
    expect(findCountry(' india ')?.iso).toBe('IN')
    expect(findCountry('Bharat')?.iso).toBe('IN')
    expect(findCountry('USA')?.iso).toBe('US')
    expect(findCountry('United Kingdom')?.iso).toBe('GB')
    expect(findCountry('Uni')).toBeUndefined()
    expect(findCountry('')).toBeUndefined()
  })

  it('makes flags', () => {
    expect(flagOf('IN')).toBe('🇮🇳')
  })
})
