import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const following = await prisma.follow.findMany({
      where: { fromId: session.user.id },
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
        ingredients: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    const recentMealPlanItems = await prisma.mealPlanItem.findMany({
      where: {
        mealPlan: {
          userId: { in: followingIds },
        },
      },
      include: {
        recipe: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        mealPlan: {
          select: {
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        mealPlan: {
          createdAt: 'desc',
        },
      },
      take: 20,
    })

    const feedItems = [
      ...recentRecipes.map((recipe) => ({
        id: `recipe-${recipe.id}`,
        type: 'recipe_created',
        user: recipe.author,
        recipe: {
          ...recipe,
          tags: JSON.parse(recipe.tags),
          steps: JSON.parse(recipe.steps),
          estCostTotal: Number(recipe.estCostTotal),
          ingredients: recipe.ingredients.map((ing) => ({
            ...ing,
            approxPrice: Number(ing.approxPrice),
          })),
        },
        createdAt: recipe.createdAt,
      })),
      ...recentMealPlanItems.map((item) => ({
        id: `mealplan-${item.id}`,
        type: 'recipe_added_to_week',
        user: item.mealPlan.user,
        recipe: {
          ...item.recipe,
          tags: JSON.parse(item.recipe.tags),
          steps: JSON.parse(item.recipe.steps),
          estCostTotal: Number(item.recipe.estCostTotal),
        },
        mealType: item.mealType,
        dayIndex: item.dayIndex,
        createdAt: item.mealPlan.createdAt,
      })),
    ]

    feedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(feedItems.slice(0, 20))
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    )
  }
}