// The question box without the AI: picks out what's being asked, runs the same calculator and says the answer plainly.
import { ALL_COUNTRIES } from '@/lib/countries'
import { chartWord, type ChartSpec } from './chart'
import { buildChart, type ChartContext, type ChartRequest } from './chartData'
import { runQuery, type Filters, type Group, type Metric } from './query'
import { showMoney, type SalesSummary } from './sales'
import type { Insight } from './insights'
import type { SalesProjection } from './forecast'
import type { AnalyticsEvent } from './summary'

const SOURCES = ['Instagram', 'YouTube', 'Google', 'Facebook', 'WhatsApp', 'Reddit', 'Pinterest', 'LinkedIn', 'Direct']
// Each metric's words, for one and for many
const METRIC_WORDS: [RegExp, Metric, string, string][] = [
  [/page ?views?/, 'pageviews', 'page view', 'page views'], [/\bvisits?\b|sessions?/, 'visits', 'visit', 'visits'],
  [/sign.?ups?|applied|applications?|joined|members?/, 'club_signup', 'Print Club sign-up', 'Print Club sign-ups'], [/orders?|bought|buying|purchases?/, 'order_request', 'print order request', 'print order requests'],
  [/messages?|inquir|enquir/, 'inquiry', 'message', 'messages'], [/solved/, 'puzzle_solved', 'puzzle solved', 'puzzles solved'], [/puzzles?|played/, 'puzzle_opened', 'puzzle opened', 'puzzles opened'],
  [/tiers?/, 'tier_selected', 'tier pick', 'tier picks'], [/time spent|how long/, 'seconds', 'second on the site', 'seconds on the site'],
]
const GROUP_WORDS: [RegExp, Group][] = [
  [/\bcit(y|ies)\b/, 'city'], [/\bstates?\b|regions?/, 'region'], [/countr|where.*(from|live|based)|location/, 'country'],
  [/sources?|coming from|come from|referr|traffic from|channel/, 'source'], [/devices?|phone or/, 'device'], [/browsers?/, 'browser'],
  [/pages?\b/, 'path'], [/which (art|piece|print|tier|puzzle)|top (art|piece|print)/, 'label'], [/what time|which hour|\bhours?\b/, 'hour'], [/which day|what day|weekday/, 'weekday'], [/per day|daily|by day/, 'day'],
]

function pickDays(q: string) {
  const n = q.match(/(?:last|past)\s+(\d+)\s*(day|week|month)/)
  if (n) return Number(n[1]) * (n[2] === 'week' ? 7 : n[2] === 'month' ? 30 : 1)
  if (/today/.test(q)) return 1
  if (/week/.test(q)) return 7
  if (/year|all time|ever/.test(q)) return 365
  if (/month/.test(q)) return 30
  return 30
}

function pickFilters(q: string, original: string): Filters {
  const f: Filters = {}
  const country = ALL_COUNTRIES.find(c => new RegExp(`\\b${c.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(q))
  if (country) f.country = country.iso
  else if (/\b(usa|america)\b/.test(q)) f.country = 'US'
  else if (/\buk\b|britain/.test(q)) f.country = 'GB'
  const source = SOURCES.find(s => q.includes(s.toLowerCase()))
  if (source) f.source = source
  if (/\b(phones?|mobile)\b/.test(q) && !/phone or/.test(q)) f.device = 'Phone'
  else if (/\b(computers?|desktop|laptop)\b/.test(q)) f.device = 'Computer'
  const page = original.match(/\/[a-z0-9/-]*/i)?.[0]
  if (page) f.path_contains = page
  return f
}

function readQuestion(question: string) {
  const q = question.toLowerCase()
  const [, metric, one, many] = METRIC_WORDS.find(([re]) => re.test(q)) ?? [null, 'visitors' as Metric, 'visitor', 'visitors']
  let group = GROUP_WORDS.find(([re]) => re.test(q))?.[1] ?? null
  // "visitors from India" filters on India; it doesn't ask for a list of countries
  const filters = pickFilters(q, question)
  if (group === 'country' && filters.country) group = null
  if (group === 'source' && filters.source) group = null
  return { metric, one, many, group, filters, days: pickDays(q) }
}

const WANTS_VISUAL = /chart|graph|plot|visual|trend|over time|\b(pie|donut|bar|bars|line|columns?)\b|show me/

/** The chart that goes with a basic answer, when one would help or was asked for. */
export function basicChart(question: string, ctx: ChartContext): ChartSpec | null {
  const q = question.toLowerCase()
  const asked = chartWord(q)
  const visual = WANTS_VISUAL.test(q)
  const view = (v: ChartRequest['view']) => buildChart(ctx, { view: v, chart_type: asked })
  if (/project|forecast|predict|next month|expect/.test(q)) return view('visitors_with_forecast')
  if (/drop|funnel|journey|steps|leak/.test(q)) return view(/shop|order|print\b/.test(q) ? 'shop_steps' : 'print_club_steps')
  if (/revenue|income|earn|sales\b|money|mrr/.test(q)) {
    if (!visual && !/\bby\b|per day|daily/.test(q)) return null
    return view(/countr/.test(q) ? 'members_by_country' : /\b(pieces?|art|prints?)\b/.test(q) ? 'orders_by_piece' : /day|daily|time/.test(q) ? 'sales_per_day' : 'members_by_tier')
  }
  if (/\bwhy\b|should i|improve|advice|recommend|how can|how do i|suggest|what.*(fix|do)\b/.test(q)) return null
  const { metric, group, filters, days } = readQuestion(question)
  if (!group && !visual) return null
  return buildChart(ctx, { view: 'custom_query', chart_type: asked, query: { metric, days, group_by: group ?? 'day', filters } })
}

export function basicAnswer(question: string, ctx: { events: AnalyticsEvent[]; sales: SalesSummary; projection: SalesProjection; insights: Insight[]; now?: Date }) {
  const q = question.toLowerCase()
  if (/project|forecast|predict|next month|expect|going to/.test(q)) {
    const p = ctx.projection, v = p.visitors
    if (v.confidence === 'too-early') return `It's too early to project: I need at least 7 days of visits, and there are ${v.days} so far.`
    return `If the current trend holds, expect about ${v.mid} visitors in the next 30 days (likely ${v.low} to ${v.high}), roughly ${p.newSignups} new sign-ups and ${p.newOrders} order requests. ${p.hasSalesHistory ? `That would put Print Club at about ${showMoney(p.monthlyIncome)} a month if every member pays.` : 'With no sales yet, I can’t put a money figure on it.'}`
  }
  if (/revenue|income|earn|sales\b|money|mrr|made/.test(q)) {
    const s = ctx.sales
    return `Print Club: ${s.members} ${s.members === 1 ? 'member' : 'members'}, ${showMoney(s.monthlyIncome)} a month if all pay. Print orders: ${s.orders} ${s.orders === 1 ? 'request' : 'requests'} worth ${showMoney(s.orderValue)}. These are requests and applications, since payments aren’t on the site yet.`
  }
  if (/\bwhy\b|should i|improve|advice|recommend|how can|how do i|suggest|what.*(fix|do)\b|working/.test(q)) {
    return ctx.insights.slice(0, 3).map(i => `${i.title}. ${i.detail}`).join('\n\n')
  }

  const { metric, one, many, group, filters, days } = readQuestion(question)
  const result = runQuery(ctx.events, { metric, days, group_by: group, filters }, ctx.now)
  const scope = [filters.country && `in ${ALL_COUNTRIES.find(c => c.iso === filters.country)?.name}`, filters.source && `from ${filters.source}`, filters.device && `on ${filters.device.toLowerCase()}s`, filters.path_contains && `on ${filters.path_contains}`].filter(Boolean).join(' ')
  const period = days === 1 ? 'today' : `in the last ${days} days`
  const head = `${result.total.toLocaleString('en-IN')} ${result.total === 1 ? one : many}${scope ? ` ${scope}` : ''} ${period}.`
  if (!group || !result.rows.length) return head
  const named = (key: string) => (group === 'country' ? ALL_COUNTRIES.find(c => c.iso === key)?.name ?? key : key)
  return `${head}\n\n${result.rows.slice(0, 5).map((r, i) => `${i + 1}. ${named(r.key)}: ${r.value.toLocaleString('en-IN')}`).join('\n')}`
}
