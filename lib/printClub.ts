// Print Club pricing, the plan follows the member's shipping country
export type PlanId = 'india' | 'international'

export type Plans = Record<PlanId, { price: string; region: string }>

// Defaults, the live prices come from Admin → Shop settings
export const DEFAULT_PLANS: Plans = {
  india:         { price: '₹750', region: 'In India' },
  international: { price: '$16',  region: 'International' },
}

export function planForCountry(country: string): PlanId {
  return /^\s*(india|bharat|in|ind)\s*$/i.test(country) ? 'india' : 'international'
}

