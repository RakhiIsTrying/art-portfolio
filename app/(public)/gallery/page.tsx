import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { COLLECTIONS } from '@/lib/collections'
import Image from 'next/image'
import type { Artwork } from '@/lib/types'

export default async function GalleryPage() {
  const supabase = await getSupabaseServerClient()

  const previews: Record<string, Artwork[]> = {}
  await Promise.all(
    COLLECTIONS.map(async col => {
      const { data } = await supabase
        .from('artworks')
        .select('*')
        .eq('collection_slug', col.slug)
        .order('created_at', { ascending: false })
        .limit(3)
      previews[col.slug] = (data ?? []) as Artwork[]
    })
  )

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-black uppercase tracking-widest text-ink mb-10">
        ✦ Collections
      </h1>

      <div className="flex flex-col gap-0 border-4 border-ink">
        {COLLECTIONS.map(col => (
          <Link
            key={col.slug}
            href={`/gallery/${col.slug}`}
            className="flex items-center gap-6 p-6 border-b-4 border-ink
                       bg-cream hover:bg-blush transition-colors last:border-b-0 group"
          >
            <span className="text-4xl">{col.icon_emoji}</span>
            <div className="flex-1">
              <h2 className="text-base font-black uppercase tracking-widest text-ink">
                {col.name}
              </h2>
              <p className="text-[9px] font-black uppercase tracking-widest text-rose mt-0.5">
                {previews[col.slug]?.length ?? 0} pieces shown · click to browse →
              </p>
            </div>
            <div className="flex gap-2">
              {previews[col.slug]?.map(art => (
                <div key={art.id} className="w-16 h-16 relative border-2 border-ink overflow-hidden">
                  <Image src={art.image_url} alt={art.title} fill className="object-cover" sizes="64px" />
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
