'use client'
import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'

export default function PushToggle() {
  const [state, setState] = useState<'unsupported' | 'default' | 'granted' | 'denied'>('unsupported')

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    setState(Notification.permission as 'default' | 'granted' | 'denied')
  }, [])

  async function enable() {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
    }
    setState(permission as 'granted' | 'denied' | 'default')
  }

  async function disable() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
      await sub.unsubscribe()
    }
    setState('default')
  }

  if (state === 'unsupported') return null

  return state === 'granted' ? (
    <button
      onClick={disable}
      className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors px-3 py-2"
      title="Désactiver les notifications"
    >
      <Bell size={14} />
      Notif. actives
    </button>
  ) : (
    <button
      onClick={enable}
      disabled={state === 'denied'}
      className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
      title={state === 'denied' ? 'Notifications bloquées dans les réglages du navigateur' : 'Activer les notifications push'}
    >
      <BellOff size={14} />
      {state === 'denied' ? 'Notif. bloquées' : 'Activer notif.'}
    </button>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}
