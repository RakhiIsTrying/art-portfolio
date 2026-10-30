import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/adminEmail'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/env'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getClaims checks the sign-in's signature (on this server when it can, no round trip to Supabase),
  // refreshing it first if it has expired
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims ? { email: data.claims.email as string | undefined } : null
  const path = req.nextUrl.pathname
  const isOpenPage = path === '/admin/login' || path === '/admin/reset'

  // Only the site owner's account may use Admin; anyone else is signed out
  if (user && !isAdminEmail(user.email)) {
    await supabase.auth.signOut()
    const out = NextResponse.redirect(new URL('/admin/login', req.url))
    res.cookies.getAll().forEach(c => out.cookies.set(c))
    return out
  }

  if (!user && !isOpenPage) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  if (user && path === '/admin/login') {
    return NextResponse.redirect(new URL('/admin/artworks', req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
