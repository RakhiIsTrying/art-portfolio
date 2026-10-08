'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const links = [
  { href: '/admin/artworks', label: 'Artworks', color: '#7a3040' },
  { href: '/admin/videos',   label: 'Videos',   color: '#1e3a8a' },
  { href: '/admin/featured', label: 'Featured', color: '#1a6060' },
  { href: '/admin/content',  label: 'Content',  color: '#7a5020' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside style={{ width: 200, minHeight: '100svh', background: '#1a1014', display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,.06)' }}>

      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <p style={{ fontSize: '7px', letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040', marginBottom: 6 }}>
          Admin
        </p>
        <p style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 16, fontWeight: 700, color: '#faf8f5', lineHeight: 1.1 }}>
          Van Gone<br />
          <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#b07880' }}>Broke</span>
        </p>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {links.map(({ href, label, color }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: 0,
                textDecoration: 'none', overflow: 'hidden',
                marginBottom: 2,
              }}
            >
              <div style={{ width: 3, alignSelf: 'stretch', background: active ? color : 'transparent', flexShrink: 0, transition: 'background .2s' }} />
              <div style={{
                flex: 1, padding: '10px 16px',
                fontSize: '8px', letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: active ? 500 : 300,
                color: active ? '#faf8f5' : 'rgba(250,248,245,.35)',
                background: active ? 'rgba(255,255,255,.05)' : 'transparent',
                transition: 'all .15s',
              }}>
                {label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* View site + sign out */}
      <div style={{ padding: '12px 20px 20px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Link
          href="/"
          target="_blank"
          style={{ fontSize: '7px', letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300, color: 'rgba(250,248,245,.3)', textDecoration: 'none' }}
        >
          View Site →
        </Link>
        <button
          onClick={handleLogout}
          style={{ fontSize: '7px', letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300, color: 'rgba(250,248,245,.3)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'inherit' }}
        >
          Sign Out
        </button>
      </div>

    </aside>
  )
}
