import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/format'
import { STAGES } from '@/lib/stages'
import LeadDetailActions from './LeadDetailActions'
import MessageComposer from './MessageComposer'
import FollowUpSetter from './FollowUpSetter'
import StageSwitcher from './StageSwitcher'

const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.id, s.label]))

export const dynamic = 'force-dynamic'

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const [{ data: lead }, { data: emailLogs }, { data: smsLogs }] = await Promise.all([
    supabase.from('leads').select('*, listings(address, city, price)').eq('id', params.id).single(),
    supabase.from('email_logs').select('*').eq('lead_id', params.id).order('created_at', { ascending: false }),
    supabase.from('sms_logs').select('*').eq('lead_id', params.id).order('created_at', { ascending: false }),
  ])

  if (!lead) notFound()

  const today = new Date().toISOString().slice(0, 10)
  const followUpDue = lead.follow_up_date && lead.follow_up_date <= today && !lead.follow_up_sent

  return (
    <div className="px-10 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/crm/leads" className="text-xs text-gray hover:text-black uppercase tracking-[0.06em]">
          ← Leads
        </Link>
        <LeadDetailActions leadId={lead.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        {/* Left */}
        <div>
          <div className="mb-6">
            <h1 className="font-serif text-4xl font-normal text-black mb-2">
              {lead.first_name} {lead.last_name}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <StageSwitcher leadId={lead.id} currentStage={lead.stage} />
              {followUpDue && (
                <span className="text-xs uppercase tracking-widest text-black font-bold px-2 py-0.5 bg-stone-100 border border-border rounded-sm">
                  ⏰ Follow-up dû
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-px bg-border border border-border mb-8">
            {[
              { label: 'Courriel',    value: lead.email,
                link: lead.email ? `mailto:${lead.email}` : undefined },
              { label: 'Téléphone',   value: lead.phone ?? '—',
                link: lead.phone ? `tel:${lead.phone}` : undefined },
              { label: 'Follow-up',   value: lead.follow_up_date ? formatDate(lead.follow_up_date) : '—' },
              { label: 'Reçu le',     value: formatDate(lead.created_at) },
              { label: 'Propriété',   value: lead.listings ? `${lead.listings.address}, ${lead.listings.city}` : '—' },
              { label: 'Email auto',  value: lead.auto_email_sent ? '✓ Envoyé' : '—' },
              { label: 'SMS auto',    value: lead.auto_sms_sent ? '✓ Envoyé' : '—' },
            ].map(({ label, value, link }) => (
              <div key={label} className="bg-white px-5 py-4">
                <div className="text-2xs uppercase tracking-[0.08em] text-gray mb-1">{label}</div>
                {link ? (
                  <a href={link} className="text-sm text-black hover:underline">{value}</a>
                ) : (
                  <div className="text-sm text-black">{value}</div>
                )}
              </div>
            ))}
          </div>

          {/* Message original */}
          <div className="border border-border bg-white p-6 mb-8">
            <div className="text-2xs uppercase tracking-[0.08em] text-gray mb-3">Message original</div>
            <p className="text-sm text-mid leading-[1.7] whitespace-pre-wrap">{lead.message}</p>
          </div>

          {/* Notes internes */}
          {lead.notes && (
            <div className="border border-border bg-bg p-6 mb-8">
              <div className="text-2xs uppercase tracking-[0.08em] text-gray mb-3">Notes internes</div>
              <p className="text-sm text-mid leading-[1.7] whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}

          {/* Composer email / SMS */}
          <MessageComposer
            leadId={lead.id}
            email={lead.email}
            phone={lead.phone}
            name={`${lead.first_name} ${lead.last_name}`}
          />

          {/* Logs */}
          <div className="mt-8">
            <h2 className="font-serif text-2xl text-black mb-4">Historique communications</h2>
            <div className="flex flex-col gap-2">
              {[...(emailLogs ?? []).map((l) => ({ ...l, _type: 'email' })),
                ...(smsLogs ?? []).map((l) => ({ ...l, _type: 'sms' })),
              ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
               .map((log) => (
                <div key={log.id} className="border border-border bg-white px-5 py-4 flex gap-4">
                  <span className={`text-2xs uppercase tracking-[0.07em] shrink-0 w-12 pt-0.5 ${log.sent ? 'text-black' : 'text-red-500'}`}>
                    {log._type === 'email' ? '✉ Email' : '💬 SMS'}
                  </span>
                  <div>
                    {log._type === 'email' && (
                      <div className="text-sm font-medium text-black mb-0.5">{(log as { subject: string }).subject}</div>
                    )}
                    <div className="text-sm text-mid">{(log as { body: string }).body.slice(0, 120)}{(log as { body: string }).body.length > 120 ? '…' : ''}</div>
                    <div className="text-xs text-gray mt-1">{formatDate(log.created_at)}</div>
                    {!log.sent && log.error && (
                      <div className="text-xs text-red-500 mt-1">Erreur : {log.error}</div>
                    )}
                  </div>
                </div>
              ))}
              {(!emailLogs?.length && !smsLogs?.length) && (
                <p className="text-sm text-gray">Aucune communication enregistrée.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="flex flex-col gap-4">
          <FollowUpSetter
            leadId={lead.id}
            currentDate={lead.follow_up_date}
          />
        </aside>
      </div>
    </div>
  )
}
