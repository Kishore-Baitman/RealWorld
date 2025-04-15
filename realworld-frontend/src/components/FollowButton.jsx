import React from 'react'
import { Link } from 'react-router-dom'

function FollowButton({ following, username, onClick, disabled }) {
  return (
    <button
      className={`btn btn-sm ${following ? 'btn-secondary' : 'btn-outline-secondary'}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      <i className="ion-plus-round"></i>
      &nbsp; {following ? 'Unfollow' : 'Follow'} {username}
    </button>
  )
}

export default FollowButton
