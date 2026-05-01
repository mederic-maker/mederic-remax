'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Users, Home, MessageSquare, LogOut, Globe } from 'lucide-react'
import PushToggle from '@/components/PushToggle'

const NAV = [
  { href: '/crm',          label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/crm/clients',  label: 'Clients',          icon: Users },
  { href: '/crm/listings', label: 'Listings',         icon: Home },
  { href: '/crm/leads',    label: 'Leads',            icon: MessageSquare },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="w-56 shrink-0 bg-black text-white flex flex-col h-screen sticky top-0">
      <div className="px-6 py-7 border-b border-white/10">
        <div className="font-serif text-lg">Médéric Souccar</div>
        <div className="text-2xs text-white/40 tracking-[0.08em] uppercase mt-0.5">CRM</div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-0.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Globe size={15} />
          Site public
        </Link>
        <PushToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full text-left"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
