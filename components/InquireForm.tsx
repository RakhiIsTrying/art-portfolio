'use client'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

type FormState = { name: string; email: string; piece: string; message: string }
type Errors    = Partial<Record<keyof FormState, string>>

function validate(f: FormState): Errors {
  const e: Errors = {}
  if (!f.name.trim())    e.name    = 'Name is required'
  if (!f.email.trim())   e.email   = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
                          e.email   = 'Enter a valid email'
  if (!f.message.trim()) e.message = 'Message is required'
  return e
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%', background: 'transparent',
  border: 'none', borderBottom: `1px solid ${hasError ? '#7a3040' : '#d0d0d0'}`,
  padding: '7px 0', fontSize: '13px', fontWeight: 300, color: '#1a1014',
  outline: 'none', fontFamily: 'inherit', resize: 'vertical' as const,
})

export default function InquireForm() {
  const params = useSearchParams()
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
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStatus('sending')
    const res = await fetch('/api/inquire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setStatus(res.ok ? 'sent' : 'error')
  }

  if (status === 'sent') {
    return (
      <div style={{ padding: '32px', border: '1px solid #d0d0d0', background: '#fff', textAlign: 'center' }}>
        <div style={{ width: 24, height: 1, background: '#7a3040', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 22, fontStyle: 'italic', fontWeight: 400, color: '#1a1014', marginBottom: 8 }}>
          Message sent.
        </p>
        <p style={{ fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0' }}>
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
          <label htmlFor={id} style={{ display: 'block', fontSize: '7px', letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014', marginBottom: 8 }}>
            {label}
          </label>
          <input
            id={id} name={id} type={type} value={form[field]}
            onChange={update(field)} required
            style={inputStyle(!!errors[field])}
            onFocus={e => !errors[field] && (e.target.style.borderBottomColor = '#7a3040')}
            onBlur={e => !errors[field] && (e.target.style.borderBottomColor = '#d0d0d0')}
          />
          {errors[field] && <p style={{ fontSize: '7px', letterSpacing: '.3em', textTransform: 'uppercase', color: '#7a3040', marginTop: 4 }}>{errors[field]}</p>}
        </div>
      ))}

      {form.piece && (
        <div>
          <label htmlFor="piece" style={{ display: 'block', fontSize: '7px', letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014', marginBottom: 8 }}>
            Piece you&apos;re interested in
          </label>
          <input id="piece" type="text" value={form.piece} onChange={update('piece')} style={inputStyle(false)} />
        </div>
      )}

      <div>
        <label htmlFor="message" style={{ display: 'block', fontSize: '7px', letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014', marginBottom: 8 }}>
          Message
        </label>
        <textarea id="message" rows={5} value={form.message} onChange={update('message')} required style={inputStyle(!!errors.message)} />
        {errors.message && <p style={{ fontSize: '7px', letterSpacing: '.3em', textTransform: 'uppercase', color: '#7a3040', marginTop: 4 }}>{errors.message}</p>}
      </div>

      {status === 'error' && (
        <p style={{ fontSize: '7px', letterSpacing: '.3em', textTransform: 'uppercase', color: '#7a3040' }}>
          Something went wrong — please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        style={{
          marginTop: 4, background: status === 'sending' ? '#d0d0d0' : '#1a1014',
          color: '#faf8f5', fontSize: '8px', letterSpacing: '.4em', textTransform: 'uppercase',
          fontWeight: 500, padding: '13px 24px', border: 'none',
          cursor: status === 'sending' ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          transition: 'background .2s', alignSelf: 'flex-start',
        }}
      >
        {status === 'sending' ? 'Sending…' : 'Send Message →'}
      </button>

    </form>
  )
}
