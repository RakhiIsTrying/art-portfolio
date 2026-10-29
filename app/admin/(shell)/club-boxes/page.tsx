import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import ClubBoxEditor, { NewBoxForm } from '@/components/admin/ClubBoxEditor'
import type { ClubBox } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminClubBoxesPage() {
  const admin = getSupabaseAdminClient()
  const [{ data: boxes }, { data: pieces }] = await Promise.all([
    admin.from('club_boxes').select('*').order('month', { ascending: false }),
    admin.from('artworks').select('id, title, image_url').order('created_at', { ascending: false }),
  ])

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #d0d0d0', paddingBottom: 20 }}>
        <div style={{ width: 3, background: '#4a3a7a', marginRight: 16, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#4a3a7a', marginBottom: 6 }}>Print Club</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Club Boxes</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}><NewBoxForm /></div>
      </div>

      {!boxes?.length && (
        <p style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0' }}>
          No months yet — pick a month above and click “New month”.
        </p>
      )}

      {(boxes as ClubBox[] | null)?.map(box => <ClubBoxEditor key={box.id} box={box} pieces={pieces ?? []} />)}
    </div>
  )
}
