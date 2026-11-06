import type { Metadata } from 'next'
import Link from 'next/link'
import DailyChart from '@/components/admin/DailyChart'
import AskAnalytics from '@/components/admin/AskAnalytics'
import { projectSales } from '@/lib/analytics/forecast'
import { findInsights, verdict, type Insight } from '@/lib/analytics/insights'
import { loadEvents, loadSales } from '@/lib/analytics/load'
import { salesSummary, showMoney } from '@/lib/analytics/sales'
import { percent, recentVisits, summarise, type AnalyticsEvent, type Row } from '@/lib/analytics/summary'
import { tierOf, TIER_IDS, TIERS } from '@/lib/printClub'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Analytics | Admin' }

const RANGES = [7, 30, 90]
const INK = '#1a1014'
// The device's own font: built for its screen, and instant to load
const READABLE_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Noto Sans", sans-serif'
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const COUNTRY_NAMES = new Intl.DisplayNames(['en'], { type: 'region' })

const countryName = (key: string) => { try { return /^[A-Z]{2}$/.test(key) ? COUNTRY_NAMES.of(key) ?? key : key } catch { return key } }
const placeName = (key: string) => { const [place, code] = key.split(', '); return code ? `${place}, ${countryName(code)}` : key }
// Small expected numbers keep a decimal, as “about 0” would hide them
const about = (n: number) => (n >= 5 ? Math.round(n).toLocaleString('en-IN') : n.toFixed(1))
const duration = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`)
const when = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })

const CONFIDENCE = { 'too-early': 'Too early to say', rough: 'Rough guess, under 2 weeks of data', fair: 'Fair estimate', good: 'Good estimate' } as const
const TONES = { good: { label: 'Working', color: '#2f7a43', mark: '▲' }, fix: { label: 'Fix', color: '#b3261e', mark: '!' }, idea: { label: 'Try', color: '#4a3a7a', mark: '★' } } as const

function Board({ title, tag, children }: { title: string; tag: string; children: React.ReactNode }) {
  return (
    <section style={{ minWidth: 0, background: '#fff', border: '1px solid #d0d0d0', borderTop: '4px solid #4a3a7a', padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3, color: INK }}>{title}</h2>
        <p style={{ fontSize: 13, color: '#595959', whiteSpace: 'normal' }}>{tag}</p>
      </div>
      {children}
    </section>
  )
}

function Big({ label, value, was }: { label: string; value: string; was?: { now: number; before: number } }) {
  const change = was && was.before > 0 ? Math.round(((was.now - was.before) / was.before) * 100) : null
  return (
    <div style={{ paddingBottom: 10, borderBottom: '1px solid #ebe8e8' }}>
      <p style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: INK, overflowWrap: 'anywhere' }}>{value}</p>
      <p style={{ fontSize: 13, color: '#595959', whiteSpace: 'normal' }}>
        {label}
        {change !== null && <b style={{ marginLeft: 6, fontWeight: 600, color: change === 0 ? '#595959' : change > 0 ? '#2f7a43' : '#b3261e' }}>{change > 0 ? '▲' : change < 0 ? '▼' : '='} {Math.abs(change)}%</b>}
      </p>
    </div>
  )
}

function Small({ label, value }: { label: string; value: string }) {
  return (
    <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, fontSize: 13, color: '#595959' }}>
      <span style={{ whiteSpace: 'normal' }}>{label}</span>
      <b style={{ fontWeight: 600, color: INK, textAlign: 'right', whiteSpace: 'normal' }}>{value}</b>
    </p>
  )
}

function InsightCard({ insight }: { insight: Insight }) {
  const tone = TONES[insight.tone]
  return (
    <article style={{ minWidth: 0, background: '#fff', border: '1px solid #d0d0d0', borderLeft: `4px solid ${tone.color}`, padding: '14px 16px' }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: tone.color, marginBottom: 5 }}><span aria-hidden>{tone.mark} </span>{tone.label}</p>
      <h3 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: INK, marginBottom: 5, whiteSpace: 'normal' }}>{insight.title}</h3>
      <p style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.55, color: '#3a3a3a', whiteSpace: 'normal' }}>{insight.detail}</p>
    </article>
  )
}

const at = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })

function VisitsTable({ visits }: { visits: ReturnType<typeof recentVisits> }) {
  if (!visits.length) return <Empty />
  const cell: React.CSSProperties = { padding: '7px 10px 7px 0', verticalAlign: 'top', borderTop: '1px solid #eee' }
  const nowrap: React.CSSProperties = { ...cell, whiteSpace: 'nowrap' }
  return (
    <div style={{ overflow: 'auto', maxHeight: 560 }}>
      <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse', fontSize: 13, color: INK }}>
        <thead style={{ position: 'sticky', top: 0, background: '#fff' }}>
          <tr style={{ textAlign: 'left', color: '#595959' }}>{['When', 'Stayed', 'Pages', 'Came from', 'Where', 'Device', 'Browser', 'System', 'Screen', 'Language', 'IP address', 'Did'].map(h => <th key={h} style={{ fontWeight: 600, padding: '0 10px 8px 0', whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
        </thead>
        <tbody>{visits.map((v, i) => (
          <tr key={i}>
            <td style={nowrap}>{at(v.at)}{v.returning && <span style={{ display: 'block', fontSize: 12, color: '#2f7a43' }}>came back</span>}</td>
            <td style={nowrap}>{v.minutes < 1 ? 'under 1 min' : `${v.minutes} min`}</td>
            <td style={{ ...cell, minWidth: 140, overflowWrap: 'anywhere' }}>{v.pages.join(' → ') || '–'}</td>
            <td style={cell}>{v.source ?? '–'}</td>
            <td style={cell}>{[v.city, v.region, v.country && countryName(v.country)].filter(Boolean).join(', ') || '–'}{v.timezone && <span style={{ display: 'block', fontSize: 12, color: '#595959' }}>{v.timezone}</span>}</td>
            <td style={cell}>{v.device ?? '–'}</td>
            <td style={nowrap}>{v.browser || '–'}</td>
            <td style={nowrap}>{v.os || '–'}</td>
            <td style={cell}>{v.screen ?? '–'}</td>
            <td style={cell}>{v.language ?? '–'}</td>
            <td style={{ ...cell, fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: 12, overflowWrap: 'anywhere' }}>{v.ip ?? '–'}</td>
            <td style={{ ...cell, minWidth: 120 }}>{v.actions.join(', ') || '–'}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

function Panel({ title, note, children, wide }: { title: string; note?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={wide ? 'lg:col-span-2' : undefined} style={{ minWidth: 0, background: '#fff', border: '1px solid #d0d0d0', padding: 18 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: note ? 4 : 12 }}>{title}</h2>
      {note && <p style={{ fontSize: 13, fontWeight: 400, color: '#595959', marginBottom: 14 }}>{note}</p>}
      {children}
    </section>
  )
}

const Empty = () => <p style={{ fontSize: 13, fontWeight: 400, color: '#595959' }}>Nothing yet.</p>

/** A ranked list with a thin bar behind each number, so the exact figures are always readable. */
function Bars({ rows, name = (k: string) => k, unit, extraLabel, limit = 10 }: { rows: Row[]; name?: (k: string) => string; unit?: string; extraLabel?: string; limit?: number }) {
  if (!rows.length) return <Empty />
  const max = Math.max(...rows.map(r => r.value), 1)
  const total = rows.reduce((t, r) => t + r.value, 0)
  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.slice(0, limit).map(r => (
        <li key={r.key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, color: INK, marginBottom: 3 }}>
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={name(r.key)}>{name(r.key)}</span>
            <span style={{ flexShrink: 0, color: '#3a3a3a' }}>
              {r.value.toLocaleString('en-IN')}{unit ? ` ${unit}` : ''} <span style={{ color: '#595959' }}>({percent(r.value, total)}%)</span>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: INK, marginBottom: 3 }}>
            <span>{s.key}</span>
            <span>{s.value} {i > 0 && <span style={{ color: '#595959' }}>({Math.min(100, percent(s.value, steps[i - 1].value))}% of the step before)</span>}</span>
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
    change = <span style={{ fontSize: 13, color: good === null ? '#595959' : good ? '#2f7a43' : '#b3261e' }}>{pct > 0 ? '▲' : pct < 0 ? '▼' : '='} {Math.abs(pct)}% vs before</span>
  } else if (was) change = <span style={{ fontSize: 13, color: '#595959' }}>nothing to compare yet</span>
  return (
    <div style={{ minWidth: 0, background: '#fff', border: '1px solid #d0d0d0', padding: '14px 14px 12px' }}>
      <p style={{ fontSize: 13, color: '#595959', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, color: INK, marginBottom: 4 }}>{value}</p>
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
        {heat[0].map((_, h) => <span key={h} style={{ fontSize: 13, textAlign: 'center', color: '#595959' }}>{h % 3 === 0 ? h : ''}</span>)}
        {[1, 2, 3, 4, 5, 6, 0].flatMap(d => [
          <span key={`d${d}`} style={{ fontSize: 13, color: '#595959', alignSelf: 'center' }}>{WEEKDAYS[d]}</span>,
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
  const { members: club, orders } = await loadSales()
  const sales = salesSummary(club, orders, days, now)
  const projection = projectSales(s, sales)
  const insights = findInsights(s, sales)
  const buyers = [
    ...club.map(m => ({ at: m.at, name: m.name, email: m.email, what: `${m.tier}, ${m.price} / month`, where: countryName(m.country) })),
    ...orders.map(o => ({ at: o.at, name: o.name, email: o.email, what: `Print order: ${o.piece}${o.total ? `, ${o.total}` : ''}`, where: '' })),
  ].sort((x, y) => y.at.localeCompare(x.at))

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 py-6 md:px-9 md:py-9" style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: READABLE_FONT, fontSize: 15, fontWeight: 400, lineHeight: 1.5, color: INK }}>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, borderBottom: '1px solid #d0d0d0', paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{ width: 3, background: '#4a3a7a', marginRight: 16 }} />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: INK, lineHeight: 1.2 }}>Analytics</h1>
          </div>
        </div>
        <nav aria-label="Time range" style={{ display: 'flex', gap: 6 }}>
          {RANGES.map(r => (
            <Link key={r} href={`/admin/analytics?days=${r}`} aria-current={r === days ? 'page' : undefined}
              style={{ padding: '6px 12px', fontSize: 13, textDecoration: 'none', border: `1px solid ${r === days ? '#4a3a7a' : '#d0d0d0'}`, background: r === days ? '#4a3a7a' : '#fff', color: r === days ? '#fff' : INK }}>
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

      <p style={{ fontSize: 17, lineHeight: 1.5, color: INK, whiteSpace: 'normal' }}>{verdict(s, sales, days)}</p>

      <AskAnalytics smart={!!process.env.ANTHROPIC_API_KEY?.trim()} />

      <div className="grid lg:grid-cols-3 gap-3">
        <Board title="Website" tag="How it's performing">
          <Big label="Visitors" value={a.visitors.toLocaleString('en-IN')} was={{ now: a.visitors, before: b.visitors }} />
          <Small label="Time per visit" value={duration(a.avgSeconds)} />
          <Small label="Left after one page" value={`${a.bounceRate}%`} />
          <Small label="Came back" value={`${percent(a.returning, a.visitors)}%`} />
          <Small label="Top source" value={s.sources[0]?.key ?? 'None yet'} />
        </Board>
        <Board title="Sales" tag="Requests, as payments aren't on yet">
          <Big label="Club income a month, if all pay" value={showMoney(sales.monthlyIncome)} />
          <Small label="Club members" value={`${sales.members}${sales.newMembers ? ` (+${sales.newMembers} new)` : ''}`} />
          <Small label="Print orders" value={`${sales.orders}${sales.newOrders ? ` (+${sales.newOrders} new)` : ''}`} />
          <Small label="Print order value" value={showMoney(sales.orderValue)} />
          <Small label="Visitors who act" value={`${a.conversionRate.toFixed(1)}%`} />
        </Board>
        <Board title="Next 30 days" tag={CONFIDENCE[projection.visitors.confidence]}>
          {projection.visitors.confidence === 'too-early' ? (
            <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.6, color: '#3a3a3a', whiteSpace: 'normal' }}>I need at least 7 days of visits to project anything. There {projection.visitors.days === 1 ? 'is 1 day' : `are ${projection.visitors.days} days`} so far.</p>
          ) : (
            <>
              <Big label="Club income a month, if all pay" value={projection.hasSalesHistory ? showMoney(projection.monthlyIncome) : 'No sales yet'} />
              <Small label="Visitors" value={`${projection.visitors.mid.toLocaleString('en-IN')} (${projection.visitors.low.toLocaleString('en-IN')} to ${projection.visitors.high.toLocaleString('en-IN')})`} />
              <Small label="New club members" value={`About ${about(projection.newSignups)}`} />
              <Small label="Print orders" value={`About ${about(projection.newOrders)}`} />
              <Small label="Print order value" value={projection.hasSalesHistory ? showMoney(projection.orderValue) : 'No sales yet'} />
            </>
          )}
        </Board>
      </div>

      <section aria-labelledby="insights">
        <h2 id="insights" style={{ fontSize: 18, fontWeight: 700, color: INK, marginBottom: 10 }}>What I’d look at</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {insights.map(i => <InsightCard key={i.title} insight={i} />)}
        </div>
      </section>

      <div style={{ minWidth: 0, background: '#fff', border: '1px solid #d0d0d0', padding: 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 12 }}>Visitors, last {days} days</h2>
        <DailyChart days={s.daily} />
      </div>

      <Panel wide title="Every visit" note={`Newest first, last ${days} days. Times are India time. Location and IP address come from the visitor's connection, so they're approximate.`}>
        <VisitsTable visits={recentVisits(events.filter(e => new Date(e.created_at).getTime() >= now.getTime() - days * 86_400_000))} />
      </Panel>

      <details style={{ background: '#fff', border: '1px solid #d0d0d0' }}>
        <summary style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: INK }}>Show all the detailed numbers</summary>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 12px 12px', background: '#e6e6e6', paddingTop: 12 }}>

      <div id="site-details" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: INK }}>
                <thead><tr style={{ textAlign: 'left', color: '#595959' }}><th style={{ fontWeight: 500, paddingBottom: 6 }}>Page</th><th style={{ fontWeight: 500, textAlign: 'right' }}>Visitors</th><th style={{ fontWeight: 500, textAlign: 'right' }}>Avg time</th></tr></thead>
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

        <div id="buyers" className="lg:col-span-2" style={{ minWidth: 0 }}>
        <Panel title="Who’s buying" note="Everyone so far, from all time. Payments aren’t on the site yet, so these are requests and applications.">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" style={{ marginBottom: 16 }}>
            {TIER_IDS.map(t => (
              <div key={t}><p style={{ fontSize: 13, color: '#595959' }}>{TIERS[t].name}</p><p style={{ fontSize: 20, fontWeight: 600, color: INK }}>{club.filter(m => m.tierId === t).length}</p></div>
            ))}
            <div><p style={{ fontSize: 13, color: '#595959' }}>Print orders</p><p style={{ fontSize: 20, fontWeight: 600, color: INK }}>{orders.length}</p></div>
            <div><p style={{ fontSize: 13, color: '#595959' }}>Club income a month, if all pay</p><p style={{ fontSize: 20, fontWeight: 600, color: INK }}>{showMoney(sales.monthlyIncome)}</p></div>
          </div>
          {buyers.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', fontSize: 13, color: INK }}>
                <thead><tr style={{ textAlign: 'left', color: '#595959' }}>{['Date', 'Name', 'What', 'Country', 'Email'].map(h => <th key={h} style={{ fontWeight: 500, paddingBottom: 6 }}>{h}</th>)}</tr></thead>
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
        </div>
      </details>
    </div>
  )
}
