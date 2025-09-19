import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/providers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dorm Chef - Eat Better, Spend Less',
  description: 'Tiny-kitchen friendly recipes for college students',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers session={session}>
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}