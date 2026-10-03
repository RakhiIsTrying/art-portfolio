import Image from 'next/image'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import VideoAddForm from '@/components/admin/VideoAddForm'
import { deleteVideo } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminVideosPage() {
  const admin = getSupabaseAdminClient()
  const { data: videos } = await admin
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8">
      <h1 className="text-2xl font-black uppercase tracking-widest text-ink">
        🎬 Videos
      </h1>

      <VideoAddForm />

      <div className="border-4 border-ink">
        <div className="bg-ink px-5 py-3 border-b-4 border-ink">
          <h2 className="text-sm font-black uppercase tracking-widest text-cream">
            All Videos ({videos?.length ?? 0})
          </h2>
        </div>

        {!videos?.length && (
          <p className="p-5 font-black text-xs uppercase tracking-widest text-rose">
            No videos yet. Add one above.
          </p>
        )}

        <div className="divide-y-4 divide-ink">
          {videos?.map(video => (
            <div key={video.id} className="flex items-center gap-4 p-4">
              <div className="relative w-24 h-14 border-2 border-ink shrink-0">
                <Image
                  src={video.thumbnail_url}
                  alt={video.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-black text-sm text-ink uppercase tracking-widest truncate">
                  {video.title}
                </p>
                <a
                  href={video.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-black uppercase tracking-[3px] text-rust hover:underline"
                >
                  {video.youtube_url.length > 50 ? video.youtube_url.slice(0, 50) + '…' : video.youtube_url}
                </a>
              </div>

              <form action={deleteVideo.bind(null, video.id)}>
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
