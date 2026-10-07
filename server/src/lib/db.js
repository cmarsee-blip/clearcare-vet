// The one connection to the database, shared by the whole server.
// Import `prisma` from here whenever a route needs data:
//
//   import { prisma } from '../lib/db.js'
//   const clinics = await prisma.clinic.findMany()
//
// Only one PrismaClient should exist per running server, because each one
// opens its own pool of database connections.
import 'dotenv/config' // loads DATABASE_URL from server/.env
import { PrismaPg } from '@prisma/adapter-pg'
// Prisma writes this folder when you run `npx prisma generate`. It is
// TypeScript, which is why the server runs through `tsx` (see package.json).
import { PrismaClient } from '../generated/prisma/client.ts'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.')
}

// The adapter is the piece that actually talks to PostgreSQL.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

export const prisma = new PrismaClient({ adapter })
