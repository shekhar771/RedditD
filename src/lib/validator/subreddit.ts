import { z } from 'zod'

export const subredditSchema = z.object({
  name: z.string().min(3).max(21),
  description: z.string().min(3).max(500).optional(),
  image: z.string().url().optional(),
  backgroundImage: z.string().url().optional(),
  allowCustomTags: z.boolean().default(false)
})

export type CreateSubredditPayload = z.infer<typeof subredditSchema>

export const subredditsubscriber = z.object({
  subredditId: z.string()
})

export type SubredditSubscriberPayload = z.infer<typeof subredditsubscriber>
