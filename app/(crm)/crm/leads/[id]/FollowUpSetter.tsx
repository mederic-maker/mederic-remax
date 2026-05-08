'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar } from 'lucide-react'

const PRESETS = [
  { label: 'Demain',    days: 1 },
  { label: '3 jours',  days: 3 },
  { label: '1 semaine', days: 7 },
  { label: '2 semaines', days: 14 },
  { label: '1 mois',   days: 30 },
]

export default function FollowUpSetter({
  leadId, currentDate,
}: { leadId: string; currentDate: string | null }) {
  const [date, setDate] = useState(currentDate ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  async function save(d: string) {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('leads').update({ follow_up_date: d || null, follow_up_sent: false }).eq('id', leadId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  function preset(days: number) {
    const d = new Date()
    d.setDate(d.getDate() + days)
    const str = d.toISOString().slice(0, 10)
    setDate(str)
    save(str)
  }

  return (
    <div className="border border-border bg-white p-5 rounded-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={14} className="text-gray" />
        <h3 className="text-xs uppercase tracking-[0.08em] text-black font-medium">Follow-up</h3>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map(({ label, days }) => (
          <button
            key={label}
            onClick={() => preset(days)}
            className="text-xs px-2.5 py-1 border border-border rounded-sm hover:border-black transition-colors text-mid hover:text-black"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom date */}
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field flex-1 text-sm"
        />
        <button
          onClick={() => save(date)}
          disabled={saving}
          className="btn-dark text-xs px-4 disabled:opacity-60"
        >
          {saved ? '✓' : saving ? '…' : 'Sauv.'}
        </button>
      </div>

      {date && (
        <button
          onClick={() => { setDate(''); save('') }}
          className="mt-3 text-xs text-gray hover:text-red-600 transition-colors"
        >
          Supprimer le follow-up
        </button>
      )}
    </div>
  )
}
