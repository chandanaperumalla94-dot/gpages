# Google Pages

A location-based discovery platform for schools, hospitals, restaurants, shopping and local
businesses across India — built as a production-style MERN application (MongoDB, Express,
React, Node.js).

## Project structure

```
google-pages/
├── client/     React + Vite + Tailwind frontend
└── server/     Express + MongoDB REST API
```

## Getting started

### 1. Backend

```bash
cd server
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET at minimum
npm install
npm run seed               # creates the category list + a sample AP location tree
npm run dev                 # http://localhost:5000
```

You need a MongoDB instance — either local (`mongodb://localhost:27017/google-pages`) or a
free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 2. Frontend

```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

The frontend expects the API at `http://localhost:5000/api` by default. Override with a
`VITE_API_URL` env var if needed.

To enable **Continue with Google**, create a Google OAuth Web application client with
`http://localhost:5173` as an authorized JavaScript origin. Set its ID as
`GOOGLE_CLIENT_ID` in `server/.env` and `VITE_GOOGLE_CLIENT_ID` in `client/.env`.

### 3. Try it out

1. Register an account at `/register`.
2. To test the business flow, register a second account, then in MongoDB set that user's
   `role` to `"business"` (there's no self-serve upgrade yet — see Known limitations).
3. Log in as the business user → **List your business** → submit a listing.
4. To approve it, set a user's `role` to `"admin"` in MongoDB, log in, and visit `/admin`.

## What's implemented

**Phase 1 — Core discovery**
Homepage, cascading State → District → City → Area location selector, dynamic category grid,
city pages with a popular-places slideshow and trending/latest listings, category listing
pages with search/filters/sort/pagination, business detail pages (gallery, contact, timings,
map link, reviews), global search, favorites, JWT auth with duplicate-account prevention.

**Phase 2 — Business & admin**
Business owner registration, listing submission (starts `pending`), business dashboard,
admin dashboard (users, businesses, approve/reject with reason, analytics overview), role-based
route protection on both the API and the frontend.

**Phase 3 — Engagement**
Reviews & ratings (one per user per place, aggregate recalculated on write), owner replies,
enquiries (contact-business form, business inbox), reporting a listing, in-app notifications.

## Known limitations / next steps

- **Image uploads**: listings currently take an image *URL* rather than a file upload widget.
  Wiring up Cloudinary/S3 (`multer` is already a dependency) is the natural next step.
- **Maps**: the "Get directions" link opens Google Maps in a new tab; there's no embedded map
  widget yet — add the Google Maps JavaScript API using the `GOOGLE_MAPS_API_KEY` env var.
- **Self-serve business signup**: today a user's role is flipped to `business` directly in the
  database. A "Become a business owner" flow (or letting any user submit a listing, which
  promotes their role automatically) would remove that manual step.
- **Notifications** are in-app only; no email/SMS delivery is wired up yet (`SMTP_*` env vars
  are scaffolded but unused).
- **Category management UI**: the API supports full category CRUD, but there's no admin screen
  for it yet — categories are managed via `npm run seed` or directly in MongoDB.
- **SEO extras** (sitemap.xml, structured data, meta tags per page) aren't generated yet.

## Security notes

Passwords are hashed with bcrypt (never stored or returned in plain text). JWTs are issued on
login/register and also set as an httpOnly cookie. Email/mobile uniqueness is enforced at the
database layer, not just in the frontend form. All admin and business-only routes are protected
by role-checking middleware on the server — the frontend's route guards are a UX convenience,
not the security boundary.
