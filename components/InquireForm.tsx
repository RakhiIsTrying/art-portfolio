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

export default function InquireForm() {
  const params = useSearchParams()
  const [form, setForm]     = useState<FormState>({
    name: '', email: '', message: '',
    piece: params.get('piece') ?? '',
  })
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
    const res = await fetch('/api/inquire', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })
    setStatus(res.ok ? 'sent' : 'error')
  }

  if (status === 'sent') {
    return (
      <div className="border-4 border-ink bg-cream p-8 text-center">
        <p className="text-xl font-black uppercase tracking-widest text-rust">
          ✦ Message Sent!
        </p>
        <p className="text-sm font-black uppercase tracking-widest text-rose mt-2">
          Thank you — I&apos;ll get back to you soon.
        </p>
      </div>
    )
  }

  const fieldClass = (field: keyof FormState) =>
    `w-full bg-cream border-2 px-3 py-2 text-sm font-bold text-ink
     outline-none focus:border-rust transition-colors
     ${errors[field] ? 'border-rust' : 'border-ink'}`

  const labelClass = 'block text-[9px] font-black uppercase tracking-widest text-rose mb-1'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="name" className={labelClass}>Name</label>
        <input id="name" type="text" value={form.name} onChange={update('name')} className={fieldClass('name')} />
        {errors.name && <p className="text-[9px] font-black text-rust mt-1 uppercase tracking-widest">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" type="email" value={form.email} onChange={update('email')} className={fieldClass('email')} />
        {errors.email && <p className="text-[9px] font-black text-rust mt-1 uppercase tracking-widest">{errors.email}</p>}
      </div>

      {form.piece && (
        <div>
          <label htmlFor="piece" className={labelClass}>Piece you&apos;re interested in</label>
          <input id="piece" type="text" value={form.piece} onChange={update('piece')} className={fieldClass('piece')} />
        </div>
      )}

      <div>
        <label htmlFor="message" className={labelClass}>Message</label>
        <textarea id="message" rows={5} value={form.message} onChange={update('message')} className={fieldClass('message')} />
        {errors.message && <p className="text-[9px] font-black text-rust mt-1 uppercase tracking-widest">{errors.message}</p>}
      </div>

      {status === 'error' && (
        <p className="text-[9px] font-black text-rust uppercase tracking-widest">
          Something went wrong — please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-rust text-cream text-[11px] font-black uppercase tracking-widest
                   px-8 py-3 border-[3px] border-ink
                   shadow-[4px_4px_0_#1f1f1f]
                   hover:translate-x-0.5 hover:translate-y-0.5
                   hover:shadow-[2px_2px_0_#1f1f1f]
                   disabled:opacity-60 disabled:cursor-not-allowed
                   transition-all"
      >
        {status === 'sending' ? 'Sending...' : 'Send Message →'}
      </button>
    </form>
  )
}
