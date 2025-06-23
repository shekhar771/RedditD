// app/api/subreddit/[subredditId]/subscribers/route.ts
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET (
  request: Request,
  { params }: { params: { subredditId: string } }
) {
  try {
    const count = await prisma.subscription.count({
      where: {
        subredditId: params.subredditId
      }
    })

    return NextResponse.json({ count })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subscriber count' },
      { status: 500 }
    )
  }
}
