import { procedureById } from './procedures'

// Sample data. Every clinic, veterinarian, review and price below is invented
// so the site has something to show. Replace this file with real API calls
// when you add a backend (see README).

const weekdays = (hours, sat = 'Closed') => ({
  Mon: hours, Tue: hours, Wed: hours, Thu: hours, Fri: hours, Sat: sat, Sun: 'Closed',
})

const clinics = [
  {
    id: 'c1', name: 'Broad Ripple Animal Surgery', featured: true, emergency: false,
    address: '6214 Winthrop Ave', city: 'Indianapolis', state: 'IN', zip: '46220',
    phone: '(317) 555-0142', species: ['dog', 'cat'],
    hours: 'Mon to Fri 7:30 to 6:00, Sat 8:00 to 12:00',
    about: 'A surgery-focused practice for dogs and cats. Most of our caseload is orthopedic and soft tissue referrals from general practices around Marion County.',
  },
  {
    id: 'c2', name: 'White River Veterinary Specialists', featured: true, emergency: true,
    address: '310 W Ohio St', city: 'Indianapolis', state: 'IN', zip: '46204',
    phone: '(317) 555-0178', species: ['dog', 'cat'],
    hours: 'Open 24 hours for emergencies. Specialty appointments Mon to Fri.',
    about: 'A multi-specialty hospital with cardiology, ophthalmology, oncology and advanced imaging under one roof, plus a 24-hour emergency room.',
  },
  {
    id: 'c3', name: 'Carmel Companion Animal Clinic', featured: false, emergency: false,
    address: '88 Rangeline Rd', city: 'Carmel', state: 'IN', zip: '46032',
    phone: '(317) 555-0113', species: ['dog', 'cat', 'rabbit'],
    hours: 'Mon to Fri 8:00 to 5:30',
    about: 'A neighborhood general practice. We do routine surgery and dentistry in-house and post our prices so nobody is surprised at checkout.',
  },
  {
    id: 'c4', name: 'Hoosier Equine & Farm Vet', featured: true, emergency: true,
    address: '4410 County Rd 350 S', city: 'Lafayette', state: 'IN', zip: '47909',
    phone: '(765) 555-0190', species: ['horse', 'cattle', 'goat'],
    hours: 'Mon to Fri 7:00 to 5:00. Farm calls and emergencies by phone.',
    about: 'Ambulatory and haul-in care for horses, cattle and small ruminants across Tippecanoe and the surrounding counties.',
  },
  {
    id: 'c5', name: 'Limestone Pet Hospital', featured: false, emergency: false,
    address: '702 S Walnut St', city: 'Bloomington', state: 'IN', zip: '47401',
    phone: '(812) 555-0127', species: ['dog', 'cat', 'rabbit'],
    hours: 'Mon to Fri 8:00 to 6:00, Sat 9:00 to 1:00',
    about: 'General practice with a visiting surgeon two days a week, so common orthopedic procedures can be done without a drive to Indianapolis.',
  },
  {
    id: 'c6', name: 'Three Rivers Veterinary Center', featured: false, emergency: true,
    address: '1505 Wells St', city: 'Fort Wayne', state: 'IN', zip: '46808',
    phone: '(260) 555-0165', species: ['dog', 'cat'],
    hours: 'Mon to Sat 8:00 to 8:00',
    about: 'Urgent care and surgery for northeast Indiana, with extended evening hours six days a week.',
  },
  {
    id: 'c7', name: 'Queen City Exotics & Avian', featured: false, emergency: false,
    address: '217 E 8th St', city: 'Cincinnati', state: 'OH', zip: '45202',
    phone: '(513) 555-0101', species: ['bird', 'reptile', 'rabbit'],
    hours: 'Tue to Sat 9:00 to 5:00',
    about: 'Birds, reptiles, rabbits and other small mammals only. No dogs or cats in the waiting room.',
  },
  {
    id: 'c8', name: 'Bluegrass Equine Surgical', featured: false, emergency: true,
    address: '2950 Old Frankfort Pike', city: 'Lexington', state: 'KY', zip: '40510',
    phone: '(859) 555-0154', species: ['horse'],
    hours: 'Surgery Mon to Fri. Emergency colic admissions at any hour.',
    about: 'A referral surgical hospital for horses with a staffed overnight barn.',
  },
]

const vets = [
  {
    id: 'v1', clinicId: 'c1', name: 'Dr. Priya Raman', credentials: 'DVM, DACVS',
    specialties: ['Orthopedic surgery'], species: ['dog', 'cat'], yearsExperience: 14, acceptingNew: true,
    bio: 'Board-certified surgeon. Knees and hips make up most of my week, and I send a written estimate before every procedure.',
    availability: weekdays('8:00 to 4:00'),
    services: [
      { procedureId: 'tplo', priceLow: 4200, priceHigh: 5200 },
      { procedureId: 'patella', priceLow: 2600, priceHigh: 3400 },
      { procedureId: 'fho', priceLow: 2000, priceHigh: 2600 },
    ],
  },
  {
    id: 'v2', clinicId: 'c1', name: 'Dr. Marcus Hale', credentials: 'DVM',
    specialties: ['Soft tissue surgery'], species: ['dog', 'cat'], yearsExperience: 9, acceptingNew: true,
    bio: 'I handle the soft tissue side of the practice: lumps, bladders, airways and whatever the dog swallowed this week.',
    availability: weekdays('9:00 to 6:00', '8:00 to 12:00'),
    services: [
      { procedureId: 'mass', priceLow: 600, priceHigh: 1500 },
      { procedureId: 'foreign', priceLow: 2800, priceHigh: 4500 },
      { procedureId: 'cystotomy', priceLow: 1900, priceHigh: 2800 },
      { procedureId: 'boas', priceLow: 2400, priceHigh: 3800 },
    ],
  },
  {
    id: 'v3', clinicId: 'c2', name: 'Dr. Elena Voss', credentials: 'DVM, DACVO',
    specialties: ['Ophthalmology'], species: ['dog', 'cat'], yearsExperience: 17, acceptingNew: true,
    bio: 'Veterinary ophthalmologist. Cataracts, glaucoma, eyelid surgery and second opinions on eyes that are not improving.',
    availability: { ...weekdays('8:30 to 4:30'), Fri: 'Closed' },
    services: [
      { procedureId: 'cataract', priceLow: 3900, priceHigh: 4600 },
      { procedureId: 'cherry', priceLow: 800, priceHigh: 1200 },
    ],
  },
  {
    id: 'v4', clinicId: 'c2', name: 'Dr. Samuel Okafor', credentials: 'DVM, DACVIM (Cardiology)',
    specialties: ['Cardiology', 'Imaging'], species: ['dog', 'cat'], yearsExperience: 11, acceptingNew: false,
    bio: 'Cardiologist. I see murmurs, arrhythmias and pre-anesthetic heart screens, and I call you with results the same day.',
    availability: weekdays('9:00 to 5:00'),
    services: [
      { procedureId: 'echo', priceLow: 580, priceHigh: 750 },
      { procedureId: 'ultrasound', priceLow: 450, priceHigh: 600 },
    ],
  },
  {
    id: 'v5', clinicId: 'c2', name: 'Dr. Hannah Lindqvist', credentials: 'DVM, DACVIM (Oncology)',
    specialties: ['Oncology', 'Imaging'], species: ['dog', 'cat'], yearsExperience: 8, acceptingNew: true,
    bio: 'Oncologist. My first appointment is a long conversation about options and cost, with no pressure to pick one that day.',
    availability: weekdays('8:00 to 5:00'),
    services: [
      { procedureId: 'chemo', priceLow: 220, priceHigh: 300 },
      { procedureId: 'mri', priceLow: 2500, priceHigh: 3200 },
      { procedureId: 'mass', priceLow: 900, priceHigh: 1800 },
    ],
  },
  {
    id: 'v6', clinicId: 'c3', name: 'Dr. Grace Whitfield', credentials: 'DVM',
    specialties: ['Routine surgery', 'Dentistry'], species: ['dog', 'cat', 'rabbit'], yearsExperience: 21, acceptingNew: true,
    bio: 'General practitioner for two decades. Spays, neuters and dental work are my bread and butter, rabbits included.',
    availability: weekdays('8:00 to 5:30'),
    services: [
      { procedureId: 'spay', priceLow: 380, priceHigh: 620 },
      { procedureId: 'neuter', priceLow: 260, priceHigh: 420 },
      { procedureId: 'dental', priceLow: 650, priceHigh: 1300 },
      { procedureId: 'cherry', priceLow: 700, priceHigh: 950 },
    ],
  },
  {
    id: 'v7', clinicId: 'c3', name: 'Dr. Tomas Becerra', credentials: 'DVM, FAVD',
    specialties: ['Dentistry'], species: ['dog', 'cat'], yearsExperience: 12, acceptingNew: true,
    bio: 'Dentistry fellow. I try to save teeth that would otherwise be pulled, and I take full-mouth X-rays on every patient.',
    availability: { ...weekdays('9:00 to 5:00'), Mon: 'Closed' },
    services: [
      { procedureId: 'rootcanal', priceLow: 1900, priceHigh: 2800 },
      { procedureId: 'dental', priceLow: 800, priceHigh: 1400 },
    ],
  },
  {
    id: 'v8', clinicId: 'c4', name: 'Dr. Wyatt Brennan', credentials: 'DVM',
    specialties: ['Equine', 'Farm animal'], species: ['horse', 'cattle', 'goat'], yearsExperience: 26, acceptingNew: true,
    bio: 'Farm calls since 1999. Horses, dairy and beef herds, and the occasional stubborn goat.',
    availability: weekdays('7:00 to 5:00', 'Emergencies only'),
    services: [
      { procedureId: 'float', priceLow: 130, priceHigh: 190 },
      { procedureId: 'lameness', priceLow: 260, priceHigh: 420 },
      { procedureId: 'da', priceLow: 420, priceHigh: 700 },
      { procedureId: 'csection', priceLow: 600, priceHigh: 1100 },
    ],
  },
  {
    id: 'v9', clinicId: 'c4', name: 'Dr. Leah Sandoval', credentials: 'DVM',
    specialties: ['Farm animal', 'Reproductive'], species: ['cattle', 'goat'], yearsExperience: 6, acceptingNew: true,
    bio: 'Small ruminants and cattle, with a focus on herd reproduction and difficult births.',
    availability: weekdays('7:00 to 4:00'),
    services: [
      { procedureId: 'csection', priceLow: 550, priceHigh: 950 },
      { procedureId: 'da', priceLow: 400, priceHigh: 650 },
    ],
  },
  {
    id: 'v10', clinicId: 'c5', name: 'Dr. Naomi Castellan', credentials: 'DVM',
    specialties: ['Routine surgery', 'Orthopedic surgery'], species: ['dog', 'cat', 'rabbit'], yearsExperience: 15, acceptingNew: true,
    bio: 'General practitioner with advanced orthopedic training. I do TPLOs on Tuesdays and Thursdays.',
    availability: weekdays('8:00 to 6:00', '9:00 to 1:00'),
    services: [
      { procedureId: 'tplo', priceLow: 3800, priceHigh: 4600 },
      { procedureId: 'spay', priceLow: 350, priceHigh: 560 },
      { procedureId: 'neuter', priceLow: 250, priceHigh: 400 },
      { procedureId: 'mass', priceLow: 500, priceHigh: 1200 },
    ],
  },
  {
    id: 'v11', clinicId: 'c6', name: 'Dr. Andre Whitaker', credentials: 'DVM',
    specialties: ['Soft tissue surgery', 'Reproductive'], species: ['dog', 'cat'], yearsExperience: 10, acceptingNew: true,
    bio: 'Urgent care surgeon. Foreign bodies, emergency C-sections and the other things that cannot wait until Monday.',
    availability: { ...weekdays('12:00 to 8:00', '12:00 to 8:00') },
    services: [
      { procedureId: 'foreign', priceLow: 2500, priceHigh: 4000 },
      { procedureId: 'csection', priceLow: 1800, priceHigh: 3200 },
      { procedureId: 'cystotomy', priceLow: 1800, priceHigh: 2600 },
      { procedureId: 'ultrasound', priceLow: 400, priceHigh: 550 },
    ],
  },
  {
    id: 'v12', clinicId: 'c6', name: 'Dr. Mei-Lin Zhao', credentials: 'DVM',
    specialties: ['Orthopedic surgery', 'Dentistry'], species: ['dog', 'cat'], yearsExperience: 7, acceptingNew: true,
    bio: 'I split my time between orthopedics and dentistry, and I am happy to talk through a payment plan before we book.',
    availability: weekdays('8:00 to 4:00'),
    services: [
      { procedureId: 'patella', priceLow: 2200, priceHigh: 3000 },
      { procedureId: 'fho', priceLow: 1800, priceHigh: 2400 },
      { procedureId: 'dental', priceLow: 600, priceHigh: 1200 },
    ],
  },
  {
    id: 'v13', clinicId: 'c7', name: 'Dr. Rosalind Achebe', credentials: 'DVM, DABVP (Avian)',
    specialties: ['Exotics'], species: ['bird', 'reptile', 'rabbit'], yearsExperience: 19, acceptingNew: true,
    bio: 'Avian specialist who also sees reptiles and rabbits. Bring the enclosure photos; husbandry is half of every exam.',
    availability: { Mon: 'Closed', Tue: '9:00 to 5:00', Wed: '9:00 to 5:00', Thu: '9:00 to 5:00', Fri: '9:00 to 5:00', Sat: '9:00 to 2:00', Sun: 'Closed' },
    services: [
      { procedureId: 'beak', priceLow: 35, priceHigh: 60 },
      { procedureId: 'reptile', priceLow: 85, priceHigh: 120 },
      { procedureId: 'spay', priceLow: 420, priceHigh: 680 },
    ],
  },
  {
    id: 'v14', clinicId: 'c8', name: 'Dr. Callum Hargrove', credentials: 'DVM, DACVS (Large Animal)',
    specialties: ['Equine'], species: ['horse'], yearsExperience: 23, acceptingNew: true,
    bio: 'Equine surgeon. Colic, upper airway and arthroscopy, with a team in the barn overnight after every surgery.',
    availability: weekdays('7:00 to 4:00', 'Emergencies only'),
    services: [
      { procedureId: 'colic', priceLow: 8000, priceHigh: 12000 },
      { procedureId: 'lameness', priceLow: 300, priceHigh: 450 },
      { procedureId: 'float', priceLow: 150, priceHigh: 200 },
    ],
  },
]

const r = (id, targetType, targetId, authorId, authorName, rating, procedureId, amountPaid, animal, date, text) => ({
  id, targetType, targetId, authorId, authorName, rating, procedureId, amountPaid, animal, date, text,
})

const reviews = [
  r('r1', 'vet', 'v1', 'u-client', 'Jordan M.', 5, 'tplo', 4650, 'Biscuit (dog)', '2026-08-14', 'Biscuit was putting weight on the leg within two weeks. The estimate was within $100 of the final bill.'),
  r('r2', 'vet', 'v1', 'x1', 'Renee T.', 5, 'tplo', 4900, 'Labrador', '2026-06-02', 'Clear about the recovery timeline and returned my calls herself.'),
  r('r3', 'vet', 'v1', 'x2', 'Dev P.', 4, 'tplo', 5400, 'Rottweiler', '2026-03-21', 'Great result. The bill came in above the listed range because of an extra night of hospitalization.'),
  r('r4', 'vet', 'v1', 'x3', 'Carla N.', 5, 'patella', 2950, 'Pomeranian', '2026-07-09', 'Both knees done six weeks apart. No complaints.'),
  r('r5', 'clinic', 'c1', 'u-client', 'Jordan M.', 4, 'tplo', 4650, 'Biscuit (dog)', '2026-08-15', 'Front desk was kind and parking is easy. Pickup ran about 40 minutes late.'),
  r('r6', 'vet', 'v2', 'x4', 'Alicia F.', 5, 'foreign', 3300, 'Beagle', '2026-09-01', 'One sock, removed. He explained every line of the invoice.'),
  r('r7', 'vet', 'v2', 'x5', 'Tom G.', 4, 'mass', 1150, 'Boxer', '2026-05-18', 'Sent the lump to the lab and called with results in three days.'),
  r('r8', 'vet', 'v3', 'x6', 'Maribel S.', 5, 'cataract', 4300, 'Cocker spaniel', '2026-04-27', 'She can see the tennis ball again. Worth every dollar.'),
  r('r9', 'vet', 'v3', 'x7', 'Owen K.', 4, 'cataract', 4550, 'Boston terrier', '2026-02-11', 'Excellent surgeon. Follow-up drops and rechecks added about $300 that I had not planned for.'),
  r('r10', 'vet', 'v4', 'x8', 'Priscilla D.', 5, 'echo', 640, 'Maine coon', '2026-07-30', 'Explained the images to me in plain language.'),
  r('r11', 'clinic', 'c2', 'x8', 'Priscilla D.', 4, 'echo', 640, 'Maine coon', '2026-07-30', 'Busy lobby because of the ER, but our appointment started on time.'),
  r('r12', 'clinic', 'c2', 'x9', 'Hank B.', 3, 'ultrasound', 610, 'Mixed breed dog', '2026-05-04', 'Good medicine. Billing took three calls to sort out.'),
  r('r13', 'vet', 'v5', 'x10', 'Yasmin A.', 5, 'chemo', 260, 'Golden retriever', '2026-08-22', 'An hour with us and never once rushed.'),
  r('r14', 'vet', 'v6', 'x11', 'Beth R.', 5, 'spay', 470, 'Kitten', '2026-09-12', 'Price matched what was posted. Home by 3pm.'),
  r('r15', 'vet', 'v6', 'x12', 'Luis V.', 5, 'dental', 980, 'Dachshund', '2026-06-19', 'Four extractions and he was eating that night.'),
  r('r16', 'vet', 'v6', 'x13', 'Kim H.', 4, 'neuter', 340, 'Rabbit', '2026-04-03', 'Hard to find someone comfortable with rabbits. Glad we did.'),
  r('r17', 'clinic', 'c3', 'x11', 'Beth R.', 5, 'spay', 470, 'Kitten', '2026-09-12', 'Posted prices are accurate, which I have not found anywhere else.'),
  r('r18', 'vet', 'v7', 'x14', 'Greg L.', 5, 'rootcanal', 2400, 'German shepherd', '2026-03-08', 'Saved a canine tooth that another clinic wanted to pull.'),
  r('r19', 'vet', 'v8', 'x15', 'Dale W.', 5, 'float', 160, 'Quarter horse', '2026-08-05', 'On time to the barn and patient with a nervous mare.'),
  r('r20', 'vet', 'v8', 'x16', 'Ruth E.', 4, 'da', 580, 'Holstein', '2026-05-29', 'Cow was back in the string in a week.'),
  r('r21', 'clinic', 'c4', 'x15', 'Dale W.', 5, 'lameness', 340, 'Quarter horse', '2026-07-17', 'They answer the emergency line at 2am. That is the review.'),
  r('r22', 'vet', 'v10', 'x17', 'Sophie C.', 5, 'tplo', 4100, 'Border collie', '2026-07-01', 'Saved us a long drive and several hundred dollars compared with the quote we got in Indianapolis.'),
  r('r23', 'vet', 'v10', 'x18', 'Marcus J.', 4, 'tplo', 4400, 'Pit bull mix', '2026-02-26', 'Good outcome. Scheduling took a month.'),
  r('r24', 'vet', 'v11', 'x19', 'Tanya O.', 5, 'csection', 2600, 'French bulldog', '2026-06-11', 'Saturday night, five healthy puppies.'),
  r('r25', 'vet', 'v12', 'x20', 'Ian S.', 4, 'patella', 2700, 'Chihuahua', '2026-04-15', 'Fair price and a clear payment plan.'),
  r('r26', 'vet', 'v13', 'x21', 'Fiona Q.', 5, 'beak', 45, 'Cockatiel', '2026-09-20', 'Gentle hands and good advice about diet.'),
  r('r27', 'vet', 'v13', 'x22', 'Ben A.', 5, 'reptile', 110, 'Bearded dragon', '2026-08-02', 'Caught a lighting problem I had no idea about.'),
  r('r28', 'vet', 'v14', 'x23', 'Laurel P.', 5, 'colic', 9800, 'Thoroughbred', '2026-03-30', 'Admitted at midnight and in surgery within the hour. He is back under saddle.'),
  r('r29', 'clinic', 'c8', 'x23', 'Laurel P.', 5, 'colic', 9800, 'Thoroughbred', '2026-03-31', 'Daily updates by phone, itemized bill at discharge.'),
]

const users = [
  {
    id: 'u-client', role: 'client', name: 'Jordan Mills', email: 'jordan@example.com',
    city: 'Indianapolis', state: 'IN', zip: '46220',
    pets: [
      { id: 'p1', name: 'Biscuit', species: 'dog', breed: 'Labrador mix', age: '6', notes: 'TPLO on right hind leg, August 2026.',
        records: [
          { id: 'h1', date: '2026-08-12', title: 'TPLO (cruciate ligament repair)', provider: 'Dr. Priya Raman', cost: 4650, notes: 'Right hind leg. Leash walks only for 8 weeks.' },
          { id: 'h2', date: '2026-07-28', title: 'Orthopedic consult and X-rays', provider: 'Broad Ripple Animal Surgery', cost: 310, notes: '' },
          { id: 'h3', date: '2025-11-03', title: 'Annual exam and vaccines', provider: 'Carmel Companion Animal Clinic', cost: 185, notes: '' },
        ] },
      { id: 'p2', name: 'Olive', species: 'cat', breed: 'Domestic shorthair', age: '11', notes: 'Due for a dental cleaning.',
        records: [
          { id: 'h4', date: '2026-02-17', title: 'Senior bloodwork', provider: 'Carmel Companion Animal Clinic', cost: 220, notes: 'Kidney values normal.' },
        ] },
    ],
    saved: [{ type: 'vet', id: 'v6' }, { type: 'clinic', id: 'c2' }],
  },
  { id: 'u-vet', role: 'vet', name: 'Dr. Priya Raman', email: 'praman@example.com', vetId: 'v1', pets: [], saved: [] },
  { id: 'u-clinic', role: 'clinic', name: 'Broad Ripple Animal Surgery', email: 'office@example.com', clinicId: 'c1', pets: [], saved: [] },
]

const threads = [
  {
    id: 't1', vetId: 'v1', clientId: 'u-client', clientName: 'Jordan Mills',
    subject: 'Biscuit 8-week recheck',
    messages: [
      { from: 'client', date: '2026-09-28', text: 'Biscuit is doing well. Do we need X-rays at the 8-week recheck, and is that included in the surgery price?' },
      { from: 'vet', date: '2026-09-29', text: 'Glad to hear it. Yes to X-rays, and they are included. Keep him on leash walks until then.' },
    ],
  },
  {
    id: 't2', vetId: 'v1', clientId: 'x30', clientName: 'Amara Okoye',
    subject: 'Second opinion on a partial tear',
    messages: [
      { from: 'client', date: '2026-10-02', text: 'Our vet thinks our 4-year-old shepherd has a partial cruciate tear. Do you see patients for a second opinion before surgery is scheduled?' },
    ],
  },
]

// Extra profile details, kept separate so the lists above stay readable.
const clinicExtras = {
  c1: { amenities: ['Parking on site', 'Wheelchair accessible', 'Payment plans', 'Accepts pet insurance'], languages: ['English', 'Spanish'] },
  c2: { amenities: ['Parking on site', 'Wheelchair accessible', 'Accepts pet insurance', 'Separate cat waiting area', 'Online booking'], languages: ['English', 'Spanish', 'Mandarin'] },
  c3: { amenities: ['Parking on site', 'Payment plans', 'Curbside drop-off', 'Online booking'], languages: ['English'] },
  c4: { amenities: ['Farm calls', 'Haul-in facility', 'Payment plans'], languages: ['English', 'Spanish'] },
  c5: { amenities: ['Parking on site', 'Accepts pet insurance', 'Curbside drop-off'], languages: ['English'] },
  c6: { amenities: ['Parking on site', 'Wheelchair accessible', 'Payment plans'], languages: ['English', 'Burmese'] },
  c7: { amenities: ['Wheelchair accessible', 'Online booking'], languages: ['English'] },
  c8: { amenities: ['Haul-in facility', 'Parking on site'], languages: ['English', 'Spanish'] },
}

const vetExtras = {
  v1: { education: 'DVM, Purdue University. Surgical residency, The Ohio State University.' },
  v2: { education: 'DVM, University of Illinois.' },
  v3: { education: 'DVM, Michigan State University. Ophthalmology residency, University of Wisconsin.' },
  v4: { education: 'DVM, Purdue University. Cardiology residency, University of Minnesota.' },
  v6: { education: 'DVM, Purdue University.' },
  v8: { education: 'DVM, Purdue University.' },
  v14: { education: 'DVM, University of Kentucky partner program at Auburn University. Large animal surgery residency.' },
}

const replies = {
  r3: { authorName: 'Dr. Priya Raman', date: '2026-03-23', text: 'Thank you, Dev. You are right that the extra night was outside the estimate. We now list overnight care as a separate line on every TPLO estimate.' },
  r12: { authorName: 'White River Veterinary Specialists', date: '2026-05-06', text: 'We are sorry about the billing runaround. Our office manager has corrected the invoice and will call you directly.' },
}

// A pending invite so the sample veterinarian has one to answer.
const invites = [
  { id: 'i1', clinicId: 'c2', email: 'praman@example.com', name: 'Dr. Priya Raman', status: 'pending', date: '2026-10-01' },
]

// Profile view counts, keyed by "vet:<id>" or "clinic:<id>".
const stats = { 'vet:v1': 214, 'vet:v2': 131, 'clinic:c1': 388, 'clinic:c2': 502 }

const stateOf = (clinicId) => clinics.find((c) => c.id === clinicId)?.state || ''

/* ---------- Location and opening hours ---------- */

// Approximate coordinates [latitude, longitude] for the map and distance search.
const clinicCoords = {
  c1: [39.869, -86.142], c2: [39.77, -86.163], c3: [39.978, -86.127], c4: [40.36, -86.88],
  c5: [39.158, -86.533], c6: [41.093, -85.146], c7: [39.105, -84.509], c8: [38.066, -84.57],
}

const span = (open, close) => ({ open, close })
const week = (open, close, sat = null) => ({
  Mon: span(open, close), Tue: span(open, close), Wed: span(open, close), Thu: span(open, close),
  Fri: span(open, close), Sat: sat, Sun: null,
})
// Free-text notes shown under the hours table.
const hoursNotes = {
  c2: 'Emergency room open 24 hours. Specialty appointments Mon to Fri.',
  c4: 'Farm calls and emergencies by phone.',
  c8: 'Emergency colic admissions at any hour.',
}

const clinicHours = {
  c1: { openHours: week('07:30', '18:00', span('08:00', '12:00')) },
  c2: { open24: true, openHours: week('00:00', '23:59', span('00:00', '23:59')) },
  c3: { openHours: week('08:00', '17:30') },
  c4: { openHours: week('07:00', '17:00') },
  c5: { openHours: week('08:00', '18:00', span('09:00', '13:00')) },
  c6: { openHours: week('08:00', '20:00', span('08:00', '20:00')) },
  c7: { openHours: { ...week('09:00', '17:00', span('09:00', '17:00')), Mon: null } },
  c8: { openHours: week('07:00', '17:00') },
}

/* ---------- What each listed price includes ---------- */

const includesByCategory = {
  'Orthopedic surgery': ['Pre-op bloodwork', 'Anesthesia', 'X-rays or imaging', 'Take-home medication'],
  'Routine surgery': ['Anesthesia', 'Take-home medication'],
  Dentistry: ['Anesthesia', 'X-rays or imaging'],
  'Soft tissue surgery': ['Anesthesia', 'Take-home medication'],
  Ophthalmology: ['Anesthesia', 'Take-home medication', 'Follow-up visits'],
  Reproductive: ['Anesthesia'],
}
const includesOverride = {
  'v1:tplo': ['Exam or consult', 'Pre-op bloodwork', 'Anesthesia', 'X-rays or imaging', 'Take-home medication', 'Follow-up visits'],
  'v10:tplo': ['Anesthesia', 'X-rays or imaging', 'Take-home medication'],
  'v14:colic': ['Anesthesia', 'Overnight stay', 'Take-home medication'],
}
const withIncludes = (vet) => ({
  ...vet,
  services: vet.services.map((s) => ({
    ...s,
    includes: includesOverride[`${vet.id}:${s.procedureId}`] || includesByCategory[procedureById[s.procedureId].category] || ['Exam or consult'],
  })),
})

/* ---------- Verification: an admin checks licenses before a badge shows ---------- */

const pendingVet = {
  id: 'v15', clinicId: 'c5', name: 'Dr. Owen Marsh', credentials: 'DVM',
  specialties: ['Dentistry'], species: ['dog', 'cat'], yearsExperience: 2, acceptingNew: true,
  bio: 'Recent graduate with a special interest in dentistry.',
  availability: weekdays('8:00 to 5:00'),
  services: [{ procedureId: 'dental', priceLow: 550, priceHigh: 1100 }],
  licenseNumber: 'IN-24019876', verification: 'pending',
}
const pendingClinic = {
  id: 'c9', name: 'Wabash Valley Animal Clinic', featured: false, emergency: false,
  address: '905 Ohio St', city: 'Terre Haute', state: 'IN', zip: '47807',
  phone: '(812) 555-0188', species: ['dog', 'cat'], hours: '',
  about: 'A new general practice opening this fall.',
  amenities: ['Parking on site'], languages: ['English'], photos: [],
  coords: [39.467, -87.414], openHours: week('08:00', '17:00'), open24: false,
  licenseNumber: 'IN-FAC-55120', verification: 'pending',
}

/* ---------- Review trust ---------- */

// Reviews where the owner attached an invoice. 'verified' shows a badge.
const proofs = {
  r1: { proof: 'verified' }, r2: { proof: 'verified' }, r6: { proof: 'verified' }, r8: { proof: 'verified' },
  r14: { proof: 'verified' }, r22: { proof: 'verified' }, r28: { proof: 'verified' },
  r3: { proof: 'pending', proofFile: 'invoice-march-2026.pdf' },
}

// Reviews someone has reported, waiting for an admin to look.
const reports = [
  { id: 'rp1', reviewId: 'r12', reporterId: null, reporterName: 'White River Veterinary Specialists', reason: 'Not a real client', note: 'We have no record of this visit.', date: '2026-10-02', status: 'open' },
]

// Quick "what I paid" reports that are not attached to a review.
const priceReports = [
  { id: 'pr1', vetId: 'v1', procedureId: 'fho', amount: 2350, authorId: 'x40', authorName: 'Sam D.', date: '2026-09-03', includes: ['Anesthesia', 'X-rays or imaging', 'Take-home medication'], proof: null },
  { id: 'pr2', vetId: 'v6', procedureId: 'spay', amount: 520, authorId: 'x41', authorName: 'Nina W.', date: '2026-08-19', includes: ['Anesthesia', 'Take-home medication'], proof: 'verified' },
  { id: 'pr3', vetId: 'v2', procedureId: 'cystotomy', amount: 2300, authorId: 'x42', authorName: 'Paul R.', date: '2026-07-11', includes: ['Anesthesia', 'Overnight stay'], proof: null },
  { id: 'pr4', vetId: 'v4', procedureId: 'echo', amount: 700, authorId: 'x43', authorName: 'Irene M.', date: '2026-09-22', includes: ['Exam or consult'], proof: null },
  { id: 'pr5', vetId: 'v6', procedureId: 'dental', amount: 1150, authorId: 'x44', authorName: 'Colin B.', date: '2026-09-27', includes: ['Anesthesia', 'X-rays or imaging'], proof: 'pending', proofFile: 'receipt.jpg' },
  { id: 'pr6', vetId: 'v10', procedureId: 'tplo', amount: 4250, authorId: 'x45', authorName: 'Dana K.', date: '2026-05-30', includes: ['Anesthesia', 'X-rays or imaging', 'Take-home medication'], proof: null },
]

/* ---------- Appointment requests ---------- */

const appointments = [
  { id: 'a1', vetId: 'v1', clientId: 'u-client', clientName: 'Jordan Mills', petName: 'Biscuit', procedureId: null, date: '2026-10-09', time: 'Morning', note: '8-week recheck with X-rays.', status: 'confirmed', created: '2026-09-29' },
  { id: 'a2', vetId: 'v1', clientId: 'x30', clientName: 'Amara Okoye', petName: 'Koda', procedureId: 'tplo', date: '2026-10-15', time: 'Any time', note: 'Second opinion on a partial tear before we schedule surgery.', status: 'requested', created: '2026-10-03' },
  { id: 'a3', vetId: 'v6', clientId: 'u-client', clientName: 'Jordan Mills', petName: 'Olive', procedureId: 'dental', date: '2026-10-14', time: 'Morning', note: '', status: 'requested', created: '2026-10-04' },
]

/* ---------- Notifications ---------- */

const note = (id, userId, text, link, date, read = false) => ({ id, userId, text, link, date, read })
const notifications = [
  note('n1', 'u-vet', 'Amara Okoye asked for an appointment on Oct 15.', '/profile', '2026-10-03'),
  note('n2', 'u-vet', 'Amara Okoye sent you a message.', '/profile', '2026-10-02'),
  note('n3', 'u-vet', 'White River Veterinary Specialists invited you to join their team.', '/profile', '2026-10-01', true),
  note('n4', 'u-client', 'Dr. Priya Raman confirmed your appointment on Oct 9.', '/profile', '2026-09-30'),
  note('n5', 'u-client', 'Dr. Priya Raman replied to your message.', '/profile', '2026-09-29', true),
  note('n6', 'u-clinic', 'Jordan M. reviewed your clinic.', '/clinics/c1', '2026-08-15', true),
  note('n7', 'u-admin', 'Dr. Owen Marsh is waiting for verification.', '/profile', '2026-10-04'),
  note('n8', 'u-admin', 'Wabash Valley Animal Clinic is waiting for verification.', '/profile', '2026-10-03'),
  note('n9', 'u-admin', 'A review of White River Veterinary Specialists was reported.', '/profile', '2026-10-02'),
]

const admin = { id: 'u-admin', role: 'admin', name: 'Site admin', email: 'admin@example.com', pets: [], saved: [] }

export const seed = {
  clinics: [
    ...clinics.map((c) => ({
      ...c, amenities: [], languages: ['English'], photos: [], open24: false,
      coords: clinicCoords[c.id], licenseNumber: `${c.state}-FAC-${c.id.slice(1)}0417`, verification: 'verified',
      ...clinicExtras[c.id], ...clinicHours[c.id], hours: hoursNotes[c.id] || '',
    })),
    pendingClinic,
  ],
  vets: [...vets, pendingVet].map((v) => withIncludes({
    photo: null, education: '', licenseState: stateOf(v.clinicId),
    licenseNumber: `${stateOf(v.clinicId)}-2401${v.id.slice(1).padStart(4, '0')}`, verification: 'verified',
    ...v, ...vetExtras[v.id],
  })),
  reviews: reviews.map((rv) => ({ ...rv, reply: replies[rv.id] || null, proof: null, ...proofs[rv.id] })),
  users: [...users, admin],
  threads,
  invites,
  stats,
  priceReports,
  reports,
  appointments,
  notifications,
  compare: [],
  currentUserId: null,
}
