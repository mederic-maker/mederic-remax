import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/ListingCard'
import ContactForm from '@/components/ContactForm'
import type { Listing } from '@/types'

export const revalidate = 60

export default async function HomePage() {
  const supabase = createClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(3)

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
          <div className="flex gap-3.5">
            <button
              onClick={undefined}
              className="btn-dark"
              id="hero-listings-btn"
            >
              Voir les propriétés
            </button>
            <button className="btn-ghost" id="hero-contact-btn">
              Évaluation gratuite
            </button>
          </div>
          <HeroScrollButtons />
        </div>
        <div className="flex flex-col">
          <div className="flex-1 overflow-hidden bg-[#ebebeb] relative min-h-[400px]">
            {/* Photo de profil — ajouter dans Supabase Storage */}
            <div className="w-full h-full flex items-center justify-center text-gray text-sm tracking-widest uppercase">
              Photo
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-border">
            <div className="px-8 py-7 border-r border-border">
              <div className="font-serif text-[42px] font-normal text-black leading-none">5+</div>
              <div className="text-xs uppercase tracking-[0.08em] text-gray mt-1.5">Années d&apos;expérience</div>
            </div>
            <div className="px-8 py-7">
              <div className="font-serif text-[42px] font-normal text-black leading-none">100+</div>
              <div className="text-xs uppercase tracking-[0.08em] text-gray mt-1.5">Transactions</div>
            </div>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section id="listings" className="px-13 py-20 border-b border-border">
        <div className="flex items-baseline justify-between mb-11">
          <div>
            <div className="eyebrow mb-2.5">Propriétés</div>
            <h2 className="section-title">Listings en vedette</h2>
          </div>
          <a
            href="/listings"
            className="text-xs uppercase tracking-[0.08em] text-gray border-b border-light pb-0.5 hover:text-black transition-colors"
          >
            Voir tous les listings
          </a>
        </div>
        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px">
            {listings.map((l: Listing) => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px">
            <PlaceholderCard price="299 000 $" addr="112 boul. Maloney Est, Gatineau" beds={3} baths={2} sqft={1450} status="Nouveau" />
            <PlaceholderCard price="415 000 $" addr="45 rue Laval, Aylmer" beds={4} baths={2} sqft={1800} status="Nouveau" />
            <PlaceholderCard price="275 000 $" addr="22 ch. Pink, Hull" beds={3} baths={1} sqft={1200} status="Vendu" sold />
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section id="about" className="grid grid-cols-1 lg:grid-cols-2 border-b border-border">
        <div className="overflow-hidden bg-[#e8e8e4] min-h-[520px] relative flex items-end">
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[rgba(17,17,17,0.85)] to-transparent">
            <div className="font-serif text-[28px] font-normal text-white">Médéric Souccar</div>
            <div className="text-xs uppercase tracking-[0.1em] text-white/60 mt-1">Courtier immobilier agréé · RE/MAX Vision</div>
          </div>
        </div>
        <div className="px-13 py-[72px] flex flex-col justify-center border-l border-border">
          <div className="eyebrow mb-2.5">À propos</div>
          <h2 className="section-title mb-6">Votre expert immobilier à Gatineau</h2>
          <p className="text-lg text-gray leading-[1.8] mb-9">
            Passionné par l&apos;immobilier et dédié à ses clients, je vous offre un service personnalisé, transparent et orienté résultats — que vous souhaitiez vendre, acheter ou investir dans l&apos;Outaouais.
          </p>
          <ul className="flex flex-col gap-3.5 mb-10">
            {[
              'Évaluation gratuite et sans engagement de votre propriété',
              'Stratégie de mise en marché adaptée à votre situation',
              'Négociation experte pour maximiser votre retour',
              'Accompagnement complet de l\'offre à la clé',
              'Connaissance approfondie des quartiers de Gatineau',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3.5 text-md text-mid">
                <span className="text-gray shrink-0">—</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3.5 p-[18px_22px] border border-border rounded-sm bg-white">
            <div className="text-sm text-gray">
              <strong className="block text-md font-medium text-black">RE/MAX Vision</strong>
              225 boul. de la Gappe, unité 102, Gatineau
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="grid grid-cols-1 lg:grid-cols-2 border-b border-border">
        <div className="px-13 py-[72px] border-r border-border flex flex-col justify-center">
          <div className="eyebrow mb-2.5">Contact</div>
          <h2 className="font-serif text-[42px] font-normal text-black mb-5">Parlons de votre projet</h2>
          <p className="text-lg text-gray leading-[1.8] mb-10">
            Que vous souhaitiez vendre votre maison, trouver la propriété idéale ou simplement connaître la valeur de votre bien, je suis disponible pour vous répondre rapidement.
          </p>
          <div className="flex flex-col gap-5">
            {[
              { icon: '📞', value: '819-743-9192' },
              { icon: '✉️', value: 'mederic@medericsouccar.com' },
              { icon: '📍', value: '225 boul. de la Gappe, unité 102, Gatineau' },
              { icon: '🏢', value: 'RE/MAX Vision' },
            ].map(({ icon, value }) => (
              <div key={value} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm border border-border flex items-center justify-center text-lg shrink-0">
                  {icon}
                </div>
                <span className="text-md text-mid">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-13 py-[72px] flex items-center">
          <ContactForm />
        </div>
      </section>
    </>
  )
}

function HeroScrollButtons() {
  return (
    <script dangerouslySetInnerHTML={{
      __html: `
        document.getElementById('hero-listings-btn')?.addEventListener('click',()=>document.getElementById('listings')?.scrollIntoView({behavior:'smooth'}));
        document.getElementById('hero-contact-btn')?.addEventListener('click',()=>document.getElementById('contact')?.scrollIntoView({behavior:'smooth'}));
      `
    }} />
  )
}

function PlaceholderCard({ price, addr, beds, baths, sqft, status, sold }: {
  price: string; addr: string; beds: number; baths: number; sqft: number; status: string; sold?: boolean
}) {
  return (
    <article className="bg-white border border-border overflow-hidden">
      <div className="h-[210px] bg-[#e8e8e4] flex items-center justify-center text-5xl">🏡</div>
      <div className="p-6">
        <span className={`inline-block text-2xs tracking-[0.1em] uppercase px-2.5 py-0.5 mb-2.5 rounded-[1px] font-medium ${sold ? 'bg-mid text-white' : 'bg-black text-white'}`}>
          {status}
        </span>
        <div className="font-serif text-[26px] font-medium text-black mb-1">{price}</div>
        <div className="text-sm text-gray mb-3.5">{addr}</div>
        <div className="flex gap-4 text-xs text-gray uppercase tracking-[0.07em]">
          <span>{beds} ch.</span><span>{baths} sdb.</span><span>{sqft.toLocaleString('fr-CA')} pi²</span>
        </div>
      </div>
    </article>
  )
}
export const dynamic = 'force-dynamic'
