import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/format'
import type { Lead } from '@/types'
import LeadActions from './LeadActions'

export default async function LeadsPage() {
  const supabase = createClient()
  const { data: leads } = await supabase
    .from('leads')
    .select('*, listings(address)')
    .order('created_at', { ascending: false })

  const newLeads = leads?.filter((l: Lead) => !l.converted) ?? []
  const done = leads?.filter((l: Lead) => l.converted) ?? []

  return (
    <div className="px-10 py-10">
      <h1 className="font-serif text-4xl font-normal text-black mb-8">Leads</h1>

      {newLeads.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-[0.1em] text-black mb-5 flex items-center gap-2">
            À traiter
            <span className="inline-block w-2 h-2 rounded-full bg-black" />
          </h2>
          <LeadTable leads={newLeads} />
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-[0.1em] text-gray mb-5">Traités ({done.length})</h2>
          <div className="opacity-60">
            <LeadTable leads={done} />
          </div>
        </section>
      )}

      {(!leads || leads.length === 0) && (
        <p className="text-gray text-sm">Aucun lead pour le moment. Ils apparaîtront ici dès qu&apos;un visiteur remplit le formulaire de contact.</p>
      )}
    </div>
  )
}

function LeadTable({ leads }: { leads: (Lead & { listings?: { address: string } | null })[] }) {
  return (
    <div className="border border-border bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {['Nom', 'Courriel', 'Téléphone', 'Propriété', 'Message', 'Date', ''].map((h) => (
              <th key={h} className="text-left px-5 py-3 text-2xs uppercase tracking-[0.08em] text-gray font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-bg transition-colors">
              <td className="px-5 py-4 text-sm font-medium text-black whitespace-nowrap">
                {lead.first_name} {lead.last_name}
              </td>
              <td className="px-5 py-4 text-sm text-gray">{lead.email}</td>
              <td className="px-5 py-4 text-sm text-gray">{lead.phone ?? '—'}</td>
              <td className="px-5 py-4 text-sm text-gray">
                {lead.listings?.address ?? '—'}
              </td>
              <td className="px-5 py-4 text-sm text-mid max-w-xs">
                <p className="truncate">{lead.message}</p>
              </td>
              <td className="px-5 py-4 text-sm text-gray whitespace-nowrap">{formatDate(lead.created_at)}</td>
              <td className="px-5 py-4">
                <LeadActions leadId={lead.id} converted={lead.converted} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
