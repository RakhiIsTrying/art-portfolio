import { NextRequest, NextResponse } from 'next/server'
import { lookupPostcode } from '@/lib/postcode'

// GET /api/postcode?code=110001&country=IN
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') ?? ''
  const country = req.nextUrl.searchParams.get('country') ?? ''
  if (!/^[A-Z]{2}$/.test(country) || code.length > 10) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const place = await lookupPostcode(code, country)
  return place ? NextResponse.json(place) : NextResponse.json({ error: 'Not found' }, { status: 404 })
}
