'use client'
import { useState } from 'react'

type FormState = { name: string; email: string; country: string; note: string }
type Errors    = Partial<Record<keyof FormState, string>>

function validate(f: FormState): Errors {
  const e: Errors = {}
  if (!f.name.trim())    e.name    = 'Name is required'
  if (!f.email.trim())   e.email   = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
                          e.email   = 'Enter a valid email'
  if (!f.country.trim()) e.country = 'Country is required'
  return e
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014', marginBottom: 8,
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%', background: 'transparent',
  border: 'none', borderBottom: `1px solid ${hasError ? '#7a3040' : '#d0d0d0'}`,
  padding: '7px 0', fontSize: 13, fontWeight: 300, color: '#1a1014',
  outline: 'none', fontFamily: 'inherit', resize: 'vertical' as const,
})

const FIELDS = [
  { id: 'name',    label: 'Name',    type: 'text',  autoComplete: 'name' },
  { id: 'email',   label: 'Email',   type: 'email', autoComplete: 'email' },
  { id: 'country', label: 'Country', type: 'text',  autoComplete: 'country-name' },
] as const

export default function PrintClubForm() {
  const [form, setForm]     = useState<FormState>({ name: '', email: '', country: '', note: '' })
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
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStatus('sending')
    const res = await fetch('/api/print-club', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (!res.ok) { setStatus('error'); return }
    const { checkoutUrl } = await res.json()
    // Once a payment link is configured, members go straight to checkout
    if (checkoutUrl) {
      const url = new URL(checkoutUrl)
      url.searchParams.set('prefilled_email', form.email.trim())
      window.location.href = url.toString()
      return
    }
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div style={{ padding: '36px 28px', border: '1px solid #d0d0d0', background: '#fff', textAlign: 'center' }}>
        <div style={{ width: 24, height: 1, background: '#7a3040', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 24, fontStyle: 'italic', fontWeight: 400, color: '#1a1014', marginBottom: 10 }}>
          You&apos;re on the list.
        </p>
        <p style={{ fontSize: 12, lineHeight: 1.7, fontWeight: 300, color: '#787878' }}>
          Welcome to the club, {form.name.trim().split(' ')[0]}. I&apos;ll email you to set up your membership.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {FIELDS.map(({ id, label, type, autoComplete }) => (
        <div key={id}>
          <label htmlFor={`pc-${id}`} style={labelStyle}>{label}</label>
          <input
            id={`pc-${id}`} name={id} type={type} autoComplete={autoComplete}
            value={form[id]} onChange={update(id)} style={inputStyle(!!errors[id])}
          />
          {errors[id] && <p style={{ fontSize: 10, letterSpacing: '.2em', color: '#7a3040', marginTop: 6 }}>{errors[id]}</p>}
        </div>
      ))}

      <div>
        <label htmlFor="pc-note" style={labelStyle}>
          Anything you&apos;d love to see? <span style={{ fontWeight: 300, color: '#a0a0a0', letterSpacing: '.2em' }}>(optional)</span>
        </label>
        <textarea id="pc-note" name="note" rows={2} value={form.note} onChange={update('note')} style={inputStyle(false)} />
      </div>

      {status === 'error' && (
        <p style={{ fontSize: 11, letterSpacing: '.15em', color: '#7a3040' }}>
          Something went wrong — please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="hover:[background:#7a3040]"
        style={{
          alignSelf: 'stretch', marginTop: 4, padding: '15px 22px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 11, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 500,
          background: '#1a1014', color: '#fff', transition: 'background .25s', opacity: status === 'sending' ? .6 : 1,
        }}
      >
        {status === 'sending' ? 'Joining…' : 'Join for $10 / month →'}
      </button>
    </form>
  )
}
