'use server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/adminAuth'
import { getSettings, saveSettings } from '@/lib/settings'
import { getCollection } from '@/lib/collections'

/** Save the hand-arranged order of one collection. */
export async function saveArtworkOrder(collection: string, ids: string[]) {
  await requireAdmin()
  if (!getCollection(collection)) throw new Error('Unknown collection')
  const { artworkOrder } = await getSettings()
  await saveSettings({ artworkOrder: { ...artworkOrder, [collection]: ids } })
  revalidatePath('/', 'layout')
}

/** Edit a piece's details, or move it to another collection. */
export async function updateArtwork(id: string, fields: { title: string; medium: string | null; year: number | null; collection_slug: string; prints_available: boolean; original_available: boolean }) {
  const admin = await requireAdmin()
  if (!fields.title.trim()) throw new Error('Title can’t be empty')
  if (!getCollection(fields.collection_slug)) throw new Error('Unknown collection')
  const { error } = await admin.from('artworks').update({
    title: fields.title.trim(),
    medium: fields.medium?.trim() || null,
    year: fields.year && fields.year > 1900 && fields.year < 2100 ? fields.year : null,
    collection_slug: fields.collection_slug,
    prints_available: fields.prints_available,
    original_available: fields.original_available,
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}
