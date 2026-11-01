import { describe, it, expect } from 'vitest'
import { DEFAULT_PLANS, mergePlans, tierPrice } from '@/lib/printClub'
import { signupsToCsv } from '@/lib/printClubExport'

describe('Print Club prices', () => {
  it('charges the agreed price for each region and tier', () => {
    expect(tierPrice(DEFAULT_PLANS.india, 'broke')).toBe('₹499')
    expect(tierPrice(DEFAULT_PLANS.india, 'baroque')).toBe('₹750')
    expect(tierPrice(DEFAULT_PLANS.international, 'broke')).toBe('$11')
    expect(tierPrice(DEFAULT_PLANS.international, 'baroque')).toBe('$16')
  })

  it('fills in the lower price for settings saved before tiers existed', () => {
    const plans = mergePlans({ india: { price: '₹800', region: 'In India' } })
    expect(plans.india).toEqual({ price: '₹800', basicPrice: '₹499', region: 'In India' })
    expect(plans.international).toEqual(DEFAULT_PLANS.international)
  })

  it('exports each member’s tier and price, treating older sign-ups as the higher tier', () => {
    const base = { created_at: '2026-11-01T00:00:00Z', name: 'A' }
    const csv = signupsToCsv([{ ...base, plan: 'india', tier: 'broke' }, { ...base, plan: 'international' }])
    expect(csv).toContain('"Monet Can’t Buy Me Love","₹499 / month"')
    expect(csv).toContain('"Gone Baroque","$16 / month"')
  })
})
