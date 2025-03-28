import { Schema, z } from "zod";

export const PostSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(128, { message: "Title cannot exceed 128 characters" }),
  subredditId: z.string(), // You'll need to pass this when submitting
  contentType: z.enum(["Text", "Images", "Link"]),
  content: z.object({
    text: z.string().optional(),
    imageFile: z.instanceof(File).optional(),
    link: z.string().url().optional(),
    description: z.string().optional(),
  }),
});

type PostFormData = z.infer<typeof PostSchema>;
