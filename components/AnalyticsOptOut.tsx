'use client'
import { useEffect, useState } from 'react'

const KEY = 'vgb-no-track'

/** Lets a visitor switch analytics off in this browser. */
export default function AnalyticsOptOut() {
  const [off, setOff] = useState<boolean | null>(null)
  useEffect(() => {
    let saved = false
    try { saved = !!localStorage.getItem(KEY) } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser storage can only be read after loading
    setOff(saved)
  }, [])

  function toggle() {
    try {
      if (off) localStorage.removeItem(KEY)
      else { localStorage.setItem(KEY, '1'); localStorage.removeItem('vgb-vid') }
      setOff(!off)
    } catch {}
  }

  if (off === null) return null
  return (
    <p style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 14px', fontSize: 14, fontWeight: 300, color: '#3a3a3a' }}>
      <span role="status">Analytics in this browser: <b style={{ fontWeight: 600 }}>{off ? 'off' : 'on'}</b></span>
      <button type="button" onClick={toggle} style={{ padding: '7px 14px', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', border: '1px solid #1a1014', background: '#fff', color: '#1a1014' }}>
        {off ? 'Turn analytics on' : 'Turn analytics off'}
      </button>
    </p>
  )
}
