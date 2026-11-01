'use server'
import { requireAdmin } from '@/lib/adminAuth'
import { memberEmailReady, monthlyPrintEmail, sendMemberEmails } from '@/lib/memberEmail'

const BUCKET = 'club-boxes'
const FOLDER = 'paint-along'

/** Signed URL so the browser can upload a big print straight to storage. */
export async function createPrintUploadUrl(filename: string) {
  const admin = await requireAdmin()
  const ext = (filename.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${FOLDER}/${crypto.randomUUID()}.${ext}`
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path)
  if (error) throw new Error(error.message)
  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path)
  return { path, token: data.token, publicUrl }
}

/** Emails this month's paint-along print to every Van Gogh Anywhere member. */
export async function sendMonthlyPrint({ fileUrl, subject, message }: { fileUrl: string; subject: string; message: string }) {
  const admin = await requireAdmin()
  if (!memberEmailReady()) throw new Error('Member emails aren’t switched on yet.')
  if (!subject.trim()) throw new Error('Add a subject.')
  const { data: { publicUrl: folder } } = admin.storage.from(BUCKET).getPublicUrl(`${FOLDER}/`)
  if (!fileUrl.startsWith(folder)) throw new Error('Upload the print first.')
  const { data, error } = await admin.from('print_club_signups').select('name, email').eq('tier', 'digital')
  if (error) throw new Error(error.message)
  return sendMemberEmails((data ?? []).map(m => monthlyPrintEmail({ to: m.email, name: m.name, subject: subject.trim(), message: message.trim(), fileUrl })))
}
