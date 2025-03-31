const { useState, useEffect } = React

import { bugService } from '../services/bug.service.remote.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'

export function BugIndex() {
  const [bugs, setBugs] = useState(null)
  const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadBugs()
  }, [filterBy])

  function loadBugs() {
    bugService
      .query(filterBy)
      .then(({ bugs, total }) => {
        setBugs(bugs)
        setTotalPages(Math.ceil(total / 5)) // 5 is PAGE_SIZE from bug.service
      })
      .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
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

  function onAddBug() {
    const bug = {
      title: prompt('Bug title?', 'Bug ' + Date.now()),
      severity: +prompt('Bug severity?', 3),
      description: prompt('Describe the bug'),
    }

    bugService
      .save(bug)
      .then(savedBug => {
        setBugs([...bugs, savedBug])
        showSuccessMsg('Bug added')
      })
      .catch(err => showErrorMsg(`Cannot add bug`, err))
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

  function onSetFilterBy(filterBy) {
    setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
  }
  function onSetPage(diff) {
    setFilterBy(prevFilter => {
      if (prevFilter.pageIdx === undefined) return prevFilter
      let newPageIdx = prevFilter.pageIdx + diff

      if (newPageIdx < 0) newPageIdx = totalPages - 1
      else if (newPageIdx >= totalPages) newPageIdx = 0

      return { ...prevFilter, pageIdx: newPageIdx }
    })
  }

  return (
    <section className="bug-index main-content">
      <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
      <header>
        <h3>Bug List</h3>
        <button onClick={onAddBug}>Add Bug</button>
      </header>

      <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />

      <label htmlFor="">
        Use Paging
        <input
          type="checkbox"
          onChange={ev =>
            setFilterBy(prevFilter => ({
              ...prevFilter,
              pageIdx: ev.target.checked ? 0 : undefined,
            }))
          }
        />
      </label>

      <button onClick={() => onSetPage(-1)}>prev page</button>

      <button onClick={() => onSetPage(1)}>next page</button>
      {filterBy.pageIdx !== undefined && (
        <p>
          Page {filterBy.pageIdx + 1} of {totalPages}
        </p>
      )}
    </section>
  )
}
