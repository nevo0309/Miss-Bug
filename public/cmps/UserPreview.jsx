export function UserPreview({ user, onRemoveUser }) {
  return (
    <li className="user-preview-card">
      <h3>{user.username}</h3>
      <h4>{user.fullname}</h4>
      <h4>ID: {user._id}</h4>
      <button className="btn user-remove" onClick={() => onRemoveUser(user._id)}>
        Remove this user
      </button>
    </li>
  )
}
