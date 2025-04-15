import axios from 'axios'
import { isEmpty } from 'lodash-es'
import { useSnapshot } from 'valtio'
import { proxyWithComputed } from 'valtio/utils'
import React from 'react'

function getAuthUser() {
  const token = window.localStorage.getItem('jwtToken')
  const userStr = window.localStorage.getItem('user')

  if (!token || !userStr) return {}

  try {
    return JSON.parse(userStr)
  } catch (error) {
    console.error('Error parsing user data')
    // Clear the invalid data
    window.localStorage.removeItem('jwtToken')
    window.localStorage.removeItem('user')
    return {}
  }
}

const state = proxyWithComputed(
  {
    authUser: getAuthUser(),
  },
  {
    isAuth: (snap) => !isEmpty(snap.authUser),
  }
)

const actions = {
  login: (user) => {
    state.authUser = user

    // Make sure the user object has a token property
    if (!user.token) {
      console.error('User object does not have a token property')
      return
    }

    // Store the token and user data separately
    window.localStorage.setItem('jwtToken', user.token)
    window.localStorage.setItem('user', JSON.stringify(user))

    // Set the Authorization header with just the token
    axios.defaults.headers.common['Authorization'] = `Token ${user.token}`
  },
  logout: () => {
    state.authUser = {}

    window.localStorage.removeItem('jwtToken')
    window.localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  },
  checkAuth: () => {
    const authUser = getAuthUser()
    const token = window.localStorage.getItem('jwtToken')

    if (!authUser || isEmpty(authUser) || !token) {
      actions.logout()
    } else {
      // Restore the Authorization header
      axios.defaults.headers.common['Authorization'] = `Token ${token}`
    }
  },
}

function useAuth() {
  const snap = useSnapshot(state)

  // Ensure the auth header is set when the hook is used
  React.useEffect(() => {
    const token = window.localStorage.getItem('jwtToken')
    if (token && !axios.defaults.headers.common['Authorization']) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`
    }
  }, [])

  return {
    ...snap,
    ...actions,
  }
}

export default useAuth
