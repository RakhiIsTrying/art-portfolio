import type { Metadata } from 'next'
import Image from 'next/image'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import PrintClubForm from '@/components/PrintClubForm'
import type { Artwork } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Print Club — Van Gone Broke',
  description: 'A new print in your mailbox every month. $15 / month.',
}

const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'

// What members get — edit freely
const PERKS = [
  { title: 'A new print, every month', body: 'A fresh piece mailed to your door — music, movies, comics or Dug-Dug.' },
  { title: 'First look',               body: 'See new work before it’s posted anywhere else.' },
  { title: 'Cancel anytime',           body: 'No commitment. Stay as long as the prints make you happy.' },
]

// Fanned stack of recent pieces
const FAN = [
  { rotate: -9, x: -38, y: 14, z: 1 },
  { rotate: 7,  x: 42,  y: 8,  z: 2 },
  { rotate: -1, x: 0,   y: 0,  z: 3 },
]

export default async function PrintClubPage() {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('artworks').select('*')
    .order('created_at', { ascending: false })
    .limit(3)
  const pieces = (data ?? []) as Artwork[]

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }} className="px-5 md:px-9 pt-10 pb-16">

      <div className="grid md:grid-cols-[1.1fr_1fr] gap-12 md:gap-16 items-center" style={{ marginBottom: 56 }}>

        {/* Pitch */}
        <div>
          <p style={{ fontSize: 10, letterSpacing: '.5em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040', marginBottom: 14 }}>
            ✦ Members
          </p>
          <h1 style={{ marginBottom: 22 }}>
            <span style={{ display: 'block', fontFamily: PLAYFAIR, fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', lineHeight: .95, color: '#1a1014' }}>
              Print
            </span>
            <span style={{ display: 'block', fontFamily: PLAYFAIR, fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.05, color: '#b07880' }}>
              Club
            </span>
          </h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
            <span style={{ fontFamily: PLAYFAIR, fontSize: 44, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>$15</span>
            <span style={{ fontSize: 11, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 300, color: '#787878' }}>/ month</span>
          </div>

          <p style={{ maxWidth: 440, fontSize: 14, lineHeight: 1.8, fontWeight: 300, color: '#787878', marginBottom: 30 }}>
            Art in your mailbox instead of bills. Join the club and get a new Van Gone Broke print every month.
          </p>

          <ul style={{ listStyle: 'none', borderTop: '1px solid #d0d0d0' }}>
            {PERKS.map((p, i) => (
              <li key={p.title} style={{ display: 'flex', gap: 18, padding: '16px 0', borderBottom: '1px solid #d0d0d0' }}>
                <span style={{ fontSize: 10, letterSpacing: '.3em', color: '#b07880', paddingTop: 2 }}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014', marginBottom: 4 }}>{p.title}</p>
                  <p style={{ fontSize: 12, lineHeight: 1.7, fontWeight: 300, color: '#787878' }}>{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Fanned prints */}
        <div aria-hidden="true" style={{ position: 'relative', height: 'clamp(340px, 46vw, 480px)' }}>
          <div style={{ position: 'absolute', inset: '8% 4%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(176,120,128,.28), transparent 65%)' }} />
          {pieces.map((art, i) => {
            const f = FAN[i + (FAN.length - pieces.length)]
            return (
              <div key={art.id} style={{
                position: 'absolute', left: '50%', top: '50%', width: '54%', aspectRatio: '4/5',
                transform: `translate(calc(-50% + ${f.x}%), calc(-50% + ${f.y}px)) rotate(${f.rotate}deg)`,
                zIndex: f.z, background: '#fff', padding: '5%',
                boxShadow: '0 22px 50px rgba(26,16,20,.22), 0 3px 10px rgba(26,16,20,.12)',
              }}>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image src={art.image_url} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 300px" priority={i === pieces.length - 1} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sign-up */}
      <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 md:gap-16" style={{ background: '#fff', border: '1px solid #d0d0d0', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7a3040 25%, #1e3a8a 25% 50%, #1a6060 50% 75%, #7a5020 75%)' }} />
        <div className="p-7 md:p-10 md:pr-0">
          <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040', marginBottom: 12 }}>
            Apply to join
          </p>
          <p style={{ fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 'clamp(24px, 2.6vw, 32px)', lineHeight: 1.2, color: '#1a1014', marginBottom: 14 }}>
            A little art, every month.
          </p>
          <p style={{ fontSize: 12, lineHeight: 1.8, fontWeight: 300, color: '#787878' }}>
            $15 a month, cancel anytime. Fill in where to reach you and where to send your prints — I’ll be in touch to get you set up.
          </p>
        </div>
        <div className="p-7 md:p-10 md:pl-0">
          <PrintClubForm />
        </div>
      </div>

    </div>
  )
}
