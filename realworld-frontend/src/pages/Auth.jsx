import React from 'react'
import { Link, useNavigate, useMatch } from 'react-router-dom'
import { Formik, Form, Field } from 'formik'
import axios from 'axios'
import { FormErrors } from '../components'
import { useAuth } from '../hooks'

function Auth() {
  const navigate = useNavigate()
  const isRegister = useMatch('/register')
  const { login } = useAuth()

  async function onSubmit(values, actions) {
    try {
      const { data } = await axios.post(`/users${isRegister ? '' : '/login'}`, { user: values })

      // Check if the response has a user property
      if (!data.user) {
        throw new Error('Invalid response format: missing user property')
      }

      login(data.user)

      navigate('/')
    } catch (error) {
      console.error('Auth error:', error)
      
      if (error?.response?.status === 422) {
        actions.setErrors(error.response.data.errors)
      } else if (error?.response?.data?.errors) {
        // Handle API errors that come in a different format
        actions.setErrors(error.response.data.errors)
      } else if (error?.message === 'Network Error') {
        actions.setErrors({
          general: ['Network error. Please check your connection and try again.']
        })
      } else {
        // Handle other types of errors with more specific messages
        actions.setErrors({
          general: [`Error: ${error?.message || 'Something went wrong. Please try again.'}`]
        })
      }
    }
  }

  const loginInitialValues = { email: '', password: '' }

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign {isRegister ? 'up' : 'in'}</h1>
            <p className="text-xs-center">
              <Link to="/register">{isRegister ? 'Have' : 'Need'} an account?</Link>
            </p>
            <Formik
              onSubmit={onSubmit}
              initialValues={isRegister ? { ...loginInitialValues, username: '' } : loginInitialValues}
            >
              {({ isSubmitting }) => (
                <>
                  <FormErrors />
                  <Form>
                    {isRegister && (
                      <fieldset className="form-group">
                        <Field
                          type="text"
                          name="username"
                          className="form-control form-control-lg"
                          placeholder="Your Name"
                        />
                      </fieldset>
                    )}
                    <fieldset className="form-group">
                      <Field type="email" name="email" className="form-control form-control-lg" placeholder="Email" />
                    </fieldset>
                    <fieldset className="form-group">
                      <Field
                        type="password"
                        name="password"
                        className="form-control form-control-lg"
                        placeholder="Password"
                      />
                    </fieldset>
                    <button disabled={isSubmitting} type="submit" className="btn btn-lg btn-primary pull-xs-right">
                      Sign {isRegister ? 'up' : 'in'}
                    </button>
                  </Form>
                </>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
