// Sends anonymous events to /api/track: a random id, never a name or an IP address. Admin's own browser opts out.
const ID_CHARS = /^[a-z0-9-]{8,40}$/

const storedId = (store: Storage, key: string) => {
  let id = store.getItem(key)
  if (!id || !ID_CHARS.test(id)) { id = crypto.randomUUID(); store.setItem(key, id) }
  return id
}

export type EventName = 'pageview' | 'leave' | 'piece_selected' | 'tier_selected' | 'order_request' | 'club_signup' | 'inquiry' | 'puzzle_opened' | 'puzzle_solved' | 'outbound'

export function track(name: EventName, extra: { label?: string; seconds?: number; path?: string; referrer?: string; utm?: Record<string, string> } = {}) {
  try {
    if (localStorage.getItem('vgb-no-track')) return
    const body = JSON.stringify({
      name, path: extra.path ?? location.pathname, label: extra.label, seconds: extra.seconds, referrer: extra.referrer, utm: extra.utm,
      visitor: storedId(localStorage, 'vgb-vid'), session: storedId(sessionStorage, 'vgb-sid'),
    })
    if (!navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }))) {
      fetch('/api/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
    }
  } catch { /* Analytics must never get in a visitor's way */ }
}
