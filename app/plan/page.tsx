import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navigation from '@/components/navigation'
import MealPlanGrid from '@/components/meal-plan-grid'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

export default async function PlanPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div>
      <Navigation />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Meal Planner</h1>
            <p className="text-muted-foreground">
              Plan your week and generate a shopping list
            </p>
          </div>
          <Link href="/plan/grocery">
            <Button>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Grocery List
            </Button>
          </Link>
        </div>

        <MealPlanGrid />
      </div>
    </div>
  )
}