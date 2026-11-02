// Reads the numbers and says what they mean: what's working, what to fix and what to try.
import { percent, type summarise } from './summary'
import type { SalesSummary } from './sales'
import { showMoney } from './sales'

export type Insight = { tone: 'good' | 'fix' | 'idea'; title: string; detail: string }

const MIN_VISITORS = 20
const MIN_GROUP = 5
const MAX_INSIGHTS = 6
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const clock = (h: number) => `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`

/** Today's position in one sentence. */
export function verdict(s: ReturnType<typeof summarise>, sales: SalesSummary, days: number) {
  const { visitors } = s.now, before = s.before.visitors
  if (!visitors) return `No visits recorded in the last ${days} days yet. This fills up as people find the site.`
  const change = before ? Math.round(((visitors - before) / before) * 100) : null
  const trend = change === null ? '' : change === 0 ? ', the same as before' : `, ${change > 0 ? 'up' : 'down'} ${Math.abs(change)}% on the period before`
  const money = sales.members ? ` Print Club could bring in ${showMoney(sales.monthlyIncome)} a month if every member pays.` : ''
  const acted = s.now.conversions
  return `${visitors.toLocaleString('en-IN')} ${visitors === 1 ? 'person' : 'people'} visited in the last ${days} days${trend}, and ${acted} ${acted === 1 ? 'action' : 'actions'} came from them (orders, sign-ups or messages).${money}`
}

export function findInsights(s: ReturnType<typeof summarise>, sales: SalesSummary): Insight[] {
  const { visitors, bounceRate, returning } = s.now
  if (visitors < MIN_VISITORS) {
    return [{ tone: 'idea', title: 'Too early to read much into this', detail: `With ${visitors} ${visitors === 1 ? 'visitor' : 'visitors'} so far, one person can swing every number. Patterns start to mean something from about ${MIN_VISITORS} visitors, so sharing your link is the most useful thing right now.` }]
  }
  const out: Insight[] = []
  const known = (rows: { key: string; value: number; extra?: number }[]) => rows.filter(r => r.key !== 'Unknown')

  // Where the visitors drop off
  const leak = (steps: { key: string; value: number }[], name: string) => {
    for (let i = 1; i < steps.length; i++) {
      const was = steps[i - 1].value, kept = percent(Math.min(steps[i].value, was), was)
      if (was >= MIN_GROUP * 2 && kept < 25) {
        out.push({ tone: 'fix', title: `Biggest leak in ${name}: only ${kept}% get past “${steps[i - 1].key}”`, detail: `${was} visitors reached that step and ${steps[i].value} went on to “${steps[i].key}”. This is where better wording or an easier next step should pay off first.` })
        return
      }
    }
  }
  leak(s.clubFunnel, 'Print Club')
  leak(s.shopFunnel, 'the shop')

  if (bounceRate >= 60) out.push({ tone: 'fix', title: `${bounceRate}% of visits end after one page`, detail: `People arrive and leave. The first page they see most often is ${known(s.entries)[0]?.key ?? 'unknown'}, so that's the page to give a stronger next step.` })

  const before = s.before.visitors
  if (before >= MIN_GROUP) {
    const change = Math.round(((visitors - before) / before) * 100)
    if (change >= 20) out.push({ tone: 'good', title: `Traffic is up ${change}%`, detail: `${before} visitors in the period before, ${visitors} now. Whatever you posted recently is worth doing again.` })
    if (change <= -20) out.push({ tone: 'fix', title: `Traffic is down ${Math.abs(change)}%`, detail: `${before} visitors in the period before, ${visitors} now. A new post linking back to the site is the quickest way to reverse it.` })
  }

  const sources = known(s.sources)
  if (sources[0]) {
    const share = percent(sources[0].value, sources.reduce((t, r) => t + r.value, 0))
    out.push({ tone: 'good', title: `${sources[0].key} is your biggest source (${share}%)`, detail: share >= 70 ? 'Nearly everyone comes from one place, which is a risk if it ever slows down. A second source would make traffic steadier.' : `It sends ${sources[0].value} visitors. Keep your best links there.` })
    const converting = sources.filter(r => r.value >= MIN_GROUP).sort((a, b) => (b.extra ?? 0) / b.value - (a.extra ?? 0) / a.value)[0]
    if (converting?.extra && converting.key !== sources[0].key) out.push({ tone: 'good', title: `${converting.key} visitors act the most`, detail: `${percent(converting.extra, converting.value)}% of them order, sign up or message you, even though it isn't your biggest source. It's worth more of your attention.` })
  }

  // Best time to post, from the busiest hour
  let bestDay = 0, bestHour = 0, best = 0
  s.heat.forEach((hours, d) => hours.forEach((n, h) => { if (n > best) { best = n; bestDay = d; bestHour = h } }))
  if (best >= MIN_GROUP) out.push({ tone: 'idea', title: `Post just before ${DAYS[bestDay]} ${clock(bestHour)}`, detail: 'That is your busiest hour in India time, so new work posted just before it should get the most eyes.' })

  const top = known(s.pieces)[0]
  if (top && top.value >= MIN_GROUP && !s.orderedPieces.some(o => o.key === top.key)) out.push({ tone: 'idea', title: `“${top.key}” gets attention but no orders`, detail: `It was picked ${top.value} times in the print shop with no order requests yet. Try featuring it, or a nudge like a card or smaller size.` })

  const phones = s.devices.find(r => r.key === 'Phone')
  if (phones && percent(phones.value, s.devices.reduce((t, r) => t + r.value, 0)) >= 60) out.push({ tone: 'idea', title: 'This is mostly a phone audience', detail: `${percent(phones.value, s.devices.reduce((t, r) => t + r.value, 0))}% browse on a phone, so check new pages on yours first.` })

  if (percent(returning, visitors) >= 25) out.push({ tone: 'good', title: `${percent(returning, visitors)}% of visitors come back`, detail: 'People are returning, which is the audience most likely to join Print Club.' })
  if (!sales.members && !sales.orders) out.push({ tone: 'idea', title: 'No sales yet', detail: 'Payments are not switched on, so a personal note to anyone who messages you could turn the first interest into the first sale.' })

  const rank = { fix: 0, good: 1, idea: 2 }
  return out.sort((a, b) => rank[a.tone] - rank[b.tone]).slice(0, MAX_INSIGHTS)
}
