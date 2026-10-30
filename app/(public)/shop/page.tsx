import type { Metadata } from 'next'
import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import ShopGrid from '@/components/shop/ShopGrid'
import PrintStudio from '@/components/shop/PrintStudio'
import { formatPrice, type Currency } from '@/lib/prints'
import type { Artwork } from '@/lib/types'
import { getSettings, arrange } from '@/lib/settings'
import { COLLECTIONS } from '@/lib/collections'
import { ShopSettingsProvider } from '@/components/shop/ShopSettings'
import { planForVisitor } from '@/lib/printClubServer'

export const metadata: Metadata = {
  title: 'Originals & Prints | Van Gone Broke',
  description: 'Prints and original pieces of pop culture art: music, movies, comics and Dug-Dug.',
}

const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'

const STEPS = [
  { n: '01', title: 'Pick a piece',   body: 'Browse prints below, or ask about an original.' },
  { n: '02', title: 'Choose sizes',   body: 'Pick sizes, quantities and card messages.' },
  { n: '03', title: 'Confirm & pay', body: 'I’ll confirm the total, shipping and timing.' },
]

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ piece?: string }> }) {
  // ?piece=<title> opens the print window on that piece (from the Originals page)
  const { piece } = await searchParams
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('artworks').select('*')
    .order('created_at', { ascending: false })

  const artworks = (data ?? []) as Artwork[]
  const settings = await getSettings()
  // Columns may not exist yet on older databases: default to prints on, originals off
  // Prints follow the gallery arrangement: collection by collection, in the order set in Admin
  const prints = COLLECTIONS.flatMap(c => arrange(artworks.filter(a => a.collection_slug === c.slug && a.prints_available !== false), settings.artworkOrder[c.slug]))
  const originals = artworks.filter(a => a.original_available === true)
  const plan = await planForVisitor()
  const clubPrice = settings.plans[plan].price
  // Prices show in rupees for visitors in India, dollars elsewhere
  const currency: Currency = plan === 'india' ? 'inr' : 'usd'

  return (
    <ShopSettingsProvider sizes={settings.printSizes} greetings={settings.greetings}>
    <div style={{ maxWidth: 1200, margin: '0 auto' }} className="px-5 md:px-9 pt-9 pb-16">

      {/* Header */}
      <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end" style={{ paddingBottom: 28, marginBottom: 28, borderBottom: '1px solid #d0d0d0' }}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{ width: 3, background: '#1a1014', marginRight: 18, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 10, letterSpacing: '.5em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040', marginBottom: 12 }}>
              ✦ Shop
            </p>
            <h1>
              <span style={{ display: 'block', fontFamily: PLAYFAIR, fontSize: 'clamp(34px, 5vw, 58px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', lineHeight: .95, color: '#1a1014' }}>
                Originals
              </span>
              <span style={{ display: 'block', fontFamily: PLAYFAIR, fontSize: 'clamp(34px, 5vw, 58px)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.05, color: '#b07880' }}>
                &amp; Prints
              </span>
            </h1>
            <p style={{ maxWidth: 440, marginTop: 16, fontSize: 13, lineHeight: 1.8, fontWeight: 300, color: '#787878' }}>
              {settings.shopIntro}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              <a href="#prints" style={{ padding: '8px 14px', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', background: '#1a1014', color: '#fff', textDecoration: 'none' }}>Prints &amp; cards ↓</a>
              <a href="/originals" style={{ padding: '8px 14px', fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', background: '#7a3040', color: '#fff', textDecoration: 'none' }}>
                Originals for sale{originals.length ? ` · ${originals.length}` : ''} →
              </a>
            </div>
          </div>
        </div>

        {/* How it works */}
        <ol className="grid grid-cols-1 sm:grid-cols-3 lg:w-[480px]" style={{ listStyle: 'none', border: '1px solid #d0d0d0', background: '#d0d0d0', gap: 1 }}>
          {STEPS.map(s => (
            <li key={s.n} style={{ background: '#e6e6e6', padding: '14px 14px 16px' }}>
              <p style={{ fontSize: 10, letterSpacing: '.3em', color: '#b07880', marginBottom: 8 }}>{s.n}</p>
              <p style={{ fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014', marginBottom: 6 }}>{s.title}</p>
              <p style={{ fontSize: 11, lineHeight: 1.6, fontWeight: 300, color: '#787878' }}>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Print Club */}
      <Link
        href="/print-club"
        className="group grid sm:grid-cols-[auto_1fr_auto] gap-x-6 gap-y-2 items-center"
        style={{ marginBottom: 40, padding: '18px 22px', background: '#fff', border: '1px solid #d0d0d0', borderLeft: '4px solid #7a3040', textDecoration: 'none' }}
      >
        <span style={{ fontFamily: PLAYFAIR, fontSize: 26, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>
          {clubPrice}<span style={{ fontFamily: 'inherit', fontSize: 11, fontWeight: 300, color: '#787878' }}> / mo</span>
        </span>
        <span>
          <span style={{ display: 'block', fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 500, color: '#7a3040', marginBottom: 4 }}>Print Club</span>
          <span style={{ fontSize: 13, fontWeight: 300, color: '#787878' }}>A new print in your mailbox every month.</span>
        </span>
        <span className="group-hover:[color:#7a3040] group-hover:[border-color:#7a3040]" style={{ justifySelf: 'start', fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014', borderBottom: '1px solid #1a1014', paddingBottom: 1, transition: 'color .2s, border-color .2s' }}>
          Join the club →
        </span>
      </Link>

      {/* Originals for sale: pieces marked "original for sale" in Admin → Arrange art */}
      <section id="originals" style={{ scrollMarginTop: 60, marginBottom: 56 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #d0d0d0' }}>
          <h2 style={{ fontFamily: PLAYFAIR, fontSize: 26, fontWeight: 700, color: '#1a1014' }}>Originals for sale</h2>
          <span style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.3em', textTransform: 'uppercase', color: '#a0a0a0' }}>
            {originals.length ? `${originals.length} one-of-one ${originals.length === 1 ? 'piece' : 'pieces'} · price on request` : 'One of one · price on request'}
          </span>
        </div>

        {originals.length > 0 && <ShopGrid artworks={originals} kind="original" currency={currency} showFilters={false} />}

        {/* Commission card, always offered */}
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center" style={{ marginTop: originals.length ? 24 : 0, background: '#1a1014', padding: '28px 30px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #7a3040 25%, #1e3a8a 25% 50%, #1a6060 50% 75%, #7a5020 75%)' }} />
          <div>
            <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', color: '#b07880', marginBottom: 10 }}>
              {originals.length ? 'Want something else?' : 'New originals coming soon'}
            </p>
            <p style={{ fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 'clamp(22px, 2.6vw, 30px)', lineHeight: 1.2, color: '#fff', marginBottom: 8 }}>
              Commission an original: your icon, your pet, your moment.
            </p>
            <p style={{ fontSize: 12, fontWeight: 300, lineHeight: 1.7, color: 'rgba(255,255,255,.55)', maxWidth: 520 }}>
              Digital or traditional, drawn by hand from scratch. Tell me what you have in mind.
            </p>
          </div>
          <Link
            href={`/inquire?piece=${encodeURIComponent('Commission: original piece')}`}
            className="hover:[background:#b07880] hover:[border-color:#b07880]"
            style={{
              justifySelf: 'start', fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 500,
              color: '#fff', border: '1px solid rgba(255,255,255,.6)', padding: '13px 22px', textDecoration: 'none',
              transition: 'background .25s, border-color .25s', whiteSpace: 'nowrap',
            }}
          >
            Start a commission →
          </Link>
        </div>
      </section>

      {/* Prints, order window on the left, scale previews on the right */}
      <section id="prints" style={{ marginBottom: 56, scrollMarginTop: 60 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
          <h2 style={{ fontFamily: PLAYFAIR, fontSize: 26, fontWeight: 700, color: '#1a1014' }}>Prints &amp; cards</h2>
          <span style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.3em', textTransform: 'uppercase', color: '#a0a0a0' }}>
            From {formatPrice(Math.min(...settings.printSizes.map(s => s[currency])), currency)}
          </span>
        </div>
        {prints.length > 0 ? (
          <PrintStudio artworks={prints} currency={currency} initialTitle={piece ?? 'Happy Pupper Dug-Dug'} />
        ) : (
          <p style={{ fontSize: 11, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0', padding: '40px 0' }}>
            Prints coming soon.
          </p>
        )}
      </section>

    </div>
    </ShopSettingsProvider>
  )
}
