import Link from 'next/link'

const tags = [
  { label: 'Music',     className: 'bg-ink text-cream' },
  { label: 'Movies',    className: 'bg-rust text-cream' },
  { label: 'Comics',    className: 'bg-rose text-cream' },
  { label: 'Paper Art', className: 'bg-blush text-ink'  },
  { label: 'Originals', className: 'bg-cream text-ink'  },
]

export default function Hero() {
  return (
    <section className="min-h-[300px] flex flex-col items-center justify-center
                        bg-cream px-6 py-12 gap-3 border-b-4 border-ink">
      <p className="text-[10px] font-black uppercase tracking-[5px] text-rose">
        Welcome to the studio of
      </p>

      <h1 className="text-[clamp(44px,9vw,82px)] font-black uppercase tracking-widest
                     text-ink text-center leading-none">
        VAN GONE{' '}
        <span className="[-webkit-text-stroke:3px_#b04a33] text-transparent">
          BROKE
        </span>
      </h1>

      <div className="flex flex-wrap gap-2 justify-center mt-1">
        {tags.map(({ label, className }) => (
          <span
            key={label}
            className={`text-[9px] font-black uppercase tracking-widest
                        px-3 py-1 rounded-sm border-[2.5px] border-ink ${className}`}
          >
            {label}
          </span>
        ))}
      </div>

      <Link
        href="/gallery"
        className="mt-2 bg-ink text-cream text-[11px] font-black uppercase
                   tracking-widest px-9 py-3 border-[3px] border-ink rounded-sm
                   shadow-[5px_5px_0_#b04a33]
                   hover:translate-x-[3px] hover:translate-y-[3px]
                   hover:shadow-[2px_2px_0_#b04a33] transition-all"
      >
        View My Work →
      </Link>
    </section>
  )
}
