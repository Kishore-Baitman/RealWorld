import classNames from 'classnames'
import React from 'react'
import { Link } from 'react-router-dom'
import { ArticleList, FollowProfileButton } from '../components'
import { useAuth, useProfileQuery } from '../hooks'

function Profile() {
  const { data, isLoading, error } = useProfileQuery()
  const { authUser } = useAuth()
  const [filters, setFilters] = React.useState({ author: '', favorited: '' })
  
  // Check if profile data exists before destructuring
  const profile = data?.profile || {}
  const { username = '', image = '', bio = '' } = profile
  const canUpdateProfile = authUser?.username === username

  const setAuthorFilter = React.useCallback(() => {
    setFilters({ author: username, favorited: '' })
  }, [username])

  React.useEffect(() => {
    if (username) {
      setAuthorFilter()
    }
  }, [username, setAuthorFilter])

  if (isLoading) {
    return (
      <div className="container">
        <div className="profile-page">
          <div className="user-info">
            <div className="container">
              <div className="row">
                <div className="col-xs-12 col-md-10 offset-md-1">
                  <div className="loading-placeholder">Loading profile...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="profile-page">
          <div className="user-info">
            <div className="container">
              <div className="row">
                <div className="col-xs-12 col-md-10 offset-md-1">
                  <div className="error-message">Error loading profile: {String(error)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if profile exists
  if (!profile || !profile.username) {
    return (
      <div className="container">
        <div className="profile-page">
          <div className="user-info">
            <div className="container">
              <div className="row">
                <div className="col-xs-12 col-md-10 offset-md-1">
                  <div className="error-message">Profile not found</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="user-info">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <img src={image} className="user-img" alt={username} />
              <h4>{username}</h4>
              <p>{bio}</p>
              {canUpdateProfile ? (
                <Link className="btn btn-sm btn-outline-secondary action-btn" to="/settings">
                  <i className="ion-gear-a" /> Edit Profile Settings
                </Link>
              ) : (
                <FollowProfileButton />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <div className="articles-toggle">
              <ul className="nav nav-pills outline-active">
                <li className="nav-item">
                  <button
                    onClick={setAuthorFilter}
                    type="button"
                    className={classNames('nav-link', {
                      active: filters?.author,
                    })}
                  >
                    My Articles
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    onClick={() => setFilters({ author: '', favorited: username })}
                    type="button"
                    className={classNames('nav-link', {
                      active: filters?.favorited,
                    })}
                  >
                    Favorited Articles
                  </button>
                </li>
              </ul>
            </div>
            <ArticleList filters={filters} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
