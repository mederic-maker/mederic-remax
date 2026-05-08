import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendManualEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { to, subject, body, lead_id, client_id } = await req.json()
  if (!to || !subject || !body) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  try {
    await sendManualEmail(to, subject, body)

    // Log
    const svc = createServiceClient()
    await svc.from('email_logs').insert({
      to_email: to, subject, body,
      lead_id: lead_id ?? null,
      client_id: client_id ?? null,
      sent: true,
    })

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur inconnue'
    const svc = createServiceClient()
    await svc.from('email_logs').insert({
      to_email: to, subject, body,
      lead_id: lead_id ?? null,
      client_id: client_id ?? null,
      sent: false, error: msg,
    })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
