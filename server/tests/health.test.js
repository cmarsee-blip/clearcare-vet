// Supertest sends requests straight to the app, with no server running.
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import app from '../src/app.js'

describe('GET /api/health', () => {
  it('says the server is up', async () => {
    const res = await request(app).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})

describe('unknown API routes', () => {
  it('answer 404 with a JSON error', async () => {
    const res = await request(app).get('/api/does-not-exist')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Not found' })
  })
})
