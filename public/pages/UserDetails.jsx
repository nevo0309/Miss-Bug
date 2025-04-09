const { useState, useEffect } = React
const { useNavigate } = ReactRouterDOM

import { BugList } from '../cmps/BugList.jsx'
import { bugService } from '../services/bug.service.remote.js'
import { authService } from '../services/auth.service.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'

export function UserDetails() {
  const user = authService.getLoggedinUser()
  const [bugs, setBugs] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    loadUserBugs()
  }, [])

  function loadUserBugs() {
    bugService
      .query({ userId: user._id })
      .then(res => {
        setBugs(res.bugs)
      })
      .catch(err => {
        console.log('err:', err)
      })
  }

  function onRemoveBug(bugId) {
    bugService
      .remove(bugId)
      .then(() => {
        const bugsToUpdate = bugs.filter(bug => bug._id !== bugId)
        setBugs(bugsToUpdate)
        showSuccessMsg('Bug removed')
      })
      .catch(err => showErrorMsg(`Cannot remove bug`, err))
  }

  function onEditBug(bug) {
    const severity = +prompt('New severity?', bug.severity)
    const bugToSave = { ...bug, severity }

    bugService
      .save(bugToSave)
      .then(savedBug => {
        const bugsToUpdate = bugs.map(currBug =>
          currBug._id === savedBug._id ? savedBug : currBug
        )

        setBugs(bugsToUpdate)
        showSuccessMsg('Bug updated')
      })
      .catch(err => showErrorMsg('Cannot update bug', err))
  }

  if (!user) return null

  return (
    <section className="user-profile">
      <h1>Hello {user.fullname}</h1>

      {!bugs || (!bugs.length && <h2>No bugs to show</h2>)}
      {bugs && bugs.length > 0 && <h3>Manage your bugs</h3>}
      <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
    </section>
  )
}
