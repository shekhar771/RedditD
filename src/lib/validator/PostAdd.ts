// import { Schema, z } from "zod";

// export const PostSchema = z.object({
//   title: z
//     .string()
//     .min(3, { message: "Title must be at least 3 characters" })
//     .max(128, { message: "Title cannot exceed 128 characters" }),
//   subredditId: z.string(), // You'll need to pass this when submitting
//   contentType: z.enum(["Text", "Images", "Link"]),
//   content: z.object({
//     text: z.string().optional(),
//     imageFile: z.instanceof(File).optional(),
//     link: z.string().url().optional(),
//     description: z.string().optional(),
//   }),
// });

// type PostFormData = z.infer<typeof PostSchema>;

import { z } from "zod";

export const PostSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(128, { message: "Title cannot exceed 128 characters" }),
  subredditId: z.string(),
  contentType: z.enum(["Text", "Images", "Link"]),
  content: z
    .object({
      text: z.string().optional(),
      imageFile: z.instanceof(File).optional(),
      link: z.string().url().optional(),
      description: z.string().optional(),
    })
    .refine(
      (data) => {
        // Ensure required fields are present based on contentType
        if (
          data.text === undefined &&
          data.imageFile === undefined &&
          data.link === undefined
        ) {
          return false;
        }
        return true;
      },
      {
        message: "Content is required based on the selected type",
      }
    ),
});

export type PostFormData = z.infer<typeof PostSchema>;
