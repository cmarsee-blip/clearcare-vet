# Backend plan

How ClearCare Vet moves from sample data in the browser to a real server and
database. Written as a working plan: each phase ends with the site still
running.

## Goals

1. A project Cody can explain line by line in an interview.
2. Real accounts, real permissions, real data shared between users.
3. Tests, a live deployment and a clean Git history.

A public launch with real clinics is not a goal of this plan. Phase 9 lists
what that would add.

## How we work

For each new pattern, Claude designs it with Cody and writes the first
example with tests. Cody writes the next ones the same way, and Claude
reviews. The "Who" column in each phase says which is which.

## Stack

| Piece | Choice | Why |
| --- | --- | --- |
| Server | Node + Express | Already familiar |
| Database | PostgreSQL | The data is full of relationships; SQL is what most employers use |
| Database access | Prisma | Readable schema file, migrations, good errors |
| Login | Sessions in a cookie, passwords hashed with bcrypt | Simple to explain, safe defaults |
| Input checking | Zod | One schema per request body |
| Tests | Vitest + Supertest | Fast, same test runner as Vite |
| File uploads | Multer, files on disk in development | Swap for cloud storage at deploy time |
| Language | JavaScript now, TypeScript as a later phase | One new thing at a time |

### Coming from MongoDB

| MongoDB / Mongoose | PostgreSQL / Prisma |
| --- | --- |
| Collection | Table |
| Document | Row |
| Mongoose schema | `model` in `schema.prisma` |
| Nested array inside a document | A separate table with a foreign key |
| `ref` + `populate()` | A relation + `include` |
| Change the schema any time | Write a migration (`prisma migrate dev`) |
| `_id` (ObjectId) | `id` (we will use `cuid` strings) |

The main shift: instead of nesting (a vet document holding a `services`
array), each thing gets its own table and rows point at each other. That is
what lets the database answer "every vet within 25 miles offering TPLO,
sorted by price" in one query.

## Folder layout

The front end stays where it is. The server is a new folder beside it.

```
VetFinder/
  src/            React front end (exists)
  server/
    package.json
    prisma/
      schema.prisma     tables
      seed.js           loads the sample data
    src/
      app.js            Express app
      routes/           one file per resource
      middleware/       requireLogin, requireRole, validate, errors
      lib/              password hashing, notifications, geo
    tests/
  docs/
    backend-plan.md     this file
```

## Data model

Fourteen tables. Arrows read "belongs to".

```
User ──< Pet ──< HealthRecord
User ──1 Vet            (a vet account owns one vet profile)
User ──1 Clinic         (a clinic account owns one clinic)
Clinic ──< Vet ──< Service >── Procedure
Vet ──< Review, Clinic ──< Review     (Review.author -> User)
Vet ──< PriceReport                   (author -> User)
Review ──< Report                     (reporter -> User)
User ──< Thread >── Vet,  Thread ──< Message
User ──< Appointment >── Vet
Clinic ──< Invite
User ──< Notification
User >──< saved Vets and Clinics      (SavedItem)
```

| Table | Key fields |
| --- | --- |
| User | email (unique), passwordHash, role (owner, vet, clinic, admin), name, zip, suspended |
| Clinic | name, address, city, state, zip, lat, lng, phone, about, emergency, open24, verification, licenseNumber |
| ClinicHours | clinicId, day, open, close |
| Vet | clinicId (optional), name, credentials, bio, photoUrl, licenseNumber, licenseState, verification, acceptingNew |
| Procedure | name, category |
| Service | vetId, procedureId, priceLow, priceHigh, includes |
| Review | authorId, targetType, vetId or clinicId, rating, text, procedureId, amountPaid, proofStatus, proofFile, reply fields |
| PriceReport | authorId, vetId, procedureId, amount, includes, proofStatus, proofFile |
| Report | reviewId, reporterId, reason, note, status |
| Pet / HealthRecord | ownerId, name, species ... / petId, date, title, provider, cost |
| Thread / Message | ownerId, vetId, subject / threadId, senderId, text |
| Appointment | ownerId, vetId, petName, procedureId, date, time, status, proposed fields |
| Invite | clinicId, email, status |
| Notification | userId, text, link, read |

Small lists that never change (animal types, amenities, what a price can
include) stay as arrays on the row rather than becoming tables.

## Permissions

The rule everything else follows: **the server decides, never the browser.**

| Action | Who may do it |
| --- | --- |
| Read vets, clinics, reviews, prices | Anyone |
| Post a review or price report | Logged-in owner |
| Edit or delete a review | Its author |
| Reply to a review | The vet or clinic it is about |
| Edit a vet profile | That vet, or their clinic if the vet has no account |
| Edit a clinic | That clinic's account |
| Read a message thread or appointment | The owner and the vet (and the vet's clinic for appointments) |
| See an uploaded invoice | Its author and admins |
| Verify licenses, resolve reports, suspend accounts | Admin |

Each row becomes at least one test.

## API shape

REST, JSON, under `/api`. Examples:

```
POST   /api/auth/signup | login | logout      GET /api/auth/me
GET    /api/search?q=&zip=&within=&open=...
GET    /api/vets/:id          PATCH /api/vets/:id
GET    /api/clinics/:id       PATCH /api/clinics/:id
GET    /api/procedures/:id/prices?city=
POST   /api/reviews           PATCH/DELETE /api/reviews/:id
POST   /api/reviews/:id/reply POST /api/reviews/:id/report
POST   /api/price-reports
GET    /api/me/pets ...       (owner's own data lives under /api/me)
POST   /api/appointments      PATCH /api/appointments/:id
GET    /api/admin/queue       POST /api/admin/verify ...
```

## Phases

### 0. Setup (half a day)
| Task | Who |
| --- | --- |
| Install PostgreSQL (Postgres.app is the easiest on a Mac) | Cody |
| `git init`, first commit, push to a new GitHub repo | Cody, Claude guides |
| Create `server/` with Express, a health-check route and one passing test | Claude |

Done when: `npm test` passes in `server/` and the repo is on GitHub.

### 1. Database (2 to 3 days)
| Task | Who |
| --- | --- |
| `schema.prisma` for User, Clinic, ClinicHours, Vet, Procedure, Service | Claude, explaining each relation |
| Remaining tables | Cody |
| Seed script that loads the current sample data | Claude starts, Cody finishes |

Done when: `prisma studio` shows the same clinics and vets the site shows now.

### 2. Accounts (3 to 4 days)
| Task | Who |
| --- | --- |
| Sign-up, login, logout, `GET /me`, password hashing, session cookie | Claude, with tests |
| `requireLogin` and `requireRole` middleware | Claude |
| Front end: real login form, remove the sample-account buttons, keep a demo login | Cody |

Done when: you can sign up, refresh the page and still be logged in.

### 3. Public reads (3 to 4 days)
| Task | Who |
| --- | --- |
| `GET /vets/:id` and the pattern for a route + test | Claude |
| `GET /clinics/:id`, procedures and price summaries | Cody |
| Search with filters and distance in SQL | Claude and Cody together; this is the hardest query |
| Front end: an `api.js` helper, and pages load from the server | Claude does one page, Cody the rest |

Done when: search, profiles and typical prices work with the browser's saved
sample data cleared.

### 4. Owner actions (4 to 5 days)
| Task | Who |
| --- | --- |
| Reviews: create, edit, delete, with permission tests | Claude |
| Price reports, saved items, pets, health records | Cody |

### 5. Vet and clinic editing (4 to 5 days)
| Task | Who |
| --- | --- |
| Vet profile and services editing | Claude |
| Clinic details, hours, invites | Cody |
| Photo upload | Claude, then Cody adds invoice upload |

### 6. Two-way features (4 to 5 days)
| Task | Who |
| --- | --- |
| Appointments and the notification helper | Claude |
| Messages, review replies | Cody |

### 7. Admin (2 to 3 days)
| Task | Who |
| --- | --- |
| License queue | Claude |
| Reported reviews, invoice checks, suspensions | Cody |

### 8. Ship it (3 to 4 days)
| Task | Who |
| --- | --- |
| GitHub Actions running tests on every push | Claude |
| Deploy server, database and front end; demo logins on the live site | Cody, Claude guides |
| README: data diagram, API list, decisions and trade-offs, screenshots | Cody drafts, Claude edits |

### 9. Later, if wanted
TypeScript. Email (verification, password reset, notifications). Real
geocoding and map tiles. Rate limiting. Cloud file storage. Legal text from a
lawyer. Loading real clinic listings.

## Time

Roughly 25 to 35 working days at a few hours a day. Phases 1 to 3 are the
steepest; the later ones repeat patterns already learned.

## What to be able to say in an interview

- Why PostgreSQL over MongoDB for this data.
- How a login works, from the password field to the session cookie.
- Where permissions are enforced and how they are tested.
- How the distance search query works.
- One thing you would do differently.
