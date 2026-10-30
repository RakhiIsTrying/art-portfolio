import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import FeaturedPicker from '@/components/admin/FeaturedPicker'
import FrontPageEditor from '@/components/admin/FrontPageEditor'
import { getSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export default async function AdminFeaturedPage() {
  const admin = getSupabaseAdminClient()
  const { data: artworks } = await admin
    .from('artworks')
    .select('*')
    .order('title', { ascending: true })
  const { heroArtworkId } = await getSettings()
  // Until a front-page piece is chosen, the site shows KATSEYE
  const defaultHeroId = (artworks ?? []).find(a => a.title === 'KATSEYE')?.id ?? null

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 py-6 md:px-9 md:py-9" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #d0d0d0', paddingBottom: 20 }}>
        <div style={{ width: 3, background: '#1a6060', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 11, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#1a6060', marginBottom: 6 }}>Manage</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Front page</h1>
          <p style={{ fontSize: 12, letterSpacing: '.2em', fontWeight: 300, color: '#a0a0a0', marginTop: 8 }}>
            Choose the big front-page piece, the Featured pieces (up to 9) and their order
          </p>
        </div>
      </div>

      <FrontPageEditor artworks={artworks ?? []} heroId={heroArtworkId} defaultHeroId={defaultHeroId} />
      <FeaturedPicker artworks={artworks ?? []} />
    </div>
  )
}
