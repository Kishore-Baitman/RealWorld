import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import useAuth from './useAuth'

interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

interface ProfileResponse {
  profile: Profile;
}

function useProfileQuery() {
  const params = useParams()
  const username = params.username
  const { isAuth } = useAuth()

  return useQuery(
    ['profile', username],
    async () => {
      if (!username) return { profile: {} as Profile }
      
      try {
        // Use the same axios instance that's configured in main.jsx
        const response = await axios.get(`/profiles/${username}`)
        return response.data as ProfileResponse
      } catch (error) {
        // If we get a 404 error, it means the profile was not found
        if (error && typeof error === 'object' && 'response' in error) {
          const status = (error as any).response?.status
          if (status === 404) {
            return {
              profile: {
                username: '',
                bio: '',
                image: '',
                following: false
              }
            }
          }
        }
        throw error
      }
    },
    { 
      placeholderData: { profile: {} as Profile },
      enabled: !!username,
      // Don't retry on 404 errors
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'response' in error) {
          const status = (error as any).response?.status
          return status !== 404 && failureCount < 3
        }
        return failureCount < 3
      }
    }
  )
}

export default useProfileQuery 