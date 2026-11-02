// Reads saved visits and sales for the Admin analytics page and its question box.
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { listInbox } from '@/lib/notify'
import { getSettings } from '@/lib/settings'
import { tierOf, tierPrice, TIERS, type PlanId } from '@/lib/printClub'
import type { AnalyticsEvent } from './summary'
import type { SaleMember, SaleOrder } from './sales'

const PAGE_SIZE = 1000
const MAX_EVENTS = 200_000
const COLUMNS = 'created_at, name, path, label, seconds, visitor_id, session_id, source, referrer, utm_medium, utm_campaign, country, region, city, device, browser, os'

export async function loadEvents(since: Date) {
  const db = getSupabaseAdminClient()
  const events: AnalyticsEvent[] = []
  while (events.length < MAX_EVENTS) {
    const { data, error } = await db.from('analytics_events').select(COLUMNS)
      .gte('created_at', since.toISOString()).order('created_at', { ascending: false }).range(events.length, events.length + PAGE_SIZE - 1)
    if (error) return { events, error: error.message }
    events.push(...(data as unknown as AnalyticsEvent[]))
    if (!data || data.length < PAGE_SIZE) break
  }
  return { events, error: null }
}

export async function loadSales() {
  const [{ data: rows }, inbox, { plans }] = await Promise.all([
    getSupabaseAdminClient().from('print_club_signups').select('name, email, tier, plan, country, created_at').order('created_at', { ascending: false }),
    listInbox(),
    getSettings(),
  ])
  const members: SaleMember[] = (rows ?? []).map(m => {
    const tier = tierOf(m.tier)
    return { name: m.name, email: m.email, country: m.country, at: m.created_at, tier: TIERS[tier].name, tierId: tier, price: plans[m.plan as PlanId] ? tierPrice(plans[m.plan as PlanId], tier) : '' }
  })
  const orders: SaleOrder[] = inbox.filter(m => m.kind === 'Print order').map(o => ({
    name: o.subject.split(', ')[0], email: o.from ?? '', at: o.at,
    piece: o.subject.split(', ').slice(1).join(', ').replace(/^Print: /, ''),
    total: o.text.match(/^Total: (.+)$/m)?.[1]?.trim() ?? '',
  }))
  return { members, orders }
}
