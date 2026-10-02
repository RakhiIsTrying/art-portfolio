import Link from 'next/link'

const socials = [
  { label: 'Instagram', href: 'https://instagram.com', handle: '@yourhandle' },
  { label: 'Twitter',   href: 'https://twitter.com',   handle: '@yourhandle' },
]

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-black uppercase tracking-widest text-ink mb-10">
        ✦ About
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-4 border-ink">
        <div className="relative aspect-square border-b-4 md:border-b-0 md:border-r-4 border-ink">
          <div className="absolute inset-0 bg-blush flex items-center justify-center">
            <span className="text-6xl">🎨</span>
          </div>
        </div>

        <div className="p-8 flex flex-col justify-between gap-8">
          <div>
            <h2 className="text-xl font-black uppercase tracking-widest text-ink mb-4">
              Your Name
            </h2>
            <p className="text-sm text-ink leading-relaxed font-bold mb-3">
              Artist based in [City]. Creating pop culture digital and paper art
              inspired by music, movies, comics and everyday joy.
            </p>
            <p className="text-sm text-ink leading-relaxed font-bold mb-3">
              Specialising in digital illustration, chibi characters, stickers,
              and hand-crafted paper art. Original creator of Bee, Ben & Dug-Dug.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[9px] font-black uppercase tracking-[4px] text-rose">
              Find me online
            </p>
            {socials.map(({ label, href, handle }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2
                           border-2 border-ink bg-cream
                           hover:bg-blush transition-colors"
              >
                <span className="text-[9px] font-black uppercase tracking-widest text-ink">
                  {label}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-rust">
                  {handle} →
                </span>
              </a>
            ))}
          </div>

          <Link
            href="/inquire"
            className="text-center text-[9px] font-black uppercase tracking-widest
                       bg-rust text-cream px-6 py-3 border-2 border-ink
                       shadow-[3px_3px_0_#1f1f1f]
                       hover:translate-x-0.5 hover:translate-y-0.5
                       hover:shadow-[1px_1px_0_#1f1f1f] transition-all"
          >
            Get in Touch →
          </Link>
        </div>
      </div>
    </div>
  )
}
