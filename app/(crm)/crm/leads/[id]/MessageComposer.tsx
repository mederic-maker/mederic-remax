'use client'
import { useState } from 'react'
import { Mail, MessageSquare } from 'lucide-react'

type Mode = 'email' | 'sms'

const EMAIL_TEMPLATES = [
  {
    label: 'Relance après visite',
    subject: 'Suite à notre visite',
    body: `Bonjour,

J'espère que vous avez bien apprécié la visite. Je voulais prendre le temps de vous recontacter pour voir si vous avez des questions ou si vous souhaitez approfondir votre intérêt.

N'hésitez pas à me faire part de vos réflexions.

Au plaisir,`,
  },
  {
    label: 'Suivi offre',
    subject: 'Mise à jour sur votre offre',
    body: `Bonjour,

Je vous contacte pour vous donner une mise à jour concernant votre offre.

Pourriez-vous me confirmer votre disponibilité pour en discuter prochainement ?

Au plaisir,`,
  },
  {
    label: 'Évaluation gratuite',
    subject: 'Votre évaluation gratuite — prochaines étapes',
    body: `Bonjour,

Suite à notre échange, je serais heureux de procéder à l'évaluation de votre propriété.

Seriez-vous disponible cette semaine pour que je passe vous voir ?

Au plaisir,`,
  },
]

const SMS_TEMPLATES = [
  { label: 'Relance rapide',  body: 'Bonjour, c\'est Médéric de RE/MAX Vision. Avez-vous eu la chance de réfléchir à votre projet immobilier ? Je suis disponible pour en jaser !' },
  { label: 'Confirmation visite', body: 'Bonjour ! Je vous confirme notre visite. Avez-vous des questions d\'ici là ?' },
  { label: 'Suivi offre',     body: 'Bonjour, du nouveau concernant votre offre. Pouvez-vous me rappeler quand vous avez un moment ?' },
]

export default function MessageComposer({
  leadId, email, phone, name,
}: { leadId: string; email: string; phone: string | null; name: string }) {
  const [mode, setMode] = useState<Mode>('email')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function applyTemplate(tmpl: { subject?: string; body: string }) {
    if (tmpl.subject) setSubject(tmpl.subject)
    setBody(tmpl.body + (mode === 'email' ? '\n\nMédéric Souccar' : ''))
  }

  async function send() {
    if (!body.trim()) return
    if (mode === 'email' && !subject.trim()) return

    setStatus('sending')
    const endpoint = mode === 'email' ? '/api/email' : '/api/sms'
    const payload = mode === 'email'
      ? { to: email, subject, body, lead_id: leadId }
      : { to: phone, body, lead_id: leadId }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setStatus('sent')
      setSubject('')
      setBody('')
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      const d = await res.json()
      setErrorMsg(d.error ?? 'Erreur')
      setStatus('error')
    }
  }

  return (
    <div className="border border-border bg-white">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setMode('email')}
          className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.07em] transition-colors border-b-2 -mb-px ${
            mode === 'email' ? 'border-black text-black' : 'border-transparent text-gray hover:text-black'
          }`}
        >
          <Mail size={13} /> Courriel
        </button>
        {phone && (
          <button
            onClick={() => setMode('sms')}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.07em] transition-colors border-b-2 -mb-px ${
              mode === 'sms' ? 'border-black text-black' : 'border-transparent text-gray hover:text-black'
            }`}
          >
            <MessageSquare size={13} /> SMS
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Templates */}
        <div className="flex gap-2 flex-wrap mb-4">
          <span className="text-2xs uppercase tracking-[0.08em] text-gray self-center">Template :</span>
          {(mode === 'email' ? EMAIL_TEMPLATES : SMS_TEMPLATES).map((t) => (
            <button
              key={t.label}
              onClick={() => applyTemplate(t)}
              className="text-xs px-2.5 py-1 border border-border rounded-sm hover:border-black transition-colors text-mid hover:text-black"
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {mode === 'email' && (
            <>
              <div>
                <label className="label">À</label>
                <input value={email} readOnly className="input-field bg-bg" />
              </div>
              <div>
                <label className="label">Objet *</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-field"
                  placeholder="Objet du courriel…"
                />
              </div>
            </>
          )}
          {mode === 'sms' && (
            <div>
              <label className="label">Vers</label>
              <input value={phone ?? ''} readOnly className="input-field bg-bg" />
            </div>
          )}
          <div>
            <label className="label">Message *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={mode === 'email' ? 6 : 4}
              className="input-field resize-none"
              placeholder={mode === 'email' ? 'Votre message…' : `Message SMS à ${name}…`}
            />
            {mode === 'sms' && (
              <p className="text-2xs text-gray mt-1">{body.length} / 160 caractères</p>
            )}
          </div>

          {status === 'sent' ? (
            <div className="py-3 text-center text-sm text-mid border border-border rounded-sm bg-bg">
              ✓ {mode === 'email' ? 'Courriel' : 'SMS'} envoyé avec succès
            </div>
          ) : (
            <button
              onClick={send}
              disabled={status === 'sending'}
              className="btn-dark disabled:opacity-60"
            >
              {status === 'sending' ? 'Envoi…' : `Envoyer ${mode === 'email' ? 'le courriel' : 'le SMS'}`}
            </button>
          )}
          {status === 'error' && (
            <p className="text-xs text-red-600">Erreur : {errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  )
}
