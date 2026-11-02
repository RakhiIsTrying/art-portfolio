'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { playChaChing } from '@/lib/chaChing'

const BILLS = ['💸', '💵', '🪙', '💰', '💴']
const AMOUNTS = [100, 500, 2000]
const JACKPOT_EVERY = 5
const MAX_ON_SCREEN = 150
const REPLIES: Record<number, string> = {
  1: 'Ding! I responded.',
  2: 'Ooh. Do it again.',
  3: 'My ears perked up.',
  4: 'Dug-Dug heard that too.',
  5: 'JACKPOT! This is my love language.',
  7: 'I have started looking at yachts.',
  10: 'JACKPOT! I just resigned from corporate. In my head.',
  12: 'Dug-Dug has asked for a salary.',
  15: 'JACKPOT! I’ve bought Dug-Dug a small country.',
  20: 'JACKPOT! Sir, this is an About page.',
}
const SOUND_KEY = 'vgb-money-muted'

type Bill = { id: number; bill: string; x: number; rain: boolean; delay: number; size: number }

/** My Instagram bio says money being thrown at me works. Test it. */
export default function ThrowMoney() {
  const [thrown, setThrown] = useState<Bill[]>([])
  const [count, setCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [muted, setMuted] = useState(false)
  const nextId = useRef(0)
  const audio = useRef<AudioContext | null>(null)

  useEffect(() => {
    let saved = false
    try { saved = !!localStorage.getItem(SOUND_KEY) } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser storage can only be read after loading
    setMuted(saved)
  }, [])

  function ring(jackpot: boolean) {
    if (muted) return
    try {
      audio.current ??= new AudioContext()
      void audio.current.resume()
      playChaChing(audio.current)
      // A jackpot rings the register again
      if (jackpot) setTimeout(() => { if (audio.current) playChaChing(audio.current, { volume: 0.7 }) }, 260)
    } catch { /* No sound on this browser: the money still flies */ }
  }

  function toss() {
    const nextCount = count + 1
    const jackpot = nextCount % JACKPOT_EVERY === 0
    setCount(nextCount)
    setTotal(t => t + (jackpot ? 50000 : AMOUNTS[nextCount % AMOUNTS.length]))
    ring(jackpot)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const make = (rain: boolean): Bill => ({
      id: nextId.current++, bill: BILLS[nextId.current % BILLS.length], rain,
      x: rain ? Math.round(Math.random() * 100) : Math.round(Math.random() * 280 - 140),
      delay: rain ? Math.round(Math.random() * 700) : Math.round(Math.random() * 90),
      size: 20 + Math.round(Math.random() * 16),
    })
    const batch = [...Array.from({ length: 10 }, () => make(false)), ...(jackpot ? Array.from({ length: 45 }, () => make(true)) : [])]
    setThrown(t => [...t, ...batch].slice(-MAX_ON_SCREEN))
    setTimeout(() => setThrown(t => t.filter(b => !batch.includes(b))), jackpot ? 2800 : 1300)
  }

  function toggleSound() {
    const next = !muted
    setMuted(next)
    try { if (next) localStorage.setItem(SOUND_KEY, '1'); else localStorage.removeItem(SOUND_KEY) } catch {}
  }

  const replyAt = Object.keys(REPLIES).map(Number).filter(n => n <= count).pop()
  const jackpotNow = count > 0 && count % JACKPOT_EVERY === 0

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12, maxWidth: '100%' }}>
      {thrown.map(b => (
        <span key={b.id} aria-hidden className="vgb-motion" style={{
          position: b.rain ? 'fixed' : 'absolute', top: b.rain ? -50 : 0, left: b.rain ? `${b.x}vw` : '50%', zIndex: 70, fontSize: b.size, pointerEvents: 'none',
          '--vgb-x': `${b.x}px`, animation: `${b.rain ? 'vgb-money-rain 2s ease-in' : 'vgb-money 1.1s ease-out'} ${b.delay}ms both`,
        } as React.CSSProperties}>{b.bill}</span>
      ))}

      {jackpotNow && (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={count} src="/puzzles/dugdug.png" alt="" aria-hidden className="vgb-motion" style={{ position: 'absolute', top: -74, right: -40, height: 90, pointerEvents: 'none', filter: 'drop-shadow(0 0 2px #fff)', animation: 'vgb-hop .7s ease-out 2 both' }} />
      )}

      <button key={count} type="button" onClick={toss} className="vgb-motion"
        style={{ padding: '16px 28px', fontFamily: 'inherit', fontSize: 13, letterSpacing: '.22em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', border: '2px solid #1a1014', background: jackpotNow ? '#3f8f4f' : '#e8c55a', color: jackpotNow ? '#fff' : '#1a1014', boxShadow: '5px 5px 0 #1a1014', animation: count ? 'vgb-cha .28s ease-out' : undefined }}>
        Throw money at me 💸
      </button>

      <p aria-live="polite" style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 700, lineHeight: 1.1, color: '#1a1014', minHeight: '1.1em' }}>
        {count > 0 && `₹${total.toLocaleString('en-IN')}`}
      </p>
      <p role="status" style={{ minHeight: 44, maxWidth: 420, fontSize: 14, lineHeight: 1.5, color: '#3a3a3a', whiteSpace: 'normal' }}>
        {count === 0 ? 'Go on. It’s in my bio.' : REPLIES[replyAt ?? 1]}
        {count >= JACKPOT_EVERY && <> <span style={{ display: 'block', fontSize: 12, color: '#787878' }}>All imaginary, sadly. <Link href="/shop" style={{ color: '#7a3040', textDecoration: 'underline' }}>Real money works here.</Link></span></>}
      </p>
      <button type="button" onClick={toggleSound} aria-pressed={muted} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, color: '#787878' }}>
        {muted ? '🔇 Sound off' : '🔊 Sound on'}
      </button>
    </div>
  )
}
