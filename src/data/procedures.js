export const species = [
  { id: 'dog', label: 'Dog' },
  { id: 'cat', label: 'Cat' },
  { id: 'rabbit', label: 'Rabbit' },
  { id: 'bird', label: 'Bird' },
  { id: 'reptile', label: 'Reptile' },
  { id: 'horse', label: 'Horse' },
  { id: 'cattle', label: 'Cattle' },
  { id: 'goat', label: 'Goat' },
]

export const procedures = [
  { id: 'tplo', name: 'TPLO (cruciate ligament repair)', category: 'Orthopedic surgery' },
  { id: 'fho', name: 'Femoral head ostectomy (FHO)', category: 'Orthopedic surgery' },
  { id: 'patella', name: 'Luxating patella repair', category: 'Orthopedic surgery' },
  { id: 'spay', name: 'Spay', category: 'Routine surgery' },
  { id: 'neuter', name: 'Neuter', category: 'Routine surgery' },
  { id: 'dental', name: 'Dental cleaning with extractions', category: 'Dentistry' },
  { id: 'rootcanal', name: 'Root canal', category: 'Dentistry' },
  { id: 'mass', name: 'Mass removal', category: 'Soft tissue surgery' },
  { id: 'foreign', name: 'Foreign body removal', category: 'Soft tissue surgery' },
  { id: 'cystotomy', name: 'Bladder stone removal (cystotomy)', category: 'Soft tissue surgery' },
  { id: 'boas', name: 'Brachycephalic airway surgery', category: 'Soft tissue surgery' },
  { id: 'cataract', name: 'Cataract surgery (per eye)', category: 'Ophthalmology' },
  { id: 'cherry', name: 'Cherry eye repair', category: 'Ophthalmology' },
  { id: 'echo', name: 'Echocardiogram', category: 'Cardiology' },
  { id: 'ultrasound', name: 'Abdominal ultrasound', category: 'Imaging' },
  { id: 'mri', name: 'MRI', category: 'Imaging' },
  { id: 'chemo', name: 'Oncology consult', category: 'Oncology' },
  { id: 'csection', name: 'C-section', category: 'Reproductive' },
  { id: 'colic', name: 'Colic surgery', category: 'Equine' },
  { id: 'float', name: 'Dental float', category: 'Equine' },
  { id: 'lameness', name: 'Lameness exam', category: 'Equine' },
  { id: 'da', name: 'Displaced abomasum surgery', category: 'Farm animal' },
  { id: 'beak', name: 'Beak and nail trim', category: 'Exotics' },
  { id: 'reptile', name: 'Reptile wellness exam', category: 'Exotics' },
]

export const procedureById = Object.fromEntries(procedures.map((p) => [p.id, p]))
export const speciesById = Object.fromEntries(species.map((s) => [s.id, s]))

export const states = ['IL', 'IN', 'KY', 'MI', 'OH']
export const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const amenities = [
  'Parking on site', 'Wheelchair accessible', 'Payment plans', 'Accepts pet insurance',
  'Separate cat waiting area', 'Curbside drop-off', 'Online booking', 'Farm calls', 'Haul-in facility',
]

// What a listed price can cover. Vets tick these per service, and owners
// tick what their bill covered when they report a price.
export const inclusions = [
  'Exam or consult', 'Pre-op bloodwork', 'Anesthesia', 'X-rays or imaging',
  'Overnight stay', 'Take-home medication', 'Follow-up visits',
]

export const reportReasons = [
  'Not a real client', 'Offensive or abusive', 'Shares private information',
  'Conflict of interest', 'Something else',
]

export const timesOfDay = ['Any time', 'Morning', 'Afternoon']
export const distanceOptions = [10, 25, 50, 100]
