import Image from 'next/image'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import ArtworkUploadForm from '@/components/admin/ArtworkUploadForm'
import { deleteArtwork } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminArtworksPage() {
  const admin = getSupabaseAdminClient()
  const { data: artworks } = await admin
    .from('artworks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8">
      <h1 className="text-2xl font-black uppercase tracking-widest text-ink">
        🖼️ Artworks
      </h1>

      <ArtworkUploadForm />

      <div className="border-4 border-ink">
        <div className="bg-ink px-5 py-3 border-b-4 border-ink">
          <h2 className="text-sm font-black uppercase tracking-widest text-cream">
            All Artworks ({artworks?.length ?? 0})
          </h2>
        </div>

        {!artworks?.length && (
          <p className="p-5 font-black text-xs uppercase tracking-widest text-rose">
            No artworks yet. Upload one above.
          </p>
        )}

        <div className="divide-y-4 divide-ink">
          {artworks?.map(art => (
            <div key={art.id} className="flex items-center gap-4 p-4">
              <div className="relative w-16 h-16 border-2 border-ink shrink-0">
                <Image
                  src={art.image_url}
                  alt={art.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-ink uppercase tracking-widest truncate">
                  {art.title}
                </p>
                <p className="text-[9px] font-black uppercase tracking-[3px] text-rose">
                  {art.collection_slug}
                  {art.medium && ` · ${art.medium}`}
                  {art.year && ` · ${art.year}`}
                  {art.featured && ' · ⭐ Featured'}
                </p>
              </div>

              <form action={deleteArtwork.bind(null, art.id)}>
                <button
                  type="submit"
                  className="text-[9px] font-black uppercase tracking-widest text-rust
                             border-2 border-rust px-3 py-1
                             hover:bg-rust hover:text-cream transition-colors"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
