# Deployment Guide - Founders Circle

This guide will walk you through deploying the Founders Circle platform to production.

## Prerequisites

- GitHub account (free)
- Vercel account (free, or use alternative)
- MongoDB Atlas account (free tier available)
- Node.js 18+ installed locally

## Step 1: Prepare for Deployment

### Backend (.env Configuration)

```env
# Production environment variables
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<generate-a-strong-random-string>
NODE_ENV=production
```

**Example MongoDB URI format:**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database-name>
```

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (free tier)
4. Create database user
5. Get connection string
6. Whitelist your server IP (or 0.0.0.0/0 for testing)

## Step 2: Deploy Backend

### Option A: Deploy to Render

1. Push backend code to GitHub
2. Go to https://render.com
3. New → Web Service → Connect GitHub repo
4. Configure:
   - Name: `founders-circle-api`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Region: Choose closest to users
5. Add environment variables from .env
6. Deploy
7. Note the deployed URL (e.g., `https://founders-circle-api.onrender.com`)

### Option B: Deploy to Railway

1. Go to https://railway.app
2. New Project → GitHub Repo
3. Add environment variables
4. Deploy
5. Note the deployed URL

### Option C: Deploy to Fly.io

```bash
# Install Fly CLI
# Go to project directory
fly auth login
fly launch  # Follow prompts
fly deploy
```

## Step 3: Deploy Frontend

### Deploy to Vercel (Recommended)

1. Go to https://vercel.com
2. Import project from GitHub
3. Configure:
   - Framework: Next.js
   - Root Directory: `Assignment/frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
5. Deploy
6. Get deployed URL (e.g., `https://founders-circle.vercel.app`)

### Deploy to Netlify

1. Build frontend:

```bash
cd Assignment/frontend
npm run build
```

2. Deploy `.next` folder to Netlify
3. Add environment variables in Netlify dashboard

## Step 4: Verify Production Deployment

1. Test homepage loads
2. Test deals page loads from API
3. Test search/filter functionality
4. Create account (registration)
5. Login and access dashboard
6. Try claiming a deal
7. Verify claimed deal appears on dashboard

## Post-Deployment Checklist

- [ ] Update JWT_SECRET to strong random string
- [ ] Enable HTTPS (automatic on Render/Vercel)
- [ ] Set up MongoDB backups
- [ ] Configure CORS to specific frontend domain
- [ ] Enable rate limiting on auth routes
- [ ] Set up error logging (Sentry)
- [ ] Monitor API response times
- [ ] Test email notifications (if implemented)
- [ ] Set up SSL certificate
- [ ] Configure domain name (if custom domain)

## Environment Variables Reference

### Backend (.env)

```
PORT=5000                    # Port (auto-set on most platforms)
MONGODB_URI=...              # MongoDB connection string
JWT_SECRET=...               # Strong random string for JWT signing
NODE_ENV=production          # Set to production for deployment
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=https://your-api-url  # Backend API URL
```

## Scaling Considerations

### For 100+ Concurrent Users

1. **Database**
   - Upgrade MongoDB cluster
   - Enable automatic backups
   - Consider database sharding

2. **Backend**
   - Deploy multiple instances behind load balancer
   - Enable caching with Redis
   - Use CDN for static assets

3. **Frontend**
   - Use Vercel's edge functions for optimization
   - Enable image optimization
   - Implement analytics

### For 1000+ Concurrent Users

1. **Separate Services**
   - Auth service
   - Deals service
   - Claims service

2. **Infrastructure**
   - Kubernetes orchestration
   - Auto-scaling groups
   - Global CDN

3. **Database**
   - Read replicas
   - Database sharding
   - Backup locations

## Monitoring & Maintenance

### Set up Error Tracking

```bash
# Install Sentry
npm install @sentry/node

# Add to server.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### Monitor API Health

```bash
# Add health check endpoint
GET /health
→ Returns 200 with database connection status
```

### Database Maintenance

- Set up automated backups (MongoDB Atlas)
- Monitor storage usage
- Clean up old logs monthly
- Review slow queries

## Troubleshooting

### Backend won't start

```bash
# Check MongoDB connection
mongosh --uri $MONGODB_URI

# Check port availability
netstat -ano | findstr :5000

# View logs
tail -f logs/app.log
```

### Frontend can't connect to API

- Verify NEXT_PUBLIC_API_URL is set correctly
- Check CORS headers on backend
- Verify firewall isn't blocking API
- Check browser console for errors

### Database connection fails

- Verify connection string is correct
- Check MongoDB Atlas IP whitelist
- Verify database credentials
- Ensure database exists

## Rollback Procedure

### On Render/Railway

1. Go to deployment history
2. Click "Deploy" on previous version
3. Wait for rollback to complete

### On GitHub

```bash
git revert <commit-hash>
git push
# Auto-redeploy triggers
```

## Security Best Practices

- [ ] Rotate JWT_SECRET every 6 months
- [ ] Enable 2FA on GitHub and cloud accounts
- [ ] Use API keys instead of passwords
- [ ] Enable HTTPS everywhere
- [ ] Set security headers
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Cost Estimation

### Free Tier (Development)

- **Render/Railway Backend**: Free tier
- **Vercel Frontend**: Free tier
- **MongoDB Atlas**: Free tier (512MB)
- **Total**: $0/month

### Small Scale Production (1000 DAU)

- **Backend**: ~$7-15/month (basic instance)
- **Frontend**: Free on Vercel
- **Database**: ~$9/month (M10 cluster)
- **Total**: ~$16-24/month

### Large Scale Production (100k+ DAU)

- **Backend**: ~$100-300/month (scaled instances)
- **Frontend**: ~$100/month (Vercel Pro)
- **Database**: ~$300-500/month (M30+ cluster)
- **CDN/Storage**: ~$50-100/month
- **Monitoring**: ~$50-100/month
- **Total**: ~$600-1000/month

## Support

For deployment issues:

1. Check platform documentation
2. Review error logs
3. Check GitHub issues
4. Contact platform support

---

Happy deploying! 🚀
