import { UserPreview } from './UserPreview.jsx'

export function UserList({ users, onRemoveUser }) {
  const nonAdminUsers = users.filter(user => !user.isAdmin)
  console.log('Filtered users:', nonAdminUsers)

  return (
    <ul className="user-list">
      {nonAdminUsers.map(user => (
        <UserPreview key={user._id} user={user} onRemoveUser={onRemoveUser} />
      ))}
    </ul>
  )
}
