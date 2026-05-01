import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const leadSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  message: z.string().min(1),
  listing_id: z.string().uuid().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = leadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('leads').insert(parsed.data)

    if (error) throw error

    // Déclencher push notification
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Nouveau lead — ${parsed.data.first_name} ${parsed.data.last_name}`,
        body: parsed.data.message.slice(0, 100),
      }),
    }).catch(() => {}) // non-bloquant

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
