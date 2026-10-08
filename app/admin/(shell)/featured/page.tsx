import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import FeaturedPicker from '@/components/admin/FeaturedPicker'

export const dynamic = 'force-dynamic'

export default async function AdminFeaturedPage() {
  const admin = getSupabaseAdminClient()
  const { data: artworks } = await admin
    .from('artworks')
    .select('*')
    .order('title', { ascending: true })

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #d0d0d0', paddingBottom: 20 }}>
        <div style={{ width: 3, background: '#1a6060', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#1a6060', marginBottom: 6 }}>Manage</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Featured Grid</h1>
          <p style={{ fontSize: 11, letterSpacing: '.2em', fontWeight: 300, color: '#a0a0a0', marginTop: 8 }}>
            Select up to 9 artworks to show on the homepage
          </p>
        </div>
      </div>

      <FeaturedPicker artworks={artworks ?? []} />
    </div>
  )
}
