import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import ContentEditorForm from './ContentEditorForm'

export const dynamic = 'force-dynamic'

export default async function AdminContentPage() {
  const admin = getSupabaseAdminClient()
  const { data: pages } = await admin
    .from('pages')
    .select('*')
    .in('slug', ['puzzles', 'about'])

  const puzzles = pages?.find(p => p.slug === 'puzzles')
  const about   = pages?.find(p => p.slug === 'about')

  return (
    <div style={{ padding: '32px 36px', maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #d0d0d0', paddingBottom: 20 }}>
        <div style={{ width: 3, background: '#7a5020', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#7a5020', marginBottom: 6 }}>Manage</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Content Editor</h1>
        </div>
      </div>

      <ContentEditorForm
        puzzlesHtml={(puzzles?.content_json as { html?: string })?.html ?? ''}
        aboutHtml={(about?.content_json as { html?: string })?.html ?? ''}
      />
    </div>
  )
}
