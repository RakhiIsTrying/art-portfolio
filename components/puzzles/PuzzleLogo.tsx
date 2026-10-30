/** The Daily Puzzles logo: PUZZLES as game tiles, with Bee, Ben and Dug-Dug joining in. */
const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'
const INK = '#1a1014'

// One colour per tile, borrowed from the games (green/yellow/red tiles, honey, purple, autumn)
const TILES: [string, string, string][] = [
  ['P', '#3f8f4f', '#fff'], ['U', '#e8c55a', INK], ['Z', '#4a3a7a', '#fff'], ['Z', '#a0521d', '#fff'],
  ['L', '#b8433b', '#fff'], ['E', '#d9a521', INK], ['S', '#1a6060', '#fff'],
]
const TILT = [-6, 4, -3, 5, -4, 3, -5]

export default function PuzzleLogo() {
  const friend = (src: string, alt: string, style: React.CSSProperties) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="vgb-motion" style={{ position: 'absolute', filter: 'drop-shadow(0 0 2px #fff) drop-shadow(0 8px 10px rgba(26,16,20,.22))', ...style }} />
  )
  return (
    <div style={{ position: 'relative', display: 'inline-block', padding: 'clamp(46px, 7vw, 64px) clamp(44px, 8vw, 92px) 8px' }}>
      {/* Dug-Dug sits on top of the tiles; Bee and Ben lean in from the sides */}
      {friend('/puzzles/dugdug.png', 'Dug-Dug', { left: 'calc(50% - clamp(18px, 2.6vw, 26px))', top: 0, height: 'clamp(56px, 8vw, 80px)', animation: 'vgb-hop 1s ease-out .9s both' })}
      {friend('/puzzles/bee.png', 'Bee', { left: 0, bottom: 0, height: 'clamp(64px, 10vw, 112px)', animation: 'vgb-tile-pop .6s cubic-bezier(.2,1.4,.4,1) .2s both' })}
      {friend('/puzzles/ben.png', 'Ben', { right: 0, bottom: 0, height: 'clamp(64px, 10vw, 112px)', animation: 'vgb-tile-pop .6s cubic-bezier(.2,1.4,.4,1) .35s both' })}

      {/* "Daily" ribbon */}
      <span style={{ position: 'relative', zIndex: 2, display: 'inline-block', marginBottom: 8, padding: '4px 14px', background: INK, color: '#e8c55a', borderRadius: 999,
                     fontFamily: PLAYFAIR, fontStyle: 'italic', fontWeight: 700, fontSize: 'clamp(15px, 2vw, 20px)', letterSpacing: '.04em', transform: 'rotate(-3deg)' }}>
        Daily
      </span>

      {/* The tiles */}
      <h1 aria-label="Daily Puzzles" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', gap: 'clamp(3px, .6vw, 6px)' }}>
        {TILES.map(([l, bg, fg], i) => (
          <span key={i} aria-hidden style={{ display: 'inline-flex', transform: `rotate(${TILT[i]}deg)` }}><span className="vgb-motion" style={{
            width: 'clamp(30px, 6.4vw, 60px)', height: 'clamp(34px, 7.2vw, 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: bg, color: fg, borderRadius: 8, fontFamily: PLAYFAIR, fontWeight: 800, fontSize: 'clamp(20px, 4.4vw, 42px)',
            boxShadow: '0 4px 0 rgba(26,16,20,.28), 0 10px 18px rgba(26,16,20,.12)',
            animation: `vgb-tile-pop .55s cubic-bezier(.2,1.5,.4,1) ${0.15 + i * 0.08}s both`,
          }}>{l}</span></span>
        ))}
      </h1>
    </div>
  )
}
