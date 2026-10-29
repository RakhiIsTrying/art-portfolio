import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { monthKey, signupsToCsv } from '@/lib/printClubExport'

export const dynamic = 'force-dynamic'

// GET /admin/print-club/export?month=2026-10  (omit month for everything)
export async function GET(req: NextRequest) {
  const { data: { user } } = await (await getSupabaseServerClient()).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const month = req.nextUrl.searchParams.get('month')
  if (month && !/^\d{4}-\d{2}$/.test(month)) return NextResponse.json({ error: 'Invalid month' }, { status: 400 })

  const { data, error } = await getSupabaseAdminClient()
    .from('print_club_signups')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: 'Could not load sign-ups' }, { status: 500 })

  const rows = month ? data.filter(s => monthKey(s.created_at) === month) : data
  return new NextResponse(signupsToCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="print-club-${month ?? 'all'}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
