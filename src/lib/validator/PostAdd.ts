import { z } from 'zod'
import { JSONContent } from '@tiptap/react'

const BasePostSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters' })
    .max(128, { message: 'Title cannot exceed 128 characters' }),
  subredditId: z.string().min(1, { message: 'Subreddit is required' }),
  tag: z.string().optional()
})

export const LinkPreviewSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  url: z.string().url()
})

export type LinkPreview = z.infer<typeof LinkPreviewSchema>

export const TextPostSchema = BasePostSchema.extend({
  type: z.literal('TEXT'),
  content: z.any()
})

export const ImagePostSchema = BasePostSchema.extend({
  type: z.literal('IMAGE'),
  imageUrl: z.string().url({ message: 'Valid image URL is required' }),

  description: z.any().optional()
})

export const LinkPostSchema = BasePostSchema.extend({
  type: z.literal('LINK'),
  linkUrl: z.string().url({ message: 'Valid URL is required' }),
  linkMeta: LinkPreviewSchema.optional()
})

export const PostCreateSchema = z.discriminatedUnion('type', [
  TextPostSchema,
  ImagePostSchema,
  LinkPostSchema
])

export type TextPostData = z.infer<typeof TextPostSchema>
export type ImagePostData = z.infer<typeof ImagePostSchema>
export type LinkPostData = z.infer<typeof LinkPostSchema>
export type PostCreateData = z.infer<typeof PostCreateSchema>

export const LinkFetchSchema = z.object({
  url: z.string().url({ message: 'Valid URL is required' })
})

export type LinkFetchInput = z.infer<typeof LinkFetchSchema>
