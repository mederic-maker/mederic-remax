'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LeadActions({ leadId, converted }: { leadId: string; converted: boolean }) {
  const router = useRouter()

  async function toggle() {
    const supabase = createClient()
    await supabase.from('leads').update({ converted: !converted }).eq('id', leadId)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      className="text-2xs uppercase tracking-[0.07em] whitespace-nowrap px-2.5 py-1 border border-border rounded-[1px] hover:border-black transition-colors text-gray hover:text-black"
    >
      {converted ? 'Rouvrir' : 'Marquer traité'}
    </button>
  )
}
