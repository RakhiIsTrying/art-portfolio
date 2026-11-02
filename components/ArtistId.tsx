import ArtFill from '@/components/ArtFill'

const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'
const INK = '#1a1014'
const WINE = '#7a3040'
const PAPER = '#fbf3df'

const DETAILS = [
  ['Occupation', 'Architect, artist, money-hungry yes-woman'],
  ['Day job', 'Corporate. Mornings. Please send snacks.'],
  ['Pronoun', 'Pauvre'],
  ['Responds to', 'Machine payment sounds, or money being thrown at me'],
  ['Condition', 'Paw-sessed woof worshipper'],
  ['Emergency contact', 'Dug-Dug (does not pick up)'],
  ['Bank balance', 'See name of website'],
  ['Current status', 'In a meeting, physically'],
]

/** A round passport stamp with its words running around the edge. */
function RoundStamp({ id, around, middle, color, style }: { id: string; around: string; middle: string[]; color: string; style: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden style={{ position: 'absolute', pointerEvents: 'none', mixBlendMode: 'multiply', ...style }}>
      <defs><path id={id} d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1 -86 0" /></defs>
      <g fill="none" stroke={color} opacity=".82">
        <circle cx="60" cy="60" r="56" strokeWidth="3" />
        <circle cx="60" cy="60" r="35" strokeWidth="1.5" />
      </g>
      <text fill={color} opacity=".82" fontSize="11" fontWeight="700" letterSpacing="1.5"><textPath href={`#${id}`}>{around}</textPath></text>
      <text fill={color} opacity=".82" fontSize="11" fontWeight="800" textAnchor="middle" y={60 - (middle.length - 1) * 6.5 + 4}>
        {middle.map((line, i) => <tspan key={line} x="60" dy={i ? 13 : 0}>{line}</tspan>)}
      </text>
    </svg>
  )
}

/** The artist's Instagram bio, issued as a mock passport. */
export default function ArtistId({ portraitUrl }: { portraitUrl?: string }) {
  return (
    <section aria-labelledby="id-card" style={{ position: 'relative', overflow: 'hidden', background: PAPER, border: `2px solid ${INK}`, borderRadius: 14, boxShadow: '0 22px 50px rgba(26,16,20,.18)', marginBottom: 48 }}>

      {/* Banknote-style line pattern behind everything */}
      <svg aria-hidden width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: .38 }}>
        <defs>
          <pattern id="id-waves" width="72" height="24" patternUnits="userSpaceOnUse">
            <path d="M0 12c12-12 24-12 36 0s24 12 36 0" fill="none" stroke="#c9a97e" strokeWidth="1" />
            <path d="M0 24c12-12 24-12 36 0s24 12 36 0" fill="none" stroke="#b07880" strokeWidth=".6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#id-waves)" />
      </svg>

      <header style={{ position: 'relative', background: INK, color: PAPER, padding: '14px clamp(16px, 3vw, 26px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 16px' }}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: '.35em', textTransform: 'uppercase', color: '#e8c55a', marginBottom: 3 }}>Republic of Van Gone Broke</p>
          <h2 id="id-card" style={{ fontFamily: PLAYFAIR, fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, lineHeight: 1.1 }}>Official Artist ID</h2>
        </div>
        <p style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(251,243,223,.75)' }}>No. VGB-0001 · Est. 2024</p>
      </header>
      <div aria-hidden style={{ position: 'relative', height: 5, background: 'linear-gradient(90deg, #7a3040 25%, #1e3a8a 25% 50%, #1a6060 50% 75%, #7a5020 75%)' }} />

      <div className="grid sm:grid-cols-[minmax(170px,230px)_1fr]" style={{ position: 'relative', gap: 'clamp(18px, 3vw, 30px)', padding: 'clamp(16px, 3vw, 26px)' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 230, margin: '0 auto' }}>
          <div style={{ position: 'relative' }}>
            {portraitUrl && (
              <div style={{ background: '#fff', padding: 7, border: `1px solid ${INK}` }}>
                <div style={{ position: 'relative', aspectRatio: '4/5' }}>
                  <ArtFill src={portraitUrl} alt="ID photo of Rakhi and Dug-Dug" sizes="230px" />
                </div>
              </div>
            )}
            <RoundStamp id="stamp-feral" around="VAN GONE BROKE ★ NIGHT SHIFT ★" middle={['CERTIFIED', 'FERAL']} color={WINE} style={{ width: 92, right: -16, bottom: -12, transform: 'rotate(-14deg)' }} />
          </div>
          <p style={{ marginTop: 22, textAlign: 'center' }}>
            <span style={{ display: 'block', fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 25, lineHeight: 1.1, color: '#1e3a8a', transform: 'rotate(-3deg)' }}>Rakhi Sinha</span>
            <span style={{ display: 'block', marginTop: 4, paddingTop: 4, borderTop: `1px solid ${INK}`, fontSize: 9, letterSpacing: '.25em', textTransform: 'uppercase', color: '#6b5a4a' }}>Signature of holder</span>
          </p>
        </div>

        {/* One grid, so every label and every answer starts on the same line */}
        <div style={{ position: 'relative', minWidth: 0 }}>
          <dl>
            {DETAILS.map(([label, value], i) => (
              <div key={label} className="grid grid-cols-1 sm:grid-cols-[172px_1fr]" style={{ alignItems: 'baseline', gap: '2px 14px', padding: `${i ? 11 : 0}px 0 11px`, borderBottom: '1px dashed rgba(26,16,20,.3)' }}>
                <dt style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 600, lineHeight: 1.5, color: WINE, whiteSpace: 'nowrap' }}>{label}</dt>
                <dd style={{ margin: 0, fontFamily: PLAYFAIR, fontSize: 'clamp(17px, 2vw, 20px)', lineHeight: 1.3, color: INK, whiteSpace: 'normal' }}>{value}</dd>
              </div>
            ))}
          </dl>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <div aria-hidden style={{ padding: '6px 10px', border: '3px double #1a6060', borderRadius: 4, color: '#1a6060', opacity: .85, mixBlendMode: 'multiply', fontSize: 10, fontWeight: 800, letterSpacing: '.14em', lineHeight: 1.3, textAlign: 'center', transform: 'rotate(4deg)' }}>
              APPROVED<br />BY DUG-DUG 🐾
            </div>
          </div>
        </div>
      </div>

      {/* The passport's machine-readable strip */}
      <div aria-hidden style={{ position: 'relative', overflow: 'hidden', padding: '10px clamp(16px, 3vw, 26px)', background: '#f1e4c4', borderTop: `1px solid ${INK}`, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 'clamp(10px, 1.7vw, 15px)', fontWeight: 600, letterSpacing: '.12em', lineHeight: 1.5, color: INK, whiteSpace: 'nowrap' }}>
        <div>P&lt;VGB&lt;SINHA&lt;&lt;RAKHI&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
        <div>FERAL&lt;&lt;&lt;DUGDUG&lt;&lt;&lt;NO&lt;BLOCKERS&lt;&lt;&lt;SEND&lt;SNACKS&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
      </div>
    </section>
  )
}
