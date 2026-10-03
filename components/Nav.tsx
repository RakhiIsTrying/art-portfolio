import Link from 'next/link'

const links = [
  { href: '/gallery', label: 'Gallery' },
  { href: '/videos',  label: 'Videos'  },
  { href: '/puzzles', label: 'Puzzles' },
  { href: '/about',   label: 'About'   },
]

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-cream border-b-4 border-ink">
      <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-black uppercase tracking-widest text-ink"
        >
          VAN GONE{' '}
          <span className="text-rust">★</span>{' '}
          BROKE
        </Link>

        <div className="flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[9px] font-black uppercase tracking-widest text-ink
                         border-b-2 border-transparent hover:border-rust
                         hover:text-rust transition-colors pb-0.5"
            >
              {label}
            </Link>
          ))}

          <Link
            href="/inquire"
            className="text-[9px] font-black uppercase tracking-widest
                       bg-rust text-cream px-4 py-1.5 rounded-sm
                       border-[2.5px] border-ink
                       shadow-[3px_3px_0_#1f1f1f]
                       hover:translate-x-0.5 hover:translate-y-0.5
                       hover:shadow-[1px_1px_0_#1f1f1f]
                       transition-all"
          >
            Inquire
          </Link>
        </div>
      </div>
    </nav>
  )
}
