import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const createRecipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  heroImage: z.string().url().optional(),
  cookTimeMin: z.number().min(1),
  servings: z.number().min(1),
  tags: z.array(z.string()),
  steps: z.array(z.string().min(1)),
  ingredients: z.array(
    z.object({
      name: z.string().min(1),
      qty: z.number().min(0),
      unit: z.string().min(1),
      approxPrice: z.number().min(0),
    })
  ),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const tags = searchParams.get('tags')?.split(',')

  try {
    const where: any = {}

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      }
    }

    if (tags && tags.length > 0) {
      where.tags = {
        contains: tags[0], // Simple tag filtering for SQLite
      }
    }

    const recipes = await prisma.recipe.findMany({
      where,
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
    })

    const recipesWithParsedData = recipes.map((recipe) => ({
      ...recipe,
      tags: JSON.parse(recipe.tags),
      steps: JSON.parse(recipe.steps),
      estCostTotal: Number(recipe.estCostTotal),
      ingredients: recipe.ingredients.map((ing) => ({
        ...ing,
        approxPrice: Number(ing.approxPrice),
      })),
    }))

    return NextResponse.json(recipesWithParsedData)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
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
    const data = createRecipeSchema.parse(body)

    const estCostTotal = data.ingredients.reduce(
      (total, ing) => total + ing.approxPrice,
      0
    )

    const recipe = await prisma.recipe.create({
      data: {
        title: data.title,
        heroImage: data.heroImage,
        cookTimeMin: data.cookTimeMin,
        servings: data.servings,
        estCostTotal,
        tags: JSON.stringify(data.tags),
        steps: JSON.stringify(data.steps),
        authorId: session.user.id,
        ingredients: {
          create: data.ingredients,
        },
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
      },
    })

    const recipeWithParsedData = {
      ...recipe,
      tags: JSON.parse(recipe.tags),
      steps: JSON.parse(recipe.steps),
      estCostTotal: Number(recipe.estCostTotal),
      ingredients: recipe.ingredients.map((ing) => ({
        ...ing,
        approxPrice: Number(ing.approxPrice),
      })),
    }

    return NextResponse.json(recipeWithParsedData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating recipe:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}