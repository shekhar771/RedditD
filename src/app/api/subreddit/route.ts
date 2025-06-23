// app/api/subreddit/route.ts
import { NextResponse, NextRequest } from 'next/server'
import { withAuth } from '@/lib/server-auth'
import { subredditSchema } from '@/lib/validator/subreddit'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json()
    const { name, description, image, backgroundImage, allowCustomTags } =
      subredditSchema.parse(body)

    console.log('Received payload:', body) // Log the payload

    // Check if subreddit already exists
    const existSubreddit = await prisma.subreddit.findFirst({
      where: {
        name: name
      }
    })

    if (existSubreddit) {
      return NextResponse.json(
        { error: 'Subreddit already exists' },
        { status: 409 }
      )
    }

    // Create new subreddit with all fields
    const newSubreddit = await prisma.subreddit.create({
      data: {
        name,
        description,
        image,
        backgroundImage,
        allowCustomTags,
        creatorId: user.id
      }
    })

    // Subscribe the creator to the subreddit
    await prisma.subscription.create({
      data: {
        UserId: user.id,
        subredditId: newSubreddit.id
      }
    })

    return NextResponse.json({
      name: newSubreddit.name,
      id: newSubreddit.id
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json({ error: error.errors }, { status: 422 })
    }

    console.error('Failed to create subreddit:', error)
    return NextResponse.json(
      { error: 'Failed to create subreddit' },
      { status: 500 }
    )
  }
})
