import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendNewLeadNotification, sendLeadWelcomeEmail } from '@/lib/email'
import { sendLeadWelcomeSms, sendBrokerLeadAlert } from '@/lib/sms'
import { z } from 'zod'

const leadSchema = z.object({
  first_name: z.string().min(1),
  last_name:  z.string().min(1),
  email:      z.string().email(),
  phone:      z.string().optional().nullable(),
  message:    z.string().min(1),
  listing_id: z.string().uuid().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = leadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }
    const data = parsed.data

    const supabase = createServiceClient()
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({ ...data, stage: 'nouveau' })
      .select()
      .single()

    if (error) throw error

    // ── Automations (non-bloquantes) ──────────────────────────
    await Promise.allSettled([
      // Notif push CRM
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/push/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `🏡 Nouveau lead — ${data.first_name} ${data.last_name}`,
          body: data.message.slice(0, 100),
          url: '/crm/leads',
        }),
      }),
      // Email à Médéric
      sendNewLeadNotification(data),
      // Email de bienvenue au lead
      sendLeadWelcomeEmail(data).then(() =>
        supabase.from('leads').update({ auto_email_sent: true }).eq('id', lead.id)
      ),
      // SMS à Médéric
      sendBrokerLeadAlert(data),
      // SMS de bienvenue au lead (si numéro fourni)
      data.phone
        ? sendLeadWelcomeSms({ first_name: data.first_name, phone: data.phone }).then(() =>
            supabase.from('leads').update({ auto_sms_sent: true }).eq('id', lead.id)
          )
        : Promise.resolve(),
    ])

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 })
  } catch (e) {
    console.error('[leads POST]', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
