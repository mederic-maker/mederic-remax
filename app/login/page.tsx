'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/crm'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Courriel ou mot de passe incorrect.')
      setLoading(false)
    } else {
      router.push(redirect)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-normal text-black mb-2">CRM</h1>
          <p className="text-sm text-gray">Médéric Souccar · RE/MAX Vision</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="label">Courriel</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="mederic@medericsouccar.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-dark w-full justify-center disabled:opacity-60 mt-2"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center mt-8">
          <a href="/" className="text-xs text-gray hover:text-black transition-colors tracking-[0.06em] uppercase">
            ← Retour au site
          </a>
        </p>
      </div>
    </div>
  )
}
