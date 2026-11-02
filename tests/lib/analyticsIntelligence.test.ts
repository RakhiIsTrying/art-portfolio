import { describe, it, expect } from 'vitest'
import { basicAnswer } from '@/lib/analytics/basicAnswer'
import { forecastVisitors, projectSales } from '@/lib/analytics/forecast'
import { findInsights, verdict } from '@/lib/analytics/insights'
import { runQuery } from '@/lib/analytics/query'
import { anonymousSales, parseMoney, salesSummary, showMoney, type SaleMember, type SaleOrder } from '@/lib/analytics/sales'
import { summarise, type AnalyticsEvent } from '@/lib/analytics/summary'

const NOW = new Date('2026-11-02T12:00:00Z')
const ev = (o: Partial<AnalyticsEvent>): AnalyticsEvent => ({ created_at: '2026-11-02T10:00:00Z', name: 'pageview', path: '/', label: null, seconds: null, visitor_id: 'v1', session_id: 's1', source: null, referrer: null, utm_medium: null, utm_campaign: null, country: 'IN', region: 'MH', city: 'Mumbai', device: 'Phone', browser: 'Safari', os: 'iOS', ...o })
const member = (o: Partial<SaleMember> = {}): SaleMember => ({ name: 'Maya', email: 'maya@example.com', country: 'India', at: '2026-11-01T10:00:00Z', tier: 'Gone Baroque', tierId: 'baroque', price: '₹750', ...o })
const order = (o: Partial<SaleOrder> = {}): SaleOrder => ({ name: 'Ana', email: 'ana@example.com', at: '2026-11-01T10:00:00Z', piece: 'Koi Pond', total: '₹1,500', ...o })

describe('runQuery', () => {
  const events = [
    ev({ visitor_id: 'a', session_id: 'a1', source: 'Instagram' }),
    ev({ visitor_id: 'a', session_id: 'a1', path: '/shop', created_at: '2026-11-02T10:01:00Z' }),
    ev({ visitor_id: 'a', session_id: 'a2', source: 'Google', created_at: '2026-10-30T10:00:00Z' }),
    ev({ visitor_id: 'b', session_id: 'b1', source: 'Instagram', country: 'JP', city: 'Tokyo', device: 'Computer' }),
    ev({ visitor_id: 'b', session_id: 'b1', name: 'leave', seconds: 90, country: 'JP', created_at: '2026-11-02T10:02:00Z' }),
    ev({ visitor_id: 'b', session_id: 'b1', name: 'order_request', label: 'Koi Pond', country: 'JP', created_at: '2026-11-02T10:03:00Z' }),
    ev({ visitor_id: 'old', session_id: 'o1', created_at: '2026-01-01T10:00:00Z' }),
  ]

  it('counts unique people, visits and views separately, and respects the period', () => {
    expect(runQuery(events, { metric: 'visitors', days: 30 }, NOW).total).toBe(2)
    expect(runQuery(events, { metric: 'visits', days: 30 }, NOW).total).toBe(3)
    expect(runQuery(events, { metric: 'pageviews', days: 30 }, NOW).total).toBe(4)
    expect(runQuery(events, { metric: 'visitors', days: 365 }, NOW).total).toBe(3)
    expect(runQuery(events, { metric: 'seconds', days: 30 }, NOW).total).toBe(90)
  })

  it('filters by country name or code, and passes a visit’s source to all its events', () => {
    expect(runQuery(events, { metric: 'visitors', days: 30, filters: { country: 'India' } }, NOW).total).toBe(1)
    expect(runQuery(events, { metric: 'visitors', days: 30, filters: { country: 'JP' } }, NOW).total).toBe(1)
    expect(runQuery(events, { metric: 'pageviews', days: 30, filters: { source: 'instagram' } }, NOW).total).toBe(3)
    expect(runQuery(events, { metric: 'order_request', days: 30, filters: { source: 'Instagram' } }, NOW).total).toBe(1)
  })

  it('breaks down and ranks', () => {
    expect(runQuery(events, { metric: 'visitors', days: 30, group_by: 'source' }, NOW).rows).toEqual([{ key: 'Instagram', value: 2 }, { key: 'Google', value: 1 }])
    expect(runQuery(events, { metric: 'order_request', days: 30, group_by: 'label' }, NOW).rows).toEqual([{ key: 'Koi Pond', value: 1 }])
    expect(runQuery(events, { metric: 'pageviews', days: 30, group_by: 'hour' }, NOW).rows[0].key).toBe('15:30'.slice(0, 2) + ':00')
  })

  it('never fails on odd input', () => {
    expect(runQuery([], { metric: 'visitors', days: 0 }, NOW)).toMatchObject({ total: 0, days: 30, rows: [] })
    expect(runQuery(events, { metric: 'visitors', days: 99999 }, NOW).days).toBe(365)
  })
})

describe('forecastVisitors', () => {
  it('waits for a week of data', () => {
    expect(forecastVisitors([0, 0, 3, 4]).confidence).toBe('too-early')
    expect(forecastVisitors([]).confidence).toBe('too-early')
  })

  it('carries a flat line forward with no spread', () => {
    expect(forecastVisitors(Array(20).fill(10))).toMatchObject({ mid: 300, low: 300, high: 300, confidence: 'fair' })
  })

  it('follows a rising trend, ignoring the empty days before launch', () => {
    const rising = [0, 0, 0, ...Array.from({ length: 10 }, (_, i) => i + 1)]
    const f = forecastVisitors(rising)
    expect(f.confidence).toBe('rough')
    // Days 11 to 40 of a line going up by one a day
    expect(f.mid).toBe(765)
  })

  it('gives a wider range when days vary, and allows for the trend being uncertain', () => {
    const steady = forecastVisitors(Array.from({ length: 21 }, (_, i) => 10 + (i % 2)))
    const jumpy = forecastVisitors(Array.from({ length: 21 }, (_, i) => (i % 2 ? 19 : 2)))
    expect(jumpy.high - jumpy.low).toBeGreaterThan(steady.high - steady.low)
    expect(jumpy.low).toBeLessThan(jumpy.mid)
    expect(jumpy.high).toBeGreaterThan(jumpy.mid)
    // Ignoring the trend's own uncertainty would give under ±130 here
    expect(jumpy.high - jumpy.mid).toBeGreaterThan(130)
  })

  it('never goes below zero when the trend is falling', () => {
    const f = forecastVisitors(Array.from({ length: 10 }, (_, i) => 10 - i))
    expect(f.mid).toBe(0)
    expect(f.low).toBe(0)
  })
})

describe('sales', () => {
  it('reads money and keeps currencies apart', () => {
    expect(parseMoney('₹1,500')).toEqual({ symbol: '₹', amount: 1500 })
    expect(parseMoney('$16')).toEqual({ symbol: '$', amount: 16 })
    expect(parseMoney('')).toBeNull()
    expect(showMoney({ '₹': 1500, $: 16 })).toBe('₹1,500 + $16')
    expect(showMoney({})).toBe('0')
  })

  it('adds up members and orders, and what’s new in the period', () => {
    const s = salesSummary([member(), member({ price: '$3', tier: 'Van Gogh Anywhere', at: '2026-01-01T00:00:00Z' })], [order()], 30, NOW)
    expect(s).toMatchObject({ members: 2, newMembers: 1, orders: 1, newOrders: 1, monthlyIncome: { '₹': 750, $: 3 }, newMonthlyIncome: { '₹': 750 }, orderValue: { '₹': 1500 } })
    expect(s.tiers).toEqual({ 'Gone Baroque': 1, 'Van Gogh Anywhere': 1 })
  })

  it('never hands the question box a name or email', () => {
    const text = JSON.stringify(anonymousSales([member()], [order()], 30, NOW))
    expect(text).not.toContain('Maya')
    expect(text).not.toContain('example.com')
    expect(text).not.toContain('Ana')
    expect(text).toContain('Koi Pond')
  })
})

// 30 quiet visitors, mostly from Instagram, with a leak in the Print Club steps
const busy = Array.from({ length: 30 }, (_, i) => ev({ visitor_id: `v${i}`, session_id: `s${i}`, path: '/print-club', source: i < 25 ? 'Instagram' : 'Google', created_at: new Date(NOW.getTime() - (i % 14) * 86_400_000 - 3600_000).toISOString() }))

describe('insights and projection', () => {
  const s = summarise(busy, 30, NOW), sales = salesSummary([], [], 30, NOW)

  it('says when it’s too early instead of inventing patterns', () => {
    const quiet = summarise(busy.slice(0, 5), 30, NOW)
    const out = findInsights(quiet, sales)
    expect(out).toHaveLength(1)
    expect(out[0].title).toMatch(/Too early/)
  })

  it('finds the leak first, and warns about relying on one source', () => {
    const out = findInsights(s, sales)
    expect(out[0]).toMatchObject({ tone: 'fix' })
    expect(out[0].title).toMatch(/Print Club/)
    expect(out.some(i => /Instagram is your biggest source \(83%\)/.test(i.title))).toBe(true)
    expect(out.length).toBeLessThanOrEqual(6)
  })

  it('writes a plain verdict', () => {
    expect(verdict(summarise([], 30, NOW), sales, 30)).toMatch(/No visits recorded/)
    expect(verdict(s, salesSummary([member()], [], 30, NOW), 30)).toMatch(/30 people visited.*₹750 a month/)
  })

  it('projects sales from the current rates', () => {
    const signups = [...busy, ev({ name: 'club_signup', label: 'baroque', visitor_id: 'v1', session_id: 's1' }), ev({ name: 'club_signup', label: 'baroque', visitor_id: 'v2', session_id: 's2' }), ev({ name: 'club_signup', label: 'baroque', visitor_id: 'v3', session_id: 's3' })]
    const withSales = summarise(signups, 30, NOW), money = salesSummary([member()], [], 30, NOW)
    const p = projectSales(withSales, money)
    expect(p.signupRate).toBeCloseTo(0.1)
    expect(p.newSignups).toBeCloseTo(p.visitors.mid * 0.1, 0)
    expect(p.monthlyIncome['₹']).toBeCloseTo(750 + p.visitors.mid * 0.1 * 750, -2)
    expect(projectSales(s, sales).hasSalesHistory).toBe(false)
  })
})

describe('basicAnswer', () => {
  const s = summarise(busy, 30, NOW), sales = salesSummary([member()], [order()], 30, NOW)
  const ask = (q: string) => basicAnswer(q, { events: busy, sales, projection: projectSales(s, sales), insights: findInsights(s, sales), now: NOW })

  it('answers counts with filters and periods', () => {
    expect(ask('How many visitors from India this month?')).toBe('30 visitors in India in the last 30 days.')
    expect(ask('how many visitors from Japan?')).toBe('0 visitors in Japan in the last 30 days.')
    expect(ask('how many visitors from instagram last 7 days')).toMatch(/visitors from Instagram in the last 7 days/)
    expect(ask('page views today')).toMatch(/page views today/)
  })

  it('answers breakdowns with names', () => {
    expect(ask('Which country sends the most people?')).toBe('30 visitors in the last 30 days.\n\n1. India: 30')
    expect(ask('top sources')).toContain('1. Instagram: 25')
  })

  it('answers sales, projections and advice', () => {
    expect(ask('What are my sales so far?')).toContain('₹750 a month')
    expect(ask('What are my sales so far?')).toContain('₹1,500')
    expect(ask('What will next month look like? forecast')).toMatch(/next 30 days/)
    expect(ask('What should I fix first?')).toMatch(/Print Club/)
  })
})
