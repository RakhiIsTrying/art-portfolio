// Sales figures from Print Club sign-ups and print order requests. Payments aren't on the site yet, so these are requests.
import { istDay } from './summary'
import type { TierId } from '@/lib/printClub'

export type SaleMember = { name: string; email: string; country: string; at: string; tier: string; tierId: TierId; price: string }
export type SaleOrder = { name: string; email: string; at: string; piece: string; total: string }
export type Money = Record<string, number>

export function parseMoney(text: string) {
  const m = text.match(/^\s*(\D*?)\s*([\d,]+(?:\.\d+)?)/)
  return m ? { symbol: m[1], amount: Number(m[2].replace(/,/g, '')) } : null
}

function addUp(prices: string[]): Money {
  const totals: Money = {}
  for (const price of prices) {
    const p = parseMoney(price)
    if (p) totals[p.symbol] = (totals[p.symbol] ?? 0) + p.amount
  }
  return totals
}

/** ₹1,200 + $16. Currencies are never mixed, as the site has no exchange rate to convert with. */
export const showMoney = (money: Money) =>
  Object.entries(money).map(([symbol, n]) => `${symbol}${Math.round(n).toLocaleString('en-IN')}`).join(' + ') || '0'

export function salesSummary(members: SaleMember[], orders: SaleOrder[], days: number, now = new Date()) {
  const since = now.getTime() - days * 86_400_000
  const recent = <T extends { at: string }>(list: T[]) => list.filter(x => new Date(x.at).getTime() >= since)
  const byTier = (list: SaleMember[]) => {
    const tally: Record<string, number> = {}
    for (const m of list) tally[m.tier] = (tally[m.tier] ?? 0) + 1
    return tally
  }
  const newMembers = recent(members), newOrders = recent(orders)
  return {
    members: members.length,
    newMembers: newMembers.length,
    tiers: byTier(members),
    monthlyIncome: addUp(members.map(m => m.price)),
    newMonthlyIncome: addUp(newMembers.map(m => m.price)),
    orders: orders.length,
    newOrders: newOrders.length,
    orderValue: addUp(orders.map(o => o.total)),
    newOrderValue: addUp(newOrders.map(o => o.total)),
    lastSale: [...members.map(m => m.at), ...orders.map(o => o.at)].sort().pop() ?? null,
  }
}
export type SalesSummary = ReturnType<typeof salesSummary>

/** Sales only, with names and emails left out: this is what the question box may see. */
export function anonymousSales(members: SaleMember[], orders: SaleOrder[], days: number, now = new Date()) {
  const perDay: Record<string, { signups: number; orders: number }> = {}
  const day = (at: string) => (perDay[istDay(at)] ??= { signups: 0, orders: 0 })
  members.forEach(m => day(m.at).signups++)
  orders.forEach(o => day(o.at).orders++)
  const tally = (values: string[]) => values.reduce<Record<string, number>>((t, v) => { if (v) t[v] = (t[v] ?? 0) + 1; return t }, {})
  return { ...salesSummary(members, orders, days, now), period_days: days, members_by_country: tally(members.map(m => m.country)), orders_by_piece: tally(orders.map(o => o.piece)), sales_by_day: perDay, note: 'Requests and applications. Payments are not on the site yet, so none of this is confirmed income.' }
}
