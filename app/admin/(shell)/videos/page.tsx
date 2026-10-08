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
    <div style={{ padding: '32px 36px', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #d0d0d0', paddingBottom: 20 }}>
        <div style={{ width: 3, background: '#1e3a8a', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '7px', letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#1e3a8a', marginBottom: 6 }}>Manage</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Videos</h1>
        </div>
      </div>

      <VideoAddForm />

      {/* Table */}
      <div style={{ border: '1px solid #d0d0d0', background: '#fff' }}>
        <div style={{ padding: '10px 20px', borderBottom: '1px solid #d0d0d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
          <h2 style={{ fontSize: '8px', fontWeight: 500, letterSpacing: '.4em', textTransform: 'uppercase', color: '#1a1014' }}>
            All Videos
          </h2>
          <span style={{ fontSize: '7px', fontWeight: 300, letterSpacing: '.2em', color: '#a0a0a0' }}>
            {videos?.length ?? 0} total
          </span>
        </div>

        {!videos?.length && (
          <p style={{ padding: '20px', fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0' }}>
            No videos yet — add one above.
          </p>
        )}

        <div>
          {videos?.map((video, i) => (
            <div key={video.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', borderBottom: i < videos.length - 1 ? '1px solid #ebebeb' : 'none' }}>
              <div style={{ position: 'relative', width: 72, height: 44, flexShrink: 0, background: '#e6e6e6', overflow: 'hidden' }}>
                <Image src={video.thumbnail_url} alt={video.title} fill className="object-cover" unoptimized />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#1a1014', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                  {video.title}
                </p>
                <a href={video.youtube_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '7px', letterSpacing: '.2em', fontWeight: 300, color: '#1e3a8a' }}>
                  {video.youtube_url.length > 55 ? video.youtube_url.slice(0, 55) + '…' : video.youtube_url}
                </a>
              </div>
              <form action={deleteVideo.bind(null, video.id)}>
                <button type="submit" style={{ fontSize: '7px', letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040', background: 'none', border: '1px solid #7a3040', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
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
