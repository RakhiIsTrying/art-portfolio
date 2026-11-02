// Answers one precise question about the visits. The question box always gets its numbers from here.
import { findCountry } from '@/lib/countries'
import { istDay, type AnalyticsEvent } from './summary'

export const METRICS = ['visitors', 'visits', 'pageviews', 'seconds', 'order_request', 'club_signup', 'inquiry', 'tier_selected', 'piece_selected', 'puzzle_opened', 'puzzle_solved', 'outbound'] as const
export const GROUPS = ['source', 'referrer', 'campaign', 'country', 'region', 'city', 'device', 'browser', 'os', 'path', 'label', 'day', 'hour', 'weekday'] as const
export type Metric = typeof METRICS[number]
export type Group = typeof GROUPS[number]
export type Filters = { country?: string | null; region?: string | null; city?: string | null; source?: string | null; device?: string | null; browser?: string | null; path_contains?: string | null; label_contains?: string | null }
export type Query = { metric: Metric; days: number; group_by?: Group | null; filters?: Filters | null; limit?: number | null }

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const IST_OFFSET_MS = 5.5 * 3600_000
const MAX_DAYS = 365
const same = (a: string | null, b: string) => a?.toLowerCase() === b.trim().toLowerCase()
const has = (a: string | null, b: string) => !!a?.toLowerCase().includes(b.trim().toLowerCase())

function groupOf(e: AnalyticsEvent, by: Group, source?: string) {
  const at = new Date(new Date(e.created_at).getTime() + IST_OFFSET_MS)
  switch (by) {
    case 'source': return source ?? null
    case 'campaign': return e.utm_campaign
    case 'day': return istDay(e.created_at)
    case 'hour': return `${String(at.getUTCHours()).padStart(2, '0')}:00`
    case 'weekday': return WEEKDAYS[at.getUTCDay()]
    default: return e[by]
  }
}

export function runQuery(all: AnalyticsEvent[], q: Query, now = new Date()) {
  const days = Math.min(Math.max(1, Math.round(q.days) || 30), MAX_DAYS)
  const since = now.getTime() - days * 86_400_000
  const sorted = [...all].sort((a, b) => a.created_at.localeCompare(b.created_at))
  // Only a visit's first page knows its source, so every event in that visit inherits it
  const sessionSource = new Map<string, string>()
  for (const e of sorted) if (e.source && !sessionSource.has(e.session_id)) sessionSource.set(e.session_id, e.source)

  const f = q.filters ?? {}
  const country = f.country ? findCountry(f.country)?.iso ?? f.country : null
  const events = sorted.filter(e => {
    if (new Date(e.created_at).getTime() < since) return false
    if (country && !same(e.country, country)) return false
    if (f.region && !same(e.region, f.region)) return false
    if (f.city && !same(e.city, f.city)) return false
    if (f.source && !same(sessionSource.get(e.session_id) ?? null, f.source)) return false
    if (f.device && !same(e.device, f.device)) return false
    if (f.browser && !same(e.browser, f.browser)) return false
    if (f.path_contains && !has(e.path, f.path_contains)) return false
    if (f.label_contains && !has(e.label, f.label_contains)) return false
    return true
  })

  // Each metric keeps either a set of people/visits, or a running count
  const wanted = (e: AnalyticsEvent) => {
    if (q.metric === 'visitors' || q.metric === 'visits') return true
    if (q.metric === 'pageviews') return e.name === 'pageview'
    if (q.metric === 'seconds') return e.name === 'leave'
    return e.name === q.metric
  }
  const add = (bucket: { ids: Set<string>; n: number }, e: AnalyticsEvent) => {
    if (q.metric === 'visitors') bucket.ids.add(e.visitor_id)
    else if (q.metric === 'visits') bucket.ids.add(e.session_id)
    else bucket.n += q.metric === 'seconds' ? e.seconds ?? 0 : 1
  }
  const value = (b: { ids: Set<string>; n: number }) => (q.metric === 'visitors' || q.metric === 'visits' ? b.ids.size : b.n)

  const total = { ids: new Set<string>(), n: 0 }
  const groups = new Map<string, { ids: Set<string>; n: number }>()
  for (const e of events.filter(wanted)) {
    add(total, e)
    if (q.group_by) {
      const key = groupOf(e, q.group_by, sessionSource.get(e.session_id))
      if (!key) continue
      if (!groups.has(key)) groups.set(key, { ids: new Set(), n: 0 })
      add(groups.get(key)!, e)
    }
  }
  const chronological = q.group_by === 'day' || q.group_by === 'hour'
  const rows = [...groups].map(([key, b]) => ({ key, value: value(b) }))
    .sort((a, b) => (chronological ? a.key.localeCompare(b.key) : b.value - a.value || a.key.localeCompare(b.key)))
  return { metric: q.metric, days, filters: f, group_by: q.group_by ?? null, total: value(total), rows: rows.slice(0, Math.min(q.limit ?? 50, 100)), more_rows: Math.max(0, rows.length - (q.limit ?? 50)) }
}
