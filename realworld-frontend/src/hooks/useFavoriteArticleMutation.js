import { useNavigate } from 'react-router-dom'
import { useQueryClient, useMutation } from 'react-query'
import axios from 'axios'
import useAuth from './useAuth'

function useFavoriteArticleMutation(slug) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuth } = useAuth()
  const queryKey = `/articles/${slug}`

  return useMutation(
    (/** @type {{favorited: boolean}} */ { favorited }) => {
      // Ensure the token is in the request
      const token = window.localStorage.getItem('jwtToken')
      if (!token) {
        return Promise.reject(new Error('Authentication required'))
      }
      
      // Make sure the Authorization header is set
      if (!axios.defaults.headers.common['Authorization']) {
        axios.defaults.headers.common['Authorization'] = `Token ${token}`
      }
      
      return axios[favorited ? 'delete' : 'post'](`/articles/${slug}/favorite`)
    },
    {
      onMutate: async () => {
        const previousArticle = queryClient.getQueryData(queryKey)

        if (isAuth) {
          await queryClient.cancelQueries(queryKey)

          queryClient.setQueryData(queryKey, (oldData) => {
            if (!oldData?.article) return oldData
            
            const currentArticle = oldData.article
            const count = currentArticle.favoritesCount

            return {
              article: {
                ...currentArticle,
                favorited: !currentArticle.favorited,
                favoritesCount: currentArticle.favorited ? count - 1 : count + 1,
              },
            }
          })
        } else {
          navigate('/login')
        }

        return { previousArticle }
      },
      onError: (err, _, context) => {
        if (context?.previousArticle) {
          queryClient.setQueryData(queryKey, context.previousArticle)
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(queryKey)
      },
    }
  )
}

export default useFavoriteArticleMutation
