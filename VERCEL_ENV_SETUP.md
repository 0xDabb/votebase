# Vercel Environment Variables Setup Guide

## ⚠️ CRITICAL: DATABASE_URL Configuration

### ❌ WRONG (Current - Causes SSL Error)
```
DATABASE_URL = ${POSTGRES_PRISMA_URL}
```

**Problem:** Vercel does NOT support variable interpolation in environment variables.
The `${...}` syntax is treated as a literal string, causing Prisma connection to fail.

### ✅ CORRECT (Fixed)
```
DATABASE_URL = postgres://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

**Solution:** Copy the ACTUAL value from `POSTGRES_PRISMA_URL` and paste it directly into `DATABASE_URL`.

---

## 📋 Step-by-Step Fix Instructions

### Step 1: Get the Connection String
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `bote-app-new`
3. Go to **Settings** → **Environment Variables**
4. Find `POSTGRES_PRISMA_URL`
5. Click **"Reveal"** to see the value
6. **Copy the entire connection string** (starts with `postgres://`)

### Step 2: Update DATABASE_URL
1. In the same Environment Variables page
2. Find `DATABASE_URL`
3. Click **"Edit"**
4. **Delete** the current value: `${POSTGRES_PRISMA_URL}`
5. **Paste** the actual connection string you copied in Step 1
6. Click **"Save"**

### Step 3: Verify All Environments
Make sure to update for:
- ✅ Production
- ✅ Preview
- ✅ Development

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **"..."** menu → **"Redeploy"**
4. Wait for deployment to complete

---

## 🔍 How to Verify the Fix

### Check Build Logs
After redeployment, check logs for:
- ✅ `Prisma schema loaded from prisma/schema.prisma`
- ✅ `Prisma Client generated`
- ❌ No `Connection timeout` errors
- ❌ No `Invalid connection string` errors

### Check Function Logs
1. Go to **Deployments** → Latest → **Functions**
2. Click on any function (e.g., `/api/categories`)
3. Check logs for:
   - ✅ Successful database queries
   - ❌ No Prisma errors

### Test the Site
1. Open your deployment URL
2. Site should load without SSL error
3. Projects and categories should display

---

## 📊 Required Environment Variables

### Production Environment
```bash
# Database (Supabase)
DATABASE_URL="postgres://postgres.xxx:pass@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true"

# NextAuth
NEXTAUTH_URL="https://votebase.vercel.app"
NEXTAUTH_SECRET="votebase-nextauth-secret-2024-production"

# Admin
ADMIN_PASSWORD="bote2024"

# Supabase (Auto-added by Vercel Integration)
POSTGRES_URL="..."
POSTGRES_PRISMA_URL="..."
POSTGRES_URL_NON_POOLING="..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_JWT_SECRET="..."
```

---

## 🎯 Expected Result

After fixing `DATABASE_URL`:
- ✅ Site loads successfully
- ✅ No SSL protocol error
- ✅ Database queries work
- ✅ Projects and categories display
- ✅ Admin panel accessible

---

**Last Updated:** 2 January 2026, 02:26
**Status:** Ready to implement
