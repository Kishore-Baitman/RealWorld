import React, { useState, useEffect } from 'react'
import { useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth, useFollowAuthorMutation, useProfileQuery } from '../hooks'
import FollowButton from './FollowButton'

/** @typedef {{ username: string, following: boolean, bio: string | null, image: string | null }} Profile */

function FollowProfileButton() {
  const { data, isLoading: isProfileLoading } = useProfileQuery()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { isAuth } = useAuth()
  
  /** @type {Profile} */
  const profile = data?.profile || { username: '', following: false, bio: null, image: null }
  const { following, username } = profile
  const queryKey = ['profile', username]
  
  // Track the current following state locally
  const [localFollowing, setLocalFollowing] = useState(following)
  
  // Update local state when profile data changes
  useEffect(() => {
    setLocalFollowing(following)
  }, [following])

  const { mutate, isLoading: isMutationLoading } = useFollowAuthorMutation({
    onMutate: async () => {
      // Return early if not authenticated or no username
      if (!isAuth || !username) {
        if (!isAuth) navigate('/login')
        return { previousProfile: null }
      }

      const previousProfile = queryClient.getQueryData(queryKey)
      
      await queryClient.cancelQueries(queryKey)
      
      // Optimistically update the profile data
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData?.profile) return oldData
        return {
          profile: {
            ...oldData.profile,
            following: !oldData.profile.following,
          },
        }
      })
      
      // Update local state optimistically
      setLocalFollowing(!localFollowing)

      return { previousProfile }
    },
    onError: (err, _, context) => {
      // Revert to the previous state if there's an error
      if (context?.previousProfile) {
        queryClient.setQueryData(queryKey, context.previousProfile)
      }
      // Revert local state
      setLocalFollowing(following)
      console.error('Follow/Unfollow error:', err)
    },
    onSettled: () => {
      // Invalidate the profile query to refetch the latest data
      queryClient.invalidateQueries(queryKey)
      queryClient.invalidateQueries(['articles', 'feed'])
    }
  })

  // Don't render the button if profile is loading or username is missing
  if (isProfileLoading || !username) return null

  const handleFollowClick = () => {
    if (!isAuth) {
      navigate('/login')
      return
    }
    
    // Prevent multiple clicks while loading
    if (isMutationLoading) return
    
    // Pass the current following state to determine the action
    // If following is true, we want to unfollow (DELETE)
    // If following is false, we want to follow (POST)
    mutate({ following: localFollowing, username })
  }

  return (
    <FollowButton
      disabled={isMutationLoading}
      following={localFollowing}
      onClick={handleFollowClick}
      username={username}
    />
  )
}

export default FollowProfileButton
