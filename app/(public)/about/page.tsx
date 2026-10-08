import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function AboutPage() {
  const supabase = await getSupabaseServerClient()
  const { data: page } = await supabase
    .from('pages').select('content_json')
    .eq('slug', 'about').single()

  const content = page?.content_json as { html?: string } | null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 36px 60px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 36, paddingBottom: 20, borderBottom: '1px solid #d0d0d0' }}>
        <div style={{ width: 3, background: '#7a5020', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#7a5020', marginBottom: 6 }}>The Studio</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 30, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>About</h1>
        </div>
      </div>

      {content?.html ? (
        <div
          style={{ fontSize: 14, lineHeight: 1.8, fontWeight: 300, color: '#3a3a3a' }}
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid #d0d0d0' }}>
          {/* Left: placeholder art panel */}
          <div style={{ position: 'relative', aspectRatio: '1', borderRight: '1px solid #d0d0d0', overflow: 'hidden', background: '#1a1014' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 55% 30%, rgba(122,48,64,.3) 0%, transparent 55%), radial-gradient(ellipse at 25% 70%, rgba(30,58,138,.2) 0%, transparent 50%), linear-gradient(148deg, #221218 0%, #0e1622 60%, #101c1c 100%)',
            }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7a3040 25%, #1e3a8a 25% 50%, #1a6060 50% 75%, #7a5020 75%)' }} />
          </div>

          {/* Right: bio content */}
          <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#fff' }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040', marginBottom: 12 }}>
                ✦ The artist
              </p>
              <h2 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 26, fontWeight: 700, color: '#1a1014', lineHeight: 1, marginBottom: 6 }}>
                Van Gone
              </h2>
              <h2 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 26, fontWeight: 400, fontStyle: 'italic', color: '#b07880', lineHeight: 1.1, marginBottom: 20 }}>
                Broke
              </h2>
              <div style={{ width: 24, height: 1, background: '#7a3040', marginBottom: 20 }} />
              <p style={{ fontSize: 13, lineHeight: 1.8, fontWeight: 300, color: '#787878' }}>
                Pop culture digital and paper art — music, movies, comics, originals. An original hand-crafted lens on the icons and moments that define culture.
              </p>
            </div>
            <Link
              href="/inquire"
              style={{
                display: 'inline-block', marginTop: 28,
                fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 400,
                color: '#1a1014', borderBottom: '1px solid #1a1014', paddingBottom: 2, textDecoration: 'none',
              }}
            >
              Get in Touch →
            </Link>
          </div>
        </div>
      )}

    </div>
  )
}
