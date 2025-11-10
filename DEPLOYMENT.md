# Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- PostgreSQL database (Neon, Supabase, or Railway)

## Step-by-Step Deployment

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Get a PostgreSQL Database

**Option A: Neon (Recommended - Free)**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)

**Option B: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection String → URI

**Option C: Railway**
1. Go to [railway.app](https://railway.app)
2. New Project → Provision PostgreSQL
3. Copy the DATABASE_URL

### 3. Deploy Backend to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Project Name:** `fueleu-backend`
   - **Root Directory:** `backend`
   - **Framework Preset:** Other
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add:
     ```
     DATABASE_URL = your_postgresql_connection_string
     NODE_ENV = production
     ```

6. Click **Deploy**
7. Copy your backend URL (e.g., `https://fueleu-backend.vercel.app`)

### 4. Deploy Frontend to Vercel

1. In Vercel Dashboard, click **"Add New Project"** again
2. Import the **same** GitHub repository
3. Configure:
   - **Project Name:** `fueleu-maritime`
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variable:**
   - Click "Environment Variables"
   - Add:
     ```
     VITE_API_URL = https://fueleu-backend.vercel.app
     ```
   (Use the backend URL from step 3.7)

5. Click **Deploy**

### 5. Initialize Database

After backend deployment, run Prisma migrations:

```bash
# Set your DATABASE_URL locally
$env:DATABASE_URL="your_postgresql_connection_string"

# Run migrations
cd backend
npx prisma migrate deploy
npx prisma db seed
```

Or use Vercel CLI:
```bash
npm i -g vercel
vercel env pull
cd backend
npx prisma migrate deploy
```

### 6. Test Your Deployment

Visit your frontend URL: `https://fueleu-maritime.vercel.app`

The app should now be live! 🎉

## Troubleshooting

**Backend Issues:**
- Check Vercel logs: Project → Deployments → Click deployment → Logs
- Verify DATABASE_URL is set correctly
- Ensure Prisma is generated: `npx prisma generate`

**Frontend Issues:**
- Check if VITE_API_URL points to backend
- Verify CORS is enabled in backend
- Check browser console for errors

**Database Issues:**
- Test connection string locally first
- Ensure database allows external connections
- Check if IP whitelist includes Vercel (usually allows all)

## Auto-Deploy on Git Push

Both projects will automatically redeploy when you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update VITE_API_URL if using custom domain for backend

## Monitoring

- **Analytics:** Vercel Dashboard → Analytics
- **Logs:** Vercel Dashboard → Deployments → View Logs
- **Performance:** Vercel Dashboard → Speed Insights
