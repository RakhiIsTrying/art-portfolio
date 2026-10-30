import { getSupabaseServerClient } from '@/lib/supabase/server'
import ScreeningRoom from '@/components/videos/ScreeningRoom'
import type { Video } from '@/lib/types'
import { arrange, getSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export default async function VideosPage() {
  const supabase = await getSupabaseServerClient()
  const { data: videos } = await supabase
    .from('videos').select('*')
    .order('created_at', { ascending: false })

  if (!videos?.length) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 36px 60px' }}>
        <p style={{ fontSize: 11, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0', padding: '40px 0' }}>
          No videos yet — check back soon.
        </p>
      </div>
    )
  }

  // Order set in Admin → Videos; the first one is "Now showing"
  const { videoOrder } = await getSettings()
  return <ScreeningRoom videos={arrange(videos as Video[], videoOrder)} />
}
