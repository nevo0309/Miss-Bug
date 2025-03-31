const BASE_URL = '/api/bug/'

export const bugService = {
  query,
  getById,
  save,
  remove,
  getDefaultFilter,
}

function query(filterBy = {}) {
  return axios.get(BASE_URL, { params: filterBy }).then(res => res.data)
  // .then((bugs) => {
  //   if (filterBy.txt) {
  //     const regExp = new RegExp(filterBy.txt, 'i')
  //     bugs = bugs.filter((bug) => regExp.test(bug.title))
  //   }

  //   if (filterBy.minSeverity) {
  //     bugs = bugs.filter((bug) => bug.severity >= filterBy.minSeverity)
  //   }

  //   return bugs
  // })
}

function getById(bugId) {
  return axios.get(BASE_URL + bugId).then(res => res.data)
}

function remove(bugId) {
  return axios.delete(BASE_URL + bugId).then(res => res.data)
}

function save(bug) {
  const url = BASE_URL

  if (bug._id) {
    return axios
      .put(url + bug._id, bug)
      .then(res => res.data)
      .catch(err => {
        console.log(err)
        throw err
      })
  } else {
    return axios
      .post(url, bug)
      .then(res => res.data)
      .catch(err => {
        console.log(err)
        throw err
      })
  }
}

// function save(bug) {
//   const queryParams = `title=${bug.title}&description=${bug.description}&severity=${bug.severity}`
//   if (bug._id) {
//     queryParams += `&_id=${bug._id}`
//     return axios.get(BASE_URL + 'save?' + queryParams)
//   } else {
//     return axios.get(BASE_URL + 'save?' + queryParams)
//   }
// }

function getDefaultFilter() {
  return {
    txt: '',
    severity: '',
    sortBy: '',
    sortDir: 'asc',
    pageIdx: undefined,
  }
}
