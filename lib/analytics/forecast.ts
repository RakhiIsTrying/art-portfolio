// Simple, honest projections: a straight-line trend through daily visitors, then today's sales rates applied to it.
import type { Money, SalesSummary } from './sales'
import type { summarise } from './summary'

const HORIZON_DAYS = 30
const MIN_DAYS = 7
const FAIR_DAYS = 14
const GOOD_DAYS = 45

export type Confidence = 'too-early' | 'rough' | 'fair' | 'good'

export function forecastVisitors(daily: number[], horizon = HORIZON_DAYS) {
  const start = daily.findIndex(v => v > 0)
  const values = start === -1 ? [] : daily.slice(start)
  const n = values.length
  if (n < MIN_DAYS) return { confidence: 'too-early' as Confidence, days: n, low: 0, mid: 0, high: 0, perDay: 0 }
  const xBar = (n - 1) / 2, yBar = values.reduce((a, b) => a + b, 0) / n
  const denominator = values.reduce((t, _, x) => t + (x - xBar) ** 2, 0)
  const slope = values.reduce((t, y, x) => t + (x - xBar) * (y - yBar), 0) / denominator
  const fit = (x: number) => yBar + slope * (x - xBar)
  const spread = Math.sqrt(values.reduce((t, y, x) => t + (y - fit(x)) ** 2, 0) / Math.max(1, n - 2))
  let mid = 0, ahead = 0
  for (let h = 0; h < horizon; h++) { mid += Math.max(0, fit(n + h)); ahead += n + h - xBar }
  // About an 80% range: days vary around the trend, and the trend itself is only an estimate
  const margin = 1.28 * spread * Math.sqrt(horizon + (horizon * horizon) / n + (ahead * ahead) / denominator)
  return { confidence: (n >= GOOD_DAYS ? 'good' : n >= FAIR_DAYS ? 'fair' : 'rough') as Confidence, days: n, low: Math.max(0, Math.round(mid - margin)), mid: Math.round(mid), high: Math.round(mid + margin), perDay: Math.round((mid / horizon) * 10) / 10 }
}

/** The trend day by day, for drawing the projection. */
export function forecastDaily(daily: number[], horizon = HORIZON_DAYS) {
  const start = daily.findIndex(v => v > 0)
  const values = start === -1 ? [] : daily.slice(start)
  const n = values.length
  if (n < MIN_DAYS) return []
  const xBar = (n - 1) / 2, yBar = values.reduce((a, b) => a + b, 0) / n
  const denominator = values.reduce((t, _, x) => t + (x - xBar) ** 2, 0)
  const slope = values.reduce((t, y, x) => t + (x - xBar) * (y - yBar), 0) / denominator
  return Array.from({ length: horizon }, (_, h) => Math.max(0, Math.round(yBar + slope * (n + h - xBar))))
}

const scale = (money: Money, factor: number): Money => Object.fromEntries(Object.entries(money).map(([k, v]) => [k, v * factor]))
const plus = (a: Money, b: Money): Money => { const t = { ...a }; for (const [k, v] of Object.entries(b)) t[k] = (t[k] ?? 0) + v; return t }

/** Next 30 days if today's rates carry on: visitors × how often visitors sign up or order × what they usually spend. */
export function projectSales(s: ReturnType<typeof summarise>, sales: SalesSummary, windowVisitors = s.now.visitors) {
  const visitors = forecastVisitors(s.daily.map(d => d.visitors))
  const signups = s.signups.reduce((t, r) => t + r.value, 0)
  const orders = s.orderedPieces.reduce((t, r) => t + r.value, 0)
  const signupRate = windowVisitors ? signups / windowVisitors : 0
  const orderRate = windowVisitors ? orders / windowVisitors : 0
  const newSignups = visitors.mid * signupRate, newOrders = visitors.mid * orderRate
  const perMember = sales.members ? scale(sales.monthlyIncome, 1 / sales.members) : {}
  const perOrder = sales.orders ? scale(sales.orderValue, 1 / sales.orders) : {}
  return {
    visitors, signupRate, orderRate,
    newSignups: Math.round(newSignups * 10) / 10,
    newOrders: Math.round(newOrders * 10) / 10,
    monthlyIncome: plus(sales.monthlyIncome, scale(perMember, newSignups)),
    orderValue: scale(perOrder, newOrders),
    hasSalesHistory: sales.members + sales.orders > 0,
  }
}
export type SalesProjection = ReturnType<typeof projectSales>
