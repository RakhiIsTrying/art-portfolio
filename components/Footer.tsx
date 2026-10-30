'use client'

import Link from 'next/link'

const categories = [
  { label: 'Music',    color: '#7a3040', href: '/gallery/music'  },
  { label: 'Movies',   color: '#1e3a8a', href: '/gallery/movies' },
  { label: 'Comics',   color: '#1a6060', href: '/gallery/comics' },
  { label: 'Sketchbook',color: '#3d4f45', href: '/gallery/sketchbook' },
]

const socials = [
  { href: 'https://www.instagram.com/van_gone_broke/', label: 'Instagram' },
  { href: 'https://twitter.com',   label: 'Twitter'   },
]

export default function Footer() {
  return (
    <footer className="flex-wrap gap-y-2 px-4 py-3 md:h-[38px] md:py-0 md:pr-6 md:pl-[76px]" style={{ background: '#1a1014', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>

      {/* Collection links — hidden on phones to keep the footer to one line */}
      <div className="hidden md:flex" style={{ alignItems: 'stretch', height: '100%' }}>
        {categories.map(({ label, color, href }) => (
          <Link
            key={label}
            href={href}
            style={{
              display: 'flex', alignItems: 'center',
              padding: '0 14px',
              fontSize: 9, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300,
              color: 'rgba(255,255,255,.3)',
              borderRight: '1px solid rgba(255,255,255,.07)',
              textDecoration: 'none',
              gap: 8,
              transition: 'color .2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.3)')}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
            {label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px 20px' }}>
        {socials.map(({ href, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 9, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300,
              color: 'rgba(255,255,255,.3)', textDecoration: 'none',
            }}
          >
            {label}
          </a>
        ))}
        <Link
          href="/shop"
          style={{
            fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 400,
            color: '#b07880', textDecoration: 'none',
          }}
        >
          Shop
        </Link>
        <Link
          href="/print-club"
          style={{
            fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 400,
            color: '#b07880', textDecoration: 'none',
          }}
        >
          Print Club
        </Link>
        <Link
          href="/gallery"
          style={{
            fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 400,
            color: '#faf8f5', borderBottom: '1px solid rgba(250,248,245,.35)', paddingBottom: 1,
            textDecoration: 'none',
          }}
        >
          View Gallery →
        </Link>
      </div>

    </footer>
  )
}
