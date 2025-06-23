// app/api/link/route.ts
import { NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { LinkSchema, LinkPreviewSchema } from '@/lib/validator/link'
import { z } from 'zod'

export async function POST (request: Request) {
  try {
    // validating the request body
    const body = await request.json()
    const { url } = LinkSchema.parse(body)

    // Fetch the URL content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)'
      },
      timeout: 10000 // 10 seconds timeout
    })

    const html = response.data

    //  parse the HTML
    const $ = cheerio.load(html)

    // Extract metadata
    const title =
      $('meta[property="og:title"]').attr('content') || $('title').text() || ''

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      ''

    // Extract image with fallbacks
    let image =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[property="twitter:image"]').attr('content') ||
      ''

    // Fix  image URLs
    if (image && !image.startsWith('http') && !image.startsWith('data:')) {
      if (image && !image.startsWith('http') && !image.startsWith('data:')) {
        try {
          // Parse the base URL
          const baseUrl = new URL(url)

          if (image.startsWith('//')) {
            image = `${baseUrl.protocol}${image}`
          } else if (image.startsWith('/')) {
            image = `${baseUrl.origin}${image}`
          } else {
            const basePath = baseUrl.pathname.split('/').slice(0, -1).join('/')
            image = `${baseUrl.origin}${basePath}/${image}`
          }
        } catch (error) {
          console.error('Error fixing relative image URL:', error)
        }
      }
    }

    if (image) {
      try {
        const imgResponse = await axios.head(image, { timeout: 3000 })
        if (imgResponse.status !== 200) {
          image = ''
        }
      } catch (error) {
        console.error('Image validation failed:', error)
        image = ''
      }
    }

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
