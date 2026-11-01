'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { isTierId, planForCountry, tierPrice, TIER_IDS, TIERS, type PlanId, type Plans, type TierId } from '@/lib/printClub'

type FormState = {
  name: string; email: string; phone: string; birthday: string; birthday_request: string
  address_line1: string; address_line2: string; city: string; region: string; postal_code: string; country: string
}
type Field  = keyof FormState
type Errors = Partial<Record<Field, string>>

const EMPTY: FormState = {
  name: '', email: '', phone: '', birthday: '', birthday_request: '',
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
  if (!f.region.trim())        e.region        = 'State is required'
  if (!f.postal_code.trim())   e.postal_code   = 'Postal code is required'
  if (!f.country.trim())       e.country       = 'Country is required'
  return e
}

type FieldDef = { id: Field; label: string; type?: string; autoComplete: string; optional?: boolean; half?: boolean; hint?: string; multiline?: boolean }

const CONTACT: FieldDef[] = [
  { id: 'name',     label: 'Full name', autoComplete: 'name', half: true },
  { id: 'birthday', label: 'Birthday',  autoComplete: 'bday', type: 'date', half: true, optional: true, hint: '🎂 Birthday perk: ask for a special request below' },
  { id: 'email', label: 'Email',     autoComplete: 'email', type: 'email', half: true },
  { id: 'phone', label: 'Phone',     autoComplete: 'tel',   type: 'tel',   half: true },
  { id: 'birthday_request', label: 'Birthday request', autoComplete: 'off', optional: true, multiline: true,
    hint: 'A favourite character, a dedication, something just for you. I’ll try to make it happen for your birthday.' },
]

const ADDRESS: FieldDef[] = [
  { id: 'address_line1', label: 'Address',           autoComplete: 'address-line1' },
  { id: 'address_line2', label: 'Apt, suite, etc.',  autoComplete: 'address-line2', optional: true },
  { id: 'city',          label: 'City',              autoComplete: 'address-level2', half: true },
  { id: 'region',        label: 'State',             autoComplete: 'address-level1', half: true },
  { id: 'postal_code',   label: 'Postal code',       autoComplete: 'postal-code',    half: true },
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

export default function PrintClubForm({ defaultPlan, plans: PLANS }: { defaultPlan: PlanId; plans: Plans }) {
  const [form, setForm]     = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  // The tier cards above link here with ?tier=
  const wanted = useSearchParams().get('tier')
  const [tier, setTier] = useState<TierId>(isTierId(wanted) ? wanted : 'broke')
  const [lastWanted, setLastWanted] = useState(wanted)
  if (wanted !== lastWanted) {
    setLastWanted(wanted)
    if (isTierId(wanted)) setTier(wanted)
  }
  // Price follows the shipping country once it's entered
  const plan = PLANS[form.country.trim() ? planForCountry(form.country) : defaultPlan]
  const birthdayPerk = tier === 'baroque'

  function update(field: Field) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(f => ({ ...f, [field]: e.target.value }))
      if (errors[field]) setErrors(er => ({ ...er, [field]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Anything typed into the birthday fields before switching tier doesn't count
    const details = birthdayPerk ? form : { ...form, birthday: '', birthday_request: '' }
    const errs = validate(details)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStatus('sending')
    const res = await fetch('/api/print-club', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...details, tier }) })
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

  const renderField = ({ id, label, type = 'text', autoComplete, optional, half, hint, multiline }: FieldDef) => (
    <div key={id} className={half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
      <label htmlFor={`pc-${id}`} style={labelStyle}>
        {label}
        {optional && <span style={{ fontWeight: 300, color: '#a0a0a0', letterSpacing: '.2em' }}> (optional)</span>}
      </label>
      {multiline ? (
        <textarea
          id={`pc-${id}`} name={id} autoComplete={autoComplete} rows={2} maxLength={500}
          value={form[id]} onChange={update(id)} style={{ ...inputStyle(!!errors[id]), resize: 'vertical' }}
        />
      ) : (
        <input
          id={`pc-${id}`} name={id} type={type} autoComplete={autoComplete}
          value={form[id]} onChange={update(id)} style={inputStyle(!!errors[id])}
          aria-invalid={!!errors[id]}
          max={type === 'date' ? new Date().toISOString().slice(0, 10) : undefined}
        />
      )}
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
          Thanks, {form.name.trim().split(' ')[0]}. I&apos;ll email you to set up your {TIERS[tier].name} membership.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-2 gap-x-6 gap-y-5">
      <fieldset className="col-span-2" style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ ...groupStyle, width: '100%' }}>Your tier</legend>
        <div className="grid sm:grid-cols-2 gap-2" style={{ marginTop: 10 }}>
          {TIER_IDS.map(id => {
            const on = tier === id
            return (
              <button key={id} type="button" aria-pressed={on} onClick={() => setTier(id)}
                style={{ padding: '10px 12px', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', border: `1px solid ${on ? '#4a3a7a' : '#d0d0d0'}`, background: on ? '#4a3a7a' : '#fff', color: on ? '#fff' : '#1a1014' }}>
                <span style={{ display: 'block', fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontStyle: 'italic', fontSize: 16, lineHeight: 1.2 }}>{TIERS[id].name}</span>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 300, marginTop: 3 }}>{tierPrice(plan, id)} / month</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <p className="col-span-2" style={{ ...groupStyle, marginTop: 10 }}>Contact</p>
      {CONTACT.filter(f => birthdayPerk || (f.id !== 'birthday' && f.id !== 'birthday_request')).map(renderField)}

      <p className="col-span-2" style={{ ...groupStyle, marginTop: 10 }}>Shipping address</p>
      {ADDRESS.map(renderField)}

      {status === 'error' && (
        <p className="col-span-2" style={{ fontSize: 11, letterSpacing: '.15em', color: '#7a3040' }}>
          Something went wrong. Please try again.
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
        {status === 'sending' ? 'Sending…' : `Apply · ${tierPrice(plan, tier)} / month →`}
      </button>

      <p className="col-span-2" style={{ fontSize: 10, lineHeight: 1.7, fontWeight: 300, color: '#a0a0a0' }}>
        Your details are only used to contact you and ship your prints.
      </p>
    </form>
  )
}
