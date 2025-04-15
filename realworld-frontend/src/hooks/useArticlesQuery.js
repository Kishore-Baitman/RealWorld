import { omit } from 'lodash-es'
import { useQuery } from 'react-query'
import useAuth from './useAuth'

function useArticlesQuery({ filters }) {
  const { isAuth } = useAuth()
  
  // If feed is true but user is not authenticated, don't make the request
  const shouldFetch = !(filters.feed && !isAuth)
  
  return useQuery(
    [`/articles${filters.feed ? '/feed' : ''}`, { limit: 10, ...omit(filters, ['feed']) }], 
    {
      placeholderData: {
        articles: [],
        articlesCount: 0,
      },
      keepPreviousData: true,
      enabled: shouldFetch, // Only run the query if shouldFetch is true
      retry: (failureCount, error) => {
        // Don't retry on 401 errors
        if (error && 
            typeof error === 'object' && 
            'response' in error && 
            error.response && 
            typeof error.response === 'object' && 
            'status' in error.response && 
            error.response.status === 401) {
          return false
        }
        return failureCount < 3
      }
    }
  )
}

export default useArticlesQuery
