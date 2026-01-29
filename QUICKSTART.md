# Quick Start Guide - Founders Circle

Get the Founders Circle platform running in minutes.

## ⚡ 5-Minute Setup

### Prerequisites

- Node.js 18+ ([download](https://nodejs.org/))
- MongoDB running locally ([install](https://www.mongodb.com/try/download/community))
- Git

### Backend (5 minutes)

```bash
# 1. Navigate to backend
cd Assignment/backend

# 2. Install dependencies
npm install

# 3. Create .env file
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/startup-benefits
JWT_SECRET=dev_secret_key" > .env

# 4. Seed database with sample deals
npm run seed

# 5. Start development server
npm run dev
```

✓ Backend running at `http://localhost:5000`

### Frontend (3 minutes)

Open a new terminal:

```bash
# 1. Navigate to frontend
cd Assignment/frontend

# 2. Install dependencies (if not done yet)
npm install

# 3. Start development server
npm run dev
```

✓ Frontend running at `http://localhost:3000`

## 🎯 Testing the Application

### 1. Homepage

- Visit `http://localhost:3000`
- See animated hero with value proposition
- Click "Browse deals" button

### 2. Deals Page

- View all 5 seeded deals
- Test filters:
  - Search: Try "analytics" or "cloud"
  - Category: Select "Cloud", "Analytics", etc.
  - Access: Toggle between "Public" and "Locked"

### 3. Create Account

- Click "Get started" or go to `/register`
- Fill form:
  - Name: Your name
  - Email: your@email.com
  - Password: At least 6 characters
  - Company: Optional
- Submit and verify redirect to dashboard

### 4. Dashboard

- View your profile
- See "Unverified" status badge
- Notice "No claimed deals yet"

### 5. Claim a Deal

- Go back to `/deals`
- Click any **public** deal (green access badge)
- Click "Claim deal" button
- See success message
- Return to dashboard to see claimed deal

### 6. Try Locked Deal

- View a **locked deal** (orange lock badge)
- Try to claim it
- See error: "Verification required"
- Notice: Locked deals need `verified: true` status

### 7. Logout & Login

- On dashboard, click "Logout"
- Go to `/login`
- Enter your email and password
- Verify you're back on dashboard with your claimed deals intact

## 📁 Project Structure

```
Assignment/
├── backend/
│   └── src/
│       ├── config/db.js          # MongoDB connection
│       ├── controllers/           # Request handlers
│       ├── models/                # Database schemas
│       ├── routes/                # API endpoints
│       ├── middleware/auth.js     # JWT verification
│       └── server.js              # Express app
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx           # Home page
        │   ├── deals/
        │   │   ├── page.tsx       # Deals listing
        │   │   └── [slug]/page.tsx # Deal details
        │   ├── dashboard/page.tsx # User dashboard
        │   ├── login/page.tsx     # Login
        │   └── register/page.tsx  # Registration
        └── components/            # UI components
```

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register     # Create account
POST   /api/auth/login        # Login (get JWT token)
GET    /api/auth/me           # Get current user (protected)
```

### Deals

```
GET    /api/deals             # List all deals
GET    /api/deals/:slug       # Get single deal
```

### Claims

```
POST   /api/claims/:dealId    # Claim a deal (protected)
GET    /api/claims/me         # Get user's claims (protected)
```

## 🎨 Features Overview

### Frontend Features

✓ Animated landing page with hero section
✓ Premium SaaS-style design with Tailwind CSS
✓ Smooth page transitions with Framer Motion
✓ Responsive mobile-first layout
✓ Search and filter functionality
✓ Authentication with JWT tokens
✓ User dashboard with claim tracking

### Backend Features

✓ RESTful API with Express.js
✓ MongoDB database with Mongoose
✓ JWT-based authentication
✓ Input validation and error handling
✓ Protected routes for authenticated users
✓ Deal filtering and search
✓ Claim management with duplicate prevention

### Security Features

✓ Password hashing with bcrypt
✓ JWT token-based authentication
✓ Protected API routes
✓ Access control for locked deals
✓ CORS enabled for development

## 🚀 Deployment

Ready to deploy? See [DEPLOYMENT.md](./DEPLOYMENT.md) for:

- Backend deployment to Render/Railway/Fly.io
- Frontend deployment to Vercel/Netlify
- MongoDB Atlas setup
- Environment variable configuration
- Production checklist

## 🐛 Troubleshooting

### MongoDB connection error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

→ Start MongoDB: `mongod` (or check MongoDB service status)

### Port already in use

```
Error: listen EADDRINUSE: address already in use :::5000
```

→ Change PORT in .env or kill process using port 5000

### Frontend can't connect to API

```
Error: fetch failed to http://localhost:5000/api/deals
```

→ Verify backend is running on port 5000
→ Check CORS is enabled (it is by default)

### Module not found errors

```
Error: Cannot find module 'express'
```

→ Run `npm install` in that directory

### .env file not loading

→ Verify .env file is in root of backend folder
→ Restart the server after creating .env

## 📚 Learning Resources

### Backend

- [Express.js docs](https://expressjs.com/)
- [Mongoose docs](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)

### Frontend

- [Next.js docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## 💡 Next Steps

1. **Understand the flow**: Read through [README.md](./README.md)
2. **Explore the code**: Check out controllers and components
3. **Try the API**: Test endpoints with curl or Postman
4. **Customize**: Modify deals, add features, change styling
5. **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md) when ready

## ❓ Common Questions

**Q: How do I verify a user?**
A: Manually in MongoDB: `db.users.updateOne({email: "user@email.com"}, {$set: {verified: true}})`

**Q: Can I use a different database?**
A: Yes, update MongoDB connection string in .env

**Q: How do I add more deals?**
A: Add to `backend/src/seed.js` and run `npm run seed`

**Q: How do I change the port?**
A: Update `PORT` in .env file

**Q: Is this production-ready?**
A: Development version - see DEPLOYMENT.md and README.md for production improvements needed

## 📝 License

Created as a full-stack developer assignment.

---

**Happy coding!** 🎉

Need help? Check the README.md or review the code comments.
