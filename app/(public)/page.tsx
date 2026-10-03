import { getSupabaseServerClient } from '@/lib/supabase/server'
import Ticker from '@/components/Ticker'
import Hero from '@/components/Hero'
import FeaturedGrid from '@/components/FeaturedGrid'
import CollectionsStrip from '@/components/CollectionsStrip'
import type { Artwork } from '@/lib/types'

const TOP_TICKER    = '★ POP ART  ✦ DIGITAL ART  ★ PAPER ART  ✦ MUSIC ICONS  ★ MOVIE ART  ✦ COMICS  ★ BEE BEN & DUG-DUG  ✦ STICKERS  ★ CHIBI  ✦ ORIGINALS'
const BOTTOM_TICKER = '★ AVAILABLE FOR COMMISSIONS  ✦ INQUIRE FOR PRICING  ★ ORIGINAL ART & PRINTS  ✦ BEE BEN & DUG-DUG  ★ STICKERS & PAPER CUTS  ✦ FAN ART & ORIGINALS'

export default async function HomePage() {
  const supabase = await getSupabaseServerClient()
  const { data: artworks } = await supabase
    .from('artworks')
    .select('*')
    .eq('featured', true)
    .order('featured_order', { ascending: true })
    .limit(9)

  return (
    <>
      <Ticker text={TOP_TICKER} direction="left" variant="rust" />
      <Hero />
      <Ticker text={BOTTOM_TICKER} direction="right" variant="blush" />

      <div className="px-8 py-3 border-y-[3px] border-ink flex justify-between items-center bg-cream">
        <h2 className="text-[11px] font-black uppercase tracking-[4px] text-ink">
          ✦ Featured Work
        </h2>
        <a href="/gallery"
           className="text-[9px] font-black uppercase tracking-widest
                      text-rust border-b-2 border-rust">
          See All Collections →
        </a>
      </div>

      <FeaturedGrid artworks={(artworks ?? []) as Artwork[]} />

      <div className="px-8 py-3 border-y-[3px] border-ink bg-cream">
        <h2 className="text-[11px] font-black uppercase tracking-[4px] text-ink">
          ✦ Browse Collections
        </h2>
      </div>

      <CollectionsStrip />
    </>
  )
}
