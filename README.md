# ClearCare Vet

A site where animal owners find veterinarians and clinics by procedure, compare
listed prices with what other owners were charged, and leave reviews.
Veterinarians and clinics manage their own profiles.

This version is a front end only. All data is sample data kept in the browser,
and login is simulated. Every clinic, veterinarian, review and price is invented.

## Run it

You need Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the address Vite prints (usually http://localhost:5173).

## Try it

On the Log in page, pick one of three sample accounts:

| Account | What you can do |
| --- | --- |
| Animal owner | Search by procedure, distance, open-now and emergency; see results on a map; compare side by side; share what you paid; ask for appointments; keep health records; post, edit, delete and report reviews; message a vet |
| Veterinarian | Answer messages and appointment requests; list services, prices and what each price includes; set availability; add a photo and credentials; reply to reviews; see stats; get verified |
| Clinic | Edit details, opening hours and amenities; add photos; invite veterinarians; answer the team's appointment requests; reply to clinic reviews; get verified |
| Site admin | Approve or reject licenses, decide on reported reviews, check invoices for "Verified visit" badges, suspend accounts |

You can also create a new owner, veterinarian or clinic account on the Log in
page. New veterinarians and clinics wait in the admin's license queue.

Changes are saved in your browser's localStorage. "Reset sample data" in the
footer puts everything back.

## Design notes

- **Light and dark mode**: follows the device setting; the sun/moon button in the header overrides it. All colours are variables in `src/styles/tokens.css`. The dark list appears twice there on purpose, so keep both copies the same.
- **Profile sections** are in the address (`/profile?tab=reviews`), so they can be linked to.
- **Confirmations**: call `useToast()` from `src/components/Toast.jsx`.
- **Empty screens**: use `src/components/EmptyState.jsx`.
- **Loading screen**: add `?delay=1500` to any address to preview it. Sample data loads instantly, so it never shows otherwise.
- **Illustration**: the dog and cat on the home page are drawn in `src/components/HeroPets.jsx`.

## Where things are

```
index.html                  page shell, fonts, <title>
public/favicon.svg          stand-in favicon
src/
  main.jsx                  entry point
  App.jsx                   routes
  config/site.js            site name (change it here)
  data/
    procedures.js           procedures, animal types, states
    seed.js                 sample clinics, vets, reviews, accounts, messages
  context/StoreContext.jsx  all app state and actions (useReducer + localStorage)
  lib/
    search.js               search and filter logic
    image.js                shrinks uploaded photos so they fit in localStorage
    useRecordView.js        counts profile views
    theme.js                light and dark mode
    selectors.js            ratings, price maths, formatting
    geo.js                  distance maths and a sample ZIP-to-coordinates table
    hours.js                opening hours and "open now"
  components/               Header, SearchBar, ResultCard, PriceRange, Reviews, ...
  pages/
    Home, Search, Compare, Prices, VetDetail, ClinicDetail, Login,
    Notifications, Legal, NotFound
    Profile.jsx             picks a dashboard by account role
    profile/                ClientDashboard, VetDashboard, ClinicDashboard,
                            AdminDashboard, VerificationPanel
  styles/
    tokens.css              colors, fonts, spacing (start here to restyle)
    base.css                typography, buttons, forms
    components.css          shared components
    pages.css               page layouts
```

## Routes

| Path | Page |
| --- | --- |
| `/` | Home |
| `/search?q=&type=&city=&state=&zip=&species=&sort=` | Search results; filters live in the URL |
| `/vets/:id` | Veterinarian profile |
| `/clinics/:id` | Clinic profile |
| `/compare` | Side-by-side comparison of up to three picks |
| `/prices` and `/prices/:id` | Typical prices by procedure and city |
| `/notifications` | The logged-in account's notifications |
| `/legal/terms`, `/legal/privacy`, `/legal/reviews` | Draft policies |
| `/login` | Sample accounts and sign-up for all three account types |
| `/profile` | Dashboard for the logged-in account |

## Known stand-ins

- **Loading states**: built, but only visible with `?delay=`. Wire `ready` in `StoreContext.jsx` to real requests later.
- **Name, logo, favicon**: set in `src/config/site.js`, `src/components/Logo.jsx`, `public/favicon.svg`.
- **Login**: no passwords or real accounts.
- **Verification**: the admin approves a license by hand. Nothing is checked against a licensing board.
- **Invoices**: only the file name is kept, so the admin cannot open them yet.
- **Notifications**: shown on the site only. No email or text is sent.
- **Legal pages**: placeholder wording. Have a lawyer replace it before launch.
- **Appointments**: requests only. Nothing is written to a real calendar.
- **Map**: uses OpenStreetMap's free tiles, which are for development. A live site needs a tile provider.
- **Open now**: uses the visitor's clock, not the clinic's time zone.
- **Photos**: stored in the browser as small JPEGs. A real version uploads them to file storage.
- **Invites**: matched by email inside the browser. No email is sent.
- **Profile views**: counted in the browser only.
- **Distance search**: works for the ZIP codes in `src/lib/geo.js` and for "Use my location". Other ZIPs fall back to matching the first three digits. A real version needs a geocoding service.
- **Prices for a clinic**: combined from its veterinarians' listings.

## Adding a backend later

Every change to data goes through one `dispatch({ type: ... })` call handled in
`src/context/StoreContext.jsx`, and every read goes through `useStore()`. To
move to a real backend, replace the reducer cases with API calls and load the
initial data from the server instead of `seed.js`. Things a real version needs
that this one does not have: authentication, verification that a vet or clinic
account belongs to that vet or clinic, review moderation, and a privacy policy.
