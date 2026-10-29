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
    <div style={{ maxWidth: 1000, margin: '0 auto' }} className="px-5 md:px-9 pt-10 pb-16">
      <div style={{ paddingBottom: 22, borderBottom: '1px solid #d0d0d0', marginBottom: 22, textAlign: 'center' }}>
        {mascot && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mascot} alt="Dug-Dug" style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'contain', padding: 11, boxSizing: 'border-box', margin: '0 auto 14px', display: 'block', background: '#fff', boxShadow: '0 0 0 3px #4a3a7a, 0 8px 20px rgba(26,16,20,.15)' }} />
        )}
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
      <PuzzleHub daily={daily} art={art} theme={theme} />
    </div>
  )
}
