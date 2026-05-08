import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendManualSms } from '@/lib/sms'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { to, body, lead_id, client_id } = await req.json()
  if (!to || !body) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  try {
    const msg = await sendManualSms(to, body)

    const svc = createServiceClient()
    await svc.from('sms_logs').insert({
      to_phone: to, body,
      lead_id: lead_id ?? null,
      client_id: client_id ?? null,
      sent: true,
      twilio_sid: msg.sid,
    })

    return NextResponse.json({ ok: true, sid: msg.sid })
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : 'Erreur inconnue'
    const svc = createServiceClient()
    await svc.from('sms_logs').insert({
      to_phone: to, body,
      lead_id: lead_id ?? null,
      client_id: client_id ?? null,
      sent: false, error: errMsg,
    })
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
