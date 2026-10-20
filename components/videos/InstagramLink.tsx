export default function InstagramLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:[color:#fff] hover:[border-color:#fff]"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 400,
        color: 'rgba(255,255,255,.65)', textDecoration: 'none',
        borderBottom: '1px solid rgba(255,255,255,.3)', paddingBottom: 2, transition: 'color .2s, border-color .2s',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
      View on Instagram ↗
    </a>
  )
}
