import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

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
app.post('/api/bug', (req, res) => {
  // loggerService.debug('req qurey', req.query)

  const { title, description, severity, _id, lables } = req.body
  const bugToSave = {
    _id,
    title,
    description,
    severity: +severity,
    lables: lables || [],
  }

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
app.put('/api/bug/:bugId', (req, res) => {
  // loggerService.debug('req qurey', req.query)

  const { title, description, severity, _id, lables } = req.body
  const bugToSave = {
    _id,
    title,
    description,
    severity: +severity,
    lables: lables || [],
  }

  bugService
    .save(bugToSave)
    .then(bug => {
      loggerService.info('Saved bug:', bug)

      res.send(bug)
    })
    .catch(err => {
      loggerService.error('Cannot edit bug', err)
      res.status(500).send('Cannot edit bug')
    })
})
// app.get('/api/bug/save', (req, res) => {
//   const bugToSave = {
//     _id: req.query._id,
//     vendor: req.query.title,
//     severity: +req.query.severity,
//   }

//   bugService
//     .save(bugToSave)
//     .then((bug) => res.send(bug))
//     .catch((err) => {
//       loggerService.error('Cannot save bug', err)
//       res.status(500).send('Cannot save bug')
//     })
// })

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
app.delete('/api/bug/:bugId', (req, res) => {
  const { bugId } = req.params
  bugService
    .remove(bugId)
    .then(() => {
      loggerService.info(`bug ${bugId} removed`)
      res.send('bug Removed')
    })
    .catch(err => {
      loggerService.error('Cannot remove bug', err)
      res.status(500).send('Cannot remove bug')
    })
})

app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

app.get('/', (req, res) => res.send('Hello there the server is running'))
app.listen(port, () => loggerService.info(`Server listening on port http://127.0.0.1:${port}/`))
