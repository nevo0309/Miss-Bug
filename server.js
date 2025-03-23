import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const port = 3030
const app = express()

app.use(express.static('public'))
app.use(cookieParser())

app.get('/api/bug', (req, res) => {
  bugService
    .query()
    .then((bugs) => res.send(bugs))
    .catch((err) => {
      loggerService.error('Cannot get bugs', err)
      res.status(500).send('Cannot load bugs')
    })
})

//* Create/Edit
app.get('/api/bug/save', (req, res) => {
  loggerService.debug('req qurey', req.query)

  const { title, description, severity, _id } = req.query
  const bugToSave = {
    _id,
    title,
    description,
    severity: +severity,
  }

  bugService
    .save(bugToSave)
    .then((bug) => {
      loggerService.info('Saved bug:', bug)

      res.send(bug)
    })
    .catch((err) => {
      loggerService.error('Cannot save bug', err)
      res.status(500).send('Cannot save bug')
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
  bugService
    .getById(bugId)
    .then((bug) => res.send(bug))
    .catch((err) => {
      loggerService.error('Cannot get bug', err)
      res.status(500).send('Cannot load bug')
    })
})

//* Remove/Delete
app.get('/api/bug/:bugId/remove', (req, res) => {
  const { bugId } = req.params
  bugService
    .remove(bugId)
    .then(() => {
      loggerService.info(`bug ${bugId} removed`)
      res.send('bug Removed')
    })
    .catch((err) => {
      loggerService.error('Cannot remove bug', err)
      res.status(500).send('Cannot remove bug')
    })
})

app.get('/', (req, res) => res.send('Hello there the server is running'))
app.listen(port, () =>
  loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)
