const { useState, useEffect } = React
const { useNavigate } = ReactRouterDOM

import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { authService } from '../services/auth.service.js'
import { userService } from '../services/user.service.js'
import { UserList } from '../cmps/UserList.jsx'

export function UserIndex() {
  const user = authService.getLoggedinUser()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!user || !user.isAdmin) {
      showErrorMsg('Not Authorized')
      navigate('/')
    }
    userService
      .query()
      .then(setUsers)
      .catch(err => {
        console.log('err', err)
        showErrorMsg('Had issues getting the users')
      })
  }, [])

  function onRemoveUser(userId) {
    userService
      .remove(userId)
      .then(() => {
        setUsers(users => users.filter(user => user._id !== userId))
        showSuccessMsg('User removed successfully')
      })
      .catch(err => {
        console.log('err', err)
        showErrorMsg('Unable removing the user')
      })
  }

  return (
    <section className="user-index">
      <h1>Hello, {user.fullname}</h1>
      <h3>User Managment</h3>
      <UserList users={users} onRemoveUser={onRemoveUser} />
    </section>
  )
}
