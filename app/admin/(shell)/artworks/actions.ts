'use server'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export async function uploadArtwork(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  const file = formData.get('image') as File
  const title = formData.get('title') as string
  const collection_slug = formData.get('collection_slug') as string
  const medium = formData.get('medium') as string || null
  const yearRaw = formData.get('year') as string
  const year = yearRaw ? parseInt(yearRaw) : null

  if (!file || !file.size || !title || !collection_slug) {
    return { error: 'Title, collection, and image are required.' }
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${crypto.randomUUID()}.${ext}`

  const admin = getSupabaseAdminClient()
  const { error: uploadError } = await admin.storage
    .from('artworks')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = admin.storage.from('artworks').getPublicUrl(path)

  const { error: dbError } = await admin
    .from('artworks')
    .insert({ title, collection_slug, image_url: publicUrl, medium, year })

  if (dbError) return { error: dbError.message }

  revalidatePath('/admin/artworks')
  revalidatePath('/')
  revalidatePath('/gallery')
  return { ok: true }
}

export async function deleteArtwork(id: string) {
  const admin = getSupabaseAdminClient()

  const { data } = await admin
    .from('artworks')
    .select('image_url')
    .eq('id', id)
    .single()

  if (data?.image_url) {
    const urlPath = new URL(data.image_url).pathname
    const storagePath = urlPath.split('/object/public/artworks/')[1]
    if (storagePath) {
      await admin.storage.from('artworks').remove([storagePath])
    }
  }

  await admin.from('artworks').delete().eq('id', id)

  revalidatePath('/admin/artworks')
  revalidatePath('/')
  revalidatePath('/gallery')
}
