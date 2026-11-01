// Print Club pricing: the region follows the member's shipping country, the tier is their choice
export type PlanId = 'india' | 'international'
export type TierId = 'digital' | 'broke' | 'baroque'

/** `price` is the Gone Baroque price, `basicPrice` the Monet Can’t Buy Me Love price, `digitalPrice` Van Gogh Anywhere price. */
export type Plans = Record<PlanId, { price: string; basicPrice: string; digitalPrice: string; region: string }>

// Defaults, the live prices come from Admin → Shop settings
export const DEFAULT_PLANS: Plans = {
  india:         { price: '₹750', basicPrice: '₹499', digitalPrice: '₹199', region: 'In India' },
  international: { price: '$16',  basicPrice: '$11',  digitalPrice: '$3',  region: 'International' },
}

export type PerkIconId = 'tablet' | 'post' | 'paint' | 'stickers' | 'cake' | 'breakup'
type Perk = { icon: PerkIconId; title: string; body: string }

const PRINT_PERK = { icon: 'post', title: 'Gogh Postal', body: 'A fresh piece of original art at your door, every month. Your walls have been asking.' } as Perk
const PAINT_PERK = { icon: 'paint', title: 'Happy Little Accidents', body: 'Paint-along cards for you and a brush. Every splash counts, and there’s no wrong way to do it.' } as Perk
const CANCEL_PERK = { icon: 'breakup', title: 'Break Up Anytime', body: 'No commitment, no awkward talk. It’s not you, it’s us.' } as Perk

// What members get, edit freely
export const TIERS: Record<TierId, { name: string; color: string; tagline: string; perks: Perk[]; wip?: boolean }> = {
  digital: {
    name: 'Van Gogh Anywhere',
    wip: true,
    color: '#4a3a7a',
    tagline: 'iPad instead of an easel? Miles from a mailbox? There’s a seat saved for you.',
    perks: [
      { icon: 'tablet', title: 'Ctrl + Alt + Paint', body: 'A detailed paint-along print, emailed to you every month. Your canvas goes wherever you go.' },
      CANCEL_PERK,
    ],
  },
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
      { icon: 'stickers', title: 'Sticker Shock', body: 'Bookmarks, special edition stickers and other surprises, tucked in every month. Go on, stick them on everything.' },
      { icon: 'cake', title: 'Cake Expectations', body: 'Add your birthday and make a special request: a favourite character, a dedication, something just for you. Better odds than blowing out candles.' },
      CANCEL_PERK,
    ],
  },
}
/** Where each tier's payment link is kept in Admin → Shop settings. */
export const checkoutKey = (plan: PlanId, tier: TierId) => `${plan}_${tier}`

export const TIER_IDS = Object.keys(TIERS) as TierId[]
export const isTierId = (v: unknown): v is TierId => v === 'digital' || v === 'broke' || v === 'baroque'

/** A saved sign-up's tier. Sign-ups from before tiers existed paid the higher price. */
export const tierOf = (saved: unknown): TierId => (isTierId(saved) ? saved : 'baroque')

export const tierPrice = (plan: Plans[PlanId], tier: TierId) => ({ digital: plan.digitalPrice, broke: plan.basicPrice, baroque: plan.price })[tier]

/** Van Gogh Anywhere has nothing to post. */
export const shipsPrints = (tier: TierId) => tier !== 'digital'

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
