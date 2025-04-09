import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { userService } from './services/user.service.js'
import { loggerService } from './services/logger.service.js'
import { authService } from './services/auth.servic.js'
import { requiredAuth } from './middlewares/requiredAuth.middleWare.js'

const port = 3030
const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/api/bug', (req, res) => {
  const filterBy = {
    txt: req.query.txt || '',
    severity: +req.query.severity || 0,
    pageIdx: req.query.pageIdx,
    sortBy: req.query.sortBy,
    sortDir: req.query.sortDir,
    userId: req.query.userId,
  }
  bugService
    .query(filterBy)
    .then(bugs => res.send(bugs))
    .catch(err => {
      loggerService.error('Cannot get bugs', err)
      res.status(500).send('Cannot load bugs')
    })
})

//* Create
app.post('/api/bug', requiredAuth, (req, res) => {
  // loggerService.debug('req qurey', req.query)
  const { loggedinUser } = req
  const { title, description, severity, _id, lables } = req.body
  const bugToSave = {
    _id,
    title,
    description,
    severity: +severity,
    lables: lables || [],
  }
  bugToSave.creator = { ...loggedinUser }
  delete bugToSave.creator.username

  bugService
    .save(bugToSave)
    .then(bug => {
      loggerService.info('Saved bug:', bug)

      res.send(bug)
    })
    .catch(err => {
      loggerService.error('Cannot add bug', err)
      res.status(500).send('Cannot add bug')
    })
})

//Update
app.put('/api/bug/:bugId', requiredAuth, (req, res) => {
  const { loggedinUser } = req
  const bugToSave = { ...req.body }
  bugToSave.severity = +bugToSave.severity

  bugService
    .getById(bugToSave._id)
    .then(existingBug => {
      bugToSave.creator = existingBug.creator
      return bugService.save(bugToSave, loggedinUser)
    })
    .then(savedBug => {
      loggerService.info('Saved bug:', savedBug)
      res.send(savedBug)
    })
    .catch(err => {
      loggerService.error('Cannot edit bug', err)
      res.status(500).send('Cannot edit bug')
    })
})

//* Get/Read by id
app.get('/api/bug/:bugId', (req, res) => {
  const { bugId } = req.params
  const { visitCountMap = [] } = req.cookies
  if (visitCountMap.length >= 3) return res.status(400).send('Wait for a bit')
  if (!visitCountMap.includes(bugId)) visitCountMap.push(bugId)
  res.cookie('visitCountMap', visitCountMap, { maxAge: 1000 * 10 })
  bugService
    .getById(bugId)
    .then(bug => res.send(bug))
    .catch(err => {
      loggerService.error('Cannot get bug', err)
      res.status(500).send('Cannot load bug')
    })
})

//* Remove/Delete
app.delete('/api/bug/:bugId', requiredAuth, (req, res) => {
  // const loggedinUser = authService.validateToken(req.cookies.loginToken)
  // if (!loggedinUser) return res.status(401).send(`Can't delete bug`)
  const { loggedinUser } = req

  const { bugId } = req.params

  bugService
    .remove(bugId, loggedinUser)
    .then(() => {
      loggerService.info(`bug ${bugId} removed`)
      res.send('bug Removed')
    })
    .catch(err => {
      loggerService.error('Cannot remove bug', err)
      res.status(500).send('Cannot remove bug')
    })
})

/////////////////////////////////// User API//////////////////////////////
app.get('/api/user', (req, res) => {
  userService
    .query()
    .then(users => res.send(users))
    .catch(err => {
      loggerService.error('Cannot load users', err)
      res.status(400).send('Cannot load users')
    })
})

app.get('/api/user/:userId', (req, res) => {
  const { userId } = req.params

  userService
    .getById(userId)
    .then(user => res.send(user))
    .catch(err => {
      loggerService.error('Cannot load user', err)
      res.status(400).send('Cannot load user')
    })
})

app.delete('/api/user/:userId', (req, res) => {
  const { loginToken } = req.cookies
  const loggedinUser = authService.validateToken(loginToken)
  if (!loggedinUser || !loggedinUser.isAdmin) return res.status(401).send('Cannot remove user')

  const { userId } = req.params

  bugService
    .hasBugs(userId)
    .then(() => userService.remove(userId))
    .then(() => res.send('Removed!'))
    .catch(err => {
      loggerService.error('Cannot delete user!', err)
      res.status(400).send(err)
    })
})

////////////////////////////////// Auth API //////////////////////////////////
app.post('/api/auth/login', (req, res) => {
  const credentials = req.body

  authService
    .checkLogin(credentials)
    .then(user => {
      const loginToken = authService.getLoginToken(user)
      res.cookie('loginToken', loginToken)
      res.send(user)
    })
    .catch(() => res.status(404).send('Invalid Credentials'))
})

app.post('/api/auth/signup', (req, res) => {
  const credentials = req.body

  userService
    .add(credentials)
    .then(user => {
      if (user) {
        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken)
        res.send(user)
      } else {
        res.status(400).send('Cannot signup')
      }
    })
    .catch(err => res.status(400).send('Username taken.'))
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('loginToken')
  res.send('logged-out!')
})

app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

app.get('/', (req, res) => res.send('Hello there the server is running'))
app.listen(port, () => loggerService.info(`Server listening on port http://127.0.0.1:${port}/`))
