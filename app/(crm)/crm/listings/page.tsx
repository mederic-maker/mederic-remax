import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatPrice, formatDate, STATUS_LABELS } from '@/lib/format'
import type { Listing } from '@/types'

const STATUS_CLS: Record<string, string> = {
  actif:      'bg-black text-white',
  sous_offre: 'bg-mid text-white',
  vendu:      'bg-gray text-white',
  retiré:     'bg-light text-mid',
}

export default async function CrmListingsPage() {
  const supabase = createClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="px-10 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl font-normal text-black">Listings</h1>
        <Link href="/crm/listings/new" className="btn-dark">+ Nouveau listing</Link>
      </div>

      <div className="border border-border bg-white">
        {listings && listings.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Adresse', 'Prix', 'Statut', 'Ch.', 'Sdb.', 'Pi²', 'Ajouté'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-2xs uppercase tracking-[0.08em] text-gray font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map((l: Listing) => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-bg transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/crm/listings/${l.id}`}
                      className="text-sm font-medium text-black hover:underline"
                    >
                      {l.address}
                    </Link>
                    <div className="text-xs text-gray mt-0.5">{l.city}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-black font-serif text-base">{formatPrice(l.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-2xs uppercase tracking-[0.07em] px-2 py-0.5 rounded-[1px] ${STATUS_CLS[l.status] ?? STATUS_CLS.actif}`}>
                      {STATUS_LABELS[l.status] ?? l.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray">{l.bedrooms}</td>
                  <td className="px-6 py-4 text-sm text-gray">{l.bathrooms}</td>
                  <td className="px-6 py-4 text-sm text-gray">{l.sqft.toLocaleString('fr-CA')}</td>
                  <td className="px-6 py-4 text-sm text-gray">{formatDate(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-6 py-8 text-gray text-sm text-center">
            Aucun listing.{' '}
            <Link href="/crm/listings/new" className="text-black underline">Ajouter le premier.</Link>
          </p>
        )}
      </div>
    </div>
  )
}
