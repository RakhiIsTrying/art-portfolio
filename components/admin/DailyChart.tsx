'use client'
import { useState } from 'react'

type Day = { day: string; views: number; visitors: number }

const label = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })

/** Visitors per day, with the exact numbers on hover or tap. */
export default function DailyChart({ days }: { days: Day[] }) {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(1, ...days.map(d => d.visitors))
  const shown = active === null ? null : days[active]
  return (
    <div>
      <p aria-live="polite" style={{ minHeight: 20, marginBottom: 8, fontSize: 13, color: '#3a3a3a' }}>
        {shown ? <><b>{label(shown.day)}</b>: {shown.visitors} {shown.visitors === 1 ? 'visitor' : 'visitors'}, {shown.views} page {shown.views === 1 ? 'view' : 'views'}</> : 'Hover or tap a day for its numbers'}
      </p>
      <div role="img" aria-label="Visitors per day" onMouseLeave={() => setActive(null)} style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 170, borderBottom: '1px solid #d0d0d0' }}>
        {days.map((d, i) => (
          <button key={d.day} type="button" onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)} aria-label={`${label(d.day)}: ${d.visitors} visitors, ${d.views} views`}
            style={{ flex: 1, minWidth: 0, height: '100%', padding: 0, border: 'none', background: active === i ? '#f3f0fa' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'flex-end' }}>
            <span style={{ display: 'block', width: '100%', height: `${(d.visitors / max) * 100}%`, minHeight: d.visitors ? 3 : 0, background: '#4a3a7a', borderRadius: '4px 4px 0 0' }} />
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 13, color: '#595959' }}>
        <span>{days.length ? label(days[0].day) : ''}</span>
        <span>Peak: {max === 1 && !days.some(d => d.visitors) ? 0 : max} a day</span>
        <span>{days.length ? label(days[days.length - 1].day) : ''}</span>
      </div>
    </div>
  )
}
