import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/server-auth'
import { PostType } from '@/app/types/post'

export async function GET (req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const sort = searchParams.get('sort') ?? 'new'
    const types = searchParams.get('types')?.split(',') as
      | PostType[]
      | undefined
    const filterMode =
      (searchParams.get('filterMode') as 'subscribed' | 'all') || 'all'

    const session = await getServerSession()
    const user = session?.user

    const where: any = {}

    if (types?.length) {
      where.type = { in: types }
    }

    if (filterMode === 'subscribed' && user) {
      const subscriptions = await prisma.subscription.findMany({
        where: { UserId: user.id },
        select: { subredditId: true }
      })
      where.subredditId = { in: subscriptions.map(s => s.subredditId) }
    }

    let orderBy: any
    if (sort === 'new') {
      orderBy = { createdAt: 'desc' }
    } else {
      orderBy = { createdAt: 'desc' } // fallback — remove Vote._count for now
    }

    const [posts, totalPosts] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          type: true,
          tag: true,
          createdAt: true,
          imageUrl: true,
          imageAlt: true,
          linkUrl: true,
          linkMeta: true,
          content: true,

          author: {
            select: { id: true, username: true, name: true, image: true }
          },
          subreddit: {
            select: { id: true, name: true, image: true }
          },
          comment: {
            select: { id: true }
          },
          Vote: {
            select: { type: true, userId: true }
          }
        }
      }),
      prisma.post.count({ where })
    ])

    return NextResponse.json({
      posts,
      hasMore: page * pageSize < totalPosts,
      totalPosts
    })
  } catch (error) {
    console.error('Feed API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
