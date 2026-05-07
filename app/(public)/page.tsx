import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/ListingCard'
import ContactForm from '@/components/ContactForm'
import type { Listing } from '@/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let listings: Listing[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(3)
    listings = data || []
  } catch (e) {
    listings = []
  }

  return (
    <>
      {/* HERO */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] min-h-[90vh] border-b border-border">
        <div className="px-13 py-20 flex flex-col justify-center border-r border-border">
          <div className="eyebrow mb-[22px]">Courtier immobilier — Gatineau</div>
          <h1 className="font-serif text-[clamp(46px,5.5vw,72px)] font-normal leading-[1.06] tracking-[-0.01em] text-black mb-7">
            Vendre ou acheter<br />
            <em className="italic font-light text-gray">avec confiance</em><br />
            dans l&apos;Outaouais
          </h1>
          <p className="text-lg text-gray leading-[1.8] max-w-[420px] mb-11">
            Accompagnement personnalisé à chaque étape. Une connaissance approfondie du marché de Gatineau et de ses environs pour maximiser votre transaction.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a href="/listings" className="btn-dark">Voir les propriétés</a>
            <a href="#contact" className="btn-ghost">Évaluation gratuite</a>
          </div>
        </div>
        <div className="bg-surface flex items-center justify-center text-gray uppercase tracking-widest text-sm">
          PHOTO
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 border-b border-border">
        {[['5+','Années d\'expérience'],['100+','Transactions'],['98%','Clients satisfaits'],['#1','Gatineau-Aylmer']].map(([n,l])=>(
          <div key={n} className="px-10 py-12 border-r border-border last:border-r-0">
            <div className="font-serif text-5xl font-normal mb-2">{n}</div>
            <div className="text-sm text-gray uppercase tracking-widest">{l}</div>
          </div>
        ))}
      </section>

      {/* FEATURED LISTINGS */}
      {listings.length > 0 && (
        <section className="px-13 py-20 border-b border-border">
          <div className="eyebrow mb-6">Propriétés en vedette</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {listings.map((l: Listing) => <ListingCard key={l.id} listing={l} />)}
          </div>
          <div className="mt-12 text-center">
            <a href="/listings" className="btn-ghost">Voir toutes les propriétés</a>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" className="grid grid-cols-1 lg:grid-cols-2 border-b border-border">
        <div className="px-13 py-20 border-r border-border">
          <div className="eyebrow mb-6">Me contacter</div>
          <h2 className="font-serif text-4xl font-normal mb-6">Parlons de votre projet</h2>
          <p className="text-gray leading-[1.8] mb-8">Que vous souhaitiez acheter ou vendre, je suis là pour vous accompagner à chaque étape.</p>
        </div>
        <div className="px-13 py-20">
          <ContactForm />
        </div>
      </section>
    </>
  )
}
