# IIT BHU Issues Tracker

A full-stack campus issue-tracking platform for reporting, discovering, prioritizing, and managing hostel maintenance problems at IIT BHU. Students can submit structured issue reports with photographs, location context, severity indicators, safety flags, and escalation priority. Authenticated users can manage their profiles and listings, while all visitors can browse and search reported issues.

## Overview

The application turns informal maintenance complaints into searchable, structured reports. Each report combines a description and proof of damage with operational metadata that helps residents and administrators understand urgency and impact.

The system supports:

- User registration, sign-in, sign-out, and protected account actions
- Issue reports for private rooms and common areas
- Multiple Cloudinary-hosted proof images per report
- Severity, duration, affected-student, safety, emergency, and escalation metadata
- Search, filtering, sorting, and pagination for reported issues
- Reporter contact through a pre-filled email link
- User profile updates and personal listing management

## Core Workflow

```text
Student creates an account
		  ↓
Student signs in and receives an HTTP-only JWT cookie
		  ↓
Student uploads proof and submits an issue report
		  ↓
Report is stored in MongoDB with structured impact metadata
		  ↓
Community searches, filters, views, and contacts the reporter
		  ↓
Report owner updates or removes the issue from their profile
```

## Technical Architecture

```text
React + Vite Client
	├─ React Router page navigation
	├─ Redux Toolkit user state
	├─ Redux Persist browser persistence
	├─ Tailwind CSS interface styling
	├─ Swiper image galleries
	└─ Cloudinary direct image uploads
			↓ /api proxy in development
Express API Server
	├─ Authentication routes
	├─ User and profile routes
	├─ Listing CRUD routes
	├─ JWT cookie verification
	└─ Centralized error responses
			↓
MongoDB via Mongoose
	├─ User documents
	└─ Listing documents
```

## Technology Stack

| Layer | Technologies |
|---|---|
| Client | React 19, Vite, React Router, Redux Toolkit, Redux Persist |
| Styling | Tailwind CSS, PostCSS, React Icons |
| Media | Cloudinary unsigned image upload API |
| Server | Node.js, Express 5, ES modules |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens, HTTP-only cookies, bcryptjs |
| Development | Nodemon, ESLint, Vite development server |

## Feature Model

### Users

User accounts contain:

- `username`
- `email`
- Hashed `password`
- `avatar`
- Creation and update timestamps

Passwords are hashed with `bcryptjs`. Successful sign-in creates a JWT containing the user ID and stores it in the `access_token` HTTP-only cookie. Protected API routes validate this cookie before allowing account or listing-owner operations.

### Issue Listings

Each listing contains:

| Field | Purpose |
|---|---|
| `title` | Short issue title |
| `description` | Detailed issue description |
| `locationContext` | Hostel, room, or common-area context |
| `category` | `individual`, `shared`, or `general` |
| `primaryMetric` | Severity score from 1 to 10 |
| `secondaryMetric` | Number of students affected |
| `tertiaryMetric` | Number of days noticed |
| `quaternaryMetric` | Escalation priority from 1 to 5 |
| `statusFlagOne` | Urgent or emergency indicator |
| `statusFlagTwo` | Safety hazard indicator |
| `statusFlagThree` | Warden escalation indicator |
| `mediaUrls` | Cloudinary URLs for proof images |
| `userRef` | ID of the reporting user |

## Client Application

The client is organized around the following routes:

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Browse featured and recent issues |
| `/about` | Public | Learn about the platform |
| `/signin` | Public | Authenticate an existing user |
| `/signup` | Public | Create a user account |
| `/search` | Public | Search, filter, sort, and paginate listings |
| `/listing/:listingId` | Public | View issue details and contact the reporter |
| `/profile` | Authenticated | Update account details and manage listings |
| `/createlisting` | Authenticated | Submit a new issue report |
| `/updatelisting/:listingId` | Authenticated | Edit an owned issue report |

The home page highlights escalated reports, private-room issues, and common-area issues. The search view supports category filters, safety and emergency filters, escalation filtering, severity sorting, creation-date sorting, and incremental loading.

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Create an account |
| `POST` | `/api/auth/signin` | Sign in and set the JWT cookie |
| `GET` | `/api/auth/signout` | Clear the JWT cookie |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/user/test` | Check the user controller |
| `GET` | `/api/user/:id` | Get public user information |
| `POST` | `/api/user/update/:id` | Update the authenticated user |
| `DELETE` | `/api/user/delete/:id` | Delete the authenticated user |
| `GET` | `/api/user/listings/:id` | Get the authenticated user's listings |

### Listings

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/listing/get` | Search and retrieve listings |
| `GET` | `/api/listing/get/:id` | Retrieve one listing |
| `POST` | `/api/listing/create` | Create an authenticated user's listing |
| `POST` | `/api/listing/update/:id` | Update an owned listing |
| `DELETE` | `/api/listing/delete/:id` | Delete an owned listing |

The listing collection endpoint accepts query parameters including `searchTerm`, `category`, `statusFlagOne`, `statusFlagTwo`, `statusFlagThree`, `sort`, `order`, `limit`, and `startIndex`.

## Project Structure

```text
.
├─ api/
│  ├─ controllers/       Request handlers for auth, users, and listings
│  ├─ models/            Mongoose user and listing schemas
│  ├─ routes/            Express route definitions
│  ├─ utils/              JWT verification and error helpers
│  └─ index.js            Express server and MongoDB connection
├─ client/
│  ├─ src/components/    Header, listing cards, contact, and route guard
│  ├─ src/pages/         Home, search, auth, profile, and listing views
│  ├─ src/redux/         Persisted Redux user store
│  ├─ src/App.jsx        Client route configuration
│  └─ vite.config.js     Vite development proxy configuration
├─ package.json           Root server scripts and dependencies
└─ README.md
```

## Installation

### Prerequisites

- Node.js 18 or newer
- npm
- A MongoDB database
- A Cloudinary account configured for unsigned image uploads

### Setup

```bash
git clone <repository-url>
cd sde3
npm install
npm install --prefix client
```

Create a root `.env` file for the server:

```env
MONGO=<mongodb-connection-string>
JWT_SECRET=<long-random-secret>
```

Create `client/.env` for Cloudinary uploads:

```env
VITE_CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
VITE_CLOUDINARY_UPLOAD_PRESET=<unsigned-upload-preset>
```

Keep both environment files out of source control. The repository's `.gitignore` already excludes `.env` files.

## Running the Application

### Development

Start the API server from the project root:

```bash
npm run dev
```

Start the Vite client in a second terminal:

```bash
npm run dev --prefix client
```

The API runs on `http://localhost:3000`, and the Vite development server normally runs on `http://localhost:5173`. Client requests beginning with `/api` are proxied to the API server.

### Production Build

Build the client from the project root:

```bash
npm run build
```

The root build script installs dependencies, builds the client into `client/dist`, and prepares the static files served by Express. Start the production server with:

```bash
npm start
```

## Security and Access Control

- Passwords are stored as bcrypt hashes rather than plaintext values.
- JWTs are stored in HTTP-only cookies and checked by `verifyToken`.
- Only authenticated users can create, update, or delete listings.
- Users can update and delete only their own accounts.
- Listing owners can update or delete only their own listings.
- Public user responses omit the password field.
- Environment files are excluded from Git tracking.

## Validation and Quality Checks

Run the client linter with:

```bash
npm run lint --prefix client
```

Create and production-build the client with:

```bash
npm run build --prefix client
```

The project currently has no automated backend test suite. Manual verification should cover authentication, protected routes, listing CRUD, Cloudinary uploads, search filters, pagination, and the production static-file fallback.

## Current Scope and Future Work

### Current Scope

- Campus-focused issue reporting and discovery
- Structured severity and impact metadata
- Image evidence and reporter contact
- Owner-controlled listing lifecycle
- MongoDB-backed persistence with cookie authentication

### Potential Extensions

- Admin and warden dashboards
- Issue status transitions such as open, assigned, and resolved
- Notifications for report updates and escalations
- Duplicate issue detection by location and category
- Moderation and abuse-reporting workflows
- Automated API and end-to-end test coverage
- Role-based authorization for maintenance staff and administrators

## Version

**Version:** 1.0.0  
**Project:** IIT BHU Issues Tracker  
**Stack:** MERN
