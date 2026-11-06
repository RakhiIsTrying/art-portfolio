// Builds a chart from the real data. Charts only ever come from here, so the numbers are always calculated, never invented.
import { ALL_COUNTRIES } from '@/lib/countries'
import { bestChart, type ChartRow, type ChartSpec, type ChartType } from './chart'
import { forecastDaily } from './forecast'
import { runQuery, type Group, type Metric, type Query } from './query'
import { istDay, summarise, type AnalyticsEvent } from './summary'
import type { SaleMember, SaleOrder } from './sales'

export const CHART_VIEWS = ['custom_query', 'members_by_tier', 'members_by_country', 'orders_by_piece', 'sales_per_day', 'print_club_steps', 'shop_steps', 'visitors_with_forecast'] as const
export type ChartView = typeof CHART_VIEWS[number]
export type ChartRequest = { view: ChartView; title?: string | null; chart_type?: ChartType | 'auto' | null; query?: Query | null }
export type ChartContext = { events: AnalyticsEvent[]; members: SaleMember[]; orders: SaleOrder[]; now?: Date }

const FORECAST_WINDOW_DAYS = 60
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const METRIC_LABELS: Record<Metric, string> = { visitors: 'Visitors', visits: 'Visits', pageviews: 'Page views', seconds: 'Seconds on the site', order_request: 'Print order requests', club_signup: 'Print Club sign-ups', inquiry: 'Messages', tier_selected: 'Tier picks', piece_selected: 'Pieces picked', puzzle_opened: 'Puzzles opened', puzzle_solved: 'Puzzles solved', outbound: 'Links clicked away' }
const GROUP_LABELS: Record<Group, string> = { source: 'source', referrer: 'site', campaign: 'campaign', country: 'country', region: 'region', city: 'city', device: 'device', browser: 'browser', os: 'system', screen: 'screen size', language: 'language', timezone: 'time zone', path: 'page', label: 'item', day: 'day', hour: 'hour', weekday: 'weekday' }

const period = (days: number) => (days === 1 ? 'today' : `last ${days} days`)
const countryName = (key: string) => ALL_COUNTRIES.find(c => c.iso === key)?.name ?? key
const tally = (values: string[]) => {
  const totals = new Map<string, number>()
  for (const v of values) if (v) totals.set(v, (totals.get(v) ?? 0) + 1)
  return [...totals].map(([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value || a.key.localeCompare(b.key))
}

function fromQuery(ctx: ChartContext, query: Query) {
  const result = runQuery(ctx.events, { ...query, limit: 100 }, ctx.now)
  const by = result.group_by
  let rows: ChartRow[] = result.rows
  if (by === 'country') rows = rows.map(r => ({ ...r, key: countryName(r.key) }))
  if (by === 'weekday') rows = WEEKDAYS.flatMap(day => rows.filter(r => r.key === day))
  // A line over time needs the quiet days too, or it would skip straight over them
  if (by === 'day') {
    const found = new Map(rows.map(r => [r.key, r.value])), now = (ctx.now ?? new Date()).getTime()
    rows = Array.from({ length: result.days }, (_, i) => istDay(new Date(now - (result.days - 1 - i) * 86_400_000).toISOString())).map(key => ({ key, value: found.get(key) ?? 0 }))
  }
  if (by === 'hour') {
    const found = new Map(rows.map(r => [r.key, r.value]))
    rows = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`).map(key => ({ key, value: found.get(key) ?? 0 }))
  }
  const label = METRIC_LABELS[result.metric]
  return { rows, total: result.total, valueLabel: label, overTime: by === 'day' || by === 'hour', more: result.more_rows, title: `${label}${by ? ` by ${GROUP_LABELS[by]}` : ''}, ${period(result.days)}` }
}

function fromView(ctx: ChartContext, view: Exclude<ChartView, 'custom_query'>) {
  const now = ctx.now ?? new Date()
  const plain = (title: string, valueLabel: string, rows: ChartRow[], overTime = false) => ({ rows, title, valueLabel, overTime, more: 0, total: rows.reduce((t, r) => t + r.value, 0) })
  switch (view) {
    case 'members_by_tier': return plain('Print Club members by tier', 'Members', tally(ctx.members.map(m => m.tier)))
    case 'members_by_country': return plain('Print Club members by country', 'Members', tally(ctx.members.map(m => m.country)))
    case 'orders_by_piece': return plain('Print order requests by piece', 'Requests', tally(ctx.orders.map(o => o.piece)))
    case 'sales_per_day': {
      const days = tally([...ctx.members.map(m => istDay(m.at)), ...ctx.orders.map(o => istDay(o.at))]).sort((a, b) => a.key.localeCompare(b.key))
      return plain('Sign-ups and print orders per day', 'Sales', days, true)
    }
    case 'print_club_steps': return plain('Print Club journey', 'Visitors', summarise(ctx.events, 30, now).clubFunnel)
    case 'shop_steps': return plain('Shop journey', 'Visitors', summarise(ctx.events, 30, now).shopFunnel)
    case 'visitors_with_forecast': {
      const past = runQuery(ctx.events, { metric: 'visitors', days: FORECAST_WINDOW_DAYS, group_by: 'day' }, now).rows
      const found = new Map(past.map(r => [r.key, r.value]))
      const rows: ChartRow[] = Array.from({ length: FORECAST_WINDOW_DAYS }, (_, i) => istDay(new Date(now.getTime() - (FORECAST_WINDOW_DAYS - 1 - i) * 86_400_000).toISOString())).map(key => ({ key, value: found.get(key) ?? 0 }))
      const ahead = forecastDaily(rows.map(r => r.value)).map((value, i) => ({ key: istDay(new Date(now.getTime() + (i + 1) * 86_400_000).toISOString()), value, projected: true }))
      const first = rows.findIndex(r => r.value > 0)
      return { rows: [...(first === -1 ? [] : rows.slice(first)), ...ahead], title: 'Visitors, with the next 30 days projected', valueLabel: 'Visitors', overTime: true, more: 0, total: ahead.reduce((t, r) => t + r.value, 0) }
    }
  }
}

export function buildChart(ctx: ChartContext, request: ChartRequest): ChartSpec {
  const isQuery = request.view === 'custom_query'
  if (isQuery && !request.query) throw new Error('A custom chart needs a query.')
  const data = isQuery ? fromQuery(ctx, request.query!) : fromView(ctx, request.view as Exclude<ChartView, 'custom_query'>)
  const asked = request.chart_type && request.chart_type !== 'auto' ? request.chart_type : null
  return {
    title: request.title?.trim() || data.title, rows: data.rows, total: data.total, valueLabel: data.valueLabel, overTime: data.overTime, more: data.more,
    type: asked ?? bestChart(data.rows, data.overTime),
    source: isQuery ? { view: request.view, query: request.query } : { view: request.view },
  }
}
