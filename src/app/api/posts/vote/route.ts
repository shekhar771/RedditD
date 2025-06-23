// app/api/posts/vote/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/server-auth'
// import { redis } from '@/lib/redis'

export async function POST (request: NextRequest) {
  const { user } = await getServerSession()

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const { postId, type } = await request.json()

  if (!postId || !type) {
    return NextResponse.json(
      { error: 'PostId and type are required' },
      { status: 400 }
    )
  }

  try {
    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId
        }
      }
    })

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote if same type (toggle off)
        await prisma.vote.delete({
          where: {
            userId_postId: {
              userId: user.id,
              postId: postId
            }
          }
        })
        return NextResponse.json({ message: 'Vote removed' })
      } else {
        // Update vote if different type
        const updatedVote = await prisma.vote.update({
          where: {
            userId_postId: {
              userId: user.id,
              postId: postId
            }
          },
          data: {
            type: type
          }
        })
        // await redis.del(`post:${postId}`)

        return NextResponse.json(updatedVote)
      }
    } else {
      // Create new vote
      const newVote = await prisma.vote.create({
        data: {
          userId: user.id,
          postId: postId,
          type: type
        }
      })
      return NextResponse.json(newVote)
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}
