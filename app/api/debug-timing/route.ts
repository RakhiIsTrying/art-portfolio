// TEMPORARY: measures how long each database read takes on the server. Remove after use.
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!
async function timed(label: string, key: string, path: string) {
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 9000)
  const s = Date.now()
  try {
    const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store', signal: ctrl.signal })
    return [label, `${Date.now() - s}ms ${r.status}`]
  } catch (e) { return [label, `${Date.now() - s}ms ${(e as Error).name}`] }
  finally { clearTimeout(timer) }
}

export async function GET() {
  const raw = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const svc = raw.trim(), anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  const rows = [
    await timed('anon about', anon, 'pages?slug=eq.about&select=slug'),
    await timed('anon settings', anon, 'pages?slug=eq.site-settings&select=slug'),
    await timed('service settings', svc, 'pages?slug=eq.site-settings&select=slug'),
    await timed('service artworks', svc, 'artworks?select=id&limit=1'),
  ]
  return NextResponse.json({ region: process.env.VERCEL_REGION ?? null, keyKind: svc.startsWith('ey') ? 'jwt' : 'other', strayCharacters: raw.length - svc.length, length: raw.length, oddCharPositions: [...raw].map((c, i) => (/[A-Za-z0-9._-]/.test(c) ? -1 : i)).filter(i => i >= 0), oddCharCodes: [...raw].filter(c => !/[A-Za-z0-9._-]/.test(c)).map(c => c.charCodeAt(0)), ...Object.fromEntries(rows) })
}
