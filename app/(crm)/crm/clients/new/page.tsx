'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const supabase = createClient()
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone || null,
        type: data.type,
        status: data.status,
        budget_min: data.budget_min ? Number(data.budget_min) : null,
        budget_max: data.budget_max ? Number(data.budget_max) : null,
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      setError('Erreur lors de la sauvegarde.')
      setLoading(false)
    } else {
      router.push(`/crm/clients/${client.id}`)
      router.refresh()
    }
  }

  return (
    <div className="px-10 py-10 max-w-2xl">
      <div className="mb-8">
        <Link href="/crm/clients" className="text-xs text-gray hover:text-black uppercase tracking-[0.06em] transition-colors">
          ← Clients
        </Link>
      </div>
      <h1 className="font-serif text-4xl font-normal text-black mb-8">Nouveau client</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Prénom *</label>
            <input name="first_name" required className="input-field" />
          </div>
          <div>
            <label className="label">Nom *</label>
            <input name="last_name" required className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Courriel</label>
            <input name="email" type="email" className="input-field" />
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input name="phone" type="tel" className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Type *</label>
            <select name="type" required className="input-field">
              <option value="acheteur">Acheteur</option>
              <option value="vendeur">Vendeur</option>
              <option value="les_deux">Acheteur & Vendeur</option>
            </select>
          </div>
          <div>
            <label className="label">Statut *</label>
            <select name="status" required className="input-field" defaultValue="prospect">
              <option value="prospect">Prospect</option>
              <option value="actif">Actif</option>
              <option value="fermé">Fermé</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Budget min ($)</label>
            <input name="budget_min" type="number" className="input-field" placeholder="200000" />
          </div>
          <div>
            <label className="label">Budget max ($)</label>
            <input name="budget_max" type="number" className="input-field" placeholder="500000" />
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea name="notes" rows={4} className="input-field resize-none" />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button type="submit" disabled={loading} className="btn-dark disabled:opacity-60">
            {loading ? 'Sauvegarde…' : 'Créer le client'}
          </button>
          <Link href="/crm/clients" className="btn-ghost">Annuler</Link>
        </div>
      </form>
    </div>
  )
}
