import { describe, it, expect, vi, afterEach } from 'vitest'
import { lookupPostcode, postcodeReady } from '@/lib/postcode'

const reply = (body: unknown, ok = true) => ({ ok, json: async () => body })
afterEach(() => vi.unstubAllGlobals())

describe('postcodeReady', () => {
  it('waits for a whole code', () => {
    expect(postcodeReady('11000', 'IN')).toBe(false)
    expect(postcodeReady('110001', 'IN')).toBe(true)
    expect(postcodeReady('9410', 'US')).toBe(false)
    expect(postcodeReady('94103', 'US')).toBe(true)
    expect(postcodeReady('SW1A 1AA', 'GB')).toBe(true)
    expect(postcodeReady('../x', 'DE')).toBe(false)
  })
})

describe('lookupPostcode', () => {
  it('uses India Post for pincodes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply([{ Status: 'Success', PostOffice: [{ District: 'Central Delhi', State: 'Delhi' }] }]))
    vi.stubGlobal('fetch', fetchMock)
    expect(await lookupPostcode('110001', 'IN')).toEqual({ city: 'Central Delhi', state: 'Delhi' })
    expect(fetchMock.mock.calls[0][0]).toContain('api.postalpincode.in/pincode/110001')
  })

  it('falls back when India Post is down or knows nothing', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValue(reply({ places: [{ 'place name': 'Janpath', state: 'New Delhi' }] }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await lookupPostcode('110001', 'IN')).toEqual({ city: 'Janpath', state: 'New Delhi' })
  })

  it('tidies place names and tries the first part of UK and Canadian codes', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(reply({}, false)).mockResolvedValue(reply({ places: [{ 'place name': 'Downtown Toronto (CN Tower / King)', state: 'Ontario' }] }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await lookupPostcode('M5V 3L9', 'CA')).toEqual({ city: 'Downtown Toronto', state: 'Ontario' })
    expect(fetchMock.mock.calls[1][0]).toMatch(/\/ca\/M5V$/)
  })

  it('returns null rather than failing, and never calls out for a bad code', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('down'))
    vi.stubGlobal('fetch', fetchMock)
    expect(await lookupPostcode('94103', 'US')).toBeNull()
    fetchMock.mockClear()
    expect(await lookupPostcode('../../etc', 'US')).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
