import type { Metadata } from 'next'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { archiveDates, getDaily, todayKey } from '@/lib/puzzles/daily'
import PuzzleHub from '@/components/puzzles/PuzzleHub'

// Puzzles change every day (India time), so render per request
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Daily Puzzles | Van Gone Broke',
  description: 'Mini Sudoku over a new drawing, Wordle, Dug-Dug Kings, Walkies and Bee’s Hive. New puzzles every day.',
}

const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'

export default async function PuzzlesPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  // ?date=YYYY-MM-DD plays a day from the past month; anything else shows today
  const { date } = await searchParams
  const today = todayKey()
  const dates = archiveDates(today)
  const daily = getDaily(date && dates.includes(date) ? date : today)

  // Bee, Ben & Dug-Dug drawings theme the puzzles; today's sudoku art rotates through them
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase.from('artworks').select('title, image_url')
    .eq('collection_slug', 'bee-ben').order('created_at', { ascending: true })
  const arts = (data ?? []).filter(a => a.title !== 'Cozy Portrait')
  const mascot = arts.find(a => a.title === 'Happy Pupper Dug-Dug')?.image_url ?? null
  const art = arts.length ? arts[daily.number % arts.length] : null
  // Shift the banner art each day so it doesn't repeat the sudoku drawing
  const theme = { mascot, arts: arts.slice(daily.number % Math.max(arts.length, 1)).concat(arts.slice(0, daily.number % Math.max(arts.length, 1))) }

  return (
    <div className="mx-auto max-w-[1120px] xl:max-w-[min(1120px,calc(100vw-400px))] px-4 sm:px-6 md:px-9 pt-8 md:pt-10 pb-16">
      <div style={{ paddingBottom: 22, borderBottom: '1px solid #d0d0d0', marginBottom: 22, textAlign: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/puzzles/dugdug.png" alt="Dug-Dug" style={{ height: 96, margin: '0 auto 12px', display: 'block', filter: 'drop-shadow(0 8px 12px rgba(26,16,20,.2))' }} />
        <p style={{ fontSize: 10, letterSpacing: '.5em', textTransform: 'uppercase', fontWeight: 400, color: '#4a3a7a', marginBottom: 14 }}>
          ✦ Play with Bee, Ben &amp; Dug-Dug
        </p>
        <h1>
          <span style={{ fontFamily: PLAYFAIR, fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', lineHeight: .95, color: '#1a1014' }}>
            Daily{' '}
          </span>
          <span style={{ fontFamily: PLAYFAIR, fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.05, color: '#b07880' }}>
            Puzzles
          </span>
        </h1>
      </div>
      <PuzzleHub daily={daily} art={art} theme={theme} dates={dates} today={today} />
    </div>
  )
}
