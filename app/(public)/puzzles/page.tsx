import type { Metadata } from 'next'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getDaily } from '@/lib/puzzles/daily'
import PuzzleHub from '@/components/puzzles/PuzzleHub'

// Puzzles change every day (India time), so render per request
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Daily Puzzles — Van Gone Broke',
  description: 'Mini Sudoku over a new artwork, Wordle, Queens, Wend and Spelling Bee. New puzzles every day.',
}

const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'

export default async function PuzzlesPage() {
  const daily = getDaily()

  // Today's sudoku artwork rotates through the gallery
  const supabase = await getSupabaseServerClient()
  const { data: arts } = await supabase.from('artworks').select('title, image_url').order('created_at', { ascending: true })
  const art = arts?.length ? arts[(daily.number * 7) % arts.length] : null

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }} className="px-5 md:px-9 pt-10 pb-16">
      <div style={{ paddingBottom: 22, borderBottom: '1px solid #d0d0d0', marginBottom: 22 }}>
        <p style={{ fontSize: 10, letterSpacing: '.5em', textTransform: 'uppercase', fontWeight: 400, color: '#1a6060', marginBottom: 14 }}>
          ✦ Play
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
      <PuzzleHub daily={daily} art={art} />
    </div>
  )
}
