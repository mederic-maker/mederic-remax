'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LeadDetailActions({ leadId }: { leadId: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Supprimer ce lead définitivement ?')) return
    const supabase = createClient()
    await supabase.from('email_logs').delete().eq('lead_id', leadId)
    await supabase.from('sms_logs').delete().eq('lead_id', leadId)
    await supabase.from('leads').delete().eq('id', leadId)
    router.push('/crm/leads')
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
