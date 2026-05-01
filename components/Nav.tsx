'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()

  const scrollTo = (id: string) => {
    if (pathname !== '/') {
      window.location.href = `/#${id}`
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border px-13 py-[18px] flex items-center justify-between">
      <Link href="/" className="flex items-center gap-4">
        <span className="font-serif text-xl font-normal text-black tracking-[0.02em]">
          Médéric Souccar
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-9">
        <button
          onClick={() => scrollTo('listings')}
          className="text-xs text-gray tracking-[0.06em] uppercase hover:text-black transition-colors"
        >
          Propriétés
        </button>
        <button
          onClick={() => scrollTo('about')}
          className="text-xs text-gray tracking-[0.06em] uppercase hover:text-black transition-colors"
        >
          À propos
        </button>
        <button
          onClick={() => scrollTo('contact')}
          className="text-xs text-gray tracking-[0.06em] uppercase hover:text-black transition-colors"
        >
          Contact
        </button>
      </div>

      <button
        onClick={() => scrollTo('contact')}
        className="btn-dark text-[11px]"
      >
        Me contacter
      </button>
    </nav>
  )
}
