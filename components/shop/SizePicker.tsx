'use client'
import { formatPrice, type Currency, type PrintSize } from '@/lib/prints'
import { useShopSettings } from './ShopSettings'

export type Quantities = Record<string, number>

/** Selected sizes with their quantities, total and which ones are under the free-shipping minimum. */
export function summarise(sizes: PrintSize[], qty: Quantities, currency: Currency) {
  const lines = sizes.filter(s => (qty[s.id] ?? 0) > 0).map(s => ({ ...s, n: qty[s.id] }))
  const total = lines.reduce((sum, l) => sum + l.n * l[currency], 0)
  const underMin = lines.filter(l => l.min && l.n < l.min)
  return { lines, total, underMin }
}

/** The order payload the inquiry email understands. */
export function orderPayload(sizes: PrintSize[], qty: Quantities, currency: Currency, greeting?: string) {
  const { lines, total, underMin } = summarise(sizes, qty, currency)
  if (!lines.length) return undefined
  return {
    lines: lines.map(l => `${l.n} × ${l.name} (${l.dims}) @ ${formatPrice(l[currency], currency)} = ${formatPrice(l.n * l[currency], currency)}`),
    total: formatPrice(total, currency),
    shipping: underMin.length ? `Shipping to be added (under minimum: ${underMin.map(l => `${l.name} needs ${l.min}`).join(', ')})` : 'Free shipping',
    greeting,
  }
}

const stepBtn: React.CSSProperties = { width: 30, height: 30, border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#1a1014', fontFamily: 'inherit' }

type Props = {
  qty: Quantities
  onChange: (q: Quantities) => void
  currency: Currency
  onCurrency: (c: Currency) => void
}

export default function SizePicker({ qty, onChange, currency, onCurrency }: Props) {
  const { sizes } = useShopSettings()
  const { lines, total, underMin } = summarise(sizes, qty, currency)
  const step = (id: string, d: number) => onChange({ ...qty, [id]: Math.max(0, Math.min(99, (qty[id] ?? 0) + d)) })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014' }}>Sizes</p>
        <button type="button" onClick={() => onCurrency(currency === 'inr' ? 'usd' : 'inr')}
                style={{ fontSize: 10, letterSpacing: '.2em', background: 'none', border: 'none', color: '#1e3a8a', cursor: 'pointer', fontFamily: 'inherit' }}>
          Show in {currency === 'inr' ? 'USD $' : 'INR ₹'}
        </button>
      </div>
      <div style={{ border: '1px solid #ebebeb' }}>
        {sizes.map((s, i) => {
          const n = qty[s.id] ?? 0
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderTop: i ? '1px solid #ebebeb' : 'none', background: n ? '#faf6f6' : '#fff' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: '#1a1014' }}>{s.name} <span style={{ fontWeight: 300, color: '#787878' }}>· {s.dims}</span></p>
                <p style={{ fontSize: 11, fontWeight: 300, color: '#787878' }}>
                  {formatPrice(s[currency], currency)} each{s.min ? ` · free shipping on ${s.min}+` : ' · free shipping'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d0d0d0', flexShrink: 0 }}>
                <button type="button" aria-label={`Fewer ${s.name}`} onClick={() => step(s.id, -1)} style={stepBtn}>−</button>
                <span style={{ width: 28, textAlign: 'center', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{n}</span>
                <button type="button" aria-label={`More ${s.name}`} onClick={() => step(s.id, 1)} style={stepBtn}>+</button>
              </div>
            </div>
          )
        })}
      </div>
      {lines.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <p style={{ fontSize: 11, fontWeight: 300, color: underMin.length ? '#7a3040' : '#1a6060' }}>
            {underMin.length
              ? `Shipping added — ${underMin.map(l => `${l.name} ships free from ${l.min}`).join(', ')}`
              : 'Free shipping ✓'}
          </p>
          <p style={{ fontSize: 13, color: '#1a1014' }}>
            Total <b style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 22 }}>{formatPrice(total, currency)}</b>
            {underMin.length > 0 && <span style={{ fontSize: 11, fontWeight: 300, color: '#787878' }}> + shipping</span>}
          </p>
        </div>
      )}
    </div>
  )
}
