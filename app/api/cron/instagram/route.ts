import { NextRequest, NextResponse } from 'next/server'
import { syncInstagram } from '@/lib/instagram'

// Run every night by Vercel Cron (see vercel.json). Vercel sends the CRON_SECRET with the request.
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await syncInstagram()
  return NextResponse.json({ result })
}
