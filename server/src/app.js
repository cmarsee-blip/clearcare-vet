// The Express app: middleware and routes, but no listening.
// Keeping it separate from server.js lets the tests load the app and send
// it requests without opening a real network port.
import express from 'express'
import healthRouter from './routes/health.js'

const app = express()

// Read JSON request bodies into req.body.
app.use(express.json())

// Every route lives under /api so the front end can tell API calls from pages.
app.use('/api/health', healthRouter)

// Anything else under /api that didn't match a route.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Errors thrown in any route end up here. Four arguments is how Express
// knows this is the error handler.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong' })
})

export default app
