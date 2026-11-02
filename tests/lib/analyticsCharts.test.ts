import { describe, it, expect } from 'vitest'
import { basicChart } from '@/lib/analytics/basicAnswer'
import { bestChart, chartCsv, chartWord, formatRequest } from '@/lib/analytics/chart'
import { buildChart, type ChartContext } from '@/lib/analytics/chartData'
import { forecastDaily } from '@/lib/analytics/forecast'
import type { AnalyticsEvent } from '@/lib/analytics/summary'
import type { SaleMember, SaleOrder } from '@/lib/analytics/sales'

const NOW = new Date('2026-11-03T12:00:00Z')
const ev = (o: Partial<AnalyticsEvent>): AnalyticsEvent => ({ created_at: '2026-11-03T05:00:00Z', name: 'pageview', path: '/', label: null, seconds: null, visitor_id: 'v1', session_id: 's1', source: null, referrer: null, utm_medium: null, utm_campaign: null, country: 'IN', region: 'MH', city: 'Mumbai', device: 'Phone', browser: 'Safari', os: 'iOS', ...o })
const member = (o: Partial<SaleMember> = {}): SaleMember => ({ name: 'Secret Name', email: 'x@secret.com', country: 'India', at: '2026-11-02T10:00:00Z', tier: 'Gone Baroque', tierId: 'baroque', price: '₹750', ...o })
const order: SaleOrder = { name: 'Secret Buyer', email: 'y@secret.com', at: '2026-11-01T10:00:00Z', piece: 'Koi Pond', total: '₹1,500' }
const events = Array.from({ length: 12 }, (_, i) => ev({ visitor_id: `v${i}`, session_id: `s${i}`, country: i < 8 ? 'IN' : 'JP', source: i < 3 ? 'Google' : 'Instagram', created_at: new Date(NOW.getTime() - (i % 10) * 86_400_000).toISOString() }))
const ctx: ChartContext = { events, members: [member(), member({ tier: 'Van Gogh Anywhere', country: 'Japan' })], orders: [order], now: NOW }

describe('choosing a chart', () => {
  it('picks the clearest form, and never chooses a pie by itself', () => {
    expect(bestChart([{ key: 'a', value: 1 }], false)).toBe('number')
    expect(bestChart([], false)).toBe('number')
    expect(bestChart([{ key: 'a', value: 1 }, { key: 'b', value: 2 }], true)).toBe('line')
    expect(bestChart([{ key: 'a', value: 1 }, { key: 'b', value: 2 }], false)).toBe('bars')
    expect(bestChart(Array.from({ length: 21 }, (_, i) => ({ key: `${i}`, value: i })), false)).toBe('table')
  })

  it('understands format words', () => {
    expect(chartWord('as a Pie please')).toBe('pie')
    expect(chartWord('donut')).toBe('pie')
    expect(chartWord('line graph')).toBe('line')
    expect(chartWord('hello')).toBeNull()
  })

  it('tells a new look from a new question', () => {
    for (const [q, t] of [['make it a pie', 'pie'], ['as a table', 'table'], ['show as bars', 'bars'], ['can you change this to a line chart', 'line'], ['in a column chart please', 'columns']] as const) expect(formatRequest(q)).toBe(t)
    for (const q of ['visitors by country as a pie', 'pie of sales', 'hello', 'which countries in a table', 'orders last week as a line']) expect(formatRequest(q)).toBeNull()
  })

  it('makes a safe spreadsheet file', () => {
    const csv = chartCsv({ title: 'T', rows: [{ key: '=HACK()', value: 2 }, { key: 'a"b', value: 3, projected: true }], valueLabel: 'V', type: 'bars', overTime: false, total: 5, source: {} })
    expect(csv).toContain(`"'=HACK()",2`)
    expect(csv).toContain('"a""b (projected)",3')
  })
})

describe('buildChart', () => {
  it('uses real counts and shows country names', () => {
    const c = buildChart(ctx, { view: 'custom_query', query: { metric: 'visitors', days: 30, group_by: 'country' } })
    expect(c).toMatchObject({ type: 'bars', total: 12, overTime: false, title: 'Visitors by country, last 30 days' })
    expect(c.rows).toEqual([{ key: 'India', value: 8 }, { key: 'Japan', value: 4 }])
  })

  it('fills in quiet days and hours, so lines are honest', () => {
    const days = buildChart(ctx, { view: 'custom_query', query: { metric: 'visitors', days: 30, group_by: 'day' } })
    expect(days).toMatchObject({ type: 'line', overTime: true })
    expect(days.rows).toHaveLength(30)
    expect(days.rows.at(-1)?.key).toBe('2026-11-03')
    expect(days.rows.reduce((t, r) => t + r.value, 0)).toBe(12)
    expect(buildChart(ctx, { view: 'custom_query', query: { metric: 'pageviews', days: 7, group_by: 'hour' } }).rows).toHaveLength(24)
  })

  it('puts weekdays in order', () => {
    const c = buildChart(ctx, { view: 'custom_query', query: { metric: 'visitors', days: 30, group_by: 'weekday' } })
    const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    expect(c.rows.map(r => r.key)).toEqual(order.filter(d => c.rows.some(r => r.key === d)))
  })

  it('honours a named format and title, and a single number stays a number', () => {
    expect(buildChart(ctx, { view: 'members_by_tier', chart_type: 'pie', title: 'Mine' })).toMatchObject({ type: 'pie', title: 'Mine' })
    expect(buildChart(ctx, { view: 'custom_query', chart_type: 'auto', query: { metric: 'visitors', days: 30, group_by: null } })).toMatchObject({ type: 'number', total: 12 })
  })

  it('never includes a buyer’s name or email', () => {
    for (const view of ['members_by_tier', 'members_by_country', 'orders_by_piece', 'sales_per_day'] as const) {
      const text = JSON.stringify(buildChart(ctx, { view }))
      expect(text).not.toContain('Secret')
      expect(text).not.toContain('secret.com')
    }
  })

  it('marks projected days', () => {
    const c = buildChart({ ...ctx, events: Array.from({ length: 20 }, (_, i) => ev({ visitor_id: `v${i}`, session_id: `s${i}`, created_at: new Date(NOW.getTime() - i * 86_400_000).toISOString() })) }, { view: 'visitors_with_forecast' })
    expect(c.overTime).toBe(true)
    expect(c.rows.filter(r => r.projected)).toHaveLength(30)
    expect(c.rows.at(-1)?.key).toBe('2026-12-03')
    expect(forecastDaily([1, 2])).toEqual([])
    expect(forecastDaily(Array(10).fill(4))).toEqual(Array(30).fill(4))
  })

  it('refuses a custom chart with no query', () => {
    expect(() => buildChart(ctx, { view: 'custom_query', query: null })).toThrow()
  })
})

describe('basicChart', () => {
  it('draws when asked or when comparing, and stays out of the way otherwise', () => {
    expect(basicChart('Show me visitors per day', ctx)).toMatchObject({ type: 'line' })
    expect(basicChart('Which country sends the most people?', ctx)?.rows[0]).toEqual({ key: 'India', value: 8 })
    expect(basicChart('Sales by tier as a chart', ctx)).toMatchObject({ title: 'Print Club members by tier' })
    expect(basicChart('sources as a pie', ctx)).toMatchObject({ type: 'pie' })
    expect(basicChart('What will next month look like?', ctx)?.overTime).toBe(true)
    expect(basicChart('how many visitors from india', ctx)).toBeNull()
    expect(basicChart('What should I fix first?', ctx)).toBeNull()
  })
})
