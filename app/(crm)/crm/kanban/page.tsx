import { createClient } from '@/lib/supabase/server'
import KanbanBoard from '@/components/crm/KanbanBoard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function KanbanPage() {
  const supabase = createClient()
  const { data: leads } = await supabase
    .from('leads')
    .select('*, listings(address)')
    .neq('stage', 'perdu')
    .order('stage_order', { ascending: true })

  return (
    <div className="px-10 py-10 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl font-normal text-black">Pipeline</h1>
          <p className="text-sm text-gray mt-1">Glisse chaque lead pour suivre l&apos;avancement</p>
        </div>
        <Link href="/crm/leads/new" className="btn-dark">+ Nouveau lead</Link>
      </div>

      <KanbanBoard initialLeads={leads ?? []} />
    </div>
  )
}
