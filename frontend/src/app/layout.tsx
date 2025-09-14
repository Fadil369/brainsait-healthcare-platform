import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { MeshGradientBackground } from '@/components/ui/MeshGradientBackground'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BrainSAIT Healthcare Platform',
  description: 'AI-Powered Enterprise Healthcare Platform for Middle East',
  keywords: ['healthcare', 'AI', 'FHIR', 'Saudi Arabia', 'medical records', 'HIPAA'],
  authors: [{ name: 'BrainSAIT Technologies' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'BrainSAIT Healthcare Platform',
    description: 'AI-Powered Enterprise Healthcare Platform for Middle East',
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className={`${inter.variable} font-latin h-full bg-midnight-900 text-white antialiased`}>
        {/* NEURAL: Mesh gradient background with glass morphism */}
        <MeshGradientBackground />
        
        <Providers>
          <div className="relative z-10 min-h-full">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
