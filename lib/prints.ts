// Print sizes and prices — edit here to change what the shop and order form show.
// `min` is the quantity for free shipping; smaller orders pay shipping on top.
export type PrintSize = { id: string; name: string; dims: string; w: number; h: number; inr: number; usd: number; min?: number; card?: boolean }

export const PRINT_SIZES: PrintSize[] = [
  { id: 'mini',  name: 'Mini',          dims: '2.5" × 3.5"',  w: 2.5,  h: 3.5,  inr: 100,  usd: 1,  min: 10 },
  { id: 'a5',    name: 'A5',            dims: '5.8" × 8.3"',  w: 5.8,  h: 8.3,  inr: 500,  usd: 10, min: 2 },
  { id: 'a4',    name: 'A4',            dims: '8.3" × 11.7"', w: 8.3,  h: 11.7, inr: 1000, usd: 20 },
  { id: 'a3',    name: 'A3',            dims: '11.7" × 16.5"', w: 11.7, h: 16.5, inr: 2500, usd: 50 },
  { id: 'card',  name: 'Greeting card', dims: '5" × 7"',      w: 5,    h: 7,    inr: 500,  usd: 10, min: 2, card: true },
]

export type Currency = 'inr' | 'usd'
export const formatPrice = (amount: number, currency: Currency) =>
  currency === 'inr' ? `₹${amount.toLocaleString('en-IN')}` : `$${amount.toLocaleString('en-US')}`

export const lowestPrice = (currency: Currency) => Math.min(...PRINT_SIZES.map(s => s[currency]))

// Inside message options for greeting cards
export const SAMPLE_GREETINGS = [
  'Wishing you a day as happy as Dug-Dug at dinner time.',
  'Sending a big hug and a little art your way.',
  'May your day be full of zoomies and good things.',
  'From our little pack to you — happy everything!',
]
