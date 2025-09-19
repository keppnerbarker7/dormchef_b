import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Navigation from '@/components/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ChefHat, 
  DollarSign, 
  Clock, 
  Users,
  Calendar,
  Plus
} from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getRecentActivity(userId: string) {
  const following = await prisma.follow.findMany({
    where: { fromId: userId },
    select: { toId: true },
  })

  const followingIds = following.map((f) => f.toId)

  const recentRecipes = await prisma.recipe.findMany({
    where: {
      authorId: { in: followingIds },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
  })

  return recentRecipes.map((recipe) => ({
    ...recipe,
    tags: JSON.parse(recipe.tags),
    steps: JSON.parse(recipe.steps),
    estCostTotal: Number(recipe.estCostTotal),
  }))
}

export default async function Home() {
  const session = await getServerSession(authOptions)
  let recentActivity: any[] = []

  if (session?.user?.id) {
    recentActivity = await getRecentActivity(session.user.id)
  }

  return (
    <div>
      <Navigation />
      
      {session ? (
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {session.user?.name}!</h1>
            <p className="text-muted-foreground">Ready to cook something great?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/recipes/new">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Add Recipe</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Create</div>
                  <p className="text-xs text-muted-foreground">
                    Share your dorm-friendly recipe
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/plan">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Meal Plan</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Plan</div>
                  <p className="text-xs text-muted-foreground">
                    Organize your weekly meals
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/recipes">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Browse</CardTitle>
                  <ChefHat className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Recipes</div>
                  <p className="text-xs text-muted-foreground">
                    Discover new dishes
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/feed">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Social</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Feed</div>
                  <p className="text-xs text-muted-foreground">
                    See what friends are cooking
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {recentActivity.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Recent from Friends</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentActivity.map((recipe) => (
                  <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">{recipe.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          by {recipe.author.name}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{recipe.cookTimeMin} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${(recipe.estCostTotal / recipe.servings).toFixed(2)}/serving</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
          <Navigation />
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <ChefHat className="h-20 w-20 mx-auto mb-8 text-primary" />
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Dorm Chef
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Eat better, spend less. Tiny-kitchen friendly.
              </p>
              <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                Built for college guys who want to cook great food without breaking the bank or taking up space. 
                Simple recipes, meal planning, and a community that gets it.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link href="/auth/signup">
                  <Button size="lg" className="text-lg px-8 py-3">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Budget-Friendly</h3>
                  <p className="text-muted-foreground">
                    Recipes designed for small budgets with cost per serving calculated
                  </p>
                </div>
                <div className="text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Quick & Easy</h3>
                  <p className="text-muted-foreground">
                    Perfect for busy schedules with minimal prep and cooking time
                  </p>
                </div>
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Community</h3>
                  <p className="text-muted-foreground">
                    Share recipes and meal plans with friends who understand dorm life
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}