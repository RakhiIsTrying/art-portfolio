'use server'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/adminAuth'
import { saveSettings } from '@/lib/settings'

export async function toggleFeatured(artworkId: string, currentlyFeatured: boolean) {
  const admin = getSupabaseAdminClient()

  if (currentlyFeatured) {
    // Remove from featured
    await admin
      .from('artworks')
      .update({ featured: false, featured_order: null })
      .eq('id', artworkId)

    // Re-number remaining featured artworks to fill the gap
    const { data: remaining } = await admin
      .from('artworks')
      .select('id')
      .eq('featured', true)
      .order('featured_order', { ascending: true })

    if (remaining) {
      for (let i = 0; i < remaining.length; i++) {
        await admin
          .from('artworks')
          .update({ featured_order: i + 1 })
          .eq('id', remaining[i].id)
      }
    }
  } else {
    // Add to featured, find next available slot
    const { count } = await admin
      .from('artworks')
      .select('id', { count: 'exact', head: true })
      .eq('featured', true)

    if ((count ?? 0) >= 9) return { error: 'Maximum 9 featured artworks.' }

    await admin
      .from('artworks')
      .update({ featured: true, featured_order: (count ?? 0) + 1 })
      .eq('id', artworkId)
  }

  revalidatePath('/admin/featured')
  revalidatePath('/')
  return null
}

/** Save the order of the featured collage on the front page. */
export async function reorderFeatured(ids: string[]) {
  const admin = await requireAdmin()
  for (const [i, id] of ids.entries()) {
    await admin.from('artworks').update({ featured_order: i + 1 }).eq('id', id).eq('featured', true)
  }
  revalidatePath('/admin/featured')
  revalidatePath('/')
}

/** Choose the big front-page piece ('latest' = newest upload). */
export async function setHero(id: string) {
  await requireAdmin()
  await saveSettings({ heroArtworkId: id })
  revalidatePath('/')
  revalidatePath('/admin/featured')
}
