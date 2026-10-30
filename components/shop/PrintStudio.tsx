'use client'
import { useEffect, useRef, useState } from 'react'
import { formatPrice, type Currency, type PrintSize } from '@/lib/prints'
import { useShopSettings } from './ShopSettings'
import type { Artwork } from '@/lib/types'
import ShopGrid from './ShopGrid'
import ArtViewer from '@/components/ArtViewer'
import { useAspect, useEdge } from '@/lib/useAspects'
import SizePicker, { orderPayload, type Quantities } from './SizePicker'

const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'
const INK = '#1a1014'
const MAX_PX_PER_INCH = 17      // largest scale for the side-by-side size comparison
const CARD_PX_PER_INCH = 30     // the larger greeting-card mockup
const MARGIN_INCHES = .25       // white margin printed around the art

const label: React.CSSProperties = { display: 'block', fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 500, color: INK, marginBottom: 8 }
const input: React.CSSProperties = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #d0d0d0', padding: '7px 0', fontSize: 13, fontWeight: 300, color: INK, outline: 'none', fontFamily: 'inherit' }

/** A print on paper: the whole art, as big as fits inside a small white margin. */
function Paper({ art, w, h, ppi, highlight, onView }: { art: Artwork; w: number; h: number; ppi: number; highlight?: boolean; onView?: () => void }) {
  // White paper with a small margin all round; the art is as large as it can be inside it, never cropped.
  // If the art's corners are one flat colour, the spare space inside the margin takes that colour.
  const edge = useEdge(art.image_url)
  return (
    <div onClick={onView} role={onView ? 'button' : undefined} aria-label={onView ? `View ${art.title} full size` : undefined} title={onView ? 'View full size' : undefined}
      style={{
      cursor: onView ? 'zoom-in' : undefined,
      width: w * ppi, height: h * ppi, background: '#fff', padding: Math.max(4, MARGIN_INCHES * ppi), flexShrink: 0,
      boxShadow: highlight ? '0 0 0 2px #4a3a7a, 0 12px 26px rgba(26,16,20,.22)' : '0 8px 20px rgba(26,16,20,.16), 0 1px 3px rgba(26,16,20,.12)',
      transition: 'box-shadow .2s',
    }}>
      <div style={{ width: '100%', height: '100%', background: edge ?? '#fff' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      </div>
    </div>
  )
}

type Props = { artworks: Artwork[]; currency: Currency; initialTitle?: string }

export default function PrintStudio({ artworks, currency: initialCurrency, initialTitle }: Props) {
  const { sizes: PRINT_SIZES, greetings: SAMPLE_GREETINGS } = useShopSettings()
  const [art, setArt] = useState<Artwork>(() => artworks.find(a => a.title === initialTitle) ?? artworks[0])
  // The buyer picks portrait or landscape; until they do, we suggest one from the art's shape
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | null>(null)
  const [viewing, setViewing] = useState<Artwork | null>(null)
  const [qty, setQty] = useState<Quantities>({})
  const [currency, setCurrency] = useState<Currency>(initialCurrency)
  const [greetingMode, setGreetingMode] = useState<'random' | 'custom'>('random')
  const [greeting, setGreeting] = useState('')
  const [sample, setSample] = useState(0)
  const [contact, setContact] = useState({ name: '', email: '', note: '' })
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const topRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const [rowWidth, setRowWidth] = useState(0)
  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setRowWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const cards = qty.card ?? 0
  const greetingText = greetingMode === 'custom' && greeting.trim() ? greeting.trim() : SAMPLE_GREETINGS[sample % SAMPLE_GREETINGS.length]
  const order = orderPayload(PRINT_SIZES, qty, currency, cards ? (greetingMode === 'custom' && greeting.trim() ? greeting.trim() : 'Surprise me (random greeting)') : undefined)

  function pick(a: Artwork) {
    setArt(a)
    setOrientation(null)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!order) return setError('Add at least one print or card.')
    if (!contact.name.trim()) return setError('Please add your name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) return setError('Please add a valid email.')
    if (cards && greetingMode === 'custom' && !greeting.trim()) return setError('Write your card message, or choose a surprise greeting.')
    setError(null); setStatus('sending')
    const res = await fetch('/api/inquire', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: contact.name.trim(), email: contact.email.trim(), piece: `Print — ${art.title} (${landscape ? 'landscape' : 'portrait'})`, message: contact.note.trim(), order }),
    })
    setStatus(res.ok ? 'sent' : 'error')
  }

  const prints = PRINT_SIZES.filter(s => !s.card)
  const card = PRINT_SIZES.find(s => s.card) as PrintSize
  // Wide pieces suit landscape paper (and a sideways card); the buyer has the final say
  const aspect = useAspect(art.image_url)
  const suggested = (aspect ?? 0) > 1.05 ? 'landscape' : 'portrait'
  const landscape = (orientation ?? suggested) === 'landscape'
  const fit = (s: PrintSize) => (landscape ? { w: s.h, h: s.w } : { w: s.w, h: s.h })
  const dims = (s: PrintSize) => { const { w, h } = fit(s); return `${w}" × ${h}"` }
  // Shrink the comparison so every size fits side by side (all at the same scale)
  const allSizes = [...prints, card]
  const LABEL_WIDTH = 96 // the caption under each size needs about this much room
  let PX_PER_INCH = MAX_PX_PER_INCH
  while (rowWidth && PX_PER_INCH > 4 &&
         allSizes.reduce((sum, s) => sum + Math.max(fit(s).w * PX_PER_INCH, LABEL_WIDTH), 0) + 22 * (allSizes.length - 1) + 8 > rowWidth) {
    PX_PER_INCH -= .25
  }

  return (
    <div ref={topRef} style={{ scrollMarginTop: 60 }}>
      <div className="grid lg:grid-cols-[380px_1fr] gap-8 lg:gap-10 items-start">

        {/* ── Order window ── */}
        <aside className="no-scrollbar lg:sticky lg:top-[60px] lg:max-h-[calc(100vh-76px)] lg:overflow-y-auto" style={{ background: '#fff', border: '1px solid #d0d0d0', borderTop: '3px solid #7a3040' }}>
          {status === 'sent' ? (
            <div style={{ padding: '36px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 24, color: INK, marginBottom: 8 }}>Order request sent.</p>
              <p style={{ fontSize: 12, fontWeight: 300, color: '#787878', lineHeight: 1.7 }}>
                Thanks, {contact.name.trim().split(' ')[0]}! I’ll email you to confirm the total, shipping and payment.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate style={{ padding: '20px 20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', color: '#7a3040', marginBottom: 12 }}>Your order</p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <button type="button" onClick={() => setViewing(art)} title="View full size" aria-label={`View ${art.title} full size`}
                          style={{ padding: 0, border: 'none', background: 'none', cursor: 'zoom-in', flexShrink: 0 }}>
                    <img src={art.image_url} alt="" style={{ width: 56, height: 56, objectFit: 'contain', display: 'block', border: '1px solid #ebebeb', background: '#fff' }} />
                  </button>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 19, color: INK, lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{art.title}</p>
                    <span style={{ display: 'flex', gap: 14 }}>
                      <button type="button" onClick={() => setViewing(art)} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', color: '#1e3a8a' }}>⤢ Full size</button>
                      <a href="#choose-piece" style={{ fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', color: '#1e3a8a' }}>Change piece ↓</a>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span style={label}>Orientation</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['portrait', 'landscape'] as const).map(o => {
                    const on = (orientation ?? suggested) === o
                    return (
                      <button key={o} type="button" onClick={() => setOrientation(o)} aria-pressed={on}
                        style={{ flex: 1, padding: '9px 10px', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer',
                                 border: `1px solid ${on ? '#4a3a7a' : '#d0d0d0'}`, background: on ? '#4a3a7a' : '#fff', color: on ? '#fff' : INK }}>
                        {o === 'portrait' ? '▯ Portrait' : '▭ Landscape'}
                        {o === suggested && <span style={{ display: 'block', fontSize: 8, letterSpacing: '.15em', marginTop: 3, opacity: .75 }}>suggested</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              <SizePicker qty={qty} onChange={setQty} currency={currency} onCurrency={setCurrency} />

              {cards > 0 && (
                <div>
                  <span style={label}>Message inside the card</span>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    {([['random', 'Surprise me'], ['custom', 'Write my own']] as const).map(([mode, text]) => (
                      <button key={mode} type="button" onClick={() => setGreetingMode(mode)}
                        style={{ flex: 1, padding: '8px 10px', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer',
                                 border: `1px solid ${greetingMode === mode ? '#4a3a7a' : '#d0d0d0'}`, background: greetingMode === mode ? '#4a3a7a' : '#fff', color: greetingMode === mode ? '#fff' : INK }}>
                        {text}
                      </button>
                    ))}
                  </div>
                  {greetingMode === 'custom' ? (
                    <textarea rows={3} maxLength={220} value={greeting} onChange={e => setGreeting(e.target.value)}
                              placeholder="Happy birthday, Maya! Love, Arjun" style={{ ...input, border: '1px solid #d0d0d0', padding: 8, resize: 'vertical' }} />
                  ) : (
                    <p style={{ fontSize: 11, fontWeight: 300, color: '#787878' }}>I’ll handwrite a greeting for you, like the one shown in the preview.</p>
                  )}
                </div>
              )}

              {([['name', 'Name', 'text'], ['email', 'Email', 'email']] as const).map(([field, text, type]) => (
                <div key={field}>
                  <label htmlFor={`order-${field}`} style={label}>{text}</label>
                  <input id={`order-${field}`} type={type} value={contact[field]} onChange={e => setContact(c => ({ ...c, [field]: e.target.value }))} style={input} />
                </div>
              ))}
              <div>
                <label htmlFor="order-note" style={label}>Note <span style={{ fontWeight: 300, color: '#a0a0a0', letterSpacing: '.2em' }}>(optional)</span></label>
                <textarea id="order-note" rows={2} value={contact.note} onChange={e => setContact(c => ({ ...c, note: e.target.value }))} style={{ ...input, resize: 'vertical' }} />
              </div>

              {(error || status === 'error') && (
                <p style={{ fontSize: 11, color: '#7a3040' }}>{error ?? 'Something went wrong — please try again.'}</p>
              )}
              <button type="submit" disabled={status === 'sending'} className="hover:[background:#7a3040]"
                style={{ padding: '14px 18px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 500, background: INK, color: '#fff', opacity: status === 'sending' ? .6 : 1, transition: 'background .25s' }}>
                {status === 'sending' ? 'Sending…' : 'Send order request →'}
              </button>
              <p style={{ fontSize: 10, fontWeight: 300, color: '#a0a0a0', lineHeight: 1.6, marginTop: -8 }}>
                No payment yet. I’ll confirm the total and shipping by email.
              </p>
            </form>
          )}
        </aside>

        {/* ── Previews ── */}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', color: '#787878', marginBottom: 4 }}>See it to scale</p>
          <h3 style={{ fontFamily: PLAYFAIR, fontSize: 24, fontWeight: 700, color: INK, marginBottom: 18 }}>{art.title}, every size</h3>
          <p style={{ fontSize: 11, fontWeight: 300, color: '#787878', margin: '-12px 0 18px' }}>
            {landscape ? '▭ Landscape' : '▯ Portrait'} — switch it in your order. Every size shows the whole artwork as large as it fits, with a small white margin.
          </p>

          <div ref={rowRef} className="no-scrollbar" style={{ overflowX: 'auto', paddingBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, minWidth: 'max-content', padding: '6px 4px 0' }}>
              {[...prints, card].map(s => (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {s.card ? (
                    // Folded card, standing: art on the front flap only
                    <div style={{ position: 'relative' }}>
                      <Paper art={art} {...fit(s)} ppi={PX_PER_INCH} highlight={(qty[s.id] ?? 0) > 0} onView={() => setViewing(art)} />
                      <div style={landscape
                        ? { position: 'absolute', left: 0, right: 0, top: 0, height: 5, background: 'linear-gradient(180deg, rgba(26,16,20,.18), transparent)' }
                        : { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: 'linear-gradient(90deg, rgba(26,16,20,.18), transparent)' }} />
                    </div>
                  ) : (
                    <Paper art={art} {...fit(s)} ppi={PX_PER_INCH} highlight={(qty[s.id] ?? 0) > 0} onView={() => setViewing(art)} />
                  )}
                  <p style={{ marginTop: 10, fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', fontWeight: 500, color: INK }}>
                    {s.card ? 'Card' : s.name}{(qty[s.id] ?? 0) > 0 && <span style={{ color: '#4a3a7a' }}> ×{qty[s.id]}</span>}
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 300, color: '#787878' }}>{dims(s)} · {formatPrice(s[currency], currency)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Greeting card, closed and open */}
          <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid #d0d0d0' }}>
            <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', color: '#787878', marginBottom: 4 }}>Greeting card · {dims(card)}{landscape ? ' · landscape, folds at the top' : ''}</p>
            <p style={{ fontSize: 12, fontWeight: 300, color: '#787878', marginBottom: 18, maxWidth: 520 }}>
              The art is printed on the front flap. Inside, a greeting: a surprise one from me, or your own words.
            </p>
            <div className="flex flex-wrap items-end gap-8">
              {/* Closed */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', transform: 'rotate(-2deg)' }}>
                  <Paper art={art} {...fit(card)} ppi={CARD_PX_PER_INCH} onView={() => setViewing(art)} />
                  <div style={landscape
                    ? { position: 'absolute', left: 0, right: 0, top: 0, height: 8, background: 'linear-gradient(180deg, rgba(26,16,20,.2), transparent)' }
                    : { position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, background: 'linear-gradient(90deg, rgba(26,16,20,.2), transparent)' }} />
                </div>
                <p style={{ marginTop: 12, fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#a0a0a0' }}>Front</p>
              </div>

              {/* Open */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: landscape ? 'column' : 'row', boxShadow: '0 10px 26px rgba(26,16,20,.16)' }}>
                  <div style={{ width: fit(card).w * CARD_PX_PER_INCH, height: fit(card).h * CARD_PX_PER_INCH, background: '#f7f5f2',
                                [landscape ? 'borderBottom' : 'borderRight']: '1px solid #e3ded8',
                                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 14 }}>
                    <span style={{ fontSize: 8, letterSpacing: '.35em', textTransform: 'uppercase', color: '#c4bdb5' }}>Van Gone Broke</span>
                  </div>
                  <div style={{ width: fit(card).w * CARD_PX_PER_INCH, height: fit(card).h * CARD_PX_PER_INCH, background: '#fff', padding: 22,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <p style={{ fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 16, lineHeight: 1.5, color: INK, wordBreak: 'break-word' }}>
                      {greetingText}
                    </p>
                    <span style={{ width: 22, height: 1, background: '#b07880', margin: '14px 0 8px' }} />
                    <span style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#a0a0a0' }}>
                      {greetingMode === 'custom' && greeting.trim() ? 'Your message' : 'Surprise greeting'}
                    </span>
                  </div>
                </div>
                <p style={{ marginTop: 12, fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#a0a0a0' }}>
                  Inside
                  {!(greetingMode === 'custom' && greeting.trim()) && (
                    <button type="button" onClick={() => setSample(n => n + 1)}
                            style={{ marginLeft: 10, background: 'none', border: 'none', color: '#1e3a8a', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '.2em' }}>
                      ⟳ another example
                    </button>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pick a piece ── */}
      <div id="choose-piece" style={{ marginTop: 48, scrollMarginTop: 60 }}>
        <h3 style={{ fontFamily: PLAYFAIR, fontSize: 22, fontWeight: 700, color: INK, marginBottom: 4 }}>Choose a piece</h3>
        <ShopGrid artworks={artworks} kind="print" currency={currency} onSelect={pick} selectedId={art.id} onExpand={setViewing} />
      </div>

      {viewing && <ArtViewer src={viewing.image_url} title={viewing.title} onClose={() => setViewing(null)} />}
    </div>
  )
}
