'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { formatMoney } from '@/lib/currency'

const BILLS = ['💸', '💵', '🪙', '💰', '💴']
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
// Gold coin prize and Slot machine win siren, from Mixkit (mixkit.co) under its Sound Effects Free License
const COIN_SOUND = '/sounds/coin-prize.mp3'
const JACKPOT_SOUND = '/sounds/jackpot-siren.mp3'
const VOLUME = 0.7

// Imaginary, so any number will do: a random round amount, much bigger at a jackpot
const randomAmount = (jackpot: boolean) => (jackpot ? 20_000 + Math.floor(Math.random() * 81) * 1000 : 50 + Math.floor(Math.random() * 60) * 50)

type Bill = { id: number; bill: string; x: number; rain: boolean; delay: number; size: number }

/** My Instagram bio says money being thrown at me works. Test it. */
export default function ThrowMoney({ currency }: { currency: string }) {
  const [thrown, setThrown] = useState<Bill[]>([])
  const [count, setCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [muted, setMuted] = useState(false)
  const nextId = useRef(0)
  const sounds = useRef<{ coin: HTMLAudioElement; jackpot: HTMLAudioElement } | null>(null)

  useEffect(() => {
    let saved = false
    try { saved = !!localStorage.getItem(SOUND_KEY) } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser storage can only be read after loading
    setMuted(saved)
    // Nothing keeps ringing after leaving the page
    return () => { sounds.current?.jackpot.pause(); sounds.current?.coin.pause() }
  }, [])

  // The files only load once someone comes near the button
  function loadSounds() {
    if (sounds.current) return sounds.current
    const load = (src: string) => { const a = new Audio(src); a.preload = 'auto'; a.volume = VOLUME; return a }
    sounds.current = { coin: load(COIN_SOUND), jackpot: load(JACKPOT_SOUND) }
    return sounds.current
  }

  function playFromStart(sound: HTMLAudioElement) {
    sound.currentTime = 0
    sound.play().catch(() => { /* No sound on this browser: the money still flies */ })
  }

  function ring(jackpot: boolean) {
    if (muted) return
    const { coin, jackpot: siren } = loadSounds()
    if (jackpot) playFromStart(siren)
    else playFromStart(coin)
  }

  function toss() {
    const nextCount = count + 1
    const jackpot = nextCount % JACKPOT_EVERY === 0
    setCount(nextCount)
    setTotal(t => t + randomAmount(jackpot))
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
    if (next) { sounds.current?.jackpot.pause(); sounds.current?.coin.pause() }
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
        <img key={`dug-${count}`} src="/puzzles/dugdug.png" alt="" aria-hidden className="vgb-motion" style={{ position: 'absolute', top: -74, right: -12, height: 90, pointerEvents: 'none', filter: 'drop-shadow(0 0 2px #fff)', animation: 'vgb-hop .7s ease-out 2 both' }} />
      )}

      <div style={{ position: 'relative', marginTop: 40 }}>
        {/* Dug-Dug peeks over the button, and hops at every throw */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={`peek-${count}`} src="/puzzles/dugdug.png" alt="" aria-hidden className="vgb-motion" style={{ position: 'absolute', top: -46, left: '50%', marginLeft: -36, width: 72, pointerEvents: 'none', animation: count ? 'vgb-hop .45s ease-out both' : undefined }} />
        <span aria-hidden className="vgb-motion" style={{ position: 'absolute', top: -12, left: -14, fontSize: 18, zIndex: 2, pointerEvents: 'none', animation: 'vgb-twinkle 1.6s ease-in-out infinite' }}>✨</span>
        <span aria-hidden className="vgb-motion" style={{ position: 'absolute', bottom: -6, right: -12, fontSize: 15, zIndex: 2, pointerEvents: 'none', animation: 'vgb-twinkle 1.6s ease-in-out .8s infinite' }}>💖</span>
        <button type="button" onClick={toss} onPointerEnter={loadSounds} onFocus={loadSounds} className="vgb-motion vgb-cute-button"
          style={{ position: 'relative', zIndex: 1, padding: '15px 30px', fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 'clamp(18px, 4vw, 22px)', fontStyle: 'italic', fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap', cursor: 'pointer', borderRadius: 999, border: '3px solid #1a1014', color: '#1a1014',
                   background: jackpotNow ? 'linear-gradient(180deg, #ffe680 0%, #f2b632 100%)' : 'linear-gradient(180deg, #ffe0e8 0%, #ffb3c7 100%)', boxShadow: `0 6px 0 ${jackpotNow ? '#c9901a' : '#d77a96'}`, animation: count ? `vgb-cha-${count % 2} .28s ease-out` : undefined }}>
          Throw money at me 💸
        </button>
      </div>

      <p aria-live="polite" style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 700, lineHeight: 1.1, color: '#1a1014', minHeight: '1.1em' }}>
        {count > 0 && formatMoney(total, currency)}
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
