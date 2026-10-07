// A quick "is the database connected?" check. Run with: npm run db:check
import { prisma } from '../src/lib/db.js'

const [users, clinics, vets, procedures] = await Promise.all([
  prisma.user.count(),
  prisma.clinic.count(),
  prisma.vet.count(),
  prisma.procedure.count(),
])

console.log('Connected to the database.')
console.table({ users, clinics, vets, procedures })

await prisma.$disconnect()
