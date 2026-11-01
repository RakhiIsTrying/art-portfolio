import type { PerkIconId } from '@/lib/printClub'

const INK = '#1a1014'

/** Little drawings of each Print Club perk. */
export default function PerkIcon({ id, size = 52 }: { id: PerkIconId; size?: number }) {
  const box = { width: size, height: size, display: 'block', flexShrink: 0 } as const
  switch (id) {
    // A tablet with a painting on it, and a stylus adding the last stroke
    case 'tablet':
      return (
        <svg viewBox="0 0 52 52" style={box} aria-hidden>
          <rect x="1.5" y="1.5" width="49" height="49" rx="12" fill="#d9cfe9" stroke={INK} strokeWidth="2.5" />
          <rect x="9" y="8" width="29" height="37" rx="4" fill="#1a1014" />
          <rect x="12" y="11" width="23" height="29" rx="1.5" fill="#1e3a8a" />
          <path d="M12 26c5-5 9-4 12-1s7 2 11-2v17H12z" fill="#3f8f4f" />
          <circle cx="29" cy="17" r="3.5" fill="#e8c55a" />
          <path d="M15 17c2-2 5-1 4 1s-3 1-2.5 0" fill="none" stroke="#9ec3ee" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="23.5" cy="42.5" r="1" fill="#fff8e1" />
          <path d="M45 15L31 34" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
          <path d="M45 15L31 34" stroke="#f4a6c0" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M31 34l-2 4 4-2z" fill={INK} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    // A letter flying through a Starry Night sky
    case 'post':
      return (
        <svg viewBox="0 0 52 52" style={box} aria-hidden>
          <rect x="1.5" y="1.5" width="49" height="49" rx="12" fill="#1e3a8a" stroke={INK} strokeWidth="2.5" />
          <path d="M5 21c7-7 13-7 18-3s10 3 13-1 6-3 10-1" fill="none" stroke="#9ec3ee" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M16 13c3-3 7-1 6 2s-5 3-5 0" fill="none" stroke="#e8c55a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="41" cy="10" r="4.5" fill="#e8c55a" />
          <circle cx="7" cy="9" r="1.5" fill="#fff8e1" />
          <circle cx="30" cy="8" r="1.5" fill="#fff8e1" />
          <g transform="rotate(-9 26 34)">
            <rect x="11" y="24" width="30" height="20" rx="2" fill="#fff8e1" stroke={INK} strokeWidth="2.2" />
            <path d="M11.5 25l14.500 11 14.500-11" fill="none" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M26 37c-3-3-6 0-3.500 2.500L26 42.500l3.500-3c2.500-2.500-.5-5.500-3.500-2.500z" fill="#b8433b" />
          </g>
        </svg>
      )
    // A palette with a brush and one very happy splat
    case 'paint':
      return (
        <svg viewBox="0 0 52 52" style={box} aria-hidden>
          <rect x="1.5" y="1.500" width="49" height="49" rx="12" fill="#bfe0dc" stroke={INK} strokeWidth="2.5" />
          <path d="M24 9C12 9 5 17 5 26s8 17 18 17c5 0 6-3 5-6s0-6 5-6h6c5 0 8-3 8-8C47 15 37 9 24 9z" fill="#ead5b5" stroke={INK} strokeWidth="2.2" />
          <circle cx="15" cy="21" r="3.600" fill="#b8433b" />
          <circle cx="25" cy="16" r="3.600" fill="#e8c55a" />
          <circle cx="36" cy="20" r="3.600" fill="#1e3a8a" />
          <circle cx="14" cy="32" r="3.600" fill="#3f8f4f" />
          <path d="M47 33L31 47" stroke={INK} strokeWidth="3.500" strokeLinecap="round" />
          <path d="M33 44l-5 1-1 4c3 0 6-1 7-3z" fill="#b0552f" stroke={INK} strokeWidth="1.800" strokeLinejoin="round" />
        </svg>
      )
    // A star sticker with its corner peeling up
    case 'stickers':
      return (
        <svg viewBox="0 0 52 52" style={box} aria-hidden>
          <rect x="1.5" y="1.5" width="49" height="49" rx="12" fill="#e9d0e4" stroke={INK} strokeWidth="2.5" />
          <path d="M25 7l5.500 11.500 12.500 1.700-9 8.800 2.200 12.500L25 35.500l-11.200 6 2.200-12.500-9-8.800 12.500-1.700z" fill="#e8c55a" stroke={INK} strokeWidth="2.200" strokeLinejoin="round" />
          <circle cx="21" cy="23" r="1.700" fill={INK} />
          <circle cx="29" cy="23" r="1.700" fill={INK} />
          <path d="M21 28c2 2.500 6 2.500 8 0" fill="none" stroke={INK} strokeWidth="1.800" strokeLinecap="round" />
          <path d="M34 46l11-11c-1 6-1 8-3 10s-4 1-8 1z" fill="#fff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 41l2 2M7 34h3" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    // A slice of cake with one candle, ready for wishes
    case 'cake':
      return (
        <svg viewBox="0 0 52 52" style={box} aria-hidden>
          <rect x="1.500" y="1.500" width="49" height="49" rx="12" fill="#f0e2a8" stroke={INK} strokeWidth="2.5" />
          <path d="M9 27h34v15a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2z" fill="#c78a5a" stroke={INK} strokeWidth="2.2" />
          <path d="M9 34h34" stroke="#fff8e1" strokeWidth="3" />
          <path d="M9 28c0-3 2-5 5-5h24c3 0 5 2 5 5 0 3-4 3-4 0 0 4-6 4-6 0 0 3-5 3-5 0 0 4-6 4-6 0 0 3-5 3-5 0 0 3-8 3-8 0z" fill="#f4a6c0" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
          <rect x="23.500" y="12" width="5" height="11" rx="1" fill="#1e3a8a" stroke={INK} strokeWidth="1.800" />
          <path d="M26 3.500c3 3 4 5 2 7.500h-4c-2-2.500-1-4.500 2-7.500z" fill="#d9a521" stroke={INK} strokeWidth="1.600" strokeLinejoin="round" />
        </svg>
      )
    // A heart split down the middle, with a plaster holding it together
    case 'breakup':
      return (
        <svg viewBox="0 0 52 52" style={box} aria-hidden>
          <rect x="1.5" y="1.5" width="49" height="49" rx="12" fill="#e7c3c9" stroke={INK} strokeWidth="2.5" />
          <path d="M26 45C13 36 6 29 6 20c0-7 5-11 10.500-11C21 9 24 11.500 26 15c2-3.500 5-6 9.500-6C41 9 46 13 46 20c0 9-7 16-20 25z" fill="#b8433b" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M26 15l-4 7 7 5-5 6 3 9" fill="none" stroke="#fff8e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <g transform="rotate(-28 34 21)">
            <rect x="26" y="17" width="16" height="8" rx="4" fill="#ead5b5" stroke={INK} strokeWidth="1.800" />
            <path d="M32 19v4M36 19v4" stroke={INK} strokeWidth="1.200" />
          </g>
        </svg>
      )
  }
}
