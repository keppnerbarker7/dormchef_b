import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navigation from '@/components/navigation'
import SocialFeed from '@/components/social-feed'

export default async function FeedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div>
      <Navigation />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Feed</h1>
          <p className="text-muted-foreground">
            See what your friends are cooking
          </p>
        </div>

        <SocialFeed />
      </div>
    </div>
  )
}