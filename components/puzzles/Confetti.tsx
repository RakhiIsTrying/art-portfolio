'use client'
import { useMemo } from 'react'
import { BEE, BEN_IMG, DUG_DUG } from './shared'

const COLOURS = ['#4a3a7a', '#e8c55a', '#a0521d', '#7a3040', '#1a6060', '#b07880']

/** Bee, Ben and Dug-Dug (plus paper confetti) falling down the screen for about 5 seconds. */
export default function Confetti({ burst }: { burst: number }) {
  const pieces = useMemo(() => Array.from({ length: 46 }, (_, i) => {
    const friend = i % 3 === 0 ? [BEE, BEN_IMG, DUG_DUG][(i / 3) % 3] : null
    return {
      friend,
      left: Math.random() * 100,
      size: friend ? 40 + Math.random() * 34 : 8 + Math.random() * 8,
      delay: Math.random() * 1.8,
      duration: 2.6 + Math.random() * 1.6,       // everything has landed by ~5s
      spin: (Math.random() < .5 ? -1 : 1) * (friend ? 40 + Math.random() * 80 : 360 + Math.random() * 360),
      sway: (Math.random() - .5) * 120,
      colour: COLOURS[i % COLOURS.length],
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [burst])

  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 80, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <div key={`${burst}-${i}`} className="vgb-motion"
             style={{ position: 'absolute', top: 0, left: `${p.left}%`, width: p.size, height: p.friend ? 'auto' : p.size * .45,
                      animation: `vgb-fall ${p.duration}s ${p.delay}s cubic-bezier(.3,.1,.5,1) both`,
                      ['--spin' as string]: `${p.spin}deg`, ['--sway' as string]: `${p.sway}px` }}>
          {p.friend
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={p.friend} alt="" style={{ width: '100%', display: 'block', filter: 'drop-shadow(0 4px 6px rgba(26,16,20,.25))' }} />
            : <span style={{ display: 'block', width: '100%', height: '100%', background: p.colour, borderRadius: 2 }} />}
        </div>
      ))}
    </div>
  )
}
