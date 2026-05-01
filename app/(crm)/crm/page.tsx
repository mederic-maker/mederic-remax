import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/format'
import type { Lead } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()

  const [
    { count: clientCount },
    { count: activeListings },
    { count: newLeads },
    { data: recentLeads },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'actif'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('converted', false),
    supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Clients', value: clientCount ?? 0, href: '/crm/clients' },
    { label: 'Listings actifs', value: activeListings ?? 0, href: '/crm/listings' },
    { label: 'Leads non traités', value: newLeads ?? 0, href: '/crm/leads', highlight: (newLeads ?? 0) > 0 },
  ]

  return (
    <div className="px-10 py-10">
      <h1 className="font-serif text-4xl font-normal text-black mb-8">Tableau de bord</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px bg-border border border-border mb-10">
        {stats.map(({ label, value, href, highlight }) => (
          <Link key={label} href={href} className="bg-white px-8 py-7 hover:bg-bg transition-colors">
            <div className={`font-serif text-5xl font-normal mb-1 ${highlight ? 'text-black' : 'text-black'}`}>
              {value}
            </div>
            <div className={`text-xs uppercase tracking-[0.08em] ${highlight && value > 0 ? 'text-black font-medium' : 'text-gray'}`}>
              {label}
              {highlight && value > 0 && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-black" />}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent leads */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl font-normal text-black">Derniers leads</h2>
          <Link href="/crm/leads" className="text-xs uppercase tracking-[0.08em] text-gray hover:text-black transition-colors">
            Voir tous →
          </Link>
        </div>

        <div className="border border-border bg-white">
          {recentLeads && recentLeads.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3 text-2xs uppercase tracking-[0.08em] text-gray font-normal">Nom</th>
                  <th className="text-left px-6 py-3 text-2xs uppercase tracking-[0.08em] text-gray font-normal">Courriel</th>
                  <th className="text-left px-6 py-3 text-2xs uppercase tracking-[0.08em] text-gray font-normal">Date</th>
                  <th className="text-left px-6 py-3 text-2xs uppercase tracking-[0.08em] text-gray font-normal">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead: Lead) => (
                  <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-bg transition-colors">
                    <td className="px-6 py-4 text-sm text-black">{lead.first_name} {lead.last_name}</td>
                    <td className="px-6 py-4 text-sm text-gray">{lead.email}</td>
                    <td className="px-6 py-4 text-sm text-gray">{formatDate(lead.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-2xs uppercase tracking-[0.07em] px-2 py-0.5 rounded-[1px] ${
                        lead.converted ? 'bg-bg text-gray' : 'bg-black text-white'
                      }`}>
                        {lead.converted ? 'Traité' : 'Nouveau'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-6 py-8 text-gray text-sm text-center">Aucun lead pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  )
}
