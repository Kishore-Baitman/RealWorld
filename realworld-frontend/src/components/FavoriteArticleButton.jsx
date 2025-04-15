import classNames from 'classnames'
import React from 'react'
import { useFavoriteArticleMutation } from '../hooks'

function FavoriteArticleButton({ slug, favorited, children, className = '' }) {
  const { mutate, isLoading } = useFavoriteArticleMutation(slug)

  const handleFavoriteClick = () => {
    // Toggle the favorite state
    mutate({ favorited })
  }

  return (
    <button
      type="button"
      className={classNames(
        'btn btn-sm',
        {
          'btn-outline-primary': !favorited,
          'btn-primary': favorited,
        },
        className
      )}
      onClick={handleFavoriteClick}
      disabled={isLoading}
    >
      <i className="ion-heart" />
      {children}
    </button>
  )
}

export default FavoriteArticleButton
