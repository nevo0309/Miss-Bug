const { Link, NavLink } = ReactRouterDOM
const { useNavigate } = ReactRouter

import { authService } from '../services/auth.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'
import { UserMsg } from './UserMsg.jsx'

export function AppHeader({ loggedinUser, setLoggedinUser }) {
  const navigate = useNavigate()

  function onLogout() {
    authService
      .logout()
      .then(() => {
        setLoggedinUser(null)
        navigate('/auth')
      })
      .catch(err => {
        console.log(err)
        showErrorMsg(`Couldn't logout`)
      })
  }

  return (
    <header className="app-header full main-layout">
      <h1>Bug App</h1>
      <nav className="app-nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/bug">Bugs</NavLink>
        {loggedinUser && loggedinUser.isAdmin && <NavLink to="/admin">Admin</NavLink>}

        {!loggedinUser ? (
          <NavLink to="/auth">Login</NavLink>
        ) : (
          <div className="user">
            <Link to={'/user'}>{loggedinUser.fullname}</Link>
            <button onClick={onLogout}>logout</button>
          </div>
        )}
      </nav>
      <UserMsg />
    </header>
  )
}
