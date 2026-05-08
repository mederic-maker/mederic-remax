import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendFollowUpReminder } from '@/lib/email'

// Vercel cron déclenche cet endpoint tous les jours à 9h (EST = 13h UTC)
// vercel.json : { "crons": [{ "path": "/api/cron/followups", "schedule": "0 13 * * *" }] }

export async function GET(req: NextRequest) {
  // Sécurité : vérifier le secret Vercel cron
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const today = new Date().toISOString().slice(0, 10)

  // Leads avec follow-up dû
  const { data: leads } = await supabase
    .from('leads')
    .select('id, first_name, last_name, follow_up_date')
    .eq('follow_up_sent', false)
    .lte('follow_up_date', today)
    .not('follow_up_date', 'is', null)

  // Clients avec follow-up dû
  const { data: clients } = await supabase
    .from('clients')
    .select('id, first_name, last_name, follow_up_date')
    .eq('follow_up_sent', false)
    .lte('follow_up_date', today)
    .not('follow_up_date', 'is', null)

  const items = [
    ...(leads ?? []).map((l) => ({
      type: 'lead' as const,
      name: `${l.first_name} ${l.last_name}`,
      date: l.follow_up_date!,
      id: l.id,
    })),
    ...(clients ?? []).map((c) => ({
      type: 'client' as const,
      name: `${c.first_name} ${c.last_name}`,
      date: c.follow_up_date!,
      id: c.id,
    })),
  ]

  if (items.length === 0) {
    return NextResponse.json({ sent: 0, message: 'Aucun follow-up aujourd\'hui' })
  }

  // Envoyer email récapitulatif
  await sendFollowUpReminder(items)

  // Envoyer push notification
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/push/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `📅 ${items.length} follow-up${items.length > 1 ? 's' : ''} à faire`,
      body: items.map((i) => i.name).join(', '),
      url: '/crm/leads',
    }),
  })

  // Marquer comme envoyé
  if (leads?.length) {
    await supabase.from('leads')
      .update({ follow_up_sent: true })
      .in('id', leads.map((l) => l.id))
  }
  if (clients?.length) {
    await supabase.from('clients')
      .update({ follow_up_sent: true })
      .in('id', clients.map((c) => c.id))
  }

  return NextResponse.json({ sent: items.length, items: items.map((i) => i.name) })
}
