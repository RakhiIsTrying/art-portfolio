'use client'

import Link from 'next/link'

const categories = [
  { label: 'Music',    color: '#7a3040', href: '/gallery?cat=music'  },
  { label: 'Movies',   color: '#1e3a8a', href: '/gallery?cat=movies' },
  { label: 'Comics',   color: '#1a6060', href: '/gallery?cat=comics' },
  { label: 'Paper Art',color: '#7a5020', href: '/gallery?cat=paper'  },
]

const socials = [
  { href: 'https://instagram.com', label: 'Instagram' },
  { href: 'https://twitter.com',   label: 'Twitter'   },
]

export default function Footer() {
  return (
    <footer style={{ background: '#1a1014', height: 38, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 0 76px', flexShrink: 0 }}>

      <div style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
        {categories.map(({ label, color, href }) => (
          <Link
            key={label}
            href={href}
            style={{
              display: 'flex', alignItems: 'center',
              padding: '0 14px',
              fontSize: '7px', letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300,
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {socials.map(({ href, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '7px', letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300,
              color: 'rgba(255,255,255,.3)', textDecoration: 'none',
            }}
          >
            {label}
          </a>
        ))}
        <Link
          href="/gallery"
          style={{
            fontSize: '8px', letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 400,
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
