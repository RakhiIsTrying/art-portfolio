import type { Metadata } from 'next'
import Link from 'next/link'
import DailyChart from '@/components/admin/DailyChart'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getSettings } from '@/lib/settings'
import { listInbox } from '@/lib/notify'
import { tierOf, tierPrice, TIER_IDS, TIERS, type PlanId } from '@/lib/printClub'
import { monthlyIncome, percent, summarise, type AnalyticsEvent, type Row } from '@/lib/analytics/summary'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Analytics | Admin' }

const RANGES = [7, 30, 90]
const PAGE_SIZE = 1000
const MAX_EVENTS = 200_000
const INK = '#1a1014'
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const COUNTRY_NAMES = new Intl.DisplayNames(['en'], { type: 'region' })

const countryName = (key: string) => { try { return /^[A-Z]{2}$/.test(key) ? COUNTRY_NAMES.of(key) ?? key : key } catch { return key } }
const placeName = (key: string) => { const [place, code] = key.split(', '); return code ? `${place}, ${countryName(code)}` : key }
const duration = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`)
const when = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })

async function loadEvents(since: Date) {
  const db = getSupabaseAdminClient()
  const events: AnalyticsEvent[] = []
  while (events.length < MAX_EVENTS) {
    const { data, error } = await db.from('analytics_events').select('created_at, name, path, label, seconds, visitor_id, session_id, source, referrer, utm_medium, utm_campaign, country, region, city, device, browser, os')
      .gte('created_at', since.toISOString()).order('created_at', { ascending: false }).range(events.length, events.length + PAGE_SIZE - 1)
    if (error) return { events, error: error.message }
    events.push(...(data as AnalyticsEvent[]))
    if (!data || data.length < PAGE_SIZE) break
  }
  return { events, error: null }
}

function Panel({ title, note, children, wide }: { title: string; note?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={wide ? 'lg:col-span-2' : undefined} style={{ minWidth: 0, background: '#fff', border: '1px solid #d0d0d0', padding: 18 }}>
      <h2 style={{ fontSize: 12, fontWeight: 500, letterSpacing: '.3em', textTransform: 'uppercase', color: INK, marginBottom: note ? 4 : 14 }}>{title}</h2>
      {note && <p style={{ fontSize: 12, fontWeight: 300, color: '#787878', marginBottom: 14 }}>{note}</p>}
      {children}
    </section>
  )
}

const Empty = () => <p style={{ fontSize: 12, fontWeight: 300, color: '#a0a0a0' }}>Nothing yet.</p>

/** A ranked list with a thin bar behind each number, so the exact figures are always readable. */
function Bars({ rows, name = (k: string) => k, unit, extraLabel, limit = 10 }: { rows: Row[]; name?: (k: string) => string; unit?: string; extraLabel?: string; limit?: number }) {
  if (!rows.length) return <Empty />
  const max = Math.max(...rows.map(r => r.value), 1)
  const total = rows.reduce((t, r) => t + r.value, 0)
  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.slice(0, limit).map(r => (
        <li key={r.key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, color: INK, marginBottom: 3 }}>
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={name(r.key)}>{name(r.key)}</span>
            <span style={{ flexShrink: 0, color: '#3a3a3a' }}>
              {r.value.toLocaleString('en-IN')}{unit ? ` ${unit}` : ''} <span style={{ color: '#a0a0a0' }}>({percent(r.value, total)}%)</span>
              {extraLabel && !!r.extra && <b style={{ marginLeft: 6, fontWeight: 600 }}>· {r.extra} {extraLabel}</b>}
            </span>
          </div>
          <div style={{ height: 6, background: '#f1eeee', borderRadius: 3 }}>
            <div style={{ width: `${(r.value / max) * 100}%`, minWidth: 3, height: '100%', background: '#4a3a7a', borderRadius: 3 }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function Funnel({ steps }: { steps: Row[] }) {
  // People can land partway through, so a later step can be bigger than an earlier one
  const top = Math.max(1, ...steps.map(s => s.value))
  return (
    <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {steps.map((s, i) => (
        <li key={s.key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: INK, marginBottom: 3 }}>
            <span>{s.key}</span>
            <span>{s.value} {i > 0 && <span style={{ color: '#787878' }}>({Math.min(100, percent(s.value, steps[i - 1].value))}% of the step before)</span>}</span>
          </div>
          <div style={{ height: 14, background: '#f1eeee', borderRadius: 3 }}>
            <div style={{ width: `${(s.value / top) * 100}%`, minWidth: s.value ? 3 : 0, height: '100%', background: '#4a3a7a', borderRadius: 3 }} />
          </div>
        </li>
      ))}
    </ol>
  )
}

function Stat({ label, value, was, better = 'up' }: { label: string; value: string; was?: { now: number; before: number }; better?: 'up' | 'down' }) {
  let change: React.ReactNode = null
  if (was && was.before > 0) {
    const pct = Math.round(((was.now - was.before) / was.before) * 100)
    const good = pct === 0 ? null : (pct > 0) === (better === 'up')
    change = <span style={{ fontSize: 11, color: good === null ? '#787878' : good ? '#2f7a43' : '#b3261e' }}>{pct > 0 ? '▲' : pct < 0 ? '▼' : '='} {Math.abs(pct)}% vs before</span>
  } else if (was) change = <span style={{ fontSize: 11, color: '#a0a0a0' }}>nothing to compare yet</span>
  return (
    <div style={{ minWidth: 0, background: '#fff', border: '1px solid #d0d0d0', padding: '14px 14px 12px' }}>
      <p style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#787878', marginBottom: 6 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, lineHeight: 1.1, color: INK, marginBottom: 4 }}>{value}</p>
      {change}
    </div>
  )
}

function Heatmap({ heat }: { heat: number[][] }) {
  const max = Math.max(1, ...heat.flat())
  return (
    <div className="no-scrollbar" style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '34px repeat(24, minmax(16px, 1fr))', gap: 2, minWidth: 460 }}>
        <span />
        {heat[0].map((_, h) => <span key={h} style={{ fontSize: 9, textAlign: 'center', color: '#787878' }}>{h % 3 === 0 ? h : ''}</span>)}
        {[1, 2, 3, 4, 5, 6, 0].flatMap(d => [
          <span key={`d${d}`} style={{ fontSize: 10, color: '#787878', alignSelf: 'center' }}>{WEEKDAYS[d]}</span>,
          ...heat[d].map((n, h) => (
            <span key={`${d}-${h}`} title={`${WEEKDAYS[d]} ${h}:00, ${n} page ${n === 1 ? 'view' : 'views'}`}
              style={{ height: 18, borderRadius: 2, background: n ? `rgba(74,58,122,${0.15 + 0.85 * (n / max)})` : '#f4f2f2' }} />
          )),
        ])}
      </div>
    </div>
  )
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const asked = Number((await searchParams).days)
  const days = RANGES.includes(asked) ? asked : 30
  const now = new Date()
  const { events, error } = await loadEvents(new Date(now.getTime() - 2 * days * 86_400_000))
  const s = summarise(events, days, now)
  const a = s.now, b = s.before

  // The people behind the numbers: only ever shown here, behind the Admin sign-in
  const [{ data: members }, inbox, { plans }] = await Promise.all([
    getSupabaseAdminClient().from('print_club_signups').select('name, email, tier, plan, country, created_at').order('created_at', { ascending: false }),
    listInbox(),
    getSettings(),
  ])
  const club = (members ?? []).map(m => ({ ...m, tierId: tierOf(m.tier), price: plans[m.plan as PlanId] ? tierPrice(plans[m.plan as PlanId], tierOf(m.tier)) : '' }))
  const orders = inbox.filter(m => m.kind === 'Print order')
  const buyers = [
    ...club.map(m => ({ at: m.created_at, name: m.name, email: m.email, what: `${TIERS[m.tierId].name}, ${m.price} / month`, where: countryName(m.country) })),
    ...orders.map(o => ({ at: o.at, name: o.subject.split(', ')[0], email: o.from ?? '', what: `Print order: ${o.subject.split(', ').slice(1).join(', ').replace(/^Print: /, '')}`, where: '' })),
  ].sort((x, y) => y.at.localeCompare(x.at))

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 py-6 md:px-9 md:py-9" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, borderBottom: '1px solid #d0d0d0', paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{ width: 3, background: '#4a3a7a', marginRight: 16 }} />
          <div>
            <p style={{ fontSize: 11, letterSpacing: '.45em', textTransform: 'uppercase', color: '#4a3a7a', marginBottom: 6 }}>Who’s visiting</p>
            <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: INK, lineHeight: 1 }}>Analytics</h1>
          </div>
        </div>
        <nav aria-label="Time range" style={{ display: 'flex', gap: 6 }}>
          {RANGES.map(r => (
            <Link key={r} href={`/admin/analytics?days=${r}`} aria-current={r === days ? 'page' : undefined}
              style={{ padding: '6px 12px', fontSize: 11, letterSpacing: '.15em', textDecoration: 'none', border: `1px solid ${r === days ? '#4a3a7a' : '#d0d0d0'}`, background: r === days ? '#4a3a7a' : '#fff', color: r === days ? '#fff' : INK }}>
              {r} days
            </Link>
          ))}
        </nav>
      </div>

      {error && <p role="alert" style={{ padding: 14, fontSize: 13, background: '#fdf0ee', border: '1px solid #b3261e', color: '#7a1c16' }}>Couldn’t load analytics: {error}</p>}
      {!error && !events.length && (
        <p style={{ padding: 14, fontSize: 13, background: '#fff', border: '1px solid #d0d0d0', color: '#3a3a3a' }}>
          No visits recorded yet. Counting starts from the day this page went live, and your own browser is left out once you’ve opened Admin.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <Stat label="Visitors" value={a.visitors.toLocaleString('en-IN')} was={{ now: a.visitors, before: b.visitors }} />
        <Stat label="Visits" value={a.sessions.toLocaleString('en-IN')} was={{ now: a.sessions, before: b.sessions }} />
        <Stat label="Page views" value={a.pageviews.toLocaleString('en-IN')} was={{ now: a.pageviews, before: b.pageviews }} />
        <Stat label="Pages per visit" value={a.pagesPerSession.toFixed(1)} was={{ now: a.pagesPerSession, before: b.pagesPerSession }} />
        <Stat label="Time per visit" value={duration(a.avgSeconds)} was={{ now: a.avgSeconds, before: b.avgSeconds }} />
        <Stat label="Left after one page" value={`${a.bounceRate}%`} was={{ now: a.bounceRate, before: b.bounceRate }} better="down" />
        <Stat label="Came back" value={`${percent(a.returning, a.visitors)}%`} was={{ now: a.returning, before: b.returning }} />
        <Stat label="Orders, sign-ups, messages" value={`${a.conversions}`} was={{ now: a.conversions, before: b.conversions }} />
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <Panel wide title={`Visitors, last ${days} days`}><DailyChart days={s.daily} /></Panel>

        <Panel title="Where they come from" note="By visitors. Bold shows how many went on to order, sign up or message you.">
          <Bars rows={s.sources} extraLabel="acted" />
        </Panel>
        <Panel title="Sites that sent them"><Bars rows={s.referrers} /></Panel>

        <Panel title="Countries" note="Bold shows how many orders, sign-ups or messages came from there."><Bars rows={s.countries} name={countryName} extraLabel="acted" /></Panel>
        <Panel title="Cities" note="Approximate, based on their internet connection."><Bars rows={s.cities} name={placeName} /></Panel>
        <Panel title="States and regions"><Bars rows={s.regions} name={placeName} /></Panel>
        <Panel title="Campaign links" note="Links you tag with ?utm_campaign=name, such as in an Instagram bio."><Bars rows={s.campaigns} /></Panel>

        <Panel wide title="When they visit" note="Page views by day and hour, India time. Darker means busier.">
          <Heatmap heat={s.heat} />
        </Panel>

        <Panel title="Most viewed pages" note="Average time looking at each page is in the table below.">
          <Bars rows={s.pages} limit={12} unit="views" />
        </Panel>
        <Panel title="Time on page">
          {s.pages.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, color: INK }}>
                <thead><tr style={{ textAlign: 'left', color: '#787878' }}><th style={{ fontWeight: 500, paddingBottom: 6 }}>Page</th><th style={{ fontWeight: 500, textAlign: 'right' }}>Visitors</th><th style={{ fontWeight: 500, textAlign: 'right' }}>Avg time</th></tr></thead>
                <tbody>{s.pages.slice(0, 12).map(p => (
                  <tr key={p.key} style={{ borderTop: '1px solid #f1eeee' }}><td style={{ padding: '5px 8px 5px 0', wordBreak: 'break-all' }}>{p.key}</td><td style={{ textAlign: 'right' }}>{p.extra}</td><td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{duration(p.seconds)}</td></tr>
                ))}</tbody>
              </table>
            </div>
          ) : <Empty />}
        </Panel>
        <Panel title="First page they see"><Bars rows={s.entries} /></Panel>
        <Panel title="Last page before leaving"><Bars rows={s.exits} /></Panel>

        <Panel title="Phone or computer"><Bars rows={s.devices} /></Panel>
        <Panel title="Browsers and apps"><Bars rows={s.browsers} /></Panel>
        <Panel title="Operating systems"><Bars rows={s.systems} /></Panel>
        <Panel title="Links they click to leave"><Bars rows={s.outbound} /></Panel>

        <Panel title="Print Club journey" note="Unique visitors at each step."><Funnel steps={s.clubFunnel} /></Panel>
        <Panel title="Shop journey" note="Unique visitors at each step."><Funnel steps={s.shopFunnel} /></Panel>
        <Panel title="Tiers people pick"><Bars rows={s.tiers} name={k => TIERS[tierOf(k)].name} /></Panel>
        <Panel title="Sign-ups by tier"><Bars rows={s.signups} name={k => TIERS[tierOf(k)].name} /></Panel>
        <Panel title="Art they consider buying" note="Pieces picked in the print shop."><Bars rows={s.pieces} /></Panel>
        <Panel title="Art they ask to buy" note="Order requests sent."><Bars rows={s.orderedPieces} /></Panel>
        <Panel wide title="Puzzles" note="How many times each was opened. Bold shows how many were solved.">
          <Bars rows={s.puzzles} extraLabel="solved" />
        </Panel>

        <Panel wide title="Who’s buying" note="Everyone so far, from all time. Payments aren’t on the site yet, so these are requests and applications.">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" style={{ marginBottom: 16 }}>
            {TIER_IDS.map(t => (
              <div key={t}><p style={{ fontSize: 11, color: '#787878' }}>{TIERS[t].name}</p><p style={{ fontSize: 20, fontWeight: 600, color: INK }}>{club.filter(m => m.tierId === t).length}</p></div>
            ))}
            <div><p style={{ fontSize: 11, color: '#787878' }}>Print orders</p><p style={{ fontSize: 20, fontWeight: 600, color: INK }}>{orders.length}</p></div>
            <div><p style={{ fontSize: 11, color: '#787878' }}>Club income a month, if all pay</p><p style={{ fontSize: 20, fontWeight: 600, color: INK }}>{monthlyIncome(club.map(m => m.price))}</p></div>
          </div>
          {buyers.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', fontSize: 12, color: INK }}>
                <thead><tr style={{ textAlign: 'left', color: '#787878' }}>{['Date', 'Name', 'What', 'Country', 'Email'].map(h => <th key={h} style={{ fontWeight: 500, paddingBottom: 6 }}>{h}</th>)}</tr></thead>
                <tbody>{buyers.slice(0, 50).map((x, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #f1eeee' }}>
                    <td style={{ padding: '6px 8px 6px 0', whiteSpace: 'nowrap' }}>{when(x.at)}</td><td style={{ paddingRight: 8 }}>{x.name}</td><td style={{ paddingRight: 8 }}>{x.what}</td><td style={{ paddingRight: 8 }}>{x.where}</td>
                    <td><a href={`mailto:${x.email}`} style={{ color: '#1e3a8a' }}>{x.email}</a></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <Empty />}
        </Panel>
      </div>
    </div>
  )
}
