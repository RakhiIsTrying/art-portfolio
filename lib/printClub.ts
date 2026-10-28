// Print Club pricing — the plan follows the member's shipping country
export type PlanId = 'india' | 'international'

export const PLANS: Record<PlanId, { price: string; region: string }> = {
  india:         { price: '₹750', region: 'In India' },
  international: { price: '$16',  region: 'International' },
}

export function planForCountry(country: string): PlanId {
  return /^\s*(india|bharat|in|ind)\s*$/i.test(country) ? 'india' : 'international'
}

