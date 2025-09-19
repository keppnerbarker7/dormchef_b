import { Suspense } from 'react'
import Navigation from '@/components/navigation'
import RecipeGrid from '@/components/recipe-grid'
import { Card, CardContent } from '@/components/ui/card'

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="h-64">
          <CardContent className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-muted rounded w-16"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function RecipesPage({
  searchParams,
}: {
  searchParams: { search?: string; tags?: string }
}) {
  return (
    <div>
      <Navigation />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Recipes</h1>
          <p className="text-muted-foreground">
            Discover dorm-friendly recipes that won&apos;t break the bank
          </p>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <RecipeGrid searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}