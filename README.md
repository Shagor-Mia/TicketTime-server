## 🚀 Live Preview

- frontend-client-link
  Check out the live version here: [Live Site](https://ticket-time-dcb40.web.app/)

- backend-server-link
  Check out the live version here: [Live Site](https://ticket-time.vercel.app/)

## Project Overview

This repository contains the **backend/server-side implementation** of **TicketBari**, an Online Ticket Booking Platform built with **Node.js, Express.js, MongoDB, Firebase Admin SDK, and Stripe**.

The backend is responsible for:

- Authentication & role-based authorization (User, Vendor, Admin)
- Ticket management & verification
- Booking workflow & status handling
- Stripe payment processing
- Dashboard analytics & reporting
- Secure API access using Firebase tokens

This server is fully production-ready and follows the deployment and security guidelines provided in the requirements.

## Key Features

### Authentication & Security

- Firebase Authentication token verification using **Firebase Admin SDK**
- Protected routes with role-based middleware:

  - `verifyFirebaseToken`
  - `verifyAdmin`
  - `verifyVendors`

- Secure environment variables for:

  - Firebase Admin credentials
  - MongoDB connection string
  - Stripe secret key

---

### User Management

- User creation on first login
- Fetch user role by email
- Update user profile (name, photo)
- Admin role assignment:

  - Make Admin
  - Make Vendor

---

### Vendor Management

- Vendor registration request system
- Admin approval / rejection of vendors
- Vendor profile access
- Vendor overview statistics:

  - Total revenue
  - Total tickets sold
  - Total tickets added

---

### Ticket Management

- Vendor can:

  - Add tickets (initially **pending**)
  - Update tickets (re-approval required)
  - Delete tickets (except rejected ones)

- Admin can:

  - Approve or reject tickets
  - View all tickets in tabular format

- Users can:

  - View **approved tickets only**
  - Search by From → To
  - Filter by transport type
  - Paginate results

---

### Advertisement System

- Admin can advertise approved tickets
- Maximum **6 advertised tickets** at a time
- Advertised tickets appear on homepage
- Prevents duplicate advertisement

---

### Booking System

- Users can book tickets with quantity validation
- Booking status lifecycle:

  - `pending` → `accepted` / `rejected` → `paid`

- Automatic ticket quantity reduction on booking
- Ticket quantity restored if booking is rejected
- Vendors can accept or reject booking requests

---

### Payment System (Stripe)

- Stripe Checkout Session integration
- Secure payment flow
- Prevents duplicate payments
- Stores transaction history
- Updates booking status after successful payment

---

### Dashboards & Analytics

#### Admin Dashboard

- Total users
- Total vendors
- Total tickets

#### Vendor Dashboard

- Total revenue
- Total tickets sold
- Total tickets added

#### User Dashboard

- Booking history
- Payment history

---

## API Endpoints Overview

### Auth & Users

- `POST /users`
- `GET /users`
- `GET /users/:email/role`
- `PATCH /users` (update profile)
- `PATCH /users/:id/role` (admin only)

### Vendors

- `POST /vendors`
- `GET /vendors`
- `GET /vendors/me`
- `PATCH /vendors/:id` (admin)
- `DELETE /vendors/:id` (admin)

### Tickets

- `POST /tickets` (vendor)
- `GET /tickets/approved`
- `GET /tickets/vendor/me`
- `GET /tickets/pending` (admin)
- `PATCH /tickets/vendor/:id`
- `DELETE /tickets/vendor/:id`
- `PATCH /tickets/:id/approve` (admin)

### Advertisement

- `POST /advertise` (admin)
- `GET /advertise`
- `GET /tickets/advertise` (admin)

### Bookings

- `POST /bookings`
- `GET /bookings/user`
- `GET /bookings/vendor`
- `PATCH /bookings/:id/status`

### Payments

- `POST /payment-checkout-session`
- `PATCH /payment-success`
- `GET /payments/user`

---

## Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB (Native Driver)**
- **Firebase Admin SDK**
- **Stripe API**
- **dotenv**
- **cors**

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
URL=your_mongodb_connection_string
STRIPE_KEY=your_stripe_secret_key
DOMAIN_URL=https://your-frontend-domain.com

# Firebase Admin SDK (Base64 encoded JSON)
FIREBASE_ADMIN=your_base64_encoded_service_account
```

⚠️ **Important:** Never expose Firebase Admin credentials or Stripe keys in client-side code.

---

## Installation & Run

1. Clone the repository:

```bash
git clone https://github.com/your-username/ticketbari-backend.git
```

2. Navigate to the project folder:

```bash
cd server-backend
```

3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
npm run dev
```

---

## Commit Guidelines

- Minimum **meaningful commits done**
- Descriptive commit messages such as:

  - `feat: Add Firebase token verification middleware`
  - `feat: Implement ticket booking workflow`
  - `feat: Integrate Stripe checkout session`
  - `fix: Prevent duplicate payments`
  - `refactor: Optimize booking status handling`

---

## Error Handling

- Global try/catch for async routes
- Proper HTTP status codes
- Prevents:

  - Unauthorized access
  - Invalid role actions
  - Duplicate payments
  - Overbooking tickets

---

## Deployment Notes

- Backend deployed on production server
- No CORS / 404 / 504 errors
- Firebase domain authorization configured
- API routes remain stable on reload
