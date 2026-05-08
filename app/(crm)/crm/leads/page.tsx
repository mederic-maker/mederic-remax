import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/format'
import Link from 'next/link'
import LeadActions from './LeadActions'
import { STAGES } from '@/components/crm/KanbanBoard'

export const dynamic = 'force-dynamic'

const STAGE_LABELS = Object.fromEntries(STAGES.map((s) => [s.id, s.label]))

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { stage?: string; q?: string }
}) {
  const supabase = createClient()
  let query = supabase
    .from('leads')
    .select('*, listings(address)')
    .order('created_at', { ascending: false })

  if (searchParams.stage) query = query.eq('stage', searchParams.stage)

  const { data: leads } = await query

  const today = new Date().toISOString().slice(0, 10)
  const dueCount = leads?.filter((l) =>
    l.follow_up_date && l.follow_up_date <= today && !l.follow_up_sent
  ).length ?? 0

  return (
    <div className="px-10 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl font-normal text-black">Leads</h1>
          {dueCount > 0 && (
            <p className="text-sm text-black font-medium mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black inline-block" />
              {dueCount} follow-up{dueCount > 1 ? 's' : ''} à faire aujourd&apos;hui
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/crm/kanban" className="btn-ghost text-xs">
            Vue Kanban
          </Link>
          <Link href="/crm/leads/new" className="btn-dark">+ Nouveau lead</Link>
        </div>
      </div>

      {/* Filtres par stage */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Link
          href="/crm/leads"
          className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
            !searchParams.stage ? 'bg-black text-white border-black' : 'border-border text-gray hover:text-black'
          }`}
        >
          Tous
        </Link>
        {STAGES.map((s) => (
          <Link
            key={s.id}
            href={`/crm/leads?stage=${s.id}`}
            className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
              searchParams.stage === s.id
                ? 'bg-black text-white border-black'
                : 'border-border text-gray hover:text-black'
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="border border-border bg-white">
        {leads && leads.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Nom', 'Contact', 'Étape', 'Propriété', 'Follow-up', 'Reçu', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-2xs uppercase tracking-[0.08em] text-gray font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const due = lead.follow_up_date && lead.follow_up_date <= today && !lead.follow_up_sent
                return (
                  <tr key={lead.id}
                    className={`border-b border-border last:border-0 hover:bg-bg transition-colors ${due ? 'bg-stone-50' : ''}`}>
                    <td className="px-5 py-4">
                      <Link href={`/crm/leads/${lead.id}`}
                        className="text-sm font-medium text-black hover:underline whitespace-nowrap">
                        {lead.first_name} {lead.last_name}
                      </Link>
                      {due && (
                        <span className="ml-2 text-2xs uppercase tracking-widest text-black font-bold">● follow-up</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-gray">{lead.email}</div>
                      {lead.phone && <div className="text-xs text-light">{lead.phone}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <StageBadge stage={lead.stage} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray">{lead.listings?.address ?? '—'}</td>
                    <td className="px-5 py-4 text-sm text-gray">
                      {lead.follow_up_date ? formatDate(lead.follow_up_date) : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray whitespace-nowrap">{formatDate(lead.created_at)}</td>
                    <td className="px-5 py-4">
                      <LeadActions leadId={lead.id} converted={lead.converted} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <p className="px-6 py-8 text-gray text-sm text-center">
            Aucun lead.{' '}
            <Link href="/crm/leads/new" className="text-black underline">Ajouter le premier.</Link>
          </p>
        )}
      </div>
    </div>
  )
}

function StageBadge({ stage }: { stage: string }) {
  const s = STAGES.find((x) => x.id === stage)
  return (
    <span className="flex items-center gap-1.5 text-2xs uppercase tracking-[0.07em] text-mid">
      <span className={`w-1.5 h-1.5 rounded-full ${s?.dot ?? 'bg-gray'}`} />
      {s?.label ?? stage}
    </span>
  )
}
