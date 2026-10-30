import type { Metadata } from 'next'
import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { COLLECTIONS } from '@/lib/collections'
import { arrange, getSettings, randomCutouts } from '@/lib/settings'
import { planForVisitor } from '@/lib/printClubServer'
import ShopGrid from '@/components/shop/ShopGrid'
import { ShopSettingsProvider } from '@/components/shop/ShopSettings'
import type { Artwork } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Originals for sale | Van Gone Broke',
  description: 'One-of-one original pieces by Van Gone Broke, ready for a new home. Ask for the price.',
}

const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'

export default async function OriginalsPage() {
  const supabase = await getSupabaseServerClient()
  const [{ data }, settings, cutouts, plan] = await Promise.all([
    supabase.from('artworks').select('*').eq('original_available', true).order('created_at', { ascending: false }),
    getSettings(),
    randomCutouts(),
    planForVisitor(),
  ])
  const all = (data ?? []) as Artwork[]
  // Same order as the gallery: collection by collection, as arranged in Admin
  const originals = COLLECTIONS.flatMap(c => arrange(all.filter(a => a.collection_slug === c.slug), settings.artworkOrder[c.slug]))
  const currency = plan === 'india' ? 'inr' : 'usd'
  const hero = cutouts['bee-ben'] ?? cutouts.sketchbook

  return (
    <ShopSettingsProvider sizes={settings.printSizes} greetings={settings.greetings}>
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8 pt-8 sm:pt-12 pb-16">

        {/* Header */}
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end" style={{ marginBottom: 30, paddingBottom: 26, borderBottom: '1px solid #d0d0d0', position: 'relative' }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '.5em', textTransform: 'uppercase', color: '#b0552f', marginBottom: 12 }}>✦ One of one</p>
            <h1>
              <span style={{ display: 'block', fontFamily: PLAYFAIR, fontSize: 'clamp(42px, 7vw, 84px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', lineHeight: .92, color: '#1a1014' }}>Originals</span>
              <span style={{ display: 'block', fontFamily: PLAYFAIR, fontSize: 'clamp(42px, 7vw, 84px)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.02, color: '#b07880' }}>for sale</span>
            </h1>
            <p style={{ maxWidth: 520, fontSize: 14, lineHeight: 1.8, fontWeight: 300, color: '#787878', marginTop: 16 }}>
              The hand-made pieces themselves, each one of a kind. Pick one and ask for the price, and I’ll get back to you with shipping and timing.
            </p>
          </div>
          {hero && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hero.url} alt={hero.title} className="hidden md:block" style={{ height: 210, maxWidth: 300, objectFit: 'contain', filter: 'drop-shadow(0 14px 18px rgba(26,16,20,.25))' }} />
          )}
        </div>

        {originals.length ? (
          <ShopGrid artworks={originals} kind="original" currency={currency} />
        ) : (
          <p style={{ fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 22, color: '#a0a0a0', padding: '40px 0' }}>New originals soon.</p>
        )}

        {/* Prints and commissions */}
        <div className="grid sm:grid-cols-2 gap-4" style={{ marginTop: 40 }}>
          <Link href="/shop" className="group" style={{ background: '#1a1014', color: '#fff', padding: '24px 26px', textDecoration: 'none' }}>
            <p style={{ fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', color: '#b07880', marginBottom: 8 }}>Prefer a print?</p>
            <p style={{ fontFamily: PLAYFAIR, fontSize: 24, fontWeight: 700 }}>Prints &amp; cards <span className="inline-block transition-transform group-hover:translate-x-1">→</span></p>
          </Link>
          <Link href={`/inquire?piece=${encodeURIComponent('Commission: original piece')}`} className="group" style={{ background: '#7a3040', color: '#fff', padding: '24px 26px', textDecoration: 'none' }}>
            <p style={{ fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 8 }}>Something else in mind?</p>
            <p style={{ fontFamily: PLAYFAIR, fontSize: 24, fontWeight: 700 }}>Commission an original <span className="inline-block transition-transform group-hover:translate-x-1">→</span></p>
          </Link>
        </div>
      </div>
    </ShopSettingsProvider>
  )
}
