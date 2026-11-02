'use client'
import { useRef, useState } from 'react'
import AnswerChart from '@/components/admin/AnswerChart'
import { CHART_NAMES, formatRequest, type ChartSpec, type ChartType } from '@/lib/analytics/chart'

const EXAMPLES = ['Show me visitors per day', 'Which country sends the most people?', 'Sales by tier as a chart', 'What will next month look like?', 'What should I fix first?']
type Turn = { role: 'user' | 'assistant'; content: string; notice?: string; charts?: ChartSpec[] }

/** Shows **bold** from an answer as bold, rather than as stars. */
function withBold(text: string) {
  return text.split(/(\*\*[^*\n]+\*\*)/).map((part, i) => (part.startsWith('**') && part.endsWith('**') && part.length > 4 ? <b key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</b> : part))
}

/** Type a question about the site and get an answer calculated from the real numbers. */
export default function AskAnalytics({ smart }: { smart: boolean }) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  async function ask(text: string) {
    const q = text.trim()
    if (!q || busy) return
    setQuestion('')
    // "Make it a pie" just redraws the latest chart, instantly
    const type = formatRequest(q)
    const latest = turns.findLastIndex(t => t.charts?.length)
    if (type && latest !== -1) {
      setTurns(t => [...t.map((turn, i) => (i === latest ? { ...turn, charts: turn.charts!.map((c, n) => (n === turn.charts!.length - 1 ? { ...c, type } : c)) } : turn)), { role: 'user', content: q }, { role: 'assistant', content: `Done, I switched the chart above to ${CHART_NAMES[type].toLowerCase()}.` }])
      return
    }
    // Earlier charts go along as text, so a follow-up can change them
    const history = turns.map(({ role, content, charts }) => ({ role, content: charts?.length ? `${content}\n[Charts shown: ${JSON.stringify(charts.map(c => ({ title: c.title, type: c.type, ...c.source })))}]` : content }))
    setTurns(t => [...t, { role: 'user', content: q }])
    setBusy(true)
    try {
      const res = await fetch('/api/admin/analytics-ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, history }) })
      const data = await res.json()
      setTurns(t => [...t, { role: 'assistant', content: res.ok ? data.answer : data.error ?? 'Something went wrong. Please try again.', notice: data.notice, charts: data.charts }])
    } catch {
      setTurns(t => [...t, { role: 'assistant', content: 'I couldn’t reach the site. Please try again.' }])
    } finally {
      setBusy(false)
      input.current?.focus()
    }
  }

  const setChartType = (turn: number, chart: number, type: ChartType) =>
    setTurns(t => t.map((x, i) => (i === turn ? { ...x, charts: x.charts!.map((c, n) => (n === chart ? { ...c, type } : c)) } : x)))

  return (
    <section aria-labelledby="ask" style={{ background: '#fff', color: '#1a1014', border: '1px solid #d0d0d0', padding: 16 }}>
      <h2 id="ask" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>Ask about your analytics</h2>
      <p style={{ fontSize: 14, color: '#595959', marginBottom: 12, whiteSpace: 'normal' }}>
        {smart ? 'Numbers are calculated from your real data, and the AI explains them. Ask for any chart, then change its format with a tap or by typing “make it a pie”. Sales questions never share names or emails.' : 'Basic mode: good for counts, charts, sales and projections. Add the AI key for “why” questions and follow-ups.'}
      </p>

      {turns.length > 0 && (
        <div role="log" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, maxHeight: 640, overflowY: 'auto' }}>
          {turns.map((t, i) => (
            <div key={i} style={{ alignSelf: t.role === 'user' ? 'flex-end' : t.charts?.length ? 'stretch' : 'flex-start', maxWidth: t.charts?.length ? '100%' : '92%', padding: '10px 14px', borderRadius: 10, fontSize: 15, lineHeight: 1.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', background: t.role === 'user' ? '#ece9f4' : '#f6f5f5', color: '#1a1014' }}>
              {t.role === 'assistant' ? withBold(t.content) : t.content}
              {t.charts?.map((c, n) => <AnswerChart key={n} chart={c} onType={type => setChartType(i, n, type)} />)}
              {t.notice && <span style={{ display: 'block', marginTop: 6, fontSize: 13, color: '#595959' }}>{t.notice}</span>}
            </div>
          ))}
          {busy && <p style={{ fontSize: 14, color: '#595959' }}>Working it out…</p>}
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); ask(question) }} style={{ display: 'flex', gap: 8 }}>
        <input ref={input} value={question} onChange={e => setQuestion(e.target.value)} maxLength={500} placeholder="Type a question…" aria-label="Your question"
          style={{ flex: 1, minWidth: 0, padding: '11px 12px', fontFamily: 'inherit', fontSize: 16, border: '1px solid #8a8a8a', borderRadius: 4, background: '#fff', color: '#1a1014' }} />
        <button type="submit" disabled={busy || !question.trim()} style={{ flexShrink: 0, padding: '0 18px', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 4, background: '#1a1014', color: '#fff', cursor: busy ? 'wait' : 'pointer', opacity: busy || !question.trim() ? .6 : 1 }}>Ask</button>
      </form>
      {!turns.length && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {EXAMPLES.map(q => (
            <button key={q} type="button" onClick={() => ask(q)} style={{ padding: '6px 10px', fontFamily: 'inherit', fontSize: 13, borderRadius: 999, cursor: 'pointer', border: '1px solid #8a8a8a', background: '#fff', color: '#1a1014', whiteSpace: 'normal', textAlign: 'left' }}>{q}</button>
          ))}
        </div>
      )}
    </section>
  )
}
