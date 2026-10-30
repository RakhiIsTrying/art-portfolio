import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSettings, collectionCutouts } from '@/lib/settings'
import { planForVisitor } from '@/lib/printClubServer'
import { formatPrice } from '@/lib/prints'
import Ticker from '@/components/Ticker'
import Hero from '@/components/Hero'
import FeaturedGrid from '@/components/FeaturedGrid'
import CollectionsStrip from '@/components/CollectionsStrip'
import { COLLECTIONS } from '@/lib/collections'
import type { Artwork } from '@/lib/types'

// Fresh data on every visit
export const dynamic = 'force-dynamic'

const TOP_TICKER    = '✦ POP ART  ·  DIGITAL ART  ·  SKETCHBOOK  ·  MUSIC ICONS  ·  MOVIE ART  ·  COMICS  ·  BEE BEN & DUG-DUG  ·  STICKERS  ·  CHIBI  ·  ORIGINALS'
// Front-page piece: chosen in Admin → Front page ('latest' = newest upload). Until one is chosen, KATSEYE.
const DEFAULT_HERO_TITLE = 'KATSEYE'

const BOTTOM_TICKER = '✦ AVAILABLE FOR COMMISSIONS  ·  INQUIRE FOR PRICING  ·  ORIGINAL ART & PRINTS  ·  BEE BEN & DUG-DUG  ·  DAILY PUZZLES  ·  FAN ART & ORIGINALS'

export default async function HomePage() {
  const supabase = await getSupabaseServerClient()
  // Everything the page needs, fetched side by side rather than one after another
  const [featuredRes, settings, cutouts, countRes, plan] = await Promise.all([
    supabase.from('artworks').select('*').eq('featured', true).order('featured_order', { ascending: true }).limit(9),
    getSettings(),
    collectionCutouts(),
    supabase.from('artworks').select('id', { count: 'exact', head: true }),
    planForVisitor(),
  ])
  const works = (featuredRes.data ?? []) as Artwork[]
  const totalWorks = countRes.count

  // Front-page piece: the one chosen in Admin, or KATSEYE until then, or the newest upload
  const { heroArtworkId } = settings
  const { data: pinned } = heroArtworkId === 'latest'
    ? { data: null }
    : heroArtworkId
    ? await supabase.from('artworks').select('*').eq('id', heroArtworkId).maybeSingle()
    : await supabase.from('artworks').select('*').eq('title', DEFAULT_HERO_TITLE).limit(1).maybeSingle()
  const { data: latest } = pinned
    ? { data: null }
    : await supabase.from('artworks').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()
  const hero = (pinned ?? latest) as Artwork | null

  const currency = plan === 'india' ? 'inr' : 'usd'
  const stats = {
    works: totalWorks ?? 0,
    printFrom: formatPrice(Math.min(...settings.printSizes.map(sz => sz[currency])), currency),
    clubPrice: settings.plans[plan].price,
  }

  return (
    <>
      <Ticker text={TOP_TICKER} direction="left" variant="rust" />
      <Hero latest={hero ?? undefined} label={pinned ? 'Featured Work' : 'Latest Work'} stats={stats} cutouts={cutouts} />
      <Ticker text={BOTTOM_TICKER} direction="right" variant="blush" />

      {/* ── Featured Work header ── */}
      <div style={{
        display: 'flex', alignItems: 'stretch',
        borderTop: '1px solid #d0d0d0', borderBottom: '1px solid #d0d0d0',
        background: '#e6e6e6',
      }}>
        {/* Rose colour tab */}
        <div style={{ width: 4, background: '#7a3040', flexShrink: 0 }} />
        <div style={{
          flex: 1, padding: '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <h2 style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.45em', textTransform: 'uppercase', color: '#1a1014' }}>
              Featured Work
            </h2>
            {works.length > 0 && (
              <span style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.2em', color: '#a0a0a0' }}>
                {String(works.length).padStart(2, '0')} works
              </span>
            )}
          </div>
          <a href="/gallery" style={{
            fontSize: 10, fontWeight: 400, letterSpacing: '.35em', textTransform: 'uppercase',
            color: '#7a3040', borderBottom: '1px solid #7a3040', paddingBottom: 1, textDecoration: 'none',
          }}>
            View All →
          </a>
        </div>
      </div>

      <FeaturedGrid artworks={works} />

      {/* ── Browse Collections header ── */}
      <div style={{
        display: 'flex', alignItems: 'stretch',
        borderTop: '1px solid #d0d0d0', borderBottom: '1px solid #d0d0d0',
        background: '#e6e6e6',
      }}>
        <div style={{ width: 4, background: '#1e3a8a', flexShrink: 0 }} />
        <div style={{ flex: 1, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.45em', textTransform: 'uppercase', color: '#1a1014' }}>
            Browse Collections
          </h2>
          <span style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.2em', color: '#a0a0a0' }}>
            {String(COLLECTIONS.length).padStart(2, '0')} categories
          </span>
        </div>
      </div>

      <CollectionsStrip cutouts={cutouts} />
    </>
  )
}
