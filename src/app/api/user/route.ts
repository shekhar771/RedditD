// app/api/user/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth } from '@/lib/server-auth'
import { z } from 'zod'

const updateSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  name: z.string().max(50).optional(),
  image: z.string().url().optional().or(z.literal(''))
})

export const PATCH = withAuth(async (req, user) => {
  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: data.username,
        name: data.name,
        image: data.image || null
      },
      select: { id: true, username: true, name: true, image: true }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status: 400 }
    )
  }
})

export const DELETE = withAuth(async (req, user) => {
  try {
    await prisma.user.delete({
      where: { id: user.id },
      // Include all related data that should be cascaded
      include: {
        accounts: true,
        sessions: true,
        posts: true,
        Comment: true,
        Vote: true,
        CommentVote: true,
        Subscription: true,
        createdSubreddits: true
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Account deletion failed. Please try again.' },
      { status: 500 }
    )
  }
})
