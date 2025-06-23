// app/api/comments/vote/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db' // Adjust path as needed
import { VoteType } from '@prisma/client'
import { withAuth } from '@/lib/server-auth'

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { commentId, type } = await req.json()

    if (!commentId || !type) {
      return NextResponse.json(
        { error: 'Comment ID and vote type are required' },
        { status: 400 }
      )
    }

    // Check if user already voted on this comment
    const existingVote = await prisma.commentVote.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId
        }
      }
    })

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote if same type
        await prisma.commentVote.delete({
          where: {
            userId_commentId: {
              userId: user.id,
              commentId
            }
          }
        })
      } else {
        // Update vote if different type
        await prisma.commentVote.update({
          where: {
            userId_commentId: {
              userId: user.id,
              commentId
            }
          },
          data: { type: type as VoteType }
        })
      }
    } else {
      // Create new vote
      await prisma.commentVote.create({
        data: {
          userId: user.id,
          commentId,
          type: type as VoteType
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error voting on comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
