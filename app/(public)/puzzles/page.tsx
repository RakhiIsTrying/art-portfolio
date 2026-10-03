import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function PuzzlesPage() {
  const supabase = await getSupabaseServerClient()
  const { data: page } = await supabase
    .from('pages')
    .select('content_json')
    .eq('slug', 'puzzles')
    .single()

  const content = page?.content_json as { html?: string } | null

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-black uppercase tracking-widest text-ink mb-10">
        ✦ Art Puzzles
      </h1>

      {content?.html ? (
        <div
          className="prose prose-lg max-w-none font-bold"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <p className="text-rose font-black uppercase tracking-widest text-sm">
          Content coming soon.
        </p>
      )}
    </div>
  )
}
