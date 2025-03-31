const { useState, useEffect } = React
const { Link, useParams, useNavigate } = ReactRouterDOM

import { bugService } from '../services/bug.service.remote.js'
import { showErrorMsg } from '../services/event-bus.service.js'

export function BugDetails() {
  const [bug, setBug] = useState(null)
  const { bugId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    bugService
      .getById(bugId)
      .then((bug) => setBug(bug))
      .catch((err) => {
        if (err && err.response.status === 400) {
          showErrorMsg(
            '"Whoa there! You’ve hit your free bug preview limit. Come back shortly to continue.'
          )
          navigate('/bug')
        } else {
          showErrorMsg('Cannot load bug')
        }
      })
  }, [])

  return (
    <div className="bug-details">
      <h3>Bug Details</h3>
      {!bug && <p className="loading">Loading....</p>}
      {bug && (
        <div>
          <h4>{bug.title}</h4>
          <h5>
            Severity: <span>{bug.severity}</span>
          </h5>
          <p>
            {bug.description ||
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
          </p>
        </div>
      )}
      <hr />
      <Link to="/bug">Back to List</Link>
    </div>
  )
}
