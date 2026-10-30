'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/env'

const links = [
  { href: '/admin/inbox',    label: 'Inbox',    color: '#1e3a8a' },
  { href: '/admin/artworks', label: 'Artworks', color: '#7a3040' },
  { href: '/admin/arrange',  label: 'Arrange art', color: '#7a3040' },
  { href: '/admin/featured', label: 'Front page', color: '#1a6060' },
  { href: '/admin/videos',   label: 'Videos',   color: '#1e3a8a' },
  { href: '/admin/shop',     label: 'Shop settings', color: '#a0521d' },
  { href: '/admin/content',  label: 'Content',  color: '#7a5020' },
  { href: '/admin/print-club', label: 'Print Club', color: '#4a3a7a' },
  { href: '/admin/club-boxes', label: 'Club Boxes', color: '#4a3a7a' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    )
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const linkRow = (vertical: boolean) => links.map(({ href, label, color }) => {
    const active = pathname.startsWith(href)
    return (
      <Link key={href} href={href} aria-current={active ? 'page' : undefined}
        style={vertical ? {
          display: 'block', padding: '11px 18px', marginBottom: 1, textDecoration: 'none',
          borderLeft: `3px solid ${active ? color : 'transparent'}`,
          fontSize: 12, letterSpacing: '.28em', textTransform: 'uppercase', fontWeight: active ? 500 : 400,
          color: active ? '#faf8f5' : 'rgba(250,248,245,.55)', background: active ? 'rgba(255,255,255,.06)' : 'transparent',
        } : {
          flexShrink: 0, padding: '11px 14px', textDecoration: 'none',
          borderBottom: `3px solid ${active ? color : 'transparent'}`,
          fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: active ? 500 : 400,
          color: active ? '#faf8f5' : 'rgba(250,248,245,.6)',
        }}>
        {label}
      </Link>
    )
  })

  const brand = (
    <p style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 17, fontWeight: 700, color: '#faf8f5', lineHeight: 1.1 }}>
      Van Gone <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#b07880' }}>Broke</span>
      <span style={{ display: 'block', fontFamily: 'inherit', fontSize: 11, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 400, color: '#b07880', marginTop: 4 }}>Admin</span>
    </p>
  )
  const small: React.CSSProperties = { fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(250,248,245,.6)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', whiteSpace: 'nowrap' }

  return (
    <>
      {/* Phones and iPads: a top bar, with tabs you can swipe sideways */}
      <header className="lg:hidden" style={{ position: 'sticky', top: 0, zIndex: 40, background: '#1a1014' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px 8px' }}>
          {brand}
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/" target="_blank" style={small}>View site ↗</Link>
            <button onClick={handleLogout} style={small}>Sign out</button>
          </div>
        </div>
        <nav style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          {linkRow(false)}
        </nav>
      </header>

      {/* Laptops: a sidebar */}
      <aside className="hidden lg:flex" style={{ width: 220, height: '100svh', position: 'sticky', top: 0, background: '#1a1014', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>{brand}</div>
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>{linkRow(true)}</nav>
        <div style={{ padding: '14px 20px 20px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <Link href="/" target="_blank" style={small}>View site ↗</Link>
          <button onClick={handleLogout} style={small}>Sign out</button>
        </div>
      </aside>
    </>
  )
}
