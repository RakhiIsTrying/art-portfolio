type TickerProps = {
  text: string
  direction: 'left' | 'right'
  variant: 'rust' | 'blush'
}

const variantStyles = {
  rust:  { bg: '#7a3040', color: 'rgba(255,255,255,.7)' },
  blush: { bg: '#1a1014', color: 'rgba(255,255,255,.35)' },
}

export default function Ticker({ text, direction, variant }: TickerProps) {
  const { bg, color } = variantStyles[variant]
  const animation = direction === 'left' ? 'animate-ticker-left' : 'animate-ticker-right'
  const content = `${text}     ${text}`

  return (
    <div style={{ background: bg, borderTop: '1px solid rgba(255,255,255,.08)', borderBottom: '1px solid rgba(255,255,255,.08)', overflow: 'hidden', padding: '7px 0', whiteSpace: 'nowrap' }}>
      <span
        className={`${animation} inline-block`}
        style={{ color, fontSize: '7px', fontWeight: 400, letterSpacing: '.4em', textTransform: 'uppercase' }}
      >
        {content}
      </span>
    </div>
  )
}
