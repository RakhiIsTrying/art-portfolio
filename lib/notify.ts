// Messages from the website (inquiries, print orders, Print Club sign-ups).
// Each one is saved to Admin → Inbox first, then emailed to the artist, so nothing is lost if email fails.
import { Resend } from 'resend'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { ADMIN_EMAIL } from '@/lib/adminEmail'

export const ARTIST_EMAIL = ADMIN_EMAIL
/** Every subject starts with this, so a Gmail filter can label them "Artist account query". */
export const SUBJECT_PREFIX = 'Artist account query'

export type MessageKind = 'Inquiry' | 'Print order' | 'Print Club'
export type InboxMessage = { kind: MessageKind; subject: string; text: string; from?: string; at: string; emailed: boolean }

export async function notifyArtist({ kind, subject, text, replyTo }: { kind: MessageKind; subject: string; text: string; replyTo?: string }) {
  const at = new Date().toISOString()
  let emailed = false
  const key = (process.env.RESEND_API_KEY ?? '').replace(/\s+/g, '')
  if (key) {
    try {
      const { error } = await new Resend(key).emails.send({
        from: 'Van Gone Broke website <onboarding@resend.dev>',
        to: ARTIST_EMAIL,
        subject: `${SUBJECT_PREFIX}: ${kind} · ${subject}`,
        text,
        ...(replyTo ? { replyTo } : {}),
      })
      emailed = !error
      if (error) console.error('Email not sent:', error.message)
    } catch (e) { console.error('Email not sent:', e) }
  }
  // Saved as a file in the private "inbox" storage folder (customers' details never go anywhere public)
  const message: InboxMessage = { kind, subject, text, from: replyTo, at, emailed }
  const name = `${at.replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}.json`
  const { error } = await getSupabaseAdminClient().storage.from('inbox')
    .upload(name, JSON.stringify(message), { contentType: 'application/json' })
  if (error) console.error('Inbox save failed:', error.message)
  return { saved: !error, emailed }
}

/** Newest messages first, for Admin → Inbox. */
export async function listInbox(limit = 200): Promise<InboxMessage[]> {
  const store = getSupabaseAdminClient().storage.from('inbox')
  const { data: files } = await store.list('', { limit, sortBy: { column: 'name', order: 'desc' } })
  const messages = await Promise.all((files ?? []).filter(f => f.name.endsWith('.json')).map(async f => {
    const { data } = await store.download(f.name)
    try { return data ? (JSON.parse(await data.text()) as InboxMessage) : null } catch { return null }
  }))
  return messages.filter((m): m is InboxMessage => !!m)
}
