# Vercel Environment Variables Setup Guide

## ⚠️ CRITICAL: JWT_SECRET Configuration

### Problem
HTTP 403 Forbidden errors occur in production (Vercel) when attempting to update berkas via PUT /api/berkas/:id, even though the same operation works perfectly in localhost.

### Root Cause
The `JWT_SECRET` environment variable is not properly configured in Vercel. The JWT token is created during login with one secret, but the backend cannot verify/decode it during the request because it uses a different (or missing) secret.

**In localhost**: Falls back to `'dev-secret-key-change-in-production'`  
**In Vercel**: If JWT_SECRET is not set, authentication fails silently, causing 401/403 errors

### Solution

#### Step 1: Set JWT_SECRET in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Add new environment variable:
   - **Name**: `JWT_SECRET`
   - **Value**: Use ANY consistent secret (minimum 32 characters recommended)
   - **Environments**: Select `Production`, `Preview`, and `Development`

**Example values:**
```
my-super-secret-jwt-key-production-2026-do-not-share
```

4. Click **Save**
5. **IMPORTANT**: Redeploy the application:
   - Go to **Deployments**
   - Click the three-dot menu (⋯) on the latest failed deployment
   - Click **Redeploy**

#### Step 2: Verify DATABASE_URL is Set

Ensure these variables are also configured:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` (if using NextAuth) - any random string

#### Step 3: Check Logs After Redeploy

After redeploy, monitor the logs for auth errors:

1. **Vercel Dashboard** → **Deployments** → Click latest deployment
2. **View Build Logs** - Look for auth-related errors
3. **Runtime Logs** - After deployment, test the PUT request and check for:
   - `DEBUG: User extracted successfully`
   - `DEBUG: User authenticated successfully`

If you see error logs like:
```
ERROR: Failed to parse JWT payload
ERROR: Authentication failed - user extraction returned null
```

The JWT_SECRET is still mismatched.

### Files That Depend on JWT_SECRET

- `/src/app/api/auth/login/route.ts` - Creates JWT tokens
- `/src/lib/auth/middleware.ts` - Validates JWT tokens
- `/src/app/api/berkas/[id]/route.ts` - Uses extractUserFromRequest()

### Debugging Commands

To verify token creation in production, check browser console (Network tab) when logging in:
- Look at POST /api/auth/login response
- Verify `token` field is present

### Important Notes

⚠️ **DO NOT** commit JWT_SECRET to git or repository  
✅ **Always** use Vercel's Environment Variables panel  
✅ **Test** the PUT endpoint after setting JWT_SECRET  
✅ **Redeploy** is required after changing environment variables

### Testing the Fix

1. Login with test credentials
2. Edit any berkas data
3. Click "Simpan"
4. Should see success message, not 403 error
5. Check Vercel logs for DEBUG messages confirming authentication

---

**If problems persist after this setup:**
1. Check that JWT_SECRET was saved and is visible in Vercel dashboard
2. Verify Redeploy completed successfully (green checkmark)
3. Clear browser cache and try again
4. Check Vercel runtime logs for specific error messages
