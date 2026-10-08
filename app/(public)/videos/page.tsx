import { getSupabaseServerClient } from '@/lib/supabase/server'
import VideoCard from '@/components/VideoCard'
import type { Video } from '@/lib/types'

export default async function VideosPage() {
  const supabase = await getSupabaseServerClient()
  const { data: videos } = await supabase
    .from('videos').select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 36px 60px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #d0d0d0' }}>
        <div style={{ width: 3, background: '#1e3a8a', marginRight: 16, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#1e3a8a', marginBottom: 6 }}>Watch</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 30, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Videos</h1>
        </div>
        {videos && videos.length > 0 && (
          <span style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.3em', color: '#a0a0a0', textTransform: 'uppercase', alignSelf: 'flex-end' }}>
            {videos.length} videos
          </span>
        )}
      </div>

      {videos && videos.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#d0d0d0', border: '1px solid #d0d0d0' }}>
          {(videos as Video[]).map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      ) : (
        <p style={{ fontSize: 11, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0', padding: '40px 0' }}>
          No videos yet — check back soon.
        </p>
      )}

    </div>
  )
}
