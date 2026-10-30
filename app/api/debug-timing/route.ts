// TEMPORARY: measures how long each database read takes on the server. Remove after use.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const t: Record<string, number> = {}
  let s = Date.now()
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  t.adminCreate = Date.now() - s
  s = Date.now(); await admin.from('pages').select('content_json').eq('slug', 'site-settings').maybeSingle(); t.adminSettings = Date.now() - s
  s = Date.now(); await admin.from('pages').select('content_json').eq('slug', 'site-settings').maybeSingle(); t.adminSettings2 = Date.now() - s
  const fast = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } })
  s = Date.now(); await fast.from('pages').select('content_json').eq('slug', 'site-settings').maybeSingle(); t.adminNoSession = Date.now() - s
  const anon = await getSupabaseServerClient()
  s = Date.now(); await anon.from('pages').select('content_json').eq('slug', 'about').maybeSingle(); t.anonAbout = Date.now() - s
  s = Date.now(); await anon.from('pages').select('content_json').eq('slug', 'site-settings').maybeSingle(); t.anonSettings = Date.now() - s
  s = Date.now(); await admin.from('artworks').select('id').limit(1); t.adminArtworks = Date.now() - s
  s = Date.now()
  const r = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/pages?slug=eq.site-settings&select=slug`, {
    headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` }, cache: 'no-store' })
  t.rawFetchAdmin = Date.now() - s; t.rawStatus = r.status
  s = Date.now()
  await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/pages?slug=eq.about&select=slug`, {
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }, cache: 'no-store' })
  t.rawFetchAnon = Date.now() - s
  t.keyKind = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').startsWith('sb_') ? 1 : (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').startsWith('ey') ? 2 : 0
  return NextResponse.json({ region: process.env.VERCEL_REGION ?? null, ms: t })
}
