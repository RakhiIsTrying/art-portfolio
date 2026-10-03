'use server'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { fetchYouTubeThumbnail } from '@/lib/youtube'

export async function addVideo(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const title = formData.get('title') as string
  const youtube_url = formData.get('youtube_url') as string
  const description = (formData.get('description') as string) || null

  if (!title || !youtube_url) return { error: 'Title and YouTube URL are required.' }

  let thumbnail_url: string
  try {
    thumbnail_url = await fetchYouTubeThumbnail(youtube_url)
  } catch {
    return { error: 'Could not fetch video thumbnail. Check the YouTube URL.' }
  }

  const admin = getSupabaseAdminClient()
  const { error } = await admin
    .from('videos')
    .insert({ title, youtube_url, thumbnail_url, description })

  if (error) return { error: error.message }

  revalidatePath('/admin/videos')
  revalidatePath('/videos')
  return null
}

export async function deleteVideo(id: string) {
  const admin = getSupabaseAdminClient()
  await admin.from('videos').delete().eq('id', id)
  revalidatePath('/admin/videos')
  revalidatePath('/videos')
}
