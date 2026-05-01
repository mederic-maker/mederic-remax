import Link from 'next/link'
import Image from 'next/image'
import type { Listing } from '@/types'
import { formatPrice } from '@/lib/format'

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  actif:      { label: 'Nouveau',    cls: 'bg-black text-white' },
  sous_offre: { label: 'Sous offre', cls: 'bg-mid text-white' },
  vendu:      { label: 'Vendu',      cls: 'bg-gray text-white' },
  retiré:     { label: 'Retiré',     cls: 'bg-light text-mid' },
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const badge = STATUS_BADGE[listing.status] ?? STATUS_BADGE.actif
  const photo = listing.photos?.[0]

  return (
    <Link href={`/listings/${listing.id}`}>
      <article className="bg-white border border-border overflow-hidden cursor-pointer card-hover">
        <div className="h-[210px] overflow-hidden bg-[#e8e8e4] relative flex items-center justify-center">
          {photo ? (
            <Image
              src={photo}
              alt={listing.address}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <span className="text-5xl">🏡</span>
          )}
        </div>
        <div className="p-6">
          <span className={`inline-block text-2xs tracking-[0.1em] uppercase px-2.5 py-0.5 mb-2.5 rounded-[1px] font-medium ${badge.cls}`}>
            {badge.label}
          </span>
          <div className="font-serif text-[26px] font-medium text-black mb-1">
            {formatPrice(listing.price)}
          </div>
          <div className="text-sm text-gray mb-3.5">{listing.address}, {listing.city}</div>
          <div className="flex gap-4 text-xs text-gray uppercase tracking-[0.07em]">
            <span>{listing.bedrooms} ch.</span>
            <span>{listing.bathrooms} sdb.</span>
            <span>{listing.sqft.toLocaleString('fr-CA')} pi²</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
