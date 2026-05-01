'use client'
import { useEffect } from 'react'

export default function PwaInit() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Demander permission push seulement si pas encore accordée
      if (Notification.permission === 'granted') {
        subscribePush(reg)
      }
    })
  }, [])

  return null
}

async function subscribePush(reg: ServiceWorkerRegistration) {
  try {
    const existing = await reg.pushManager.getSubscription()
    if (existing) return

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    })

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    })
  } catch {}
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}
