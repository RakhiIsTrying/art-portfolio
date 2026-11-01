'use client'
import Link from 'next/link'
import { useRef, useState } from 'react'

const BILLS = ['💸', '💵', '🪙', '💰']
const REPLIES = ['Ding! I responded.', 'Ooh. Do it again.', 'My ears perked up.', 'Dug-Dug heard that too.', 'This is my love language.']

/** The Instagram bio says money being thrown works. Test it. */
export default function ThrowMoney() {
  const [thrown, setThrown] = useState<{ id: number; bill: string; x: number }[]>([])
  const [count, setCount] = useState(0)
  const next = useRef(0)

  function toss() {
    setCount(c => c + 1)
    const batch = Array.from({ length: 8 }, () => ({ id: next.current++, bill: BILLS[next.current % BILLS.length], x: Math.round(Math.random() * 240 - 120) }))
    setThrown(t => [...t, ...batch])
    setTimeout(() => setThrown(t => t.filter(b => !batch.includes(b))), 1200)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {thrown.map(b => (
        <span key={b.id} aria-hidden className="vgb-motion" style={{ position: 'absolute', top: 0, left: '50%', fontSize: 24, pointerEvents: 'none', '--vgb-x': `${b.x}px`, animation: 'vgb-money 1.1s ease-out both' } as React.CSSProperties}>{b.bill}</span>
      ))}
      <button type="button" onClick={toss} className="hover:-translate-y-0.5"
        style={{ padding: '14px 24px', fontFamily: 'inherit', fontSize: 12, letterSpacing: '.25em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', border: '2px solid #1a1014', background: '#e8c55a', color: '#1a1014', boxShadow: '4px 4px 0 #1a1014', transition: 'transform .15s' }}>
        Throw money at me 💸
      </button>
      <p role="status" style={{ minHeight: 40, fontSize: 13, color: '#3a3a3a' }}>
        {count === 0 ? 'Go on. It’s in my bio.' : count < 5 ? REPLIES[(count - 1) % REPLIES.length] : <>That was imaginary, but I felt it. <Link href="/shop" style={{ color: '#7a3040', textDecoration: 'underline' }}>Real money works here.</Link></>}
      </p>
    </div>
  )
}
