// app/api/link/route.ts (using Next.js App Router)
import { NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { LinkSchema, LinkPreviewSchema } from '@/lib/validator/link'
import { z } from 'zod'

LinkSchema
export async function POST (request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json()
    const { url } = LinkSchema.parse(body)

    // Fetch the URL content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)'
      }
    })

    const html = response.data

    // Use Cheerio to parse the HTML
    const $ = cheerio.load(html)

    // Extract metadata
    const title =
      $('meta[property="og:title"]').attr('content') || $('title').text() || ''

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      ''

    const image = $('meta[property="og:image"]').attr('content') || ''

    // Validate and return the preview data
    const preview = LinkPreviewSchema.parse({
      title,
      description,
      image,
      url
    })

    return NextResponse.json(preview)
  } catch (error) {
    console.error('Link preview error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to generate link preview' },
      { status: 500 }
    )
  }
}
