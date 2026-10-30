'use client'
import { useActionState, useEffect, useState } from 'react'
import { forgotPasswordAction, loginAction } from './actions'

export default function LoginPage() {
  const [forgot, setForgot] = useState(false)
  const [state, formAction, pending] = useActionState(forgot ? forgotPasswordAction : loginAction, null)
  // Signed in: open Admin with a full page load, so the new sign-in is definitely sent along
  useEffect(() => { if (state?.ok) window.location.assign('/admin/artworks') }, [state])
  const busy = pending || !!state?.ok

  return (
    <div style={{ minHeight: '100svh', background: '#e6e6e6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, letterSpacing: '.5em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040', marginBottom: 8 }}>
            Van Gone Broke
          </p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>
            Admin
          </h1>
          <div style={{ width: 24, height: 1, background: '#7a3040', marginTop: 12 }} />
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #d0d0d0' }}>

          {state?.sent && (
            <div style={{ padding: '10px 20px', borderBottom: '1px solid #d0d0d0', background: '#eef6f1' }}>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: '#1a6060' }}>{state.sent}</p>
            </div>
          )}

          {state?.error && (
            <div style={{ padding: '10px 20px', borderBottom: '1px solid #d0d0d0', background: '#fdf0f2' }}>
              <p style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040' }}>
                {state.error}
              </p>
            </div>
          )}

          <form action={formAction} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="email" style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014' }}>
                Email
              </label>
              <input
                id="email" name="email" type="email" required
                style={{
                  border: 'none', borderBottom: '1px solid #d0d0d0', background: 'transparent',
                  padding: '6px 0', fontSize: 13, fontWeight: 300, color: '#1a1014',
                  outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => (e.target.style.borderBottomColor = '#7a3040')}
                onBlur={e => (e.target.style.borderBottomColor = '#d0d0d0')}
              />
            </div>

            {!forgot && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="password" style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014' }}>
                Password
              </label>
              <input
                id="password" name="password" type="password" required
                style={{
                  border: 'none', borderBottom: '1px solid #d0d0d0', background: 'transparent',
                  padding: '6px 0', fontSize: 13, fontWeight: 300, color: '#1a1014',
                  outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => (e.target.style.borderBottomColor = '#7a3040')}
                onBlur={e => (e.target.style.borderBottomColor = '#d0d0d0')}
              />
            </div>}

            <button
              type="submit"
              disabled={busy}
              style={{
                marginTop: 4,
                background: busy ? '#d0d0d0' : '#1a1014',
                color: '#faf8f5',
                fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 500,
                padding: '12px 20px', border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'background .2s',
              }}
            >
              {forgot ? (pending ? 'Sending…' : 'Email me a reset link →') : (state?.ok ? 'Opening admin…' : pending ? 'Signing in…' : 'Sign In →')}
            </button>
            <button type="button" onClick={() => setForgot(f => !f)}
              style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, color: '#1e3a8a' }}>
              {forgot ? '← Back to sign in' : 'Forgot password?'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
