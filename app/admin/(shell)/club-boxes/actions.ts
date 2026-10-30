'use server'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/adminEmail'

const BUCKET = 'club-boxes'

async function requireAdmin() {
  const { data: { user } } = await (await getSupabaseServerClient()).auth.getUser()
  if (!user || !isAdminEmail(user.email)) throw new Error('Unauthorized')
  return getSupabaseAdminClient()
}

function refresh() {
  revalidatePath('/admin/club-boxes')
  revalidatePath('/print-club/boxes')
}

const storagePath = (url: string) => new URL(url).pathname.split(`/object/public/${BUCKET}/`)[1]

export async function createBox(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const admin = await requireAdmin()
  const month = String(formData.get('month') ?? '')
  if (!/^\d{4}-\d{2}$/.test(month)) return { error: 'Pick a month.' }
  const { error } = await admin.from('club_boxes').insert({ month })
  if (error) return { error: error.code === '23505' ? 'That month already exists.' : error.message }
  refresh()
  return null
}

export async function deleteBox(id: string) {
  const admin = await requireAdmin()
  const { data } = await admin.from('club_boxes').select('photo_urls, video_url').eq('id', id).single()
  const paths = [...(data?.photo_urls ?? []), data?.video_url].filter(Boolean).map(u => storagePath(u!)).filter(Boolean)
  if (paths.length) await admin.storage.from(BUCKET).remove(paths)
  await admin.from('club_boxes').delete().eq('id', id)
  refresh()
}

/** Signed URL so the browser can upload big files (videos) straight to storage. */
export async function createUploadUrl(boxId: string, filename: string) {
  const admin = await requireAdmin()
  const { data: box } = await admin.from('club_boxes').select('month').eq('id', boxId).single()
  if (!box) throw new Error('Box not found')
  const ext = (filename.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${box.month}/${crypto.randomUUID()}.${ext}`
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path)
  if (error) throw new Error(error.message)
  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path)
  return { path, token: data.token, publicUrl }
}

export async function addMedia(boxId: string, kind: 'photo' | 'video', url: string) {
  const admin = await requireAdmin()
  const { data: box } = await admin.from('club_boxes').select('photo_urls, video_url').eq('id', boxId).single()
  if (!box) return
  if (kind === 'photo') {
    await admin.from('club_boxes').update({ photo_urls: [...box.photo_urls, url] }).eq('id', boxId)
  } else {
    // One unboxing video per month, replace the old one
    if (box.video_url) await admin.storage.from(BUCKET).remove([storagePath(box.video_url)])
    await admin.from('club_boxes').update({ video_url: url }).eq('id', boxId)
  }
  refresh()
}

export async function removeMedia(boxId: string, url: string) {
  const admin = await requireAdmin()
  const { data: box } = await admin.from('club_boxes').select('photo_urls, video_url').eq('id', boxId).single()
  if (!box) return
  await admin.storage.from(BUCKET).remove([storagePath(url)])
  await admin.from('club_boxes').update(
    box.video_url === url ? { video_url: null } : { photo_urls: box.photo_urls.filter((u: string) => u !== url) },
  ).eq('id', boxId)
  refresh()
}

export async function updateBox(boxId: string, fields: { note?: string | null; artwork_ids?: string[] }) {
  const admin = await requireAdmin()
  await admin.from('club_boxes').update(fields).eq('id', boxId)
  refresh()
}
