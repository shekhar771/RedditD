// app/api/uploadthing/route.ts
import { createRouteHandler } from 'uploadthing/next'
import { ourFileRouter } from './core'

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    uploadthingId: process.env.UPLOADTHING_APP_ID,
    uploadthingSecret: process.env.UPLOADTHING_SECRET,

    // Simplified callback URL - let UploadThing handle the detection
    callbackUrl: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/uploadthing`
      : `${
          process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        }/api/uploadthing`,

    // Simplified CORS origins
    corsOrigins: [
      'http://localhost:3000',
      'https://*.app.github.dev',
      'https://potential-zebra-vrp6r4p4x4whpp65-3000.app.github.dev',
      ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? [process.env.NEXT_PUBLIC_SUPABASE_URL]
        : [])
    ].filter(Boolean) // Remove any undefined values
  }
})
