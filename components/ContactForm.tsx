'use client'
import { useState } from 'react'

export default function ContactForm({ listingId }: { listingId?: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, listing_id: listingId ?? null }),
    })

    if (res.ok) {
      setStatus('sent')
      form.reset()
    } else {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Prénom</label>
          <input name="first_name" required className="input-field" placeholder="Jean" />
        </div>
        <div>
          <label className="label">Nom</label>
          <input name="last_name" required className="input-field" placeholder="Dupont" />
        </div>
      </div>
      <div>
        <label className="label">Courriel</label>
        <input name="email" type="email" required className="input-field" placeholder="jean@exemple.com" />
      </div>
      <div>
        <label className="label">Téléphone (optionnel)</label>
        <input name="phone" type="tel" className="input-field" placeholder="819-xxx-xxxx" />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea
          name="message"
          required
          rows={4}
          className="input-field resize-none"
          placeholder="Décrivez votre projet immobilier..."
        />
      </div>

      {status === 'sent' ? (
        <div className="py-4 text-center text-sm text-mid border border-border rounded-sm bg-bg">
          Message envoyé — je vous réponds sous 24h !
        </div>
      ) : (
        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn-dark w-full justify-center disabled:opacity-60"
        >
          {status === 'sending' ? 'Envoi…' : 'Envoyer le message'}
        </button>
      )}

      {status === 'error' && (
        <p className="text-xs text-red-600 text-center">
          Une erreur s&apos;est produite. Veuillez réessayer ou m&apos;appeler directement.
        </p>
      )}
    </form>
  )
}
