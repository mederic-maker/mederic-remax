import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createServiceClient } from '@/lib/supabase/server'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: NextRequest) {
  const { title, body } = await req.json()
  const supabase = createServiceClient()
  const { data: subs } = await supabase.from('push_subscriptions').select('*')

  if (!subs?.length) return NextResponse.json({ sent: 0 })

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, icon: '/icons/icon-192.png', badge: '/icons/badge-72.png' })
      )
    )
  )

  // Supprimer les abonnements expirés (410 Gone)
  const expired = results
    .map((r, i) => (r.status === 'rejected' && (r.reason as { statusCode?: number }).statusCode === 410 ? subs[i].endpoint : null))
    .filter(Boolean)

  if (expired.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', expired)
  }

  return NextResponse.json({ sent: results.filter((r) => r.status === 'fulfilled').length })
}
