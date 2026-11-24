'use client'
import { useState, useSyncExternalStore } from 'react'
import { appPlugin, inApp } from '@/lib/nativeApp'
import { BEE_BEN, INK } from './shared'

const KEY = 'vgb-puzzle-reminder'   // the chosen time, e.g. "09:00"; missing when off
const ID = 1
const TIMES = ['07:00', '08:00', '09:00', '12:00', '18:00', '21:00']
const readSaved = () => { try { return localStorage.getItem(KEY) ?? '' } catch { return '' } }   // private mode: off
const noChanges = () => () => {}
const pretty = (t: string) => new Date(`2000-01-01T${t}:00`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

/** In the iPhone app only: a daily nudge when the new puzzles are ready. */
export default function PuzzleReminder() {
  // Read once in the browser; the server always renders nothing
  const shown = useSyncExternalStore(noChanges, inApp, () => false)
  const saved = useSyncExternalStore(noChanges, readSaved, () => '')
  const [picked, setPicked] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const time = picked ?? saved
  if (!shown) return null

  const choose = async (next: string) => {
    const notes = appPlugin('LocalNotifications')
    if (!notes) return
    setNote('')
    await notes.cancel({ notifications: [{ id: ID }] }).catch(() => {})
    if (next) {
      const { display } = await notes.requestPermissions()
      if (display !== 'granted') {
        setNote('Notifications are switched off for this app. You can turn them on in Settings → Van Gone Broke → Notifications.')
        return
      }
      const [hour, minute] = next.split(':').map(Number)
      await notes.schedule({ notifications: [{
        id: ID,
        title: 'Fresh puzzles, fetched 🦴',
        body: 'Bee, Ben & Dug-Dug have today’s six puzzles ready for you.',
        schedule: { on: { hour, minute }, allowWhileIdle: true },
        extra: { url: '/puzzles' },
      }] })
    }
    try { if (next) localStorage.setItem(KEY, next); else localStorage.removeItem(KEY) } catch { /* fine */ }
    setPicked(next)
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '8px 12px', margin: '-6px 0 20px', fontSize: 13, color: INK }}>
      <label htmlFor="vgb-reminder" style={{ whiteSpace: 'normal', textAlign: 'center' }}>
        🔔 {time ? `Dug-Dug will fetch you daily at ${pretty(time)}` : 'Want Dug-Dug to fetch you when new puzzles land?'}
      </label>
      <select id="vgb-reminder" value={time} onChange={e => choose(e.target.value)}
        style={{ fontFamily: 'inherit', fontSize: 13, padding: '8px 10px', border: `1px solid ${BEE_BEN}`, background: '#fff', color: INK }}>
        <option value="">{time ? 'Stop reminders' : 'No thanks'}</option>
        {TIMES.map(t => <option key={t} value={t}>Every day at {pretty(t)}</option>)}
      </select>
      {note && <p role="status" style={{ flexBasis: '100%', textAlign: 'center', fontSize: 12, color: '#787878' }}>{note}</p>}
    </div>
  )
}
