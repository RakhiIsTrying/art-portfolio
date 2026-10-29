'use client'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { PRINT_SIZES, formatPrice, type Currency } from '@/lib/prints'

type FormState = { name: string; email: string; piece: string; message: string }
type Errors    = Partial<Record<keyof FormState, string>>

function validate(f: FormState, hasOrder: boolean): Errors {
  const e: Errors = {}
  if (!f.name.trim())    e.name    = 'Name is required'
  if (!f.email.trim())   e.email   = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
                          e.email   = 'Enter a valid email'
  if (!f.message.trim() && !hasOrder) e.message = 'Message is required'
  return e
}

const stepBtn: React.CSSProperties = { width: 30, height: 30, border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#1a1014', fontFamily: 'inherit' }

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%', background: 'transparent',
  border: 'none', borderBottom: `1px solid ${hasError ? '#7a3040' : '#d0d0d0'}`,
  padding: '7px 0', fontSize: 13, fontWeight: 300, color: '#1a1014',
  outline: 'none', fontFamily: 'inherit', resize: 'vertical' as const,
})

export default function InquireForm({ currency: initialCurrency }: { currency: Currency }) {
  const params = useSearchParams()
  const isPrint = (params.get('piece') ?? '').startsWith('Print')
  const [currency, setCurrency] = useState<Currency>(initialCurrency)
  const [qty, setQty] = useState<Record<string, number>>({})
  const lines = PRINT_SIZES.filter(s => (qty[s.id] ?? 0) > 0).map(s => ({ ...s, n: qty[s.id] }))
  const total = lines.reduce((sum, l) => sum + l.n * l[currency], 0)
  const underMin = lines.filter(l => l.min && l.n < l.min)
  const step = (id: string, d: number) => setQty(q => ({ ...q, [id]: Math.max(0, Math.min(99, (q[id] ?? 0) + d)) }))
  const [form, setForm]     = useState<FormState>({ name: '', email: '', message: '', piece: params.get('piece') ?? '' })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  function update(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(f => ({ ...f, [field]: e.target.value }))
      if (errors[field]) setErrors(er => ({ ...er, [field]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form, lines.length > 0)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStatus('sending')
    const res = await fetch('/api/inquire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      ...form,
      order: lines.length ? {
        lines: lines.map(l => `${l.n} × ${l.name} (${l.dims}) @ ${formatPrice(l[currency], currency)} = ${formatPrice(l.n * l[currency], currency)}`),
        total: formatPrice(total, currency),
        shipping: underMin.length ? `Shipping to be added (under minimum: ${underMin.map(l => `${l.name} needs ${l.min}`).join(', ')})` : 'Free shipping',
      } : undefined,
    }) })
    setStatus(res.ok ? 'sent' : 'error')
  }

  if (status === 'sent') {
    return (
      <div style={{ padding: '32px', border: '1px solid #d0d0d0', background: '#fff', textAlign: 'center' }}>
        <div style={{ width: 24, height: 1, background: '#7a3040', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 22, fontStyle: 'italic', fontWeight: 400, color: '#1a1014', marginBottom: 8 }}>
          Message sent.
        </p>
        <p style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0' }}>
          Thank you — I&apos;ll get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 24, background: '#fff', border: '1px solid #d0d0d0', padding: '28px 24px' }}>

      {[
        { id: 'name',    label: 'Name',    type: 'text',  field: 'name'    as const },
        { id: 'email',   label: 'Email',   type: 'email', field: 'email'   as const },
      ].map(({ id, label, type, field }) => (
        <div key={id}>
          <label htmlFor={id} style={{ display: 'block', fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014', marginBottom: 8 }}>
            {label}
          </label>
          <input
            id={id} name={id} type={type} value={form[field]}
            onChange={update(field)} required
            style={inputStyle(!!errors[field])}
            onFocus={e => !errors[field] && (e.target.style.borderBottomColor = '#7a3040')}
            onBlur={e => !errors[field] && (e.target.style.borderBottomColor = '#d0d0d0')}
          />
          {errors[field] && <p style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#7a3040', marginTop: 4 }}>{errors[field]}</p>}
        </div>
      ))}

      {form.piece && (
        <div>
          <label htmlFor="piece" style={{ display: 'block', fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014', marginBottom: 8 }}>
            Piece you&apos;re interested in
          </label>
          <input id="piece" type="text" value={form.piece} onChange={update('piece')} style={inputStyle(false)} />
        </div>
      )}

      {isPrint && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014' }}>Sizes</p>
            <button type="button" onClick={() => setCurrency(c => (c === 'inr' ? 'usd' : 'inr'))}
                    style={{ fontSize: 10, letterSpacing: '.2em', background: 'none', border: 'none', color: '#1e3a8a', cursor: 'pointer', fontFamily: 'inherit' }}>
              Show in {currency === 'inr' ? 'USD $' : 'INR ₹'}
            </button>
          </div>
          <div style={{ border: '1px solid #ebebeb' }}>
            {PRINT_SIZES.map((s, i) => {
              const n = qty[s.id] ?? 0
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderTop: i ? '1px solid #ebebeb' : 'none', background: n ? '#faf6f6' : '#fff' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: '#1a1014' }}>{s.name} <span style={{ fontWeight: 300, color: '#787878' }}>· {s.dims}</span></p>
                    <p style={{ fontSize: 11, fontWeight: 300, color: '#787878' }}>
                      {formatPrice(s[currency], currency)} each{s.min ? ` · free shipping on ${s.min}+` : ' · free shipping'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d0d0d0' }}>
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
      )}

      <div>
        <label htmlFor="message" style={{ display: 'block', fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014', marginBottom: 8 }}>
          Message{isPrint && <span style={{ fontWeight: 300, color: '#a0a0a0', letterSpacing: '.2em' }}> (optional)</span>}
        </label>
        <textarea id="message" rows={5} value={form.message} onChange={update('message')} required style={inputStyle(!!errors.message)} />
        {errors.message && <p style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#7a3040', marginTop: 4 }}>{errors.message}</p>}
      </div>

      {status === 'error' && (
        <p style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#7a3040' }}>
          Something went wrong — please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        style={{
          marginTop: 4, background: status === 'sending' ? '#d0d0d0' : '#1a1014',
          color: '#faf8f5', fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase',
          fontWeight: 500, padding: '13px 24px', border: 'none',
          cursor: status === 'sending' ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          transition: 'background .2s', alignSelf: 'flex-start',
        }}
      >
        {status === 'sending' ? 'Sending…' : lines.length ? 'Send order request →' : 'Send Message →'}
      </button>

    </form>
  )
}
