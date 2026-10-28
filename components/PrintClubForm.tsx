'use client'
import { useState } from 'react'
import { PLANS, planForCountry, type PlanId } from '@/lib/printClub'

type FormState = {
  name: string; email: string; phone: string; birthday: string
  address_line1: string; address_line2: string; city: string; region: string; postal_code: string; country: string
}
type Field  = keyof FormState
type Errors = Partial<Record<Field, string>>

const EMPTY: FormState = {
  name: '', email: '', phone: '', birthday: '',
  address_line1: '', address_line2: '', city: '', region: '', postal_code: '', country: '',
}

function validate(f: FormState): Errors {
  const e: Errors = {}
  if (!f.name.trim())  e.name  = 'Name is required'
  if (!f.email.trim()) e.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
                       e.email = 'Enter a valid email'
  if (!f.phone.trim()) e.phone = 'Phone is required'
  else if (f.phone.replace(/\D/g, '').length < 7)
                       e.phone = 'Enter a valid phone number'
  if (f.birthday) {
    const d = new Date(f.birthday)
    if (isNaN(d.getTime()) || d > new Date() || d.getFullYear() < 1900) e.birthday = 'Enter a valid date'
  }
  if (!f.address_line1.trim()) e.address_line1 = 'Address is required'
  if (!f.city.trim())          e.city          = 'City is required'
  if (!f.country.trim())       e.country       = 'Country is required'
  return e
}

type FieldDef = { id: Field; label: string; type?: string; autoComplete: string; optional?: boolean; half?: boolean; hint?: string }

const CONTACT: FieldDef[] = [
  { id: 'name',     label: 'Full name', autoComplete: 'name', half: true },
  { id: 'birthday', label: 'Birthday',  autoComplete: 'bday', type: 'date', half: true, optional: true, hint: 'So I can send you a birthday greeting 🎂' },
  { id: 'email', label: 'Email',     autoComplete: 'email', type: 'email', half: true },
  { id: 'phone', label: 'Phone',     autoComplete: 'tel',   type: 'tel',   half: true },
]

const ADDRESS: FieldDef[] = [
  { id: 'address_line1', label: 'Address',           autoComplete: 'address-line1' },
  { id: 'address_line2', label: 'Apt, suite, etc.',  autoComplete: 'address-line2', optional: true },
  { id: 'city',          label: 'City',              autoComplete: 'address-level2', half: true },
  { id: 'region',        label: 'State',             autoComplete: 'address-level1', half: true, optional: true },
  { id: 'postal_code',   label: 'Postal code',       autoComplete: 'postal-code',    half: true, optional: true },
  { id: 'country',       label: 'Country',           autoComplete: 'country-name',   half: true },
]

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014', marginBottom: 8,
}

const groupStyle: React.CSSProperties = {
  fontSize: 9, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#b07880',
  paddingBottom: 8, borderBottom: '1px solid #ebebeb', marginBottom: 2,
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: '100%', background: 'transparent',
  border: 'none', borderBottom: `1px solid ${hasError ? '#7a3040' : '#d0d0d0'}`,
  padding: '7px 0', fontSize: 13, fontWeight: 300, color: '#1a1014',
  outline: 'none', fontFamily: 'inherit',
})

export default function PrintClubForm({ defaultPlan }: { defaultPlan: PlanId }) {
  const [form, setForm]     = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  // Price follows the shipping country once it's entered
  const plan = PLANS[form.country.trim() ? planForCountry(form.country) : defaultPlan]

  function update(field: Field) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const renderField = ({ id, label, type = 'text', autoComplete, optional, half, hint }: FieldDef) => (
    <div key={id} className={half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
      <label htmlFor={`pc-${id}`} style={labelStyle}>
        {label}
        {optional && <span style={{ fontWeight: 300, color: '#a0a0a0', letterSpacing: '.2em' }}> (optional)</span>}
      </label>
      <input
        id={`pc-${id}`} name={id} type={type} autoComplete={autoComplete}
        value={form[id]} onChange={update(id)} style={inputStyle(!!errors[id])}
        aria-invalid={!!errors[id]}
        max={type === 'date' ? new Date().toISOString().slice(0, 10) : undefined}
      />
      {hint && !errors[id] && <p style={{ fontSize: 10, letterSpacing: '.1em', fontWeight: 300, color: '#a0a0a0', marginTop: 6 }}>{hint}</p>}
      {errors[id] && <p style={{ fontSize: 10, letterSpacing: '.2em', color: '#7a3040', marginTop: 6 }}>{errors[id]}</p>}
    </div>
  )

  if (status === 'sent') {
    return (
      <div style={{ padding: '36px 28px', border: '1px solid #d0d0d0', background: '#fff', textAlign: 'center' }}>
        <div style={{ width: 24, height: 1, background: '#7a3040', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 24, fontStyle: 'italic', fontWeight: 400, color: '#1a1014', marginBottom: 10 }}>
          Application received.
        </p>
        <p style={{ fontSize: 12, lineHeight: 1.7, fontWeight: 300, color: '#787878' }}>
          Thanks, {form.name.trim().split(' ')[0]}. I&apos;ll email you to set up your membership.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-2 gap-x-6 gap-y-5">
      <p className="col-span-2" style={groupStyle}>Contact</p>
      {CONTACT.map(renderField)}

      <p className="col-span-2" style={{ ...groupStyle, marginTop: 10 }}>Shipping address</p>
      {ADDRESS.map(renderField)}

      {status === 'error' && (
        <p className="col-span-2" style={{ fontSize: 11, letterSpacing: '.15em', color: '#7a3040' }}>
          Something went wrong — please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="col-span-2 hover:[background:#7a3040]"
        style={{
          marginTop: 4, padding: '15px 22px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 11, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 500,
          background: '#1a1014', color: '#fff', transition: 'background .25s', opacity: status === 'sending' ? .6 : 1,
        }}
      >
        {status === 'sending' ? 'Sending…' : `Apply — ${plan.price} / month →`}
      </button>

      <p className="col-span-2" style={{ fontSize: 10, lineHeight: 1.7, fontWeight: 300, color: '#a0a0a0' }}>
        Your details are only used to contact you and ship your prints.
      </p>
    </form>
  )
}
