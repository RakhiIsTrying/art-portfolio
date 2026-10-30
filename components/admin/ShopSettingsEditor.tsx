'use client'
import { useState, useTransition } from 'react'
import { saveShopSettings, type ShopSettingsInput } from '@/app/admin/(shell)/shop/actions'

const panel: React.CSSProperties = { border: '1px solid #d0d0d0', background: '#fff', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }
const h2: React.CSSProperties = { fontSize: 11, fontWeight: 500, letterSpacing: '.35em', textTransform: 'uppercase', color: '#1a1014' }
const input: React.CSSProperties = { border: '1px solid #e0dcdc', padding: '6px 8px', fontSize: 13, fontFamily: 'inherit', background: '#fff', color: '#1a1014', width: '100%' }
const th: React.CSSProperties = { fontSize: 9, letterSpacing: '.25em', textTransform: 'uppercase', color: '#787878', fontWeight: 500, textAlign: 'left', padding: '0 6px 6px' }
const btn = (dark?: boolean): React.CSSProperties => ({ padding: '8px 14px', fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer', border: '1px solid #1a1014', background: dark ? '#1a1014' : '#fff', color: dark ? '#fff' : '#1a1014' })

export default function ShopSettingsEditor({ initial }: { initial: ShopSettingsInput }) {
  const [sizes, setSizes] = useState(initial.printSizes)
  const [greetings, setGreetings] = useState(initial.greetings.join('\n'))
  const [plans, setPlans] = useState(initial.plans)
  const [intro, setIntro] = useState(initial.shopIntro)
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()

  const setSize = (i: number, patch: Record<string, unknown>) => setSizes(s => s.map((x, j) => (j === i ? { ...x, ...patch } : x)))

  function save() {
    start(async () => {
      try {
        await saveShopSettings({ printSizes: sizes, greetings: greetings.split('\n'), plans, shopIntro: intro })
        setNote({ ok: true, text: 'Saved — the shop is updated ✓' })
      } catch (e) { setNote({ ok: false, text: e instanceof Error ? e.message : 'Could not save' }) }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={panel}>
        <h2 style={h2}>Print sizes &amp; prices</h2>
        <p style={{ fontSize: 12, fontWeight: 300, color: '#787878' }}>Size in inches (portrait). “Free shipping from” is the quantity that ships free — leave empty if it always ships free.</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead><tr>
              <th style={th}>Name</th><th style={th}>Width</th><th style={th}>Height</th><th style={th}>₹ India</th><th style={th}>$ Intl</th><th style={th}>Free shipping from</th><th style={th}>Card</th><th style={th} />
            </tr></thead>
            <tbody>
              {sizes.map((s, i) => (
                <tr key={i}>
                  <td style={{ padding: 4 }}><input style={input} value={s.name} onChange={e => setSize(i, { name: e.target.value })} /></td>
                  <td style={{ padding: 4, width: 80 }}><input style={input} inputMode="decimal" value={s.w} onChange={e => setSize(i, { w: e.target.value })} /></td>
                  <td style={{ padding: 4, width: 80 }}><input style={input} inputMode="decimal" value={s.h} onChange={e => setSize(i, { h: e.target.value })} /></td>
                  <td style={{ padding: 4, width: 90 }}><input style={input} inputMode="numeric" value={s.inr} onChange={e => setSize(i, { inr: e.target.value })} /></td>
                  <td style={{ padding: 4, width: 80 }}><input style={input} inputMode="numeric" value={s.usd} onChange={e => setSize(i, { usd: e.target.value })} /></td>
                  <td style={{ padding: 4, width: 110 }}><input style={input} inputMode="numeric" placeholder="—" value={s.min ?? ''} onChange={e => setSize(i, { min: e.target.value ? Number(e.target.value.replace(/\D/g, '')) : undefined })} /></td>
                  <td style={{ padding: 4, width: 50, textAlign: 'center' }}><input type="checkbox" aria-label="Greeting card" checked={!!s.card} onChange={e => setSize(i, { card: e.target.checked })} /></td>
                  <td style={{ padding: 4, width: 40 }}><button type="button" aria-label={`Remove ${s.name}`} onClick={() => setSizes(x => x.filter((_, j) => j !== i))} style={{ ...btn(), padding: '5px 9px' }}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div><button type="button" style={btn()} onClick={() => setSizes(s => [...s, { id: '', name: 'New size', dims: '', w: 4, h: 6, inr: 0, usd: 0 }])}>+ Add size</button></div>
      </div>

      <div style={panel}>
        <h2 style={h2}>Greeting-card messages</h2>
        <p style={{ fontSize: 12, fontWeight: 300, color: '#787878' }}>One per line. Shown as examples for “Surprise me” cards.</p>
        <textarea rows={5} style={{ ...input, resize: 'vertical' }} value={greetings} onChange={e => setGreetings(e.target.value)} />
      </div>

      <div style={panel}>
        <h2 style={h2}>Print Club monthly price</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {(['india', 'international'] as const).map(id => (
            <label key={id} style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#787878' }}>
              {plans[id].region}
              <input style={{ ...input, width: 140 }} value={plans[id].price} onChange={e => setPlans(p => ({ ...p, [id]: { ...p[id], price: e.target.value } }))} />
            </label>
          ))}
        </div>
      </div>

      <div style={panel}>
        <h2 style={h2}>Shop intro</h2>
        <textarea rows={3} maxLength={400} style={{ ...input, resize: 'vertical' }} value={intro} onChange={e => setIntro(e.target.value)} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', bottom: 0, background: '#e6e6e6', padding: '10px 0' }}>
        <button type="button" onClick={save} disabled={pending} style={{ ...btn(true), opacity: pending ? .5 : 1 }}>{pending ? 'Saving…' : 'Save shop settings'}</button>
        {note && <span role="status" style={{ fontSize: 12, color: note.ok ? '#1a6060' : '#7a3040' }}>{note.text}</span>}
      </div>
    </div>
  )
}
