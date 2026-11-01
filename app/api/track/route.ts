import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { isBot, parseDevice, referrerHost, sourceOf } from '@/lib/analytics/parse'

const NAMES = new Set(['pageview', 'leave', 'piece_selected', 'tier_selected', 'order_request', 'club_signup', 'inquiry', 'puzzle_opened', 'puzzle_solved', 'outbound'])
const MAX_BODY = 4000
const MAX_SECONDS = 4 * 3600
const ID = /^[a-z0-9-]{8,40}$/

const text = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)
const header = (req: NextRequest, name: string) => {
  const v = req.headers.get(name)
  try { return v ? decodeURIComponent(v) : null } catch { return v }
}
const done = () => new NextResponse(null, { status: 204 })

// POST /api/track from the visitor's browser. The IP address is never read or saved.
export async function POST(req: NextRequest) {
  const ua = req.headers.get('user-agent') ?? ''
  if (isBot(ua)) return done()
  const raw = await req.text()
  if (raw.length > MAX_BODY) return done()
  let body: Record<string, unknown>
  try { body = JSON.parse(raw) } catch { return done() }
  const { name, visitor, session } = body
  if (typeof name !== 'string' || !NAMES.has(name) || typeof visitor !== 'string' || !ID.test(visitor) || typeof session !== 'string' || !ID.test(session)) return done()

  const utm = (body.utm && typeof body.utm === 'object' ? body.utm : {}) as Record<string, unknown>
  const referrer = text(body.referrer, 500) ?? ''
  const utmSource = text(utm.source, 60) ?? undefined
  const firstPage = name === 'pageview' && (body.referrer !== undefined || utmSource)
  const seconds = typeof body.seconds === 'number' && body.seconds > 0 ? Math.min(Math.round(body.seconds), MAX_SECONDS) : null

  const { error } = await getSupabaseAdminClient().from('analytics_events').insert({
    name,
    path: text(body.path, 200),
    label: text(body.label, 200),
    seconds,
    visitor_id: visitor,
    session_id: session,
    source: firstPage ? sourceOf({ referrer, utmSource, ua, siteHost: req.nextUrl.hostname }) : null,
    // The site only, never the full address someone came from
    referrer: firstPage ? referrerHost(referrer) || null : null,
    utm_medium: text(utm.medium, 60),
    utm_campaign: text(utm.campaign, 80),
    country: header(req, 'x-vercel-ip-country'),
    region: header(req, 'x-vercel-ip-country-region'),
    city: header(req, 'x-vercel-ip-city'),
    ...parseDevice(ua),
  })
  if (error) console.error('Analytics not saved:', error.message)
  return done()
}
