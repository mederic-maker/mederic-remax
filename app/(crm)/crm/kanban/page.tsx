import { createClient } from '@/lib/supabase/server'
import KanbanBoard from '@/components/crm/KanbanBoard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function KanbanPage() {
  const supabase = await createClient()

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*, listings(address)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[kanban] Supabase error:', error.message)
  }

  // Normaliser côté JS : si stage n'existe pas encore, mettre 'nouveau' par défaut
  const kanbanLeads = (leads ?? [])
    .map((l) => ({ ...l, stage: l.stage ?? 'nouveau', stage_order: l.stage_order ?? 0 }))
    .filter((l) => l.stage !== 'perdu')

  return (
    <div className="px-10 py-10 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl font-normal text-black">Pipeline</h1>
          <p className="text-sm text-gray mt-1">Glisse chaque lead pour suivre l&apos;avancement</p>
        </div>
        <Link href="/crm/leads/new" className="btn-dark">+ Nouveau lead</Link>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-sm text-sm text-red-700">
          ⚠️ Erreur : {error.message}
          <p className="mt-1 text-xs">Assure-toi d&apos;avoir exécuté la migration v2 dans Supabase SQL Editor.</p>
        </div>
      )}

      <KanbanBoard initialLeads={kanbanLeads} />
    </div>
  )
}
