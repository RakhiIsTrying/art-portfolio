import type { Metadata } from 'next'
import Link from 'next/link'
import ArtFill from '@/components/ArtFill'
import ArtistId from '@/components/ArtistId'
import ThrowMoney from '@/components/ThrowMoney'
import Timesheet from '@/components/Timesheet'
import { currencyForCountry } from '@/lib/currency'
import { countryForVisitor } from '@/lib/printClubServer'
import Ticker from '@/components/Ticker'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'About | Van Gone Broke',
  description: 'Rakhi Sinha: corporate by day, feral artist by night, and the person behind Van Gone Broke.',
}

const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'
const INK = '#1a1014'
const INTRO_TITLE = 'CEO of Zoomies'
const ID_PHOTO_TITLE = 'Me & Dug-Dug'

const DOORS = [
  { href: '/gallery', title: 'See the art', body: 'Proof that I don’t sleep.', color: '#7a3040' },
  { href: '/shop', title: 'Take some home', body: 'Fund my terrible decisions, get a print.', color: INK },
  { href: '/print-club', title: 'Join the club', body: 'Like a monthly bill, but it’s nice to you.', color: '#9a5a64' },
  { href: '/puzzles', title: 'Play puzzles', body: 'Six a day, hosted by Bee, Ben and Dug-Dug.', color: '#1a6060' },
]

export default async function AboutPage() {
  const supabase = await getSupabaseServerClient()
  const [{ data: page }, { data: art }] = await Promise.all([
    supabase.from('pages').select('content_json').eq('slug', 'about').single(),
    supabase.from('artworks').select('title, image_url').in('title', [INTRO_TITLE, ID_PHOTO_TITLE]),
  ])
  const content = page?.content_json as { html?: string } | null
  const intro = art?.find(a => a.title === INTRO_TITLE)
  const idPhoto = art?.find(a => a.title === ID_PHOTO_TITLE)

  return (
    <>
    {/* Full width, straight under the menu, like the banners on the front page */}
    <Ticker direction="left" variant="rust" text="★ Corporate by day ✦ Feral by night ✦ Will draw for rent ✦ Payment sounds welcome ✦ Dug-Dug approved ✦ This could have been an email" />
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
        {intro && (
          <figure style={{ background: '#fff', padding: '12px 12px 10px', boxShadow: '0 22px 50px rgba(26,16,20,.2)', transform: 'rotate(-2deg)' }}>
            <div style={{ position: 'relative', aspectRatio: '4/5' }}>
              <ArtFill src={intro.image_url} alt="Rakhi hugging Dug-Dug in a sunny park, drawn by Rakhi" sizes="(max-width: 768px) 90vw, 400px" priority />
            </div>
            <figcaption style={{ marginTop: 8, fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 14, textAlign: 'center', color: INK }}>My manager, Dug-Dug, CEO of Zoomies</figcaption>
          </figure>
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
              <p style={{ fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 'clamp(20px, 3vw, 26px)', lineHeight: 1.25, color: INK }}>Running away from responsibilities and human interaction since 2024.</p>
              <p>I have a corporate job. I attend its meetings the way a hostage attends a birthday party: smiling, nodding, one eye on the door. I say yes to everything. I am a money-hungry yes-woman and the machine goes ding.</p>
              <p>At 6:30 I sprint home to a 70lb chocolate lab who has never once asked me to align on anything. I have put him in Squid Game. I have put him in a thug life. He told me my skin barrier was looking a little ruff. He was right. I haven’t slept since Naruto.</p>
              <p>Every piece I make ends with me asking, at 3 AM, “should the dog be in this one too?” He snores in response. It’s the best feedback I’ve had all quarter.</p>
              <p>I also trained as an architect, so I can walk into any room and feel disappointed. And Van Gone Broke isn’t a brand name. It’s a financial forecast.</p>
            </div>
          )}
        </div>
      </section>

      <ArtistId portraitUrl={idPhoto?.image_url} />

      <Timesheet />

      {/* The bio says this works */}
      <section style={{ textAlign: 'center', marginBottom: 48 }}>
        <ThrowMoney currency={currencyForCountry(await countryForVisitor())} />
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
    </>
  )
}
