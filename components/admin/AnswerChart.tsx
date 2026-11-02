'use client'
import { useState } from 'react'
import { CHART_NAMES, CHART_TYPES, chartCsv, type ChartRow, type ChartSpec, type ChartType } from '@/lib/analytics/chart'

const INK = '#1a1014'
const MUTED = '#787878'
const ACCENT = '#4a3a7a'
const TRACK = '#f1eeee'
// A checked colour-blind-safe order. An eighth slice and beyond fold into "Other", rather than inventing more colours.
const SLICE_COLOURS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6']
const OTHER_COLOUR = '#a8a29e'
const MAX_SLICES = 7
const MAX_BARS = 20
const MAX_COLUMN_LABELS = 12

const num = (n: number) => n.toLocaleString('en-IN')
const share = (value: number, total: number) => (total ? Math.round((value / total) * 100) : 0)
const prettyKey = (key: string) => (key === '/' ? 'Home page' : /^\d{4}-\d{2}-\d{2}$/.test(key) ? new Date(`${key}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }) : key)

function NoData() {
  return <p style={{ fontSize: 13, color: MUTED }}>Nothing to show for this yet.</p>
}

function Bars({ rows, more }: { rows: ChartRow[]; more: number }) {
  const max = Math.max(1, ...rows.map(r => r.value)), total = rows.reduce((t, r) => t + r.value, 0)
  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.slice(0, MAX_BARS).map(r => (
        <li key={r.key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, marginBottom: 2 }}>
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={prettyKey(r.key)}>{prettyKey(r.key)}</span>
            <span style={{ flexShrink: 0 }}>{num(r.value)} <span style={{ color: MUTED }}>({share(r.value, total)}%)</span></span>
          </div>
          <div style={{ height: 8, background: TRACK, borderRadius: 4 }}><div style={{ width: `${(r.value / max) * 100}%`, minWidth: r.value ? 4 : 0, height: '100%', background: ACCENT, borderRadius: 4 }} /></div>
        </li>
      ))}
      {rows.length + more > MAX_BARS && <li style={{ fontSize: 11, color: MUTED }}>Showing the top {MAX_BARS}. Switch to Table for more.</li>}
    </ul>
  )
}

/** The exact figures for whichever point is being touched, for columns and lines. */
function Readout({ row, label, fallback }: { row: ChartRow | null; label: string; fallback: string }) {
  return (
    <p aria-live="polite" style={{ minHeight: 18, marginBottom: 6, fontSize: 12 }}>
      {row ? <><b style={{ fontWeight: 600 }}>{prettyKey(row.key)}</b>: {num(row.value)} {label.toLowerCase()}{row.projected ? ' (projected)' : ''}</> : <span style={{ color: MUTED }}>{fallback}</span>}
    </p>
  )
}

function AxisEnds({ rows, max }: { rows: ChartRow[]; max: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 4, fontSize: 11, color: MUTED }}>
      <span>{prettyKey(rows[0].key)}</span><span>Highest: {num(max)}</span><span>{prettyKey(rows[rows.length - 1].key)}</span>
    </div>
  )
}

function Columns({ rows, label }: { rows: ChartRow[]; label: string }) {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(1, ...rows.map(r => r.value))
  return (
    <div>
      <Readout row={active === null ? null : rows[active]} label={label} fallback="Hover or tap a column for its number" />
      <div onMouseLeave={() => setActive(null)} style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 170, borderBottom: '1px solid #d0d0d0' }}>
        {rows.map((r, i) => (
          <button key={r.key} type="button" onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)} aria-label={`${prettyKey(r.key)}: ${num(r.value)}`}
            style={{ flex: 1, minWidth: 0, height: '100%', padding: 0, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'flex-end', background: active === i ? '#f3f0fa' : 'transparent' }}>
            <span style={{ display: 'block', width: '100%', height: `${(r.value / max) * 100}%`, minHeight: r.value ? 3 : 0, borderRadius: '4px 4px 0 0', background: r.projected ? `repeating-linear-gradient(135deg, ${ACCENT} 0 3px, #cfc8e3 3px 6px)` : ACCENT }} />
          </button>
        ))}
      </div>
      {rows.length <= MAX_COLUMN_LABELS ? (
        <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
          {rows.map(r => <span key={r.key} title={prettyKey(r.key)} style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10, textAlign: 'center', color: MUTED }}>{prettyKey(r.key)}</span>)}
        </div>
      ) : <AxisEnds rows={rows} max={max} />}
    </div>
  )
}

function Line({ rows, label }: { rows: ChartRow[]; label: string }) {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(1, ...rows.map(r => r.value))
  const x = (i: number) => (rows.length === 1 ? 50 : (i / (rows.length - 1)) * 100)
  const y = (v: number) => 100 - (v / max) * 96 - 2
  const points = (list: { r: ChartRow; i: number }[]) => list.map(({ r, i }) => `${x(i)},${y(r.value)}`).join(' ')
  const all = rows.map((r, i) => ({ r, i }))
  const firstAhead = all.findIndex(p => p.r.projected)
  const known = firstAhead === -1 ? all : all.slice(0, firstAhead)
  const ahead = firstAhead === -1 ? [] : all.slice(Math.max(0, firstAhead - 1))
  const stroke = { vectorEffect: 'non-scaling-stroke' as const, fill: 'none', stroke: ACCENT, strokeWidth: 2, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
  return (
    <div>
      <Readout row={active === null ? null : rows[active]} label={label} fallback="Hover or tap the line for its numbers" />
      <div onMouseLeave={() => setActive(null)} style={{ position: 'relative', height: 170, borderBottom: '1px solid #d0d0d0' }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          {[25, 50, 75].map(g => <line key={g} x1="0" x2="100" y1={g} y2={g} stroke="#f1eeee" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
          {active !== null && <line x1={x(active)} x2={x(active)} y1="0" y2="100" stroke="#b9b4c9" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
          <polyline points={points(known)} {...stroke} />
          {ahead.length > 1 && <polyline points={points(ahead)} {...stroke} strokeDasharray="5 5" />}
        </svg>
        {active !== null && <span aria-hidden style={{ position: 'absolute', left: `${x(active)}%`, top: `${y(rows[active].value)}%`, width: 10, height: 10, marginLeft: -5, marginTop: -5, borderRadius: '50%', background: ACCENT, border: '2px solid #fff', pointerEvents: 'none' }} />}
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          {rows.map((r, i) => <button key={r.key} type="button" onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)} aria-label={`${prettyKey(r.key)}: ${num(r.value)}`} style={{ flex: 1, minWidth: 0, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} />)}
        </div>
      </div>
      <AxisEnds rows={rows} max={max} />
      {firstAhead !== -1 && <p style={{ marginTop: 4, fontSize: 11, color: MUTED }}>Solid line: actual. Dashed line: projected.</p>}
    </div>
  )
}

function Pie({ rows }: { rows: ChartRow[] }) {
  const sorted = [...rows].sort((a, b) => b.value - a.value).filter(r => r.value > 0)
  const top = sorted.slice(0, MAX_SLICES), rest = sorted.slice(MAX_SLICES)
  const slices = [...top.map((r, i) => ({ ...r, colour: SLICE_COLOURS[i] })), ...(rest.length ? [{ key: `Other (${rest.length})`, value: rest.reduce((t, r) => t + r.value, 0), colour: OTHER_COLOUR }] : [])]
  const total = slices.reduce((t, s) => t + s.value, 0)
  if (!total) return <NoData />
  const length = 2 * Math.PI * 40
  let start = 0
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '12px 24px' }}>
      <svg viewBox="0 0 100 100" role="img" aria-label={slices.map(s => `${s.key} ${share(s.value, total)}%`).join(', ')} style={{ width: 170, height: 170, flexShrink: 0, transform: 'rotate(-90deg)' }}>
        {slices.map(s => {
          const part = (s.value / total) * length, offset = start
          start += part
          return (
            <circle key={s.key} cx="50" cy="50" r="40" fill="none" stroke={s.colour} strokeWidth="18" strokeDasharray={`${Math.max(part - (slices.length > 1 ? 0.8 : 0), 0.1)} ${length}`} strokeDashoffset={-offset}>
              <title>{`${s.key}: ${num(s.value)} (${share(s.value, total)}%)`}</title>
            </circle>
          )
        })}
      </svg>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0, fontSize: 12 }}>
        {slices.map(s => (
          <li key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span aria-hidden style={{ width: 10, height: 10, flexShrink: 0, borderRadius: 2, background: s.colour }} />
            <span style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{prettyKey(s.key)}</span>
            <b style={{ marginLeft: 'auto', paddingLeft: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>{share(s.value, total)}%</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Table({ chart }: { chart: ChartSpec }) {
  const total = chart.rows.reduce((t, r) => t + r.value, 0)
  return (
    <div style={{ maxHeight: 280, overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead><tr style={{ textAlign: 'left', color: MUTED }}><th style={{ fontWeight: 500, paddingBottom: 4 }}>{chart.overTime ? 'When' : 'Name'}</th><th style={{ fontWeight: 500, textAlign: 'right' }}>{chart.valueLabel}</th><th style={{ fontWeight: 500, textAlign: 'right' }}>Share</th></tr></thead>
        <tbody>{chart.rows.map(r => (
          <tr key={r.key} style={{ borderTop: '1px solid #f1eeee' }}>
            <td style={{ padding: '4px 8px 4px 0', overflowWrap: 'anywhere' }}>{prettyKey(r.key)}{r.projected ? ' (projected)' : ''}</td><td style={{ textAlign: 'right' }}>{num(r.value)}</td><td style={{ textAlign: 'right', color: MUTED }}>{share(r.value, total)}%</td>
          </tr>
        ))}</tbody>
      </table>
      {!!chart.more && <p style={{ marginTop: 6, fontSize: 11, color: MUTED }}>{chart.more} more not shown.</p>}
    </div>
  )
}

/** One chart in an answer, with buttons to see the same numbers in another form. */
export default function AnswerChart({ chart, onType }: { chart: ChartSpec; onType: (type: ChartType) => void }) {
  const empty = !chart.rows.length
  function download() {
    const url = URL.createObjectURL(new Blob([`﻿${chartCsv(chart)}`], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${chart.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <figure style={{ marginTop: 10, padding: 12, border: '1px solid #e6e2e2', borderRadius: 8, background: '#fff', color: INK, whiteSpace: 'normal' }}>
      <figcaption style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{chart.title}</figcaption>
      {chart.type === 'number' ? (
        <p><span style={{ display: 'block', fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 44, fontWeight: 700, lineHeight: 1.1 }}>{num(chart.total)}</span><span style={{ fontSize: 12, color: MUTED }}>{chart.valueLabel}</span></p>
      ) : empty ? <NoData />
        : chart.type === 'bars' ? <Bars rows={chart.rows} more={chart.more ?? 0} />
        : chart.type === 'columns' ? <Columns rows={chart.rows} label={chart.valueLabel} />
        : chart.type === 'line' ? <Line rows={chart.rows} label={chart.valueLabel} />
        : chart.type === 'pie' ? <Pie rows={chart.rows} />
        : <Table chart={chart} />}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginTop: 10 }}>
        {CHART_TYPES.map(type => (
          <button key={type} type="button" aria-pressed={chart.type === type} onClick={() => onType(type)}
            style={{ padding: '4px 9px', fontFamily: 'inherit', fontSize: 11, cursor: 'pointer', borderRadius: 999, border: `1px solid ${chart.type === type ? ACCENT : '#d0d0d0'}`, background: chart.type === type ? ACCENT : '#fff', color: chart.type === type ? '#fff' : INK }}>
            {CHART_NAMES[type]}
          </button>
        ))}
        <button type="button" onClick={download} style={{ marginLeft: 'auto', padding: '4px 9px', fontFamily: 'inherit', fontSize: 11, cursor: 'pointer', borderRadius: 999, border: '1px solid #d0d0d0', background: '#fff', color: INK }}>Download CSV</button>
      </div>
    </figure>
  )
}
