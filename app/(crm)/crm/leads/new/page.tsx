'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NewLeadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const supabase = createClient()

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
        stage: data.stage || 'nouveau',
        follow_up_date: data.follow_up_date || null,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) { setError('Erreur lors de la sauvegarde.'); setLoading(false); return }
    router.push(`/crm/leads/${lead.id}`)
    router.refresh()
  }

  return (
    <div className="px-10 py-10 max-w-2xl">
      <div className="mb-8">
        <Link href="/crm/leads" className="text-xs text-gray hover:text-black uppercase tracking-[0.06em]">
          ← Leads
        </Link>
      </div>
      <h1 className="font-serif text-4xl font-normal text-black mb-8">Nouveau lead</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Prénom *</label><input name="first_name" required className="input-field" /></div>
          <div><label className="label">Nom *</label><input name="last_name" required className="input-field" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Courriel *</label><input name="email" type="email" required className="input-field" /></div>
          <div><label className="label">Téléphone</label><input name="phone" type="tel" className="input-field" /></div>
        </div>
        <div><label className="label">Message / source *</label>
          <textarea name="message" required rows={3} className="input-field resize-none" placeholder="Ex: Intéressé par 45 rue Laval via le site web..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Étape pipeline</label>
            <select name="stage" className="input-field" defaultValue="nouveau">
              <option value="nouveau">Nouveau</option>
              <option value="contacté">Contacté</option>
              <option value="visite">Visite planifiée</option>
              <option value="offre">Offre en cours</option>
              <option value="fermé">Fermé</option>
              <option value="perdu">Perdu</option>
            </select>
          </div>
          <div>
            <label className="label">Follow-up prévu</label>
            <input name="follow_up_date" type="date" className="input-field" />
          </div>
        </div>
        <div><label className="label">Notes internes</label>
          <textarea name="notes" rows={3} className="input-field resize-none" />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-3 mt-2">
          <button type="submit" disabled={loading} className="btn-dark disabled:opacity-60">
            {loading ? 'Sauvegarde…' : 'Créer le lead'}
          </button>
          <Link href="/crm/leads" className="btn-ghost">Annuler</Link>
        </div>
      </form>
    </div>
  )
}
