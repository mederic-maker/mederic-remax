'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ClientActions({ clientId }: { clientId: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Supprimer ce client ? Cette action est irréversible.')) return
    const supabase = createClient()
    await supabase.from('interactions').delete().eq('client_id', clientId)
    await supabase.from('clients').delete().eq('id', clientId)
    router.push('/crm/clients')
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
