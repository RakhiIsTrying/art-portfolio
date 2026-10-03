import { getSupabaseServerClient } from '@/lib/supabase/server'
import VideoCard from '@/components/VideoCard'
import type { Video } from '@/lib/types'

export default async function VideosPage() {
  const supabase = await getSupabaseServerClient()
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-black uppercase tracking-widest text-ink mb-10">
        ✦ Videos
      </h1>

      {videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(videos as Video[]).map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      ) : (
        <p className="text-rose font-black uppercase tracking-widest text-sm">
          No videos yet — check back soon.
        </p>
      )}
    </div>
  )
}
