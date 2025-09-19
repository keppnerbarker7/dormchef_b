import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Navigation from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, DollarSign, Users, ChefHat } from 'lucide-react'
import AddToWeekButton from '@/components/add-to-week-button'
import LikeButton from '@/components/like-button'

async function getRecipe(id: string, userId?: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      ingredients: true,
      _count: {
        select: {
          likes: true,
        },
      },
      likes: userId ? {
        where: {
          userId,
        },
      } : false,
    },
  })

  if (!recipe) return null

  return {
    ...recipe,
    tags: JSON.parse(recipe.tags),
    steps: JSON.parse(recipe.steps),
    estCostTotal: Number(recipe.estCostTotal),
    ingredients: recipe.ingredients.map((ing) => ({
      ...ing,
      approxPrice: Number(ing.approxPrice),
    })),
    isLiked: userId ? recipe.likes.length > 0 : false,
  }
}

export default async function RecipePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const session = await getServerSession(authOptions)
  const recipe = await getRecipe(params.id, session?.user?.id)

  if (!recipe) {
    notFound()
  }

  const costPerServing = recipe.estCostTotal / recipe.servings

  return (
    <div>
      <Navigation />
      <div className="container py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {recipe.heroImage && (
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={recipe.heroImage}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={recipe.author.image || ''} />
                    <AvatarFallback>
                      {recipe.author.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{recipe.author.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(recipe.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {session && <LikeButton recipeId={recipe.id} initialLiked={recipe.isLiked} />}
                  <span className="text-sm text-muted-foreground">
                    {recipe._count.likes} likes
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {recipe.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">{recipe.cookTimeMin} min</div>
                  <div className="text-xs text-muted-foreground">Cook Time</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">{recipe.servings}</div>
                  <div className="text-xs text-muted-foreground">Servings</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">${costPerServing.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Per Serving</div>
                </div>
              </div>

              {session && (
                <div className="mb-8">
                  <AddToWeekButton recipeId={recipe.id} />
                </div>
              )}
            </div>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChefHat className="h-5 w-5" />
                  <span>Instructions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recipe.steps.map((step: string, index: number) => (
                    <div key={index} className="flex space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="flex-1 py-1">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Serves {recipe.servings} • Total: ${recipe.estCostTotal.toFixed(2)}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{ingredient.name}</span>
                        <div className="text-sm text-muted-foreground">
                          {ingredient.qty} {ingredient.unit}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${ingredient.approxPrice.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nutrition & Cost</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Cost per serving</span>
                  <span className="font-medium">${costPerServing.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total recipe cost</span>
                  <span className="font-medium">${recipe.estCostTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cook time</span>
                  <span className="font-medium">{recipe.cookTimeMin} minutes</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}