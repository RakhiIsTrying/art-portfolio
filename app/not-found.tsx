import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, paddingBlock: 48, textAlign: 'center' }} className="page-width">
        <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 700, lineHeight: 1.1, color: '#1a1014' }}>This page has gone broke.</h1>
        <p style={{ fontSize: 14, fontWeight: 300, color: '#787878' }}>It doesn’t exist, or it has wandered off. This whole website is a work in progress, after all.</p>
        <Link href="/" style={{ padding: '12px 20px', fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500, background: '#1a1014', color: '#fff', textDecoration: 'none' }}>Back home →</Link>
      </main>
      <Footer />
    </div>
  )
}
