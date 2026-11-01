'use client'
import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { createPrintUploadUrl, sendMonthlyPrint } from '@/app/admin/(shell)/print-club/actions'
import WipTag from '@/components/WipTag'

const field: React.CSSProperties = { width: '100%', padding: 8, border: '1px solid #d0d0d0', fontFamily: 'inherit', fontSize: 13, fontWeight: 300, color: '#1a1014', background: '#fff' }

/** Upload this month's paint-along print and email it to every Van Gogh Anywhere member. */
export default function MonthlyPrintSender({ ready, members }: { ready: boolean; members: number }) {
  const [file, setFile] = useState<File | null>(null)
  const [subject, setSubject] = useState('Your paint-along print is here!')
  const [message, setMessage] = useState('')
  const [sure, setSure] = useState(false)
  const [state, setState] = useState<{ busy?: boolean; done?: string; error?: string }>({})
  const canSend = ready && !!file && members > 0 && !state.busy

  async function send() {
    if (!file) return
    // Sending can't be undone, so the first press only asks
    if (!sure) return setSure(true)
    setSure(false)
    setState({ busy: true })
    try {
      const { path, token, publicUrl } = await createPrintUploadUrl(file.name)
      const { error } = await getSupabaseBrowserClient().storage.from('club-boxes').uploadToSignedUrl(path, token, file, { contentType: file.type })
      if (error) throw error
      const sent = await sendMonthlyPrint({ fileUrl: publicUrl, subject, message })
      setState({ done: `Sent to ${sent} ${sent === 1 ? 'member' : 'members'}.` })
      setFile(null)
    } catch (e) {
      setState({ error: e instanceof Error ? e.message : 'Something went wrong. Please try again.' })
    }
  }

  return (
    <div style={{ border: '1px solid #d0d0d0', background: '#fff' }}>
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #d0d0d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
        <h2 style={{ fontSize: 12, fontWeight: 500, letterSpacing: '.4em', textTransform: 'uppercase', color: '#1a1014' }}>
          Monthly paint-along email<WipTag />
        </h2>
        <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: '.2em', color: '#a0a0a0' }}>{members} Van Gogh Anywhere {members === 1 ? 'member' : 'members'}</span>
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!ready && (
          <p style={{ fontSize: 12, fontWeight: 300, color: '#787878' }}>
            Waiting on the domain being verified in Resend. Welcome emails and this send will switch on after that.
          </p>
        )}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#787878' }}>
          This month’s print
          <input type="file" accept="image/*,application/pdf" onChange={e => { setFile(e.target.files?.[0] ?? null); setSure(false); setState({}) }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#787878' }}>
          Subject
          <input value={subject} maxLength={150} onChange={e => setSubject(e.target.value)} style={field} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#787878' }}>
          A note from you (optional)
          <textarea rows={3} maxLength={2000} value={message} onChange={e => setMessage(e.target.value)} style={{ ...field, resize: 'vertical' }} />
        </label>
        <div>
          <button type="button" disabled={!canSend} onClick={send}
            style={{ padding: '10px 16px', fontSize: 11, letterSpacing: '.25em', textTransform: 'uppercase', fontFamily: 'inherit', border: 'none', background: sure ? '#7a3040' : '#1a1014', color: '#fff', cursor: canSend ? 'pointer' : 'not-allowed', opacity: canSend ? 1 : .45 }}>
            {state.busy ? 'Sending…' : sure ? `Yes, email ${members} ${members === 1 ? 'member' : 'members'}` : 'Send to members'}
          </button>
        </div>
        {state.done && <p style={{ fontSize: 12, color: '#1a6060' }}>{state.done}</p>}
        {state.error && <p style={{ fontSize: 12, color: '#7a3040' }}>{state.error}</p>}
      </div>
    </div>
  )
}
