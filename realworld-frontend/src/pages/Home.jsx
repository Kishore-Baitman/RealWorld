import classNames from 'classnames'
import React from 'react'
import { ArticleList, PopularTags } from '../components'
import { useAuth } from '../hooks'

const initialFilters = { tag: '', offset: null, feed: false }

function Home() {
  const { isAuth } = useAuth()
  const [filters, setFilters] = React.useState({ ...initialFilters, feed: isAuth })

  React.useEffect(() => {
    // Only set feed to true if user is authenticated
    setFilters({ ...initialFilters, feed: isAuth })
  }, [isAuth])

  function onTagClick(tag) {
    setFilters({ ...initialFilters, tag })
  }

  function onGlobalFeedClick() {
    setFilters(initialFilters)
  }

  function onFeedClick() {
    // Only allow feed if user is authenticated
    if (isAuth) {
      setFilters({ ...initialFilters, feed: true })
    } else {
      // If not authenticated, redirect to login or show a message
      console.log('You need to be logged in to view your feed')
    }
  }

  return (
    <div className="home-page">
      <div className="banner">
        <div className="container">
          <h1 className="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>
      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <div className="feed-toggle">
              <ul className="nav nav-pills outline-active">
                {isAuth && (
                  <li className="nav-item">
                    <button
                      onClick={onFeedClick}
                      type="button"
                      className={classNames('nav-link', {
                        active: filters.feed,
                      })}
                    >
                      Your Feed
                    </button>
                  </li>
                )}
                <li className="nav-item">
                  <button
                    onClick={onGlobalFeedClick}
                    type="button"
                    className={classNames('nav-link', {
                      active: !filters.feed && !filters.tag,
                    })}
                  >
                    Global Feed
                  </button>
                </li>
                {filters.tag && (
                  <li className="nav-item">
                    <button type="button" className="nav-link active">
                      #{filters.tag}
                    </button>
                  </li>
                )}
              </ul>
            </div>
            <ArticleList filters={filters} />
          </div>
          <div className="col-md-3">
            <div className="sidebar">
              <p>Popular Tags</p>
              <PopularTags onTagClick={onTagClick} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
