import { Schema, z } from "zod";

export const subredditSchema = z.object({
  name: z.string().min(3).max(21),
  description: z.string().min(3).max(55),
});

export const subredditsubscriber = z.object({
  subredditId: z.string(),
});

export type createSubredditPayload = z.infer<typeof subredditSchema>;
export type subredditsubscribberPayload = z.infer<typeof subredditsubscriber>;
