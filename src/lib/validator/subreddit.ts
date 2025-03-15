import { Schema, z } from "zod";

export const subredditSchema = z.object({
  name: z.string().min(3).max(21),
});

export const subredditsubscriber = z.object({
  subredditId: z.string(),
});

export type createSubredditPayload = z.infer<typeof subredditSchema>;
export type subreddutsubscribberPayload = z.infer<typeof subredditSchema>;
