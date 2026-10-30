/** Bee, Ben and Dug-Dug together, the same cut-outs as on the puzzles. */
export default function FriendsTrio({ style, className }: { style?: React.CSSProperties; className?: string }) {
  return (
    <span aria-hidden className={className} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', ...style }}>
      {['/puzzles/bee.png', '/puzzles/ben.png', '/puzzles/dugdug.png'].map((src, k) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" style={{ height: k === 2 ? '72%' : '100%', marginLeft: k ? '-9%' : 0, objectFit: 'contain', filter: 'drop-shadow(0 10px 14px rgba(0,0,0,.35))', position: 'relative', zIndex: k === 2 ? 3 : 1 }} />
      ))}
    </span>
  )
}
