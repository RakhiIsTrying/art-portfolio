// Print Club pricing: the region follows the member's shipping country, the tier is their choice
export type PlanId = 'india' | 'international'
export type TierId = 'broke' | 'baroque'

/** `price` is the Gone Baroque price, `basicPrice` the Monet Can’t Buy Me Love price. */
export type Plans = Record<PlanId, { price: string; basicPrice: string; region: string }>

// Defaults, the live prices come from Admin → Shop settings
export const DEFAULT_PLANS: Plans = {
  india:         { price: '₹750', basicPrice: '₹499', region: 'In India' },
  international: { price: '$16',  basicPrice: '$11',  region: 'International' },
}

const PRINT_PERK = { title: 'A new print, every month', body: 'A fresh piece of original art mailed to your door.' }
const PAINT_PERK = { title: 'Paint-along cards 🎨', body: 'Grab a brush and paint along, so you get to make a little art of your own too.' }
const CANCEL_PERK = { title: 'Cancel anytime', body: 'No commitment. Stay as long as the prints make you happy.' }

// What members get, edit freely
export const TIERS: Record<TierId, { name: string; color: string; tagline: string; perks: { title: string; body: string }[] }> = {
  broke: {
    name: 'Monet Can’t Buy Me Love',
    color: '#1a6060',
    tagline: 'Art in your mailbox instead of bills.',
    perks: [PRINT_PERK, PAINT_PERK, CANCEL_PERK],
  },
  baroque: {
    name: 'Gone Baroque',
    color: '#7a3040',
    tagline: 'The full, gloriously over-the-top membership.',
    perks: [
      PRINT_PERK,
      PAINT_PERK,
      { title: 'Monthly goodies 🎁', body: 'Little extras tucked in with each month’s print: bookmarks, special edition stickers and other surprises.' },
      { title: 'Birthday special 🎂', body: 'Add your birthday and ask for a special request: a favourite character, a dedication, something just for you.' },
      CANCEL_PERK,
    ],
  },
}
export const TIER_IDS = Object.keys(TIERS) as TierId[]
export const isTierId = (v: unknown): v is TierId => v === 'broke' || v === 'baroque'

/** A saved sign-up's tier. Sign-ups from before tiers existed paid the higher price. */
export const tierOf = (saved: unknown): TierId => (isTierId(saved) ? saved : 'baroque')

export const tierPrice = (plan: Plans[PlanId], tier: TierId) => (tier === 'broke' ? plan.basicPrice : plan.price)

/** Saved prices over the defaults, one region at a time, so settings saved before tiers keep working. */
export function mergePlans(saved?: Partial<Record<PlanId, Partial<Plans[PlanId]>>>): Plans {
  return {
    india: { ...DEFAULT_PLANS.india, ...saved?.india },
    international: { ...DEFAULT_PLANS.international, ...saved?.international },
  }
}

export function planForCountry(country: string): PlanId {
  return /^\s*(india|bharat|in|ind)\s*$/i.test(country) ? 'india' : 'international'
}
