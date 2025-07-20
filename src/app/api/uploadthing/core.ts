// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "@/lib/server-auth";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      try {
        // This code runs on your server before upload
        const user = await getServerSession(); // Make sure this is awaited
        
        console.log("Upload middleware - User:", user?.user?.id || "No user");
        
        // If you throw, the user will not be able to upload
        // Uncomment this if you want to require authentication
        // if (!user) throw new Error("Unauthorized");

        // Whatever is returned here is accessible in onUploadComplete as `metadata`
        return { userId: user?.user?.id || "anonymous" };
      } catch (error) {
        console.error("Middleware error:", error);
        // Return default metadata if auth fails
        return { userId: "anonymous" };
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      console.log("File key:", file.key);
      
      // Make sure to return the correct URL structure
      return { 
        uploadedBy: metadata.userId, 
        url: file.url, // This is the main URL
        key: file.key,
        name: file.name
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;