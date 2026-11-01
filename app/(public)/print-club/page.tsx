import Link from 'next/link'
import type { Metadata } from 'next'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import PrintClubForm from '@/components/PrintClubForm'
import { tierPrice, TIER_IDS, TIERS } from '@/lib/printClub'
import { getSettings } from '@/lib/settings'
import { countryForVisitor, planForVisitor } from '@/lib/printClubServer'
import type { Artwork } from '@/lib/types'
import ArtFill from '@/components/ArtFill'
import PerkIcon from '@/components/PerkIcon'

export const metadata: Metadata = {
  title: 'Print Club | Van Gone Broke',
  description: 'A new Van Gone Broke print in your mailbox every month.',
}

const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'

// Fanned stack of recent pieces
const FAN = [
  { rotate: -9, x: -38, y: 14, z: 1 },
  { rotate: 7,  x: 42,  y: 8,  z: 2 },
  { rotate: -1, x: 0,   y: 0,  z: 3 },
]

export default async function PrintClubPage() {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('artworks').select('*')
    .order('created_at', { ascending: false })
    .limit(3)
  const pieces = (data ?? []) as Artwork[]
  const visitorPlan = await planForVisitor()
  const visitorCountry = await countryForVisitor()
  const PLANS = (await getSettings()).plans

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }} className="px-5 md:px-9 pt-10 pb-16">

      <div className="grid md:grid-cols-[1.1fr_1fr] gap-12 md:gap-16 items-center" style={{ marginBottom: 56 }}>

        {/* Pitch */}
        <div>
          <p style={{ fontSize: 10, letterSpacing: '.5em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040', marginBottom: 14 }}>
            ✦ Members
          </p>
          <h1 style={{ marginBottom: 22 }}>
            <span style={{ display: 'block', fontFamily: PLAYFAIR, fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', lineHeight: .95, color: '#1a1014' }}>
              Print
            </span>
            <span style={{ display: 'block', fontFamily: PLAYFAIR, fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.05, color: '#b07880' }}>
              Club
            </span>
          </h1>

          <p style={{ maxWidth: 440, fontSize: 14, lineHeight: 1.8, fontWeight: 300, color: '#787878', marginBottom: 30 }}>
            Art in your mailbox instead of bills. Join the club and get a new Van Gone Broke print every month.
          </p>

          <Link href="/print-club/boxes" className="group"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 20, fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 500, color: '#7a3040', textDecoration: 'none' }}>
            See past boxes &amp; unboxings <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Fanned prints */}
        <div aria-hidden="true" style={{ position: 'relative', height: 'clamp(340px, 46vw, 480px)' }}>
          <div style={{ position: 'absolute', inset: '8% 4%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(176,120,128,.28), transparent 65%)' }} />
          {pieces.map((art, i) => {
            const f = FAN[i + (FAN.length - pieces.length)]
            return (
              <div key={art.id} style={{
                position: 'absolute', left: '50%', top: '50%', width: '54%', aspectRatio: '4/5',
                transform: `translate(calc(-50% + ${f.x}%), calc(-50% + ${f.y}px)) rotate(${f.rotate}deg)`,
                zIndex: f.z, background: '#fff', padding: '5%',
                boxShadow: '0 22px 50px rgba(26,16,20,.22), 0 3px 10px rgba(26,16,20,.12)',
              }}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <ArtFill src={art.image_url} sizes="(max-width: 768px) 50vw, 300px" priority={i === pieces.length - 1} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tiers, priced for the visitor's region first */}
      <section aria-label="Membership tiers" className="grid lg:grid-cols-3 gap-5" style={{ marginBottom: 56 }}>
        {TIER_IDS.map(id => {
          const tier = TIERS[id]
          const other = visitorPlan === 'india' ? 'international' : 'india'
          return (
            <div key={id} style={{ minWidth: 0, display: 'flex', flexDirection: 'column', padding: '24px 24px 22px', background: '#fff', border: '1px solid #d0d0d0', borderTop: `4px solid ${tier.color}` }}>
              <p style={{ fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 'clamp(24px, 2.6vw, 30px)', lineHeight: 1.15, color: '#1a1014', marginBottom: 6, whiteSpace: 'normal' }}>{tier.name}</p>
              <p style={{ fontSize: 13, fontWeight: 300, color: '#787878', marginBottom: 18 }}>{tier.tagline}</p>
              <p style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: PLAYFAIR, fontSize: 40, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>{tierPrice(PLANS[visitorPlan], id)}</span>
                <span style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 300, color: '#787878' }}>/ month · {PLANS[visitorPlan].region}</span>
              </p>
              <p style={{ fontSize: 11, fontWeight: 300, color: '#a0a0a0', marginBottom: 18 }}>
                {PLANS[other].region}: {tierPrice(PLANS[other], id)} / month
              </p>
              <ul style={{ listStyle: 'none', borderTop: '1px solid #d0d0d0', marginBottom: 20, flex: 1 }}>
                {tier.perks.map(p => (
                  <li key={p.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: '1px solid #ebebeb' }}>
                    <PerkIcon id={p.icon} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: PLAYFAIR, fontSize: 18, fontWeight: 700, lineHeight: 1.2, color: '#1a1014', marginBottom: 4, whiteSpace: 'normal' }}>{p.title}</p>
                      <p style={{ fontSize: 12, lineHeight: 1.7, fontWeight: 300, color: '#787878', whiteSpace: 'normal' }}>{p.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href={`/print-club?tier=${id}#apply`} className="hover:opacity-85"
                    style={{ textAlign: 'center', padding: '13px 18px', fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500, textDecoration: 'none', background: tier.color, color: '#fff', transition: 'opacity .25s' }}>
                Choose this tier →
              </Link>
            </div>
          )
        })}
      </section>

      {/* Sign-up */}
      <div id="apply" className="grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16" style={{ background: '#fff', border: '1px solid #d0d0d0', position: 'relative', scrollMarginTop: 84 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7a3040 25%, #1e3a8a 25% 50%, #1a6060 50% 75%, #7a5020 75%)' }} />
        <div className="p-7 md:p-10 md:pr-0">
          <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040', marginBottom: 12 }}>
            Apply to join
          </p>
          <p style={{ fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 'clamp(24px, 2.6vw, 32px)', lineHeight: 1.2, color: '#1a1014', marginBottom: 14 }}>
            A little art, every month.
          </p>
          <p style={{ fontSize: 12, lineHeight: 1.8, fontWeight: 300, color: '#787878' }}>
            From {PLANS.india.digitalPrice} a month in India, {PLANS.international.digitalPrice} internationally. Cancel anytime. Tell me where to reach you, and where to send your prints if you’re getting them by mail, and I’ll be in touch to get you set up.
          </p>
        </div>
        <div className="p-7 md:p-10 md:pl-0">
          <PrintClubForm defaultPlan={visitorPlan} visitorCountry={visitorCountry} plans={PLANS} />
        </div>
      </div>

    </div>
  )
}
