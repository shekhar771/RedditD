export enum PostType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  LINK = 'LINK'
}

export type PostWithRelations = {
  id: string
  title: string
  content: any
  type: PostType
  imageUrl?: string | null
  linkUrl?: string | null
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  subreddit: {
    id: string
    name: string
  }
  comment: any[]
  Vote: any[]
}
export type SortOption = 'new' | 'top' | 'controversial' | 'hot'
