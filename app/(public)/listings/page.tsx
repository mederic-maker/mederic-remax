import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/ListingCard'
import type { Listing } from '@/types'

export const revalidate = 60

export default async function ListingsPage() {
  const supabase = createClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .neq('status', 'retiré')
    .order('created_at', { ascending: false })

  const active = listings?.filter((l: Listing) => l.status === 'actif') ?? []
  const others = listings?.filter((l: Listing) => l.status !== 'actif') ?? []

  return (
    <div className="px-13 py-20">
      <div className="mb-14">
        <div className="eyebrow mb-3">Propriétés</div>
        <h1 className="font-serif text-[52px] font-normal text-black">Tous les listings</h1>
      </div>

      {active.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xs uppercase tracking-[0.1em] text-gray mb-6">
            Actifs ({active.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px">
            {active.map((l: Listing) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-[0.1em] text-gray mb-6">
            Vendus / Sous offre ({others.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px opacity-70">
            {others.map((l: Listing) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {(!listings || listings.length === 0) && (
        <p className="text-gray text-lg">Aucun listing pour le moment. Revenez bientôt.</p>
      )}
    </div>
  )
}
