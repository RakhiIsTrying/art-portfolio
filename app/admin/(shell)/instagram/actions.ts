'use server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/adminAuth'
import { connect, getPending, removePending, syncInstagram } from '@/lib/instagram'
import { getCollection, VIDEO_CATEGORIES } from '@/lib/collections'

type State = { error?: string; ok?: string } | null

export async function connectInstagram(_prev: State, formData: FormData): Promise<State> {
  await requireAdmin()
  const token = String(formData.get('token') ?? '').replace(/\s+/g, '')
  if (!token) return { error: 'Paste the access token first.' }
  try {
    const username = await connect(token)
    const first = await syncInstagram()
    revalidatePath('/admin/instagram')
    return { ok: `Connected as @${username}. ${first}` }
  } catch (e) {
    return { error: `Instagram didn’t accept that token: ${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function checkNow() {
  await requireAdmin()
  const result = await syncInstagram()
  revalidatePath('/admin/instagram')
  return result
}

const SALE = {
  prints:   { prints: true,  original: false },
  both:     { prints: true,  original: true },
  original: { prints: false, original: true },
  display:  { prints: false, original: false },
} as const
export type Sale = keyof typeof SALE

/** Put a reviewed post on the site: images into a gallery collection, reels onto the Videos page.
 *  Returns an error message rather than throwing, so the real reason shows in Admin. */
export async function publishPost(id: string, fields: { title: string; collection: string; sale: Sale }): Promise<{ error?: string }> {
  try { await publish(id, fields); return {} }
  catch (e) { return { error: e instanceof Error ? e.message : 'Could not publish' } }
}

async function publish(id: string, fields: { title: string; collection: string; sale: Sale }) {
  const admin = await requireAdmin()
  const post = await getPending(id)
  if (!post) throw new Error('This post was already handled.')
  const title = fields.title.trim() || 'Untitled'

  if (post.kind === 'image') {
    if (!getCollection(fields.collection)) throw new Error('Pick a collection.')
    const sale = SALE[fields.sale] ?? SALE.display
    const { error } = await admin.from('artworks').insert({
      title, collection_slug: fields.collection, image_url: post.imageUrl, instagram_url: post.permalink,
      year: new Date(post.postedAt).getFullYear(), prints_available: sale.prints, original_available: sale.original,
    })
    if (error) throw new Error(error.message)
  } else {
    const { error } = await admin.from('videos').insert({
      title, video_url: post.videoUrl, thumbnail_url: post.imageUrl || null, instagram_url: post.permalink,
      category: (VIDEO_CATEGORIES as readonly string[]).includes(fields.collection) ? fields.collection : null,
    })
    if (error) throw new Error(error.message)
  }
  await removePending(post, false)
  revalidatePath('/', 'layout')
}

export async function skipPost(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const post = await getPending(id)
    if (post) await removePending(post, true)
    revalidatePath('/admin/instagram')
    return {}
  } catch (e) { return { error: e instanceof Error ? e.message : 'Could not skip' } }
}
