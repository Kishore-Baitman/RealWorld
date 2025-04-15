import React from 'react'

function TagsInput({ field, form }) {
  const handleKeyDown = (/** @type {import('react').KeyboardEvent<HTMLInputElement>} */ e) => {
    // @ts-ignore
    const value = e.target.value.trim()

    if (e.key === 'Enter') {
      e.preventDefault()

      // Don't add empty tags or duplicates
      if (value && !field.value.includes(value)) {
        form.setFieldValue(field.name, [...field.value, value])
      }

      // @ts-ignore
      e.target.value = ''
    }
  }

  const removeTag = (tagToRemove) => {
    form.setFieldValue(
      field.name,
      field.value.filter((tag) => tag !== tagToRemove)
    )
  }

  return (
    <>
      <input
        onKeyDown={handleKeyDown}
        type="text"
        className="form-control"
        placeholder="Enter tags (press Enter to add)"
      />
      <div className="tag-list">
        {Array.isArray(field.value) && field.value.map((tag) => (
          <span key={tag} className="tag-default tag-pill">
            <i
              className="ion-close-round"
              onClick={() => removeTag(tag)}
            />
            {tag}
          </span>
        ))}
      </div>
    </>
  )
}

export default TagsInput
