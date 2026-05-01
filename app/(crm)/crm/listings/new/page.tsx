'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photos, setPhotos] = useState<File[]>([])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    const supabase = createClient()

    // Upload photos
    const photoUrls: string[] = []
    for (const photo of photos) {
      const ext = photo.name.split('.').pop()
      const path = `listings/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('listing-photos')
        .upload(path, photo)
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(path)
        photoUrls.push(urlData.publicUrl)
      }
    }

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        address: data.address,
        city: data.city,
        price: Number(data.price),
        status: data.status,
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        sqft: Number(data.sqft),
        description: data.description || null,
        mls_number: data.mls_number || null,
        featured: data.featured === 'on',
        photos: photoUrls,
      })
      .select()
      .single()

    if (error) {
      setError('Erreur lors de la sauvegarde.')
      setLoading(false)
    } else {
      router.push(`/crm/listings/${listing.id}`)
      router.refresh()
    }
  }

  return (
    <div className="px-10 py-10 max-w-2xl">
      <div className="mb-8">
        <Link href="/crm/listings" className="text-xs text-gray hover:text-black uppercase tracking-[0.06em] transition-colors">
          ← Listings
        </Link>
      </div>
      <h1 className="font-serif text-4xl font-normal text-black mb-8">Nouveau listing</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="label">Adresse *</label>
          <input name="address" required className="input-field" placeholder="112 boul. Maloney Est" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Ville *</label>
            <input name="city" required className="input-field" placeholder="Gatineau" defaultValue="Gatineau" />
          </div>
          <div>
            <label className="label">Numéro MLS</label>
            <input name="mls_number" className="input-field" placeholder="28123456" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Prix ($) *</label>
            <input name="price" required type="number" className="input-field" placeholder="299000" />
          </div>
          <div>
            <label className="label">Statut *</label>
            <select name="status" required className="input-field" defaultValue="actif">
              <option value="actif">Actif</option>
              <option value="sous_offre">Sous offre</option>
              <option value="vendu">Vendu</option>
              <option value="retiré">Retiré</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Chambres *</label>
            <input name="bedrooms" required type="number" className="input-field" placeholder="3" />
          </div>
          <div>
            <label className="label">Salles de bain *</label>
            <input name="bathrooms" required type="number" step="0.5" className="input-field" placeholder="2" />
          </div>
          <div>
            <label className="label">Pi² *</label>
            <input name="sqft" required type="number" className="input-field" placeholder="1450" />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" rows={5} className="input-field resize-none" />
        </div>
        <div>
          <label className="label">Photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
            className="block w-full text-sm text-gray file:mr-4 file:py-2 file:px-4 file:border file:border-border file:rounded-sm file:text-xs file:uppercase file:tracking-widest file:bg-white file:cursor-pointer"
          />
          {photos.length > 0 && (
            <p className="text-xs text-gray mt-1">{photos.length} photo(s) sélectionnée(s)</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input name="featured" type="checkbox" id="featured" className="accent-black" />
          <label htmlFor="featured" className="text-sm text-mid cursor-pointer">
            Afficher en vedette sur le site public
          </label>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button type="submit" disabled={loading} className="btn-dark disabled:opacity-60">
            {loading ? 'Sauvegarde…' : 'Créer le listing'}
          </button>
          <Link href="/crm/listings" className="btn-ghost">Annuler</Link>
        </div>
      </form>
    </div>
  )
}
