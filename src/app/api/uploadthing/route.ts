// app/api/uploadthing/route.ts
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    // Add your GitHub Codespaces domain
    uploadthingId: process.env.UPLOADTHING_APP_ID,
    uploadthingSecret: process.env.UPLOADTHING_SECRET,
    callbackUrl: "https://potential-zebra-vrp6r4p4x4whpp65-3000.app.github.dev",
    // Allow any GitHub Codespaces URL pattern
    corsOrigins: [
      "http://localhost:3000", //
      "https://*.app.github.dev",
      "https://potential-zebra-vrp6r4p4x4whpp65-3000.app.github.dev",
    ],
  },
});
