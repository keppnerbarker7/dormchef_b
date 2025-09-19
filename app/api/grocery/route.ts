import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const groceryListSchema = z.object({
  weekOf: z.string(),
})

type GroceryItem = {
  name: string
  unit: string
  qty: number
  approxPrice: number
  category: string
}

function categorizeIngredient(name: string): string {
  const lowercaseName = name.toLowerCase()
  
  if (
    lowercaseName.includes('chicken') ||
    lowercaseName.includes('beef') ||
    lowercaseName.includes('pork') ||
    lowercaseName.includes('fish') ||
    lowercaseName.includes('egg') ||
    lowercaseName.includes('protein')
  ) {
    return 'protein'
  }
  
  if (
    lowercaseName.includes('rice') ||
    lowercaseName.includes('bread') ||
    lowercaseName.includes('pasta') ||
    lowercaseName.includes('oats') ||
    lowercaseName.includes('flour')
  ) {
    return 'grains'
  }
  
  if (
    lowercaseName.includes('tomato') ||
    lowercaseName.includes('onion') ||
    lowercaseName.includes('pepper') ||
    lowercaseName.includes('lettuce') ||
    lowercaseName.includes('spinach')
  ) {
    return 'produce'
  }
  
  if (
    lowercaseName.includes('milk') ||
    lowercaseName.includes('cheese') ||
    lowercaseName.includes('yogurt') ||
    lowercaseName.includes('butter')
  ) {
    return 'dairy'
  }
  
  return 'pantry'
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { weekOf } = groceryListSchema.parse(body)

    const weekStart = new Date(weekOf)

    const mealPlan = await prisma.mealPlan.findUnique({
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
              },
            },
          },
        },
      },
    })

    if (!mealPlan || mealPlan.items.length === 0) {
      return NextResponse.json({
        items: [],
        totalCost: 0,
        categorizedItems: {},
      })
    }

    const ingredientMap = new Map<string, GroceryItem>()

    mealPlan.items.forEach((item) => {
      item.recipe.ingredients.forEach((ingredient) => {
        const key = `${ingredient.name}_${ingredient.unit}`
        const scaledQty = ingredient.qty * item.servings
        const scaledPrice = Number(ingredient.approxPrice) * item.servings

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!
          existing.qty += scaledQty
          existing.approxPrice += scaledPrice
        } else {
          ingredientMap.set(key, {
            name: ingredient.name,
            unit: ingredient.unit,
            qty: scaledQty,
            approxPrice: scaledPrice,
            category: categorizeIngredient(ingredient.name),
          })
        }
      })
    })

    const items = Array.from(ingredientMap.values())
    const totalCost = items.reduce((total, item) => total + item.approxPrice, 0)

    const categorizedItems = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, GroceryItem[]>)

    return NextResponse.json({
      items,
      totalCost,
      categorizedItems,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error generating grocery list:', error)
    return NextResponse.json(
      { error: 'Failed to generate grocery list' },
      { status: 500 }
    )
  }
}