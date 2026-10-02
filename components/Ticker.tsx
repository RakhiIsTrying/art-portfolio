type TickerProps = {
  text: string
  direction: 'left' | 'right'
  variant: 'rust' | 'blush'
}

export default function Ticker({ text, direction, variant }: TickerProps) {
  const bg        = variant === 'rust' ? 'bg-rust' : 'bg-blush'
  const textColor = variant === 'rust' ? 'text-cream' : 'text-ink'
  const animation = direction === 'left' ? 'animate-ticker-left' : 'animate-ticker-right'

  const content = `${text}     ${text}`

  return (
    <div className={`${bg} border-y-4 border-ink overflow-hidden py-2 whitespace-nowrap`}>
      <span className={`${textColor} ${animation} inline-block text-xs font-black uppercase tracking-widest`}>
        {content}
      </span>
    </div>
  )
}
