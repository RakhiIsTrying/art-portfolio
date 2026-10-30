'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/gallery',  label: 'Gallery', color: '#7a3040' },
  { href: '/originals', label: 'Originals', color: '#b0552f' },
  { href: '/videos',   label: 'Videos',  color: '#1e3a8a' },
  { href: '/puzzles',  label: 'Puzzles', color: '#1a6060' },
  { href: '/about',    label: 'About',   color: '#7a5020' },
  { href: '/inquire',  label: 'Inquire', color: '#4a3a7a' },
  { href: '/shop',     label: 'Shop',    color: '#1a1014' },
  { href: '/print-club', label: 'Print Club', color: '#9a5a64' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="lg:h-[44px]" style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #d0d0d0', position: 'sticky', top: 0, zIndex: 50, background: '#e6e6e6' }}>
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

      {/* Phones: tabs wrap into rows of 4 so every one stays visible */}
      <div className="grid grid-cols-4 lg:flex" style={{ flex: 1 }}>
        {navItems.map(({ href, label, color }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="h-9 lg:h-auto"
              style={{
                flex: '1 0 auto', padding: '0 4px', whiteSpace: 'nowrap',
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

      <div className="hidden xl:flex" style={{
        padding: '0 24px',
        fontSize: 9, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300,
        color: '#a0a0a0',
        borderLeft: '1px solid #d0d0d0',
        alignItems: 'center',
        background: '#e6e6e6',
        flexShrink: 0,
      }}>
        Est. 2024
      </div>
    </nav>
  )
}
