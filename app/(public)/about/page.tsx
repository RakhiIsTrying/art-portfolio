import type { Metadata } from 'next'
import Link from 'next/link'
import ArtFill from '@/components/ArtFill'
import ArtistId from '@/components/ArtistId'
import ThrowMoney from '@/components/ThrowMoney'
import Ticker from '@/components/Ticker'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'About | Van Gone Broke',
  description: 'Rakhi Sinha: corporate by day, feral artist by night, and the person behind Van Gone Broke.',
}

const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'
const INK = '#1a1014'
const PORTRAIT_TITLE = 'Me & Dug-Dug'

// A joke, not a timesheet
const DAY = [
  { at: '9:00 AM', what: 'Logs on. Writes “per my last email” with love.' },
  { at: '11:30 AM', what: 'Meeting about the meeting. Draws Dug-Dug in the notes. Nods.' },
  { at: '6:30 PM', what: 'Logs off. Personality returns from its holiday.' },
  { at: '10:00 PM', what: '“Just one more layer.”' },
  { at: '2:00 AM', what: 'Layer 247. Dug-Dug judges in silence.' },
]

const DOORS = [
  { href: '/gallery', title: 'See the art', body: 'Proof that I don’t sleep.', color: '#7a3040' },
  { href: '/shop', title: 'Take some home', body: 'Fund my terrible decisions, get a print.', color: INK },
  { href: '/print-club', title: 'Join the club', body: 'Like a monthly bill, but it’s nice to you.', color: '#9a5a64' },
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

      <div style={{ margin: '-8px 0 28px' }}>
        <Ticker direction="left" variant="rust" text="★ Corporate by day ✦ Feral by night ✦ Will draw for rent ✦ Payment sounds welcome ✦ Dug-Dug approved ✦ This could have been an email" />
      </div>

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
          <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', color: '#7a5020', marginBottom: 12 }}>✦ Evidence suggests a human runs this place</p>
          <h1 style={{ fontFamily: PLAYFAIR, fontSize: 'clamp(42px, 7vw, 72px)', fontWeight: 700, lineHeight: .95, color: INK, marginBottom: 18 }}>
            Hi, I’m <span style={{ fontWeight: 400, fontStyle: 'italic', color: '#b07880' }}>Rakhi.</span>
          </h1>
          {content?.html ? (
            <div className="prose max-w-none" style={{ fontSize: 15, lineHeight: 1.8, fontWeight: 300, color: '#3a3a3a' }} dangerouslySetInnerHTML={{ __html: content.html }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 15, lineHeight: 1.8, fontWeight: 300, color: '#3a3a3a' }}>
              <p style={{ fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 'clamp(20px, 3vw, 26px)', lineHeight: 1.25, color: INK }}>Corporate by day. Absolutely feral by night.</p>
              <p>From 9 to 6:30, I am a corporate employee. I have a lanyard. I have “bandwidth.” I once said “synergy” out loud and nobody called for help.</p>
              <p>At 6:31, the lanyard comes off and something feral crawls out. It draws pop stars, movie villains and my dog until 3 AM, then logs on for the morning stand-up and says “no blockers.”</p>
              <p>I also trained as an architect, so I can walk into any room and feel disappointed. And Van Gone Broke isn’t a brand name. It’s a financial forecast.</p>
            </div>
          )}
        </div>
      </section>

      <ArtistId portraitUrl={portrait?.image_url} />

      {/* A normal day */}
      <section aria-labelledby="normal-day" style={{ marginBottom: 48 }}>
        <h2 id="normal-day" style={{ fontFamily: PLAYFAIR, fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, color: INK, marginBottom: 16 }}>
          A perfectly normal <span style={{ fontWeight: 400, fontStyle: 'italic', color: '#b07880' }}>day</span>
        </h2>
        <ol style={{ listStyle: 'none', borderTop: `2px solid ${INK}` }}>
          {DAY.map(d => (
            <li key={d.at} style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 18px', padding: '12px 0', borderBottom: '1px solid #d0d0d0' }}>
              <span style={{ width: 86, flexShrink: 0, fontSize: 12, fontWeight: 600, color: '#7a3040' }}>{d.at}</span>
              <span style={{ flex: 1, minWidth: 200, fontSize: 15, fontWeight: 300, color: '#3a3a3a', whiteSpace: 'normal' }}>{d.what}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* The bio says this works */}
      <section style={{ textAlign: 'center', marginBottom: 48 }}>
        <ThrowMoney />
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
          <a href="https://www.youtube.com/@Van_Gone_Broke" target="_blank" rel="noreferrer" style={{ padding: '12px 22px', fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500, border: `1px solid ${INK}`, color: INK, textDecoration: 'none' }}>
            YouTube
          </a>
        </div>
      </section>

    </div>
  )
}
