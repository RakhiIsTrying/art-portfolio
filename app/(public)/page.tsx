import { getSupabaseServerClient } from '@/lib/supabase/server'
import Ticker from '@/components/Ticker'
import Hero from '@/components/Hero'
import FeaturedGrid from '@/components/FeaturedGrid'
import CollectionsStrip from '@/components/CollectionsStrip'
import type { Artwork } from '@/lib/types'

const TOP_TICKER    = '✦ POP ART  ·  DIGITAL ART  ·  PAPER ART  ·  MUSIC ICONS  ·  MOVIE ART  ·  COMICS  ·  BEE BEN & DUG-DUG  ·  STICKERS  ·  CHIBI  ·  ORIGINALS'
const BOTTOM_TICKER = '✦ AVAILABLE FOR COMMISSIONS  ·  INQUIRE FOR PRICING  ·  ORIGINAL ART & PRINTS  ·  BEE BEN & DUG-DUG  ·  STICKERS & PAPER CUTS  ·  FAN ART & ORIGINALS'

export default async function HomePage() {
  const supabase = await getSupabaseServerClient()
  const { data: artworks } = await supabase
    .from('artworks')
    .select('*')
    .eq('featured', true)
    .order('featured_order', { ascending: true })
    .limit(9)

  const works = (artworks ?? []) as Artwork[]

  return (
    <>
      <Ticker text={TOP_TICKER} direction="left" variant="rust" />
      <Hero />
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
            <h2 style={{ fontSize: '8px', fontWeight: 500, letterSpacing: '.45em', textTransform: 'uppercase', color: '#1a1014' }}>
              Featured Work
            </h2>
            {works.length > 0 && (
              <span style={{ fontSize: '7px', fontWeight: 300, letterSpacing: '.2em', color: '#a0a0a0' }}>
                {String(works.length).padStart(2, '0')} works
              </span>
            )}
          </div>
          <a href="/gallery" style={{
            fontSize: '7px', fontWeight: 400, letterSpacing: '.35em', textTransform: 'uppercase',
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
          <h2 style={{ fontSize: '8px', fontWeight: 500, letterSpacing: '.45em', textTransform: 'uppercase', color: '#1a1014' }}>
            Browse Collections
          </h2>
          <span style={{ fontSize: '7px', fontWeight: 300, letterSpacing: '.2em', color: '#a0a0a0' }}>
            05 categories
          </span>
        </div>
      </div>

      <CollectionsStrip />
    </>
  )
}
