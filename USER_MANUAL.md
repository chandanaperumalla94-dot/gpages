# Google Pages — User Manual

## 1. Application access

Start the backend and frontend, then open the frontend URL in a browser.

Typical local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
API:      http://localhost:5000/api
```

The homepage is publicly accessible. Login is only required for account-specific actions such as favorites, reviews, enquiries, and business listing management.

## 2. Public visitor operations

### Browse the homepage

1. Open Google Pages.
2. Review the hero section and location selector.
3. Select State, District, City, and optional Area.
4. Select **Explore now**.
5. The application opens the selected city page.

### Browse categories

1. Select **Categories** from the header or homepage.
2. Search for a category if needed.
3. Select a category card.
4. Review the available approved places.
5. Select a place to open its detail page.

Category cards are loaded from MongoDB, so the visible categories depend on active category records.

### Explore a city

1. Select **Explore** from the header.
2. Select a state.
3. Select a district.
4. Select a city card.
5. Browse categories, popular places, latest listings, and search results for that city.

### Search for a place

1. Open **Search** from the header or use a city page search box.
2. Enter a name, service, address, or keyword.
3. Submit the search.
4. Review the returned approved listings.
5. Open any result to view its details.

### Use category filters

1. Open a city category page, such as a schools or hospitals listing.
2. Enter a keyword in the search field.
3. Select a minimum rating.
4. Use the category-specific filters when available.
5. Select a sorting method such as highest rated, newest, or most popular.
6. Move through the result pages when more listings are available.

Search is debounced, so the API is not called for every individual keystroke.

### View a place

A place detail page may include:

- Name and category.
- Verified status.
- Rating and review count.
- Address and location.
- Phone, email, and official website.
- Cover image and gallery.
- Services and facilities.
- Working hours.
- Directions link.
- Favorite, enquiry, review, report, and share actions.

## 3. Normal user account

### Register

1. Select **Join Google Pages**.
2. Choose **I'm exploring places**.
3. Enter name, email, mobile number, password, and location.
4. Submit the form.
5. The account is created with the `user` role.
6. You are redirected to the normal user experience.

Email and mobile values must be unique.

### Login

1. Select **Log in**.
2. Enter email or mobile number.
3. Enter your password.
4. Select **Log in**.
5. Normal users are redirected to `/dashboard` unless they were returning from a protected page.

### Save a favorite

1. Open a place detail page.
2. Select the favorite action.
3. The place is saved to your account.
4. Open `/dashboard` and choose the Favorites section to view saved places.

### Write a review

1. Log in.
2. Open an approved place.
3. Select the review action.
4. Choose a rating and enter a comment.
5. Submit the review.

### Send an enquiry

1. Open an approved place.
2. Complete the enquiry form.
3. Enter your contact details and message.
4. Submit the enquiry.
5. The business owner can view the enquiry in the business area.

### View notifications and activity

Open `/dashboard` to view:

- Favorites.
- Recently viewed places.
- Notifications.
- Profile information.

## 4. Business owner account

### Register as a business owner

1. Open **Businesses**.
2. Select **Join as a business**.
3. Complete the registration form.
4. The **I own a business** option is selected automatically.
5. Submit the form.
6. The account is created with the `business` role.
7. You are redirected to `/business/dashboard`.

Do not use the normal visitor option if you need to create listings.

### Login as a business owner

1. Select **Log in**.
2. Enter business email or mobile number.
3. Enter password.
4. Business accounts are redirected to the business dashboard.

### Create a listing

1. Open **Business dashboard**.
2. Select **Create new listing**.
3. Enter business name.
4. Select a category.
5. Select state, district, city, and optional area.
6. Enter address, description, phone, email, website, services, and image URL.
7. Submit the listing.

The listing is saved to MongoDB with:

```text
status: pending
verified: false
```

It will not appear in public search until an administrator approves it.

### Track listing status

The business dashboard shows:

- Total listings.
- Approved listings.
- Pending listings.
- Rejected listings.
- Views.
- Favorites.
- Rejection reason when provided.

### Understand approval results

#### Approved

The listing becomes publicly visible and searchable. Its status changes to `approved` and it is marked verified.

#### Rejected

The listing remains hidden from public discovery. The rejection reason appears in the business dashboard and a notification is created.

#### Editing after approval

When owner editing is implemented through the update endpoint, owner changes return the listing to pending review so the admin can verify the updated information again.

## 5. Administrator account

### Admin account setup

Public registration cannot create an admin role. The admin account must be created through the seed configuration or promoted directly in MongoDB.

Development seed configuration:

```env
SEED_ADMIN_EMAIL=admin@googlepages.local
SEED_ADMIN_PASSWORD=Admin@12345
SEED_ADMIN_MOBILE=9999999999
```

Run:

```bash
cd server
npm run seed
```

Use a new secure password in any shared or production environment.

### Login as administrator

1. Open **Log in**.
2. Enter the admin email or mobile number.
3. Enter the admin password.
4. The application redirects the admin to `/admin`.

If the page says **Access restricted**, the account returned by the API is not currently using `role: "admin"`. Log out, confirm the MongoDB role, and log in again.

### Admin overview

The overview displays platform information such as:

- Total users.
- Business owners.
- Total listings.
- Approved listings.
- Pending listings.
- Categories.
- Cities.
- Reviews.
- Enquiries.
- Most viewed listings.
- Most searched listings.

### Review submitted listings

1. Open `/admin`.
2. Select **Businesses**.
3. Open the **Pending** tab.
4. Review the listing name, category, city, owner, email, and address.

### Approve a listing

1. Locate a pending listing.
2. Select **Approve**.
3. The listing changes to `approved`.
4. The listing is marked verified.
5. The listing becomes publicly visible.
6. The owner receives an in-app approval notification.

### Reject a listing

1. Locate a pending listing.
2. Select **Reject**.
3. Enter a clear rejection reason.
4. Select **Confirm**.
5. The listing changes to `rejected`.
6. The owner receives the rejection reason and notification.

### Suspend an approved listing

The backend supports suspending a listing. A suspended listing is hidden from public discovery and can be managed from the administrator workflow.

### Manage users

1. Open **Users** in the admin console.
2. Search by name, email, or mobile number.
3. Block or unblock an account.
4. Change roles through the admin action when required.
5. Delete an account only when necessary because deletion is destructive.

### Import place data

1. Open **Businesses** in the admin console.
2. Use the **Import places** panel.
3. Upload a JSON or CSV file.
4. Use the downloadable template for the expected columns.
5. Select **Upload to MongoDB**.
6. Review the import result message.

Required fields:

```text
name, category, state, district, city, address
```

Optional fields include:

```text
area, description, phone, website, images, services, rating, reviewCount
```

Use the pipe character to separate multiple image or service values:

```text
images=image-one-url|image-two-url
services=Delivery|Online enquiries|Customer support
```

## 6. Role troubleshooting

### Access restricted after admin login

Check the following:

1. The account exists in MongoDB.
2. The account has exactly `role: "admin"`.
3. The account status is `active`.
4. You logged out and logged in again after changing the role.
5. The frontend is connected to the correct backend through `VITE_API_URL`.
6. The backend was restarted after environment changes.

### Business dashboard is restricted

The account must have exactly `role: "business"`. Selecting “I own a business” during registration creates this role for new accounts.

### Listing does not appear publicly

Check that:

- The listing was approved by an admin.
- Its status is `approved`.
- Its category and city are correct.
- The frontend is connected to the same MongoDB database where the listing was created.

### No seeded data appears

Check that `MONGO_URI` exists in `server/.env`, then run:

```bash
cd server
npm run seed
```

## 7. Operational rules summary

```text
user      → discovery, favorites, reviews, enquiries
business  → business dashboard, create listings, track approval status
admin     → moderation, approvals, users, analytics, imports
```

Only approved listings are visible through public search and category pages.

