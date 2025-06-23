// app/api/posts/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/server-auth'
import { prisma } from '@/lib/db'
import { PostCreateSchema } from '@/lib/validator/PostAdd'

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json()

    // Validate the request body against our schema
    const validationResult = PostCreateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid post data',
          details: validationResult.error.format()
        },
        { status: 400 }
      )
    }

    const postData = validationResult.data

    // Check if the subreddit exists
    const subreddit = await prisma.subreddit.findUnique({
      where: {
        id: postData.subredditId
      },
      select: {
        id: true,
        name: true,
        tags: true,
        allowCustomTags: true
      }
    })

    if (!subreddit) {
      return NextResponse.json(
        { error: 'Subreddit not found' },
        { status: 404 }
      )
    }

    // Validate the tag against the subreddit's allowed tags
    if (
      postData.tag &&
      !subreddit.allowCustomTags &&
      !subreddit.tags.includes(postData.tag)
    ) {
      return NextResponse.json(
        { error: 'Invalid tag for this subreddit' },
        { status: 400 }
      )
    }
    // Create post based on type
    let post

    switch (postData.type) {
      case 'TEXT':
        post = await prisma.post.create({
          data: {
            title: postData.title,
            content: postData.content, // This should be JSON or string consistently
            type: 'TEXT',
            tag: postData.tag,
            subredditId: postData.subredditId,
            authorId: user.id,
            updatedAt: new Date()
          }
        })
        break

      case 'IMAGE':
        post = await prisma.post.create({
          data: {
            title: postData.title,
            imageUrl: postData.imageUrl,
            content: postData.description || '',
            type: 'IMAGE',
            tag: postData.tag,
            subredditId: postData.subredditId,
            authorId: user.id,
            updatedAt: new Date()
          }
        })
        break

      case 'LINK':
        post = await prisma.post.create({
          data: {
            title: postData.title,
            linkUrl: postData.linkUrl,
            linkMeta: postData.linkMeta || '',
            type: 'LINK',
            tag: postData.tag,
            subredditId: postData.subredditId,
            authorId: user.id,
            updatedAt: new Date()
          }
        })
        break
    }

    return NextResponse.json({
      postId: post.id,
      subredditName: subreddit.name,
      success: true
    })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
})
