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
  const about = pages?.find(p => p.slug === 'about')

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-8">
      <h1 className="text-2xl font-black uppercase tracking-widest text-ink">
        ✏️ Content Editor
      </h1>
      <ContentEditorForm
        puzzlesHtml={(puzzles?.content_json as { html?: string })?.html ?? ''}
        aboutHtml={(about?.content_json as { html?: string })?.html ?? ''}
      />
    </div>
  )
}
