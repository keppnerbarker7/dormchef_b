import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navigation from '@/components/navigation'
import GroceryList from '@/components/grocery-list'

export default async function GroceryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div>
      <Navigation />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Grocery List</h1>
          <p className="text-muted-foreground">
            Generated from your weekly meal plan
          </p>
        </div>

        <GroceryList />
      </div>
    </div>
  )
}