import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ContactForm from '@/components/ContactForm'
import { formatPrice } from '@/lib/format'

export const revalidate = 60

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  actif:      { label: 'Actif',      cls: 'bg-black text-white' },
  sous_offre: { label: 'Sous offre', cls: 'bg-mid text-white' },
  vendu:      { label: 'Vendu',      cls: 'bg-gray text-white' },
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!listing) notFound()

  const badge = STATUS_BADGE[listing.status] ?? STATUS_BADGE.actif

  return (
    <div className="min-h-screen">
      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border h-[480px]">
        {listing.photos?.length > 0 ? (
          listing.photos.slice(0, 2).map((photo: string, i: number) => (
            <div key={i} className="relative overflow-hidden bg-[#e8e8e4]">
              <Image src={photo} alt={`Photo ${i + 1}`} fill className="object-cover" />
            </div>
          ))
        ) : (
          <div className="col-span-2 bg-[#e8e8e4] flex items-center justify-center text-7xl">🏡</div>
        )}
      </div>

      {/* Content */}
      <div className="px-13 py-16 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16">
        <div>
          <span className={`inline-block text-2xs tracking-[0.1em] uppercase px-2.5 py-0.5 mb-4 rounded-[1px] font-medium ${badge.cls}`}>
            {badge.label}
          </span>
          <h1 className="font-serif text-[52px] font-normal text-black mb-2">
            {formatPrice(listing.price)}
          </h1>
          <p className="text-lg text-gray mb-8">{listing.address}, {listing.city}</p>

          <div className="flex gap-8 mb-12 pb-8 border-b border-border">
            <div>
              <div className="font-serif text-3xl">{listing.bedrooms}</div>
              <div className="text-xs uppercase tracking-[0.08em] text-gray mt-1">Chambres</div>
            </div>
            <div>
              <div className="font-serif text-3xl">{listing.bathrooms}</div>
              <div className="text-xs uppercase tracking-[0.08em] text-gray mt-1">Salles de bain</div>
            </div>
            <div>
              <div className="font-serif text-3xl">{listing.sqft.toLocaleString('fr-CA')}</div>
              <div className="text-xs uppercase tracking-[0.08em] text-gray mt-1">Pi²</div>
            </div>
            {listing.mls_number && (
              <div>
                <div className="font-serif text-3xl text-gray">{listing.mls_number}</div>
                <div className="text-xs uppercase tracking-[0.08em] text-gray mt-1">MLS</div>
              </div>
            )}
          </div>

          {listing.description && (
            <div>
              <h2 className="section-title mb-5">Description</h2>
              <p className="text-lg text-gray leading-[1.8] whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}
        </div>

        {/* Contact sidebar */}
        <aside className="border border-border p-8 rounded-sm self-start sticky top-24">
          <h3 className="font-serif text-2xl mb-1">Intéressé ?</h3>
          <p className="text-sm text-gray mb-6">Contactez-moi pour une visite ou des informations.</p>
          <ContactForm listingId={listing.id} />
        </aside>
      </div>
    </div>
  )
}
