'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ListingCrmActions({ listingId }: { listingId: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Supprimer ce listing ? Cette action est irréversible.')) return
    const supabase = createClient()
    await supabase.from('listings').delete().eq('id', listingId)
    router.push('/crm/listings')
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs uppercase tracking-[0.07em] text-gray hover:text-red-600 transition-colors border-b border-light pb-0.5"
    >
      Supprimer
    </button>
  )
}
