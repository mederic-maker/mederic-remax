import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate, STATUS_LABELS, formatPrice } from '@/lib/format'
import ClientActions from './ClientActions'
import type { Interaction } from '@/types'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  if (params.id === 'new') return null // handled by separate page

  const supabase = createClient()
  const [{ data: client }, { data: interactions }] = await Promise.all([
    supabase.from('clients').select('*, listings(address, city, price, status)').eq('id', params.id).single(),
    supabase.from('interactions').select('*').eq('client_id', params.id).order('date', { ascending: false }),
  ])

  if (!client) notFound()

  return (
    <div className="px-10 py-10">
      <div className="mb-8">
        <Link href="/crm/clients" className="text-xs text-gray hover:text-black uppercase tracking-[0.06em] transition-colors">
          ← Clients
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
        {/* Main */}
        <div>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-serif text-4xl font-normal text-black mb-1">
                {client.first_name} {client.last_name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-[0.07em] px-2 py-0.5 bg-black text-white rounded-[1px]">
                  {STATUS_LABELS[client.status] ?? client.status}
                </span>
                <span className="text-sm text-gray">{STATUS_LABELS[client.type]}</span>
              </div>
            </div>
            <ClientActions clientId={client.id} />
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-px bg-border border border-border mb-10">
            {[
              { label: 'Courriel', value: client.email },
              { label: 'Téléphone', value: client.phone },
              { label: 'Budget min', value: client.budget_min ? formatPrice(client.budget_min) : null },
              { label: 'Budget max', value: client.budget_max ? formatPrice(client.budget_max) : null },
              { label: 'Client depuis', value: formatDate(client.created_at) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white px-6 py-5">
                <div className="text-2xs uppercase tracking-[0.08em] text-gray mb-1">{label}</div>
                <div className="text-sm text-black">{value ?? '—'}</div>
              </div>
            ))}
          </div>

          {client.notes && (
            <div className="mb-10">
              <h2 className="text-xs uppercase tracking-[0.08em] text-gray mb-3">Notes</h2>
              <div className="border border-border bg-white p-6 text-sm text-mid leading-[1.7] whitespace-pre-wrap">
                {client.notes}
              </div>
            </div>
          )}

          {/* Interactions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl text-black">Historique</h2>
              <AddInteractionButton clientId={client.id} />
            </div>
            <div className="flex flex-col gap-2">
              {interactions && interactions.length > 0 ? (
                interactions.map((i: Interaction) => (
                  <div key={i.id} className="border border-border bg-white px-6 py-4 flex gap-4">
                    <div className="text-xs uppercase tracking-[0.07em] text-gray w-20 shrink-0 pt-0.5">{i.type}</div>
                    <div>
                      <div className="text-sm text-black mb-0.5">{i.notes}</div>
                      <div className="text-xs text-gray">{formatDate(i.date)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray">Aucune interaction enregistrée.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside>
          {client.listings && (
            <div className="border border-border bg-white p-6 mb-4">
              <div className="text-xs uppercase tracking-[0.08em] text-gray mb-3">Propriété liée</div>
              <div className="font-serif text-2xl mb-1">{formatPrice(client.listings.price)}</div>
              <div className="text-sm text-gray">{client.listings.address}, {client.listings.city}</div>
              <div className="mt-3">
                <span className="text-2xs uppercase tracking-[0.07em] px-2 py-0.5 bg-black text-white rounded-[1px]">
                  {STATUS_LABELS[client.listings.status] ?? client.listings.status}
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function AddInteractionButton({ clientId }: { clientId: string }) {
  return (
    <Link
      href={`/crm/clients/${clientId}/interaction`}
      className="text-xs uppercase tracking-[0.07em] text-gray hover:text-black border-b border-light pb-0.5 transition-colors"
    >
      + Ajouter
    </Link>
  )
}
