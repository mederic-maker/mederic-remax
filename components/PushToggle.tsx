'use client'
import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

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

  if (state === 'unsupported') return null
  return (
    <button onClick={enable} className="flex items-center gap-2 text-sm">
      {state === 'granted' ? <Bell size={16} /> : <BellOff size={16} />}
      {state === 'granted' ? 'Notifications activées' : 'Activer les notifications'}
    </button>
  )
}
