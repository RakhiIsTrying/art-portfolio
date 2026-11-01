import type { Metadata } from 'next'
import Link from 'next/link'
import ArtFill from '@/components/ArtFill'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'About | Van Gone Broke',
  description: 'Rakhi Sinha: architect, artist and the person behind Van Gone Broke, making pop culture art by hand and on screen.',
}

const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'
const INK = '#1a1014'
const PORTRAIT_TITLE = 'Me & Dug-Dug'

// The artist's Instagram bio, as a set of ID card details
const ID_CARD = [
  { label: 'Occupation', value: 'Architect, artist, money-hungry yes-woman', color: '#7a3040' },
  { label: 'Pronoun', value: 'Pauvre', color: '#1e3a8a' },
  { label: 'Responds to', value: 'Machine payment sounds, or money being thrown at me', color: '#1a6060' },
  { label: 'Condition', value: 'Paw-sessed woof worshipper', color: '#7a5020' },
]

const DOORS = [
  { href: '/gallery', title: 'See the art', body: 'Music, movies, comics, sketchbook and Dug-Dug.', color: '#7a3040' },
  { href: '/shop', title: 'Take some home', body: 'Prints and cards, made to order.', color: INK },
  { href: '/print-club', title: 'Join the club', body: 'New art, every single month.', color: '#9a5a64' },
  { href: '/puzzles', title: 'Play puzzles', body: 'Six a day, hosted by Bee, Ben and Dug-Dug.', color: '#1a6060' },
]

export default async function AboutPage() {
  const supabase = await getSupabaseServerClient()
  const [{ data: page }, { data: portrait }] = await Promise.all([
    supabase.from('pages').select('content_json').eq('slug', 'about').single(),
    supabase.from('artworks').select('title, image_url').eq('title', PORTRAIT_TITLE).maybeSingle(),
  ])
  const content = page?.content_json as { html?: string } | null

  return (
    <div className="px-4 sm:px-9 pt-8 sm:pt-10 pb-16" style={{ maxWidth: 1040, margin: '0 auto' }}>

      {/* The whole site is still being built */}
      <div role="note" style={{ background: '#e8c55a', border: `3px solid ${INK}`, marginBottom: 40 }}>
        <div aria-hidden style={{ height: 12, background: `repeating-linear-gradient(135deg, ${INK} 0 14px, #e8c55a 14px 28px)` }} />
        <div style={{ padding: 'clamp(20px, 4vw, 36px)', textAlign: 'center' }}>
          <p style={{ fontFamily: PLAYFAIR, fontSize: 'clamp(30px, 7.5vw, 68px)', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, color: INK }}>
            This whole website is a WIP
          </p>
          <p style={{ marginTop: 12, fontSize: 'clamp(13px, 2vw, 16px)', fontWeight: 500, lineHeight: 1.6, color: INK }}>
            Work in progress: things will move, change and occasionally wander off. Thanks for visiting while the paint is still wet.
          </p>
        </div>
        <div aria-hidden style={{ height: 12, background: `repeating-linear-gradient(135deg, ${INK} 0 14px, #e8c55a 14px 28px)` }} />
      </div>

      {/* Who */}
      <section className="grid md:grid-cols-[2fr_3fr] gap-8 md:gap-12 items-center" style={{ marginBottom: 48 }}>
        {portrait && (
          <div style={{ background: '#fff', padding: 12, boxShadow: '0 22px 50px rgba(26,16,20,.2)', transform: 'rotate(-2deg)' }}>
            <div style={{ position: 'relative', aspectRatio: '4/5' }}>
              <ArtFill src={portrait.image_url} alt="Rakhi and Dug-Dug, drawn by Rakhi" sizes="(max-width: 768px) 90vw, 400px" priority />
            </div>
          </div>
        )}
        <div>
          <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', color: '#7a5020', marginBottom: 12 }}>✦ The human behind Van Gone Broke</p>
          <h1 style={{ fontFamily: PLAYFAIR, fontSize: 'clamp(42px, 7vw, 72px)', fontWeight: 700, lineHeight: .95, color: INK, marginBottom: 18 }}>
            Hi, I’m <span style={{ fontWeight: 400, fontStyle: 'italic', color: '#b07880' }}>Rakhi.</span>
          </h1>
          {content?.html ? (
            <div className="prose max-w-none" style={{ fontSize: 15, lineHeight: 1.8, fontWeight: 300, color: '#3a3a3a' }} dangerouslySetInnerHTML={{ __html: content.html }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 15, lineHeight: 1.8, fontWeight: 300, color: '#3a3a3a' }}>
              <p>By training, I’m an architect. By compulsion, I draw: the music, movies and comics I can’t stop thinking about, in digital and traditional media.</p>
              <p>The name is a promise: I’ll keep making art until I’ve gone completely broke, or you’ve bought enough of it that I haven’t.</p>
            </div>
          )}
        </div>
      </section>

      {/* The Instagram bio, as an ID card */}
      <section aria-labelledby="id-card" style={{ background: '#fff', border: `2px solid ${INK}`, marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 16px', padding: '12px 20px', background: INK, color: '#fff' }}>
          <h2 id="id-card" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.35em', textTransform: 'uppercase' }}>Official artist ID</h2>
          <span style={{ fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)' }}>Est. 2024</span>
        </div>
        <dl className="grid sm:grid-cols-2">
          {ID_CARD.map(row => (
            <div key={row.label} style={{ padding: '20px', borderTop: '1px solid #ebebeb', borderLeft: `4px solid ${row.color}` }}>
              <dt style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 500, color: row.color, marginBottom: 6 }}>{row.label}</dt>
              <dd style={{ fontFamily: PLAYFAIR, fontSize: 'clamp(19px, 2.4vw, 24px)', lineHeight: 1.25, color: INK }}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Where to next */}
      <section aria-label="Where to next" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" style={{ marginBottom: 48 }}>
        {DOORS.map(d => (
          <Link key={d.href} href={d.href} className="group" style={{ display: 'block', padding: '20px 18px', background: d.color, color: '#fff', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontFamily: PLAYFAIR, fontSize: 21, fontWeight: 700, lineHeight: 1.15, marginBottom: 6 }}>
              {d.title} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </span>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 300, lineHeight: 1.6, color: 'rgba(255,255,255,.8)', whiteSpace: 'normal' }}>{d.body}</span>
          </Link>
        ))}
      </section>

      {/* Sign-off */}
      <section style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 'clamp(24px, 4vw, 38px)', lineHeight: 1.2, color: INK, marginBottom: 18 }}>
          Got an idea, a pet or a pile of money to throw?
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          <Link href="/inquire" className="hover:[background:#7a3040]" style={{ padding: '13px 22px', fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500, background: INK, color: '#fff', textDecoration: 'none', transition: 'background .25s' }}>
            Get in touch →
          </Link>
          <a href="https://www.instagram.com/van_gone_broke/" target="_blank" rel="noreferrer" style={{ padding: '12px 22px', fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500, border: `1px solid ${INK}`, color: INK, textDecoration: 'none' }}>
            @van_gone_broke
          </a>
        </div>
      </section>

    </div>
  )
}
