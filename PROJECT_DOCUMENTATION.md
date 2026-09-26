# Google Pages — Project Documentation

## 1. Project overview

Google Pages is a location-based discovery platform for finding trusted businesses, organizations, and public places. Users can browse places by state, district, city, area, and category, then search, filter, view details, save favorites, write reviews, and contact businesses.

The platform also supports business owners who want to submit listings and administrators who verify, approve, reject, suspend, and manage listings.

## 2. Problem statement

Local information is often fragmented across search engines, social media, directories, and word-of-mouth. Users may have difficulty finding complete and relevant information about schools, hospitals, restaurants, hotels, shops, offices, and other organizations in a specific locality.

Google Pages addresses this problem by providing:

- A structured State → District → City → Area location hierarchy.
- Category-based discovery for local businesses and organizations.
- Search, filtering, sorting, pagination, and rating-based discovery.
- Verified listing and admin approval workflows.
- Business profiles with contact details, services, images, and working information.
- User favorites, reviews, enquiries, notifications, and recently viewed places.

## 3. Objectives

- Make local discovery simple and location-aware.
- Keep category and location data dynamic and MongoDB-backed.
- Give businesses a controlled listing submission workflow.
- Prevent unverified listings from being publicly visible.
- Provide administrators with platform moderation and analytics tools.
- Maintain a scalable MERN architecture that can expand to more cities and states.

## 4. Technology stack

### Frontend

- React 18
- React Router 6
- Axios
- Vite
- Tailwind CSS
- JavaScript/JSX

### Backend

- Node.js 18+
- Express.js
- REST API architecture
- JWT authentication
- bcryptjs password hashing
- Mongoose ODM
- Multer memory uploads for admin data imports

### Database and security

- MongoDB or MongoDB Atlas
- MongoDB indexes for search and discovery queries
- Helmet security headers
- CORS
- Express rate limiting
- Mongo query sanitization
- Express Validator
- HTTP-only authentication cookie with bearer-token fallback

## 5. High-level architecture

```text
┌──────────────────────────────┐
│        React Web Client       │
│  Pages, components, routing   │
│  Auth context, API services   │
└───────────────┬──────────────┘
                │ Axios / REST / JWT cookie or bearer token
                ▼
┌──────────────────────────────┐
│       Express API Server      │
│ Security middleware           │
│ Auth and role authorization   │
│ Validators and controllers    │
│ REST routes and error handler │
└───────────────┬──────────────┘
                │ Mongoose queries
                ▼
┌──────────────────────────────┐
│          MongoDB              │
│ Users, places, categories,    │
│ locations, reviews, favorites│
│ enquiries, reports, notices  │
└──────────────────────────────┘

External image URLs ───────────► Listing galleries and carousel images
Admin JSON/CSV upload ─────────► Express/Multer ─────────► MongoDB
Google Maps directions link ───► External Google Maps page
```

## 6. Main request flow

```text
User action
   ↓
React page or component
   ↓
Axios API service
   ↓
Express route
   ↓
Security/auth middleware
   ↓
Controller
   ↓
Mongoose model
   ↓
MongoDB
   ↓
JSON response
   ↓
React state update and UI feedback
```

## 7. Role architecture

### Normal user

Normal users can browse places, search, filter, view details, save favorites, submit reviews, send enquiries, report listings, and manage their personal dashboard.

### Business owner

Business owners can create listings. New listings are created with `pending` status and are not publicly visible until an administrator approves them. Business owners can see listing status, rejection reasons, views, favorites, and other listing information.

### Administrator

Administrators use the separate `/admin` console. They can review listing requests, approve or reject listings, suspend listings, manage users, view analytics, and import place data.

## 8. Database collections

### Users

Stores name, email, mobile, password hash, role, location, status, favorites, and recently viewed places.

### Locations

Stores hierarchical state, district, city, and area records. Each child location references its parent.

### Categories

Stores category names, slugs, icons, descriptions, sort order, active status, and category-specific filter definitions.

### Places

Stores business or organization name, category, location references, address, description, contact details, images, services, facilities, working hours, coordinates, rating, verification, approval status, owner, views, favorites, and search appearances.

### Reviews

Stores user ratings and comments connected to a place.

### Favorites

Stores the relationship between a user and a saved place.

### Business requests

Stores listing submission snapshots and approval/rejection history.

### Notifications

Stores in-app messages such as listing approval, rejection, registration, and review activity.

### Enquiries and reports

Stores user enquiries sent to businesses and reports submitted about listings.

## 9. Important API groups

```text
/api/auth          Registration, login, logout, current user
/api/locations     States, districts, cities, areas, slug resolution
/api/categories    Public category discovery and admin category CRUD
/api/places        Search, listing discovery, details, create/update/delete
/api/favorites     Save and remove places
/api/reviews       Create, list, moderate, and remove reviews
/api/enquiries     Contact businesses and manage enquiries
/api/reports       Report listings and admin report management
/api/notifications User notifications
/api/admin         Analytics, users, business approvals, imports
```

## 10. Implemented features

### Discovery and UI

- Responsive homepage with hero section and location selector.
- Dynamic category grid loaded from MongoDB.
- Categories page with category search.
- Category-specific place results.
- State, district, city, and area cascade selectors.
- City pages with trending places, latest listings, category links, and carousel.
- Explore page for selecting a live city from MongoDB.
- About and business-owner landing pages.
- Place cards with ratings, verification badge, images, and details navigation.
- Image fallback behavior and lazy-loaded listing images.
- Responsive header, mobile navigation, footer, loading states, and empty states.

### Search and filtering

- Global search by name, address, description, and services.
- Category listing search with debouncing.
- Minimum rating filtering.
- Dynamic category-specific filters from MongoDB.
- Sorting by rating, newest, and popularity.
- Pagination and complete result counts.

### Authentication and roles

- Registration and login with email or mobile number.
- JWT plus HTTP-only cookie authentication.
- Password hashing with bcrypt.
- Duplicate email and mobile prevention.
- Protected frontend routes.
- Backend role authorization.
- Role-aware redirects after login.
- Admin redirected to `/admin`.
- Business owner redirected to `/business/dashboard`.
- Normal user redirected to `/dashboard`.

### Business workflow

```text
Business registration
        ↓
Create listing
        ↓
Pending review
        ↓
Admin approval or rejection
        ↓
Approved listing becomes public
        ↓
Rejected listing shows reason to owner
```

### Admin workflow

- Admin overview analytics.
- Pending, approved, rejected, and suspended listing tabs.
- Approve listing action.
- Reject listing with required reason.
- Suspend listing.
- User search, block/unblock, role management, and deletion.
- JSON/CSV place import into MongoDB.
- Downloadable import template.

### Seed data

The seed script creates or updates:

- 23 categories.
- Andhra Pradesh location hierarchy.
- Cities including Rajahmundry, Kakinada, Vijayawada, Machilipatnam, Visakhapatnam City, and Anakapalle.
- Multiple areas under each city.
- 138 approved demonstration places.
- Demonstration business owner account.
- Development admin account when MongoDB is configured.

## 11. Current implementation progress

### Completed

- Core MERN application structure.
- MongoDB models and relationships.
- REST API routes and controllers.
- Authentication and role authorization.
- Location and category hierarchy.
- Seed data and demo listings.
- Homepage and responsive discovery UI.
- Search, filtering, sorting, and pagination.
- Debounced category search.
- Place details, carousel, ratings, favorites, reviews, and enquiries.
- Business listing submission workflow.
- Admin listing approval workflow.
- Admin user management.
- Admin analytics overview.
- Admin JSON/CSV import.
- Role-aware redirects and protected interfaces.
- Production frontend build verification.

### Partially implemented or remaining

- Image fields currently use external image URLs; production cloud uploads are not yet wired to Cloudinary or S3.
- Maps currently use Google Maps directions links instead of an embedded interactive map.
- Email/SMS delivery is not connected; notifications are in-app.
- Category and location CRUD APIs exist, but the full admin management screens are not yet complete.
- Advanced analytics charts are not yet implemented.
- SEO sitemap, structured metadata, and canonical URL automation remain future work.
- Automated unit, integration, and end-to-end test suites should be added before production deployment.
- The default development admin credentials must be replaced before deployment.

## 12. Setup and commands

### Backend

```bash
cd server
npm install
npm run seed
npm run dev
```

Required environment values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=long_random_secret
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_web_client_id
```

Optional seed admin values:

```env
SEED_ADMIN_EMAIL=admin@googlepages.local
SEED_ADMIN_PASSWORD=Admin@12345
SEED_ADMIN_MOBILE=9999999999
```

### Frontend

```bash
cd client
npm install
npm run dev
```

The frontend defaults to `http://localhost:5000/api`. Set `VITE_API_URL` when using another API URL.
For Google sign-in, create a Google OAuth Web application client, add `http://localhost:5173` as an authorized JavaScript origin, then set the same client ID in `server/.env` as `GOOGLE_CLIENT_ID` and in `client/.env` as `VITE_GOOGLE_CLIENT_ID`.

## 13. Production recommendations

- Rotate all database passwords and JWT secrets.
- Do not commit `.env` files.
- Replace external demo images with optimized cloud-hosted assets.
- Add a strict production CORS allowlist.
- Add automated tests and CI checks.
- Add request logging and centralized monitoring.
- Configure MongoDB backups and indexes for the expected production dataset.
- Add real file upload validation and virus/content checks.
- Use HTTPS in production.

