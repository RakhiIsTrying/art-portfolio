'use server'
import { revalidatePath } from 'next/cache'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export async function savePageContent(
  _prev: { error?: string; saved?: string } | null,
  formData: FormData
): Promise<{ error?: string; saved?: string } | null> {
  const slug = formData.get('slug') as string
  const html = formData.get('content') as string

  if (!slug || !['puzzles', 'about'].includes(slug)) {
    return { error: 'Invalid page slug.' }
  }

  const admin = getSupabaseAdminClient()
  const { error } = await admin
    .from('pages')
    .update({ content_json: { html }, updated_at: new Date().toISOString() })
    .eq('slug', slug)

  if (error) return { error: error.message }

  revalidatePath(`/${slug}`)
  return { saved: slug }
}
