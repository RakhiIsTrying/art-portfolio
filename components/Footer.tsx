import Link from 'next/link'

const socials = [
  { href: 'https://instagram.com', label: 'Instagram' },
  { href: 'https://twitter.com',   label: 'Twitter'   },
]

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest">
          © Van Gone Broke <span className="text-rust">★</span> Art Studio
        </span>

        <div className="flex items-center gap-4">
          {socials.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-black uppercase tracking-widest
                         text-blush hover:text-rust transition-colors"
            >
              {label}
            </a>
          ))}
          <Link
            href="/inquire"
            className="text-[9px] font-black uppercase tracking-widest
                       text-blush hover:text-rust transition-colors"
          >
            Inquire
          </Link>
        </div>
      </div>
    </footer>
  )
}
