import { Formik, Form, Field } from 'formik'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import axios from 'axios'
import { useAuth, useUserQuery } from '../hooks'
import { FormErrors } from '../components'

function Settings() {
  const {
    data,
  } = useUserQuery()
  const user = data?.user || {}
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { logout, login } = useAuth()

  async function onSubmit(values, { setErrors }) {
    try {
      console.log('Submitting settings update with values:', values)
      
      const { data } = await axios.put(`/user`, { user: values })
      console.log('Settings update response:', data)

      // Check if we have a valid user response with a token
      if (data?.user?.token) {
        // Update the auth state with the new user data and token
        login(data.user)
        
        const updatedUsername = data.user.username

        // Invalidate relevant queries
        queryClient.invalidateQueries(`/profiles/${updatedUsername}`)
        queryClient.invalidateQueries(`/user`)

        // Navigate to the updated profile
        navigate(`/profile/${updatedUsername}`)
      } else {
        // If no token in response, something went wrong
        console.error('No token in response:', data)
        setErrors({ general: ['Failed to update settings. Please try again.'] })
      }
    } catch (error) {
      console.error('Settings update error:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      
      if (error?.response?.status === 422) {
        setErrors(error.response.data.errors)
      } else if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors({ general: ['An error occurred while updating settings.'] })
      }
    }
  }

  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Your Settings</h1>
            <Formik onSubmit={onSubmit} initialValues={user} enableReinitialize>
              {({ isSubmitting }) => (
                <>
                  <FormErrors />
                  <Form>
                    <fieldset disabled={isSubmitting}>
                      <fieldset className="form-group">
                        <Field name="image" className="form-control" type="text" placeholder="URL of profile picture" />
                      </fieldset>
                      <fieldset className="form-group">
                        <Field
                          name="username"
                          className="form-control form-control-lg"
                          type="text"
                          placeholder="Your Name"
                        />
                      </fieldset>
                      <fieldset className="form-group">
                        <Field
                          as="textarea"
                          name="bio"
                          className="form-control form-control-lg"
                          rows={8}
                          placeholder="Short bio about you"
                        />
                      </fieldset>
                      <fieldset className="form-group">
                        <Field name="email" className="form-control form-control-lg" type="text" placeholder="Email" />
                      </fieldset>
                      <fieldset className="form-group">
                        <Field
                          name="password"
                          className="form-control form-control-lg"
                          type="password"
                          placeholder="Password"
                        />
                      </fieldset>
                      <button type="submit" className="btn btn-lg btn-primary pull-xs-right">
                        Update Settings
                      </button>
                    </fieldset>
                  </Form>
                </>
              )}
            </Formik>
            <hr />
            <button onClick={() => logout()} type="button" className="btn btn-outline-danger">
              Or click here to logout.
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
