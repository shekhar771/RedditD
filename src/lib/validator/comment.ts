// types/comment.ts
import { Comment, User, CommentVote } from '@prisma/client'

export type CommentWithRelations = Comment & {
  author: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  votes: CommentVote[]
  replies?: CommentWithRelations[]
}

export interface CommentFormData {
  content: string
  postId: string
  replyToId?: string
}
