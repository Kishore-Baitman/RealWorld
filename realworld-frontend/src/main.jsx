import React from 'react'
import ReactDOM from 'react-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { createServer } from 'miragejs'
import axios from 'axios'
import App from './App'
import makeServer from './server'

// @ts-ignore
if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = 'https://api.realworld.io/api'
// @ts-ignore
} else if (process.env.NODE_ENV === 'development') {
  // Connect to the local backend API
  axios.defaults.baseURL = 'http://localhost:3001/api'
  
  // Comment out Mirage.js to use the real backend API
  // makeServer({ environment: 'development' })
}

// Set up axios interceptors to handle authentication
const token = window.localStorage.getItem('jwtToken')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Token ${token}`
}

// Add a request interceptor to ensure the token is always included
axios.interceptors.request.use(
  config => {
    const token = window.localStorage.getItem('jwtToken')
    if (token) {
      config.headers['Authorization'] = `Token ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

const defaultQueryFn = async ({ queryKey }) => {
  const { data } = await axios.get(queryKey[0], { params: queryKey[1] })
  return data
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 300000,
    },
  },
})

// @ts-ignore
if (window.Cypress && process.env.NODE_ENV === 'test') {
  const cyServer = createServer({
    routes() {
      ;['get', 'put', 'patch', 'post', 'delete'].forEach((method) => {
        // @ts-ignore
        this[method]('/*', (schema, request) => window.handleFromCypress(request))
      })
    },
  })
  cyServer.logging = false
// @ts-ignore
} else if(process.env.NODE_ENV === 'development') {
  // Completely disable Mirage.js in development mode
  // makeServer({ environment: 'development' })
}

// @ts-ignore
ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} containerElement="div" />
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
