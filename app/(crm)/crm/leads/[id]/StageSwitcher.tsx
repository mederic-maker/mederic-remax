'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { STAGES, type KanbanStage } from '@/lib/stages'

export default function StageSwitcher({
  leadId, currentStage,
}: { leadId: string; currentStage: KanbanStage }) {
  const [stage, setStage] = useState<KanbanStage>(currentStage)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const current = STAGES.find((s) => s.id === stage)!

  async function changeStage(next: KanbanStage) {
    if (next === stage) return
    setSaving(true)
    setStage(next)
    const supabase = createClient()
    await supabase.from('leads').update({ stage: next }).eq('id', leadId)
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="relative group inline-block">
      <button
        className="flex items-center gap-2 text-xs uppercase tracking-[0.07em] px-3 py-1.5 border border-border rounded-sm bg-white hover:border-black transition-colors"
      >
        <span className={`w-2 h-2 rounded-full ${current.dot}`} />
        {saving ? 'Sauvegarde…' : current.label}
        <span className="text-light ml-1">▾</span>
      </button>
      <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-sm shadow-lg z-10
        opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity min-w-[160px]">
        {STAGES.map((s) => (
          <button
            key={s.id}
            onClick={() => changeStage(s.id)}
            className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-bg transition-colors
              ${s.id === stage ? 'font-medium text-black' : 'text-mid'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
