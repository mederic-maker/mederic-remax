'use client'
import { useState, useCallback } from 'react'
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  DragOverlay, PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/format'
import Link from 'next/link'
import { GripVertical, Mail, MessageSquare, Calendar } from 'lucide-react'
import { STAGES, type KanbanStage } from '@/lib/stages'

// Re-export pour compatibilité
export type { KanbanStage }
export { STAGES }

export interface KanbanLead {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  stage: KanbanStage
  stage_order: number
  follow_up_date: string | null
  created_at: string
  listings?: { address: string } | null
}

// ── Card draggable ────────────────────────────────────────────
function KanbanCard({ lead, isDragging }: { lead: KanbanLead; isDragging?: boolean }) {
  const today = new Date().toISOString().slice(0, 10)
  const followUpDue = lead.follow_up_date && lead.follow_up_date <= today

  return (
    <div className={`bg-white border border-border rounded-sm p-4 shadow-sm select-none
      ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={`/crm/leads/${lead.id}`}
          className="font-medium text-sm text-black hover:underline leading-tight"
          onClick={(e) => e.stopPropagation()}
        >
          {lead.first_name} {lead.last_name}
        </Link>
      </div>

      {lead.listings?.address && (
        <p className="text-xs text-gray mb-2 truncate">{lead.listings.address}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {lead.email && (
          <a href={`mailto:${lead.email}`}
             onClick={(e) => e.stopPropagation()}
             className="text-gray hover:text-black transition-colors" title={lead.email}>
            <Mail size={12} />
          </a>
        )}
        {lead.phone && (
          <a href={`sms:${lead.phone}`}
             onClick={(e) => e.stopPropagation()}
             className="text-gray hover:text-black transition-colors" title={lead.phone}>
            <MessageSquare size={12} />
          </a>
        )}
        {followUpDue && (
          <span className="flex items-center gap-1 text-2xs uppercase tracking-[0.06em] text-black font-medium">
            <Calendar size={10} />
            Follow-up
          </span>
        )}
      </div>

      <p className="text-2xs text-light mt-2">{formatDate(lead.created_at)}</p>
    </div>
  )
}

// ── Card sortable wrapper ─────────────────────────────────────
function SortableCard({ lead }: { lead: KanbanLead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity"
           {...attributes} {...listeners}>
        <GripVertical size={14} className="text-gray" />
      </div>
      <KanbanCard lead={lead} isDragging={isDragging} />
    </div>
  )
}

// ── Column ────────────────────────────────────────────────────
function KanbanColumn({
  stage, leads, isOver,
}: {
  stage: typeof STAGES[number]; leads: KanbanLead[]; isOver: boolean
}) {
  return (
    <div className={`flex flex-col w-64 shrink-0 rounded-sm border
      ${isOver ? 'border-black bg-stone-100' : 'border-border bg-bg'}
      transition-colors`}>
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
          <span className="text-xs font-medium text-black uppercase tracking-[0.07em]">
            {stage.label}
          </span>
        </div>
        <span className="text-xs text-gray bg-white border border-border rounded-full w-5 h-5 flex items-center justify-center">
          {leads.length}
        </span>
      </div>

      <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-3 flex-1 min-h-[120px]">
          {leads.map((lead) => (
            <SortableCard key={lead.id} lead={lead} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

// ── Board principal ───────────────────────────────────────────
export default function KanbanBoard({ initialLeads }: { initialLeads: KanbanLead[] }) {
  const [leads, setLeads] = useState<KanbanLead[]>(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<KanbanStage | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }))

  const supabase = createClient()

  const byStage = useCallback((stage: KanbanStage) =>
    leads.filter((l) => l.stage === stage), [leads])

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null

  const findStage = (id: string): KanbanStage | null =>
    leads.find((l) => l.id === id)?.stage ?? null

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) { setOverStage(null); return }
    const overId = over.id as string
    const targetStage = STAGES.find((s) => s.id === overId)?.id ?? findStage(overId)
    setOverStage(targetStage ?? null)
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    setOverStage(null)
    if (!over) return

    const activeId = active.id as string
    const overId   = over.id as string

    const currentStage = findStage(activeId)
    const targetStage: KanbanStage =
      (STAGES.find((s) => s.id === overId)?.id as KanbanStage | undefined)
      ?? findStage(overId)
      ?? currentStage!

    if (!currentStage || targetStage === currentStage) return

    setLeads((prev) =>
      prev.map((l) => l.id === activeId ? { ...l, stage: targetStage } : l)
    )

    await supabase.from('leads').update({ stage: targetStage }).eq('id', activeId)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            leads={byStage(stage.id)}
            isOver={overStage === stage.id}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? <KanbanCard lead={activeLead} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
