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

export type PerkIconId = 'post' | 'paint' | 'stickers' | 'cake' | 'breakup'
type Perk = { icon: PerkIconId; title: string; body: string }

const PRINT_PERK = { icon: 'post', title: 'Gogh Postal', body: 'A fresh piece of original art at your door, every month. Your walls have been asking.' } as Perk
const PAINT_PERK = { icon: 'paint', title: 'Happy Little Accidents', body: 'Paint-along cards for you and a brush. No talent required, and nobody has to see your first attempt.' } as Perk
const CANCEL_PERK = { icon: 'breakup', title: 'Break Up Anytime', body: 'No commitment, no awkward talk. It’s not you, it’s the budget.' } as Perk

// What members get, edit freely
export const TIERS: Record<TierId, { name: string; color: string; tagline: string; perks: Perk[] }> = {
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
      { icon: 'stickers', title: 'Sticker Shock', body: 'Bookmarks, special edition stickers and other surprises, tucked in every month. Go on, actually use the stickers this time.' },
      { icon: 'cake', title: 'Cake Expectations', body: 'Add your birthday and make a special request: a favourite character, a dedication, something just for you. Better odds than blowing out candles.' },
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
