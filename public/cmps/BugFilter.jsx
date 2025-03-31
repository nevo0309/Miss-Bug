const { useState, useEffect } = React

export function BugFilter({ filterBy, onSetFilterBy }) {
  const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

  useEffect(() => {
    onSetFilterBy(filterByToEdit)
  }, [filterByToEdit])

  function handleChange({ target }) {
    const field = target.name
    let value = target.value

    switch (target.type) {
      case 'number':
      case 'range':
        value = +value || ''
        break

      case 'checkbox':
        value = target.checked
        break

      default:
        break
    }

    setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
  }

  function onSubmitFilter(ev) {
    ev.preventDefault()
    onSetFilterBy(filterByToEdit)
  }

  const { txt, severity } = filterByToEdit
  return (
    <section className="bug-filter">
      <h2>Filter</h2>
      <form onSubmit={onSubmitFilter}>
        <label htmlFor="txt">Text: </label>
        <input
          value={txt}
          onChange={handleChange}
          type="text"
          placeholder="By Text"
          id="txt"
          name="txt"
        />

        <label htmlFor="severity">Min Severity: </label>
        <input
          value={severity}
          onChange={handleChange}
          type="number"
          placeholder="By severity"
          id="severity"
          name="severity"
        />
      </form>
      <label htmlFor="sortBy">Sort By:</label>
      <select name="sortBy" value={filterByToEdit.sortBy || ''} onChange={handleChange}>
        <option value="title">Title</option>
        <option value="createdAt">Create at</option>
        <option value="severity">Severity</option>
      </select>
      <label htmlFor="sortDir">Direction:</label>
      <select name="sortDir" value={filterByToEdit.sortDir || 'asc'} onChange={handleChange}>
        <option value="asc">Ascending</option>
        <option value="des">Descending</option>
      </select>
    </section>
  )
}
