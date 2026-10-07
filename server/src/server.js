// Starts the app listening. Run with `npm run dev`.
import 'dotenv/config' // loads server/.env into process.env
import app from './app.js'

const port = process.env.PORT || 4000

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
