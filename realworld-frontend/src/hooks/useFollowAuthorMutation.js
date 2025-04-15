import axios from 'axios'
import { useMutation, useQueryClient } from 'react-query'

function useFollowAuthorMutation(config) {
  const queryClient = useQueryClient()

  return useMutation(
    (/** @type {{following: boolean, username: string}} */ { following, username }) => {
      // Ensure the token is in the request
      const token = window.localStorage.getItem('jwtToken')
      if (!token) {
        console.error('No token found in localStorage')
        return Promise.reject(new Error('Authentication required'))
      }
      
      // If following is true, we want to unfollow (DELETE)
      // If following is false, we want to follow (POST)
      const method = following ? 'delete' : 'post'
      
      // Create a new axios instance with the correct headers
      const api = axios.create({
        baseURL: axios.defaults.baseURL,
        headers: {
          'Authorization': `Token ${token}`
        }
      })
      
      return api({
        method,
        url: `/profiles/${username}/follow`,
      })
        .then(response => response.data)
        .catch(error => {
          console.error('Error following/unfollowing user:', error.response?.data || error.message)
          throw error
        })
    },
    {
      ...config,
      onSuccess: (data, variables) => {
        // Call the original onSuccess if it exists
        if (config?.onSuccess) {
          config.onSuccess(data, variables)
        }
        
        // Update the profile in the cache
        const queryKey = ['profile', variables.username]
        queryClient.setQueryData(queryKey, data)
        
        // Also invalidate the feed query to update article lists
        queryClient.invalidateQueries(['articles', 'feed'])
        
        // Invalidate any queries that might contain this user's profile
        queryClient.invalidateQueries(['articles'])
      }
    }
  )
}

export default useFollowAuthorMutation
