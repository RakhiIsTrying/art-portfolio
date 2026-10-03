'use client'
import { useActionState } from 'react'
import { loginAction } from './actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-8">
      <div className="w-full max-w-sm border-4 border-ink shadow-[6px_6px_0_#1f1f1f]">
        <div className="bg-rust px-6 py-4 border-b-4 border-ink">
          <h1 className="text-lg font-black uppercase tracking-widest text-cream">
            Admin Login
          </h1>
        </div>

        <form action={formAction} className="bg-cream p-6 flex flex-col gap-4">
          {state?.error && (
            <p className="text-rust font-black text-xs uppercase tracking-widest border-2 border-rust px-3 py-2">
              {state.error}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-[9px] font-black uppercase tracking-[4px] text-ink"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="border-2 border-ink px-3 py-2 bg-cream font-bold text-sm
                         focus:outline-none focus:border-rust"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-[9px] font-black uppercase tracking-[4px] text-ink"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="border-2 border-ink px-3 py-2 bg-cream font-bold text-sm
                         focus:outline-none focus:border-rust"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-2 bg-ink text-cream font-black uppercase tracking-widest
                       text-sm px-6 py-3 border-2 border-ink
                       shadow-[3px_3px_0_#b04a33]
                       hover:translate-x-0.5 hover:translate-y-0.5
                       hover:shadow-[1px_1px_0_#b04a33] transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  )
}
