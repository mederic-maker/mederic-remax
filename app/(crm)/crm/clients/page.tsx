import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, STATUS_LABELS } from '@/lib/format'
import type { Client } from '@/types'

export default async function ClientsPage() {
  const supabase = createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="px-10 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl font-normal text-black">Clients</h1>
        <Link href="/crm/clients/new" className="btn-dark">
          + Nouveau client
        </Link>
      </div>

      <div className="border border-border bg-white">
        {clients && clients.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Nom', 'Téléphone', 'Type', 'Statut', 'Depuis'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-2xs uppercase tracking-[0.08em] text-gray font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client: Client) => (
                <tr key={client.id} className="border-b border-border last:border-0 hover:bg-bg transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/crm/clients/${client.id}`}
                      className="text-sm font-medium text-black hover:underline"
                    >
                      {client.first_name} {client.last_name}
                    </Link>
                    {client.email && (
                      <div className="text-xs text-gray mt-0.5">{client.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray">{client.phone ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray">{STATUS_LABELS[client.type] ?? client.type}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray">{formatDate(client.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-6 py-8 text-gray text-sm text-center">
            Aucun client pour le moment.{' '}
            <Link href="/crm/clients/new" className="text-black underline">Ajouter le premier.</Link>
          </p>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    actif:    'bg-black text-white',
    prospect: 'bg-bg text-mid border border-border',
    fermé:    'bg-gray text-white',
    inactif:  'bg-light text-mid',
  }
  return (
    <span className={`text-2xs uppercase tracking-[0.07em] px-2 py-0.5 rounded-[1px] ${map[status] ?? map.inactif}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
