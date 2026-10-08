import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function PuzzlesPage() {
  const supabase = await getSupabaseServerClient()
  const { data: page } = await supabase
    .from('pages').select('content_json')
    .eq('slug', 'puzzles').single()

  const content = page?.content_json as { html?: string } | null

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '36px 36px 60px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #d0d0d0' }}>
        <div style={{ width: 3, background: '#1a6060', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '7px', letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#1a6060', marginBottom: 6 }}>Explore</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 32, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Art Puzzles</h1>
        </div>
      </div>

      {content?.html ? (
        <div
          style={{ fontSize: '14px', lineHeight: 1.8, fontWeight: 300, color: '#3a3a3a' }}
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <p style={{ fontSize: '8px', letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0', padding: '40px 0' }}>
          Content coming soon.
        </p>
      )}

    </div>
  )
}
