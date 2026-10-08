'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/gallery',  label: 'Gallery', color: '#7a3040' },
  { href: '/videos',   label: 'Videos',  color: '#1e3a8a' },
  { href: '/puzzles',  label: 'Puzzles', color: '#1a6060' },
  { href: '/about',    label: 'About',   color: '#7a5020' },
  { href: '/inquire',  label: 'Inquire', color: '#4a3a7a' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav style={{ display: 'flex', alignItems: 'stretch', height: '44px', borderBottom: '1px solid #d0d0d0', position: 'sticky', top: 0, zIndex: 50, background: '#e6e6e6' }}>
      <Link
        href="/"
        style={{
          padding: '0 24px',
          fontSize: 10, letterSpacing: '.55em', textTransform: 'uppercase', fontWeight: 600,
          color: '#7a3040',
          borderRight: '1px solid #d0d0d0',
          display: 'flex', alignItems: 'center',
          textDecoration: 'none',
          flexShrink: 0,
          background: '#e6e6e6',
        }}
      >
        VGB
      </Link>

      <div style={{ display: 'flex', flex: 1 }}>
        {navItems.map(({ href, label, color }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, letterSpacing: '.4em', textTransform: 'uppercase',
                fontWeight: active ? 500 : 300,
                color: active ? '#fff' : 'rgba(255,255,255,.6)',
                background: color,
                borderRight: '1px solid rgba(255,255,255,.1)',
                textDecoration: 'none',
                transition: 'filter .2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
            >
              {label}
            </Link>
          )
        })}
      </div>

      <div style={{
        padding: '0 24px',
        fontSize: 9, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300,
        color: '#a0a0a0',
        borderLeft: '1px solid #d0d0d0',
        display: 'flex', alignItems: 'center',
        background: '#e6e6e6',
        flexShrink: 0,
      }}>
        Est. 2024
      </div>
    </nav>
  )
}
