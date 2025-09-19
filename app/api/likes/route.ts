import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

const likeSchema = z.object({
  recipeId: z.string(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { recipeId } = likeSchema.parse(body)

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId,
        },
      },
    })

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_recipeId: {
            userId: session.user.id,
            recipeId,
          },
        },
      })
      return NextResponse.json({ liked: false })
    } else {
      await prisma.like.create({
        data: {
          userId: session.user.id,
          recipeId,
        },
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}