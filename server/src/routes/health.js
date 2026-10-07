// A route that only says "the server is up". Hosting services call it to
// check the app is alive, and it is the simplest example of the pattern
// every other route file follows: make a router, add handlers, export it.
import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({ status: 'ok' })
})

export default router
