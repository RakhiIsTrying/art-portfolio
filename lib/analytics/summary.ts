// Turns raw events into everything the Admin analytics page shows.
export type AnalyticsEvent = {
  created_at: string; name: string; path: string | null; label: string | null; seconds: number | null
  visitor_id: string; session_id: string; source: string | null; referrer: string | null; utm_medium: string | null; utm_campaign: string | null
  country: string | null; region: string | null; city: string | null; device: string | null; browser: string | null; os: string | null
}
export type Row = { key: string; value: number; extra?: number }

const IST_OFFSET_MS = 5.5 * 3600_000
const CONVERSIONS = new Set(['order_request', 'club_signup', 'inquiry'])
const UNKNOWN = 'Unknown'

const ist = (iso: string) => new Date(new Date(iso).getTime() + IST_OFFSET_MS)
export const istDay = (iso: string) => ist(iso).toISOString().slice(0, 10)

function ranked(counts: Map<string, Set<string> | number>): Row[] {
  return [...counts].map(([key, v]) => ({ key, value: typeof v === 'number' ? v : v.size })).sort((a, b) => b.value - a.value || a.key.localeCompare(b.key))
}
function addTo(map: Map<string, Set<string>>, key: string | null | undefined, id: string) {
  const k = key || UNKNOWN
  if (!map.has(k)) map.set(k, new Set())
  map.get(k)!.add(id)
}
const bump = (map: Map<string, number>, key: string | null | undefined, by = 1) => { const k = key || UNKNOWN; map.set(k, (map.get(k) ?? 0) + by) }

export const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0)

function headline(events: AnalyticsEvent[]) {
  const sessions = new Map<string, { views: number; acted: boolean; seconds: number }>()
  const visitorSessions = new Map<string, Set<string>>()
  let pageviews = 0, conversions = 0
  for (const e of events) {
    const s = sessions.get(e.session_id) ?? { views: 0, acted: false, seconds: 0 }
    sessions.set(e.session_id, s)
    addTo(visitorSessions, e.visitor_id, e.session_id)
    if (e.name === 'pageview') { s.views++; pageviews++ }
    else if (e.name === 'leave') s.seconds += e.seconds ?? 0
    else s.acted = true
    if (CONVERSIONS.has(e.name)) conversions++
  }
  const count = sessions.size, list = [...sessions.values()]
  const returning = [...visitorSessions.values()].filter(v => v.size > 1).length
  const visitors = visitorSessions.size
  return {
    visitors, returning, sessions: count, pageviews, conversions,
    pagesPerSession: count ? pageviews / count : 0,
    bounceRate: percent(list.filter(s => s.views <= 1 && !s.acted).length, count),
    avgSeconds: count ? Math.round(list.reduce((t, s) => t + s.seconds, 0) / count) : 0,
    conversionRate: visitors ? (conversions / visitors) * 100 : 0,
  }
}

export function summarise(all: AnalyticsEvent[], days: number, now = new Date()) {
  const start = now.getTime() - days * 86_400_000, prevStart = start - days * 86_400_000
  const inRange = (e: AnalyticsEvent) => new Date(e.created_at).getTime() >= start
  const events = all.filter(inRange)
  const before = all.filter(e => { const t = new Date(e.created_at).getTime(); return t >= prevStart && t < start })

  // Oldest first, so each session's first page is its entry and last its exit
  const sorted = [...events].sort((a, b) => a.created_at.localeCompare(b.created_at))
  const sessionSource = new Map<string, string>(), visitorSource = new Map<string, string>(), visitorCountry = new Map<string, string>()
  const entries = new Map<string, string>(), exits = new Map<string, string>()

  const daily = new Map<string, { views: number; visitors: Set<string> }>()
  for (let i = days - 1; i >= 0; i--) daily.set(istDay(new Date(now.getTime() - i * 86_400_000).toISOString()), { views: 0, visitors: new Set() })

  const sources = new Map<string, Set<string>>(), referrers = new Map<string, Set<string>>(), campaigns = new Map<string, Set<string>>()
  const countries = new Map<string, Set<string>>(), regions = new Map<string, Set<string>>(), cities = new Map<string, Set<string>>()
  const devices = new Map<string, Set<string>>(), browsers = new Map<string, Set<string>>(), systems = new Map<string, Set<string>>()
  const pageViews = new Map<string, number>(), pageVisitors = new Map<string, Set<string>>(), pageSeconds = new Map<string, number>()
  const heat = Array.from({ length: 7 }, () => Array<number>(24).fill(0))
  const counts: Record<string, Map<string, number>> = {}
  const funnel: Record<string, Set<string>> = { club: new Set(), tier: new Set(), signup: new Set(), shop: new Set(), piece: new Set(), order: new Set() }
  const goalsBySource = new Map<string, number>(), goalsByCountry = new Map<string, number>()

  for (const e of sorted) {
    if (!visitorCountry.has(e.visitor_id) && e.country) visitorCountry.set(e.visitor_id, e.country)
    if (e.source && !sessionSource.has(e.session_id)) sessionSource.set(e.session_id, e.source)
    if (e.source && !visitorSource.has(e.visitor_id)) visitorSource.set(e.visitor_id, e.source)
    if (e.source) addTo(sources, e.source, e.visitor_id)
    if (e.referrer) addTo(referrers, e.referrer, e.visitor_id)
    if (e.utm_campaign) addTo(campaigns, e.utm_campaign, e.visitor_id)
    addTo(countries, e.country, e.visitor_id)
    if (e.region) addTo(regions, e.country ? `${e.region}, ${e.country}` : e.region, e.visitor_id)
    if (e.city) addTo(cities, e.country ? `${e.city}, ${e.country}` : e.city, e.visitor_id)
    addTo(devices, e.device, e.visitor_id); addTo(browsers, e.browser, e.visitor_id); addTo(systems, e.os, e.visitor_id)

    if (e.name === 'pageview') {
      const at = ist(e.created_at)
      heat[at.getUTCDay()][at.getUTCHours()]++
      const day = daily.get(istDay(e.created_at))
      if (day) { day.views++; day.visitors.add(e.visitor_id) }
      bump(pageViews, e.path); addTo(pageVisitors, e.path, e.visitor_id)
      if (!entries.has(e.session_id)) entries.set(e.session_id, e.path ?? UNKNOWN)
      exits.set(e.session_id, e.path ?? UNKNOWN)
      if (e.path?.startsWith('/print-club')) funnel.club.add(e.visitor_id)
      if (e.path?.startsWith('/shop') || e.path?.startsWith('/originals')) funnel.shop.add(e.visitor_id)
    } else if (e.name === 'leave') {
      bump(pageSeconds, e.path, e.seconds ?? 0)
    } else {
      bump((counts[e.name] ??= new Map()), e.label)
      if (e.name === 'tier_selected') funnel.tier.add(e.visitor_id)
      if (e.name === 'piece_selected') funnel.piece.add(e.visitor_id)
      if (e.name === 'club_signup') funnel.signup.add(e.visitor_id)
      if (e.name === 'order_request') funnel.order.add(e.visitor_id)
      if (CONVERSIONS.has(e.name)) {
        bump(goalsBySource, visitorSource.get(e.visitor_id) ?? 'Direct')
        bump(goalsByCountry, visitorCountry.get(e.visitor_id))
      }
    }
  }

  const count = (name: string) => ranked(counts[name] ?? new Map())
  const tally = (ids: Map<string, string>) => { const m = new Map<string, number>(); for (const p of ids.values()) bump(m, p); return ranked(m) }
  const solved = counts.puzzle_solved ?? new Map<string, number>()

  return {
    now: headline(events),
    before: headline(before),
    daily: [...daily].map(([day, d]) => ({ day, views: d.views, visitors: d.visitors.size })),
    sources: ranked(sources).map(r => ({ ...r, extra: goalsBySource.get(r.key) ?? 0 })),
    referrers: ranked(referrers), campaigns: ranked(campaigns),
    countries: ranked(countries).map(r => ({ ...r, extra: goalsByCountry.get(r.key) ?? 0 })),
    regions: ranked(regions), cities: ranked(cities),
    devices: ranked(devices), browsers: ranked(browsers), systems: ranked(systems),
    pages: ranked(pageViews).map(r => ({ ...r, extra: pageVisitors.get(r.key)?.size ?? 0, seconds: Math.round((pageSeconds.get(r.key) ?? 0) / (r.value || 1)) })),
    entries: tally(entries), exits: tally(exits),
    heat,
    clubFunnel: [{ key: 'Saw Print Club', value: funnel.club.size }, { key: 'Picked a tier', value: funnel.tier.size }, { key: 'Applied', value: funnel.signup.size }],
    shopFunnel: [{ key: 'Saw the shop', value: funnel.shop.size }, { key: 'Picked a piece', value: funnel.piece.size }, { key: 'Sent an order request', value: funnel.order.size }],
    pieces: count('piece_selected'), tiers: count('tier_selected'), orderedPieces: count('order_request'), signups: count('club_signup'), inquiries: count('inquiry'), outbound: count('outbound'),
    puzzles: count('puzzle_opened').map(r => ({ ...r, extra: solved.get(r.key) ?? 0 })),
  }
}

/** Adds up prices like ₹499 or $11 per member, with each currency kept separate. */
export function monthlyIncome(prices: string[]) {
  const totals = new Map<string, number>()
  for (const price of prices) {
    const m = price.match(/^(\D*)([\d,.]+)/)
    if (m) totals.set(m[1].trim(), (totals.get(m[1].trim()) ?? 0) + Number(m[2].replace(/,/g, '')))
  }
  return [...totals].map(([symbol, total]) => `${symbol}${total.toLocaleString('en-IN')}`).join(' + ') || '0'
}
