import { utilService } from './util.service.js'
import fs from 'fs'

const PAGE_SIZE = 5
const gBugs = utilService.readJsonFile('data/bug.json')

export const bugService = {
  query,
  getById,
  remove,
  save,
  hasBugs,
}

function query(filterBy) {
  return Promise.resolve(gBugs).then(bugs => {
    if (filterBy.txt) {
      const regExp = new RegExp(filterBy.txt, 'i')
      bugs = bugs.filter(bug => regExp.test(bug.title))
    }

    if (filterBy.severity) {
      bugs = bugs.filter(bug => bug.severity >= filterBy.severity)
    }
    if (filterBy.userId) {
      bugs = bugs.filter(bug => bug.creator && bug.creator._id === filterBy.userId)
    }

    const total = bugs.length

    if (filterBy.pageIdx !== undefined && filterBy.pageIdx !== null) {
      const startIdx = filterBy.pageIdx * PAGE_SIZE
      bugs = bugs.slice(startIdx, startIdx + PAGE_SIZE)
    }

    if (filterBy.sortBy) {
      const dir = filterBy.sortDir === 'des' ? -1 : 1
      bugs.sort((a, b) => {
        if (filterBy.sortBy === 'title') {
          return a.title.localeCompare(b.title) * dir
        } else {
          return (a[filterBy.sortBy] - b[filterBy.sortBy]) * dir
        }
      })
    }

    return { bugs, total }
  })
}

function getById(bugId) {
  const bug = gBugs.find(bug => bug._id === bugId)
  if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
  return Promise.resolve(bug)
}

function hasBugs(userId) {
  const has = gBugs.some(bug => bug.creator._id === userId)
  return has ? Promise.reject('Cannot remove user with bugs') : Promise.resolve()
}

function remove(bugId, loggedinUser) {
  const idx = gBugs.findIndex(bug => bug._id === bugId)
  if (idx === -1) return Promise.reject('No bug found')

  console.log('Logged in user:', loggedinUser)
  console.log('Bug creator:', gBugs[idx].creator)

  if (!isAuthorized(gBugs[idx], loggedinUser)) {
    return Promise.reject('Not authorized to delete this bug')
  }

  gBugs.splice(idx, 1)
  return _saveBugsToFile()
}

function save(bugToSave, loggedinUser) {
  if (bugToSave._id) {
    const bugIdx = gBugs.findIndex(bug => bug._id === bugToSave._id)
    if (bugIdx === -1) return Promise.reject('No bug found')

    if (!isAuthorized(gBugs[bugIdx], loggedinUser)) {
      return Promise.reject('Not authorized to update this bug')
    }

    gBugs[bugIdx] = { ...gBugs[bugIdx], ...bugToSave }
  } else {
    bugToSave._id = utilService.makeId()
    bugToSave.createdAt = Date.now()
    gBugs.unshift(bugToSave)
  }

  return _saveBugsToFile().then(() => bugToSave)
}

function isAuthorized(bug, loggedinUser) {
  if (!bug.creator) return loggedinUser.isAdmin
  return bug.creator._id === loggedinUser._id || loggedinUser.isAdmin
}

function _saveBugsToFile() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(gBugs, null, 4)
    fs.writeFile('data/bug.json', data, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}
