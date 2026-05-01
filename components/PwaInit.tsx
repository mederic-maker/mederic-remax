'use client'
import { useEffect } from 'react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const outputArray = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; ++i) {
    outputArray[i] = raw.charCodeAt(i)
  }
  return outputArray
}

export default function PwaInit() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
  }, [])
  return null
}
