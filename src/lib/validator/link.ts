// utils/types.ts
import { z } from 'zod'

export const LinkSchema = z.object({
  url: z
    .string()
    .url('Please enter a valid URL')
    .refine(
      url => {
        try {
          new URL(url)
          return true
        } catch {
          return false
        }
      },
      {
        message: 'Invalid URL format'
      }
    )
})

export type LinkInput = z.infer<typeof LinkSchema>

export const LinkPreviewSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  url: z.string().url()
})

export type LinkPreview = z.infer<typeof LinkPreviewSchema>
