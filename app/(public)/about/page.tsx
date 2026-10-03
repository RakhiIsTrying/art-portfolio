import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function AboutPage() {
  const supabase = await getSupabaseServerClient()
  const { data: page } = await supabase
    .from('pages')
    .select('content_json')
    .eq('slug', 'about')
    .single()

  const content = page?.content_json as { html?: string } | null

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-black uppercase tracking-widest text-ink mb-10">
        ✦ About
      </h1>

      {content?.html ? (
        <div
          className="prose max-w-none font-bold"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-4 border-ink">
          <div className="relative aspect-square border-b-4 md:border-b-0 md:border-r-4 border-ink">
            <div className="absolute inset-0 bg-blush flex items-center justify-center">
              <span className="text-6xl">🎨</span>
            </div>
          </div>
          <div className="p-8 flex flex-col justify-between gap-8">
            <div>
              <h2 className="text-xl font-black uppercase tracking-widest text-ink mb-4">
                Van Gone Broke
              </h2>
              <p className="text-sm text-ink leading-relaxed font-bold mb-3">
                Pop culture digital and paper art — music, movies, comics, originals.
              </p>
            </div>
            <Link
              href="/inquire"
              className="text-center text-[9px] font-black uppercase tracking-widest
                         bg-rust text-cream px-6 py-3 border-2 border-ink
                         shadow-[3px_3px_0_#1f1f1f]
                         hover:translate-x-0.5 hover:translate-y-0.5
                         hover:shadow-[1px_1px_0_#1f1f1f] transition-all"
            >
              Get in Touch →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
