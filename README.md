# Founders Circle - Startup Benefits Platform

A full-stack platform connecting early-stage startups with exclusive SaaS deals and partner benefits.

## 🏗️ Project Structure

```
Assignment/
├── backend/          # Node.js + Express + MongoDB API
│   └── src/
│       ├── config/   # Database configuration
│       ├── controllers/  # Request handlers
│       ├── middleware/   # JWT authentication
│       ├── models/   # Mongoose schemas
│       ├── routes/   # API route definitions
│       ├── server.js # Express application
│       └── seed.js   # Database seeding script
│
└── frontend/         # Next.js 16 + TypeScript + Tailwind CSS
    └── src/
        ├── app/      # App Router pages
        │   ├── deals/       # Deals listing & detail pages
        │   ├── dashboard/   # User dashboard
        │   ├── login/       # Login page
        │   └── register/    # Registration page
        └── components/      # Shared UI components
```

## 🚀 Tech Stack

### Backend

- **Node.js** with Express 5
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled for cross-origin requests

### Frontend

- **Next.js 16** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **React 19** with client-side state management

## 📋 Features

### Authentication System

- User registration with email/password
- Secure login with JWT tokens
- Password hashing with bcrypt (10 salt rounds)
- Protected routes on both frontend and backend
- Automatic token validation on dashboard access

### Deal Management

- Public and locked deals (verification-based access)
- Category-based filtering (Cloud, Analytics, Sales, Marketing, Productivity)
- Search functionality across titles, partners, and descriptions
- Access level filtering (public/locked)
- Rich deal details with eligibility requirements and perks

### Claim System

- Authenticated users can claim deals
- Verification check for locked deals
- Duplicate claim prevention (unique index on user+deal)
- Claim status tracking (pending, approved, rejected)
- User dashboard showing all claimed deals

### UI/UX Features

- Smooth page transitions with Framer Motion
- Animated hero section with gradient effects
- Loading states and skeleton screens
- Responsive design (mobile-first)
- Interactive hover effects and micro-interactions
- Dark theme with premium glassmorphism effects

## 🔐 Authentication & Authorization Flow

### Registration Flow

1. User submits registration form with name, email, password, and optional company
2. Backend validates input and checks for existing email
3. Password is hashed using bcrypt before database storage
4. New user document is created with `verified: false` by default
5. JWT token is generated with user ID as payload
6. Token is returned to client and stored in localStorage
7. User is redirected to dashboard

### Login Flow

1. User submits email and password
2. Backend finds user by email (case-insensitive)
3. Password is compared using bcrypt's compare function
4. If valid, JWT token is generated and returned
5. Client stores token in localStorage
6. User is redirected to dashboard

### Protected Route Access

1. Client includes JWT token in Authorization header (`Bearer <token>`)
2. Auth middleware extracts and verifies token using JWT_SECRET
3. User document is fetched from database
4. User object is attached to request (`req.user`)
5. Request proceeds to controller if valid, otherwise 401 is returned

### Claim Authorization Logic

```javascript
// Locked deals require verification
if (deal.accessLevel === "locked" && !req.user.verified) {
  return 403 Forbidden
}

// Prevent duplicate claims
if (existingClaim) {
  return 409 Conflict
}
```

## 🎯 Deal Claiming Flow

### Step-by-Step Process

1. **User browses deals** (`/deals`)
   - Deals are fetched from `GET /api/deals`
   - Optional filters: category, accessLevel, search
   - Locked deals are visually marked

2. **User views deal details** (`/deals/:slug`)
   - Frontend calls `GET /api/deals/:slug`
   - Full deal information is displayed
   - Eligibility requirements shown
   - Claim button rendered

3. **User clicks "Claim deal"**
   - Frontend checks for JWT token in localStorage
   - If no token, user is redirected to `/login`
   - If token exists, `POST /api/claims/:dealId` is called

4. **Backend validates claim request**

   ```
   ├─ Auth middleware verifies JWT token
   ├─ Deal is fetched and validated (exists + active)
   ├─ If locked deal → check user.verified === true
   ├─ Check for existing claim (user + deal combination)
   └─ Create claim with status: "pending"
   ```

5. **Claim response**
   - Success: Claim object returned, success message displayed
   - Failure: Error message (e.g., "Verification required", "Already claimed")

6. **Dashboard view** (`/dashboard`)
   - Frontend calls `GET /api/claims/me` with auth token
   - Backend returns all claims for authenticated user
   - Claims are populated with deal details
   - Status badges displayed (pending/approved/rejected)

### Database Relations

```
User (1) ←──→ (Many) Claim
Deal (1) ←──→ (Many) Claim

Claim Schema:
{
  user: ObjectId → User,
  deal: ObjectId → Deal,
  status: enum ['pending', 'approved', 'rejected'],
  timestamps: true
}

Unique Index: [user + deal] prevents duplicates
```

## 🔄 Frontend-Backend Interaction

### API Endpoints

#### Authentication

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and get JWT token
- `GET /api/auth/me` - Get current user (protected)

#### Deals

- `GET /api/deals` - List all active deals (supports query params)
- `GET /api/deals/:slug` - Get single deal by slug

#### Claims

- `POST /api/claims/:dealId` - Claim a deal (protected)
- `GET /api/claims/me` - Get user's claimed deals (protected)

### Request/Response Examples

#### Register

```javascript
POST /api/auth/register
Body: { name, email, password, company? }
Response: { token, user: { id, name, email, verified, ... } }
```

#### Login

```javascript
POST /api/auth/login
Body: { email, password }
Response: { token, user: { id, name, email, verified, ... } }
```

#### Claim Deal

```javascript
POST /api/claims/:dealId
Headers: { Authorization: "Bearer <token>" }
Response: { claim: { _id, user, deal, status, createdAt } }
```

#### Get User Claims

```javascript
GET /api/claims/me
Headers: { Authorization: "Bearer <token>" }
Response: { claims: [{ _id, status, deal: { title, slug, ... }, ... }] }
```

## ⚠️ Known Limitations

### Security

- No refresh token mechanism (tokens valid for 7 days)
- Password reset functionality not implemented
- Email verification not implemented (verified flag manually set)
- No rate limiting on authentication endpoints
- CORS is fully open (should be restricted in production)

### Data Validation

- Limited input sanitization
- No schema validation library (e.g., Joi, Zod)
- File upload not supported for partner logos (using placeholder URLs)

### User Experience

- No email notifications for claim status changes
- Admin panel for deal/claim management not implemented
- No social authentication (Google, GitHub, etc.)
- Browser back button may show stale data (no cache invalidation)

### Performance

- No pagination on deals or claims lists
- No caching layer (Redis, etc.)
- Database queries not optimized with select projections
- All deals loaded client-side on every filter change

### Error Handling

- Generic error messages (could expose internal details in dev mode)
- No centralized error logging
- Frontend error boundaries not implemented

## 🚀 Production Readiness Improvements

### Essential

1. **Environment variable validation** - Validate all required env vars on startup
2. **Rate limiting** - Add express-rate-limit for auth routes
3. **Input validation** - Use Joi/Zod for request body validation
4. **Error logging** - Integrate Winston or Pino for structured logs
5. **HTTPS** - Enforce HTTPS in production
6. **CORS configuration** - Restrict to specific frontend domain
7. **Database indexing** - Add compound indexes for frequent queries
8. **Pagination** - Implement cursor or offset pagination
9. **Refresh tokens** - Implement JWT refresh token rotation
10. **Email verification** - Send verification emails on registration

### Recommended

11. **Monitoring** - Add Sentry or similar for error tracking
12. **API documentation** - Generate OpenAPI/Swagger docs
13. **Testing** - Add unit and integration tests (Jest, Supertest)
14. **CI/CD** - Automate deployment with GitHub Actions
15. **Database backups** - Automated MongoDB backups
16. **Content Security Policy** - Add CSP headers
17. **Image optimization** - Use Next.js Image component with real logos
18. **SEO optimization** - Add metadata and Open Graph tags
19. **Analytics** - Track user behavior with privacy-friendly tools
20. **Admin dashboard** - Build interface for deal/claim management

### Advanced

21. **Redis caching** - Cache frequently accessed deals
22. **WebSockets** - Real-time claim status updates
23. **Search engine** - Integrate Elasticsearch or Algolia
24. **CDN** - Serve static assets from CDN
25. **Load balancing** - Deploy multiple backend instances
26. **Database sharding** - Scale MongoDB horizontally
27. **Microservices** - Split auth, deals, claims into services
28. **GraphQL** - Alternative API layer for flexible querying

## 🎨 UI & Animation Features

### Animations Implemented

- **Page transitions**: Fade + slide with Framer Motion
- **Hero section**: Staggered text reveal, floating stat cards
- **Deal cards**: Hover scale, gradient effects
- **Button interactions**: Scale on hover, ripple effects
- **Loading states**: Skeleton screens, spinner animations
- **Form feedback**: Error shake, success slide

### Design System

- **Colors**: Zinc grayscale with blue/purple/pink accents
- **Typography**: Geist Sans (body), Geist Mono (code)
- **Spacing**: Consistent 4px grid system
- **Borders**: Subtle white/10 for glassmorphism
- **Shadows**: Minimal use, blur effects preferred
- **Gradients**: Blue-to-purple for CTAs and highlights

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB 6+ (local or MongoDB Atlas)
- Git

### Backend Setup

1. Navigate to backend directory:

```bash
cd Assignment/backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/startup-benefits
JWT_SECRET=your_super_secret_key_change_this_in_production
```

4. Seed the database:

```bash
npm run seed
```

5. Start development server:

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd Assignment/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🧪 Testing the Application

### Manual Testing Flow

1. **Homepage** - Visit `http://localhost:3000`
   - Verify animated hero loads smoothly
   - Click "Browse deals" button

2. **Deals Page** - Explore deals
   - Test search functionality
   - Filter by category
   - Filter by access level
   - Click on a deal card

3. **Deal Details** - View specific deal
   - Verify all deal information displays
   - Try claiming without login (should redirect)

4. **Registration** - Create account
   - Fill registration form
   - Submit and verify token storage
   - Confirm redirect to dashboard

5. **Dashboard** - Check user profile
   - Verify user details display
   - Check verification status badge
   - Confirm no claims initially

6. **Claim a Deal** - Make first claim
   - Browse to a public deal
   - Click "Claim deal" button
   - Verify success message
   - Return to dashboard to see claimed deal

7. **Locked Deal** - Test verification
   - Try claiming a locked deal
   - Verify error message about verification

8. **Logout & Login** - Test persistence
   - Logout from dashboard
   - Login with same credentials
   - Verify claimed deals persist

## 🌐 Deployment Guide

### Backend Deployment (Render/Railway/Fly.io)

1. Push code to GitHub repository

2. Create new web service on hosting platform

3. Configure environment variables:
   - `PORT` (auto-set by most platforms)
   - `MONGODB_URI` (use MongoDB Atlas connection string)
   - `JWT_SECRET` (generate strong random string)
   - `NODE_ENV=production`

4. Set build command: `npm install`

5. Set start command: `npm start`

6. Deploy and note the backend URL

### Frontend Deployment (Vercel)

1. Push code to GitHub repository

2. Import project in Vercel dashboard

3. Configure build settings:
   - Framework: Next.js
   - Root directory: `Assignment/frontend`
   - Build command: `npm run build`
   - Output directory: `.next`

4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your backend URL

5. Update frontend API calls to use `process.env.NEXT_PUBLIC_API_URL`

6. Deploy and verify functionality

### MongoDB Atlas Setup

1. Create free cluster at mongodb.com/cloud/atlas

2. Create database user with password

3. Whitelist IP addresses (0.0.0.0/0 for testing)

4. Get connection string and add to backend env vars

5. Run seed script with production database:

```bash
MONGODB_URI=<atlas_connection_string> npm run seed
```

## 📄 License

This project is created as a technical assignment for a developer position.

## 👨‍💻 Development Notes

- Backend uses ESLint with `no-console` rule (warnings suppressed for server logs)
- Frontend uses Next.js 16 App Router (not Pages Router)
- All components use TypeScript for type safety
- API calls use native fetch (no axios dependency)
- State management uses React hooks (no Redux/Zustand)
- Authentication uses localStorage (consider httpOnly cookies in production)

## 🤝 Support

For questions or issues, please contact the development team.
