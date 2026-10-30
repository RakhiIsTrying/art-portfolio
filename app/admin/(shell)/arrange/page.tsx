import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { arrange, getSettings } from '@/lib/settings'
import { COLLECTIONS } from '@/lib/collections'
import ArrangeArt from '@/components/admin/ArrangeArt'
import type { Artwork } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminArrangePage() {
  const { data } = await getSupabaseAdminClient().from('artworks').select('*').order('created_at', { ascending: false })
  const { artworkOrder } = await getSettings()
  const byCollection = Object.fromEntries(COLLECTIONS.map(c => [
    c.slug, arrange(((data ?? []) as Artwork[]).filter(a => a.collection_slug === c.slug), artworkOrder[c.slug]),
  ]))

  return (
    <div style={{ padding: '32px 36px', maxWidth: 980, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #d0d0d0', paddingBottom: 20 }}>
        <div style={{ width: 3, background: '#7a3040', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040', marginBottom: 6 }}>Gallery &amp; shop</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Arrange art</h1>
          <p style={{ fontSize: 12, fontWeight: 300, color: '#787878', marginTop: 8 }}>
            Drag pieces into the order you want — the gallery and the shop follow it. Edit titles, medium and year, or move a piece to another collection.
          </p>
        </div>
      </div>
      <ArrangeArt collections={COLLECTIONS.map(c => ({ slug: c.slug, name: c.name }))} initial={byCollection} />
    </div>
  )
}
