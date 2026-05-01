import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice, formatDate, STATUS_LABELS } from '@/lib/format'
import ListingCrmActions from './ListingCrmActions'

export default async function CrmListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!listing) notFound()

  return (
    <div className="px-10 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/crm/listings" className="text-xs text-gray hover:text-black uppercase tracking-[0.06em] transition-colors">
          ← Listings
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={`/listings/${listing.id}`}
            target="_blank"
            className="text-xs uppercase tracking-[0.06em] text-gray hover:text-black transition-colors"
          >
            Voir public ↗
          </Link>
          <ListingCrmActions listingId={listing.id} />
        </div>
      </div>

      <h1 className="font-serif text-4xl font-normal text-black mb-1">{listing.address}</h1>
      <p className="text-lg text-gray mb-8">{listing.city}</p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
        <div>
          {/* Photos */}
          {listing.photos?.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-8">
              {listing.photos.map((url: string, i: number) => (
                <div key={i} className="relative aspect-video bg-[#e8e8e4] overflow-hidden rounded-sm">
                  <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          {listing.description && (
            <div>
              <h2 className="text-xs uppercase tracking-[0.08em] text-gray mb-3">Description</h2>
              <p className="text-sm text-mid leading-[1.7] whitespace-pre-wrap border border-border bg-white p-6">
                {listing.description}
              </p>
            </div>
          )}
        </div>

        {/* Info panel */}
        <aside>
          <div className="border border-border bg-white">
            {[
              { label: 'Prix', value: formatPrice(listing.price) },
              { label: 'Statut', value: STATUS_LABELS[listing.status] ?? listing.status },
              { label: 'Chambres', value: listing.bedrooms },
              { label: 'Salles de bain', value: listing.bathrooms },
              { label: 'Superficie', value: `${listing.sqft.toLocaleString('fr-CA')} pi²` },
              { label: 'MLS', value: listing.mls_number ?? '—' },
              { label: 'Vedette', value: listing.featured ? 'Oui' : 'Non' },
              { label: 'Ajouté', value: formatDate(listing.created_at) },
            ].map(({ label, value }) => (
              <div key={label} className="px-5 py-4 border-b border-border last:border-0 flex justify-between">
                <span className="text-xs uppercase tracking-[0.07em] text-gray">{label}</span>
                <span className="text-sm text-black">{String(value)}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
