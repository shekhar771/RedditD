import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

type VoteType = 'UPVOTE' | 'DOWNVOTE'

interface VotePayload {
  postId: string
  type: VoteType
}

export function useVoteMutation () {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, type }: VotePayload) => {
      const { data } = await axios.post('/api/posts/vote', {
        postId,
        type
      })
      return data
    },
    onMutate: async ({ postId, type }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] })

      const previousPosts = queryClient.getQueryData(['posts'])

      queryClient.setQueryData(['posts'], (old: any) => {
        return old
      })

      return { previousPosts }
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['posts'], context?.previousPosts)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    }
  })
}
