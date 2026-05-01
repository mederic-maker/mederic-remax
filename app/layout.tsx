import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import PwaInit from '@/components/PwaInit'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Médéric Souccar — Courtier Immobilier RE/MAX Vision',
  description: 'Courtier immobilier agréé à Gatineau et dans l\'Outaouais. Achat, vente et évaluation de propriétés avec un service personnalisé.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Médéric Souccar' },
  openGraph: {
    title: 'Médéric Souccar — Courtier Immobilier',
    description: 'Votre expert immobilier à Gatineau',
    locale: 'fr_CA',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#111111',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="font-sans antialiased">
        <PwaInit />
        {children}
      </body>
    </html>
  )
}
