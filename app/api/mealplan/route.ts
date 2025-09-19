import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const addMealPlanItemSchema = z.object({
  recipeId: z.string(),
  dayIndex: z.number().min(0).max(6),
  mealType: z.enum(['Breakfast', 'Lunch', 'Dinner']),
  servings: z.number().min(1).default(1),
  weekOf: z.string(), // ISO date string
})

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(request.url)
  const weekOf = searchParams.get('weekOf')

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!weekOf) {
    return NextResponse.json(
      { error: 'weekOf parameter is required' },
      { status: 400 }
    )
  }

  try {
    const weekStart = new Date(weekOf)

    let mealPlan = await prisma.mealPlan.findUnique({
      where: {
        userId_weekOf: {
          userId: session.user.id,
          weekOf: weekStart,
        },
      },
      include: {
        items: {
          include: {
            recipe: {
              include: {
                ingredients: true,
                author: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!mealPlan) {
      mealPlan = await prisma.mealPlan.create({
        data: {
          userId: session.user.id,
          weekOf: weekStart,
        },
        include: {
          items: {
            include: {
              recipe: {
                include: {
                  ingredients: true,
                  author: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    }

    const mealPlanWithParsedData = {
      ...mealPlan,
      items: mealPlan.items.map((item) => ({
        ...item,
        recipe: {
          ...item.recipe,
          tags: JSON.parse(item.recipe.tags),
          steps: JSON.parse(item.recipe.steps),
          estCostTotal: Number(item.recipe.estCostTotal),
          ingredients: item.recipe.ingredients.map((ing) => ({
            ...ing,
            approxPrice: Number(ing.approxPrice),
          })),
        },
      })),
    }

    return NextResponse.json(mealPlanWithParsedData)
  } catch (error) {
    console.error('Error fetching meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meal plan' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = addMealPlanItemSchema.parse(body)

    const weekStart = new Date(data.weekOf)

    let mealPlan = await prisma.mealPlan.findUnique({
      where: {
        userId_weekOf: {
          userId: session.user.id,
          weekOf: weekStart,
        },
      },
    })

    if (!mealPlan) {
      mealPlan = await prisma.mealPlan.create({
        data: {
          userId: session.user.id,
          weekOf: weekStart,
        },
      })
    }

    const mealPlanItem = await prisma.mealPlanItem.create({
      data: {
        mealPlanId: mealPlan.id,
        recipeId: data.recipeId,
        dayIndex: data.dayIndex,
        mealType: data.mealType,
        servings: data.servings,
      },
      include: {
        recipe: {
          include: {
            ingredients: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })

    const itemWithParsedData = {
      ...mealPlanItem,
      recipe: {
        ...mealPlanItem.recipe,
        tags: JSON.parse(mealPlanItem.recipe.tags),
        steps: JSON.parse(mealPlanItem.recipe.steps),
        estCostTotal: Number(mealPlanItem.recipe.estCostTotal),
        ingredients: mealPlanItem.recipe.ingredients.map((ing) => ({
          ...ing,
          approxPrice: Number(ing.approxPrice),
        })),
      },
    }

    return NextResponse.json(itemWithParsedData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error adding meal plan item:', error)
    return NextResponse.json(
      { error: 'Failed to add meal plan item' },
      { status: 500 }
    )
  }
}