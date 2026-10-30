'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

/** Opened from the password-reset email: choose a new admin password. */
export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState<'checking' | 'ok' | 'expired'>('checking')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const code = new URLSearchParams(window.location.search).get('code')
    const check = async (): Promise<boolean> => {
      if (code) return !(await supabase.auth.exchangeCodeForSession(code)).error
      return !!(await supabase.auth.getSession()).data.session
    }
    check().then(ok => setReady(ok ? 'ok' : 'expired')).catch(() => setReady('expired'))
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (pw.length < 10) return setError('Use at least 10 characters.')
    if (pw !== pw2) return setError('The two passwords don’t match.')
    setSaving(true); setError(null)
    const { error } = await getSupabaseBrowserClient().auth.updateUser({ password: pw })
    setSaving(false)
    if (error) return setError(error.message)
    router.push('/admin/artworks')
  }

  const field: React.CSSProperties = { border: 'none', borderBottom: '1px solid #d0d0d0', background: 'transparent', padding: '6px 0', fontSize: 13, color: '#1a1014', outline: 'none', fontFamily: 'inherit' }
  const label: React.CSSProperties = { fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014' }

  return (
    <div style={{ minHeight: '100svh', background: '#e6e6e6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <p style={{ fontSize: 10, letterSpacing: '.5em', textTransform: 'uppercase', color: '#7a3040', marginBottom: 8 }}>Van Gone Broke</p>
        <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: '#1a1014', marginBottom: 24 }}>New password</h1>
        <div style={{ background: '#fff', border: '1px solid #d0d0d0', padding: '24px 20px' }}>
          {ready === 'checking' && <p style={{ fontSize: 12, color: '#787878' }}>Checking your link…</p>}
          {ready === 'expired' && (
            <p style={{ fontSize: 12, lineHeight: 1.6, color: '#7a3040' }}>
              This link has expired or was already used. Go back to <a href="/admin/login" style={{ color: '#1e3a8a' }}>sign in</a> and choose “Forgot password?” again.
            </p>
          )}
          {ready === 'ok' && (
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={label}>New password</span>
                <input type="password" autoComplete="new-password" value={pw} onChange={e => setPw(e.target.value)} style={field} /></label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={label}>Type it again</span>
                <input type="password" autoComplete="new-password" value={pw2} onChange={e => setPw2(e.target.value)} style={field} /></label>
              {error && <p style={{ fontSize: 12, color: '#7a3040' }}>{error}</p>}
              <button type="submit" disabled={saving}
                style={{ background: saving ? '#d0d0d0' : '#1a1014', color: '#faf8f5', fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', padding: '12px 20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Saving…' : 'Save & sign in →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
