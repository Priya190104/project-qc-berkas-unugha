# DEPLOYMENT GUIDE - VERCEL + RAILWAY

**Last Updated**: 10 Januari 2026  
**Status**: Production Ready ✅

---

## QUICK START - DEPLOY KE VERCEL (5 Menit)

### Prerequisite:
- ✅ GitHub account (sudah punya)
- ✅ Vercel account (gratis di vercel.com)
- ✅ Railway account (gratis di railway.app)
- ✅ Project sudah di GitHub: https://github.com/Priya190104/project-qc-berkas-unugha

---

## STEP 1: SETUP DATABASE DI RAILWAY

**1.1 Buat PostgreSQL Database**
```
1. Buka https://railway.app
2. Login atau signup dengan GitHub
3. Klik "New Project"
4. Pilih "Provision PostgreSQL"
5. Railway otomatis membuat database

Tunggu ~1-2 menit sampai selesai.
```

**1.2 Get Connection String**
```
1. Di Railway dashboard, klik PostgreSQL project
2. Buka tab "Connect"
3. Copy connection string di bawah "Database URL"
4. Format: postgresql://[user]:[password]@[host]:[port]/[database]

Simpan ini, akan dipakai di Step 2.
```

---

## STEP 2: DEPLOY KE VERCEL

**2.1 Import Project dari GitHub**
```
1. Buka https://vercel.com/new
2. Pilih "Import an existing project"
3. Paste GitHub repo URL: https://github.com/Priya190104/project-qc-berkas-unugha
4. Klik "Import"
```

**2.2 Configure Environment Variables**
```
Pada step "Configure Project", cari "Environment Variables"

Add variables:

Name: DATABASE_URL
Value: [Paste dari Railway - dari Step 1.2]
```

**2.3 Deploy**
```
1. Klik "Deploy"
2. Tunggu build process selesai (~3-5 menit)
3. Setelah berhasil, dapatkan URL: https://[project-name].vercel.app
```

---

## STEP 3: MIGRATE DATABASE

Setelah deploy berhasil, jalankan migrations di Railway database:

**Option A: Dari Local Machine (Recommended)**
```bash
# Set DATABASE_URL ke Railway connection string
set DATABASE_URL=postgresql://...

# Run migrations1. Vercel Dashboard > Project > Settings
2. Environment Variables
3. Cari DATABASE_URL
4. HAPUS value lama
5. PASTE value baru dari Railway
6. Klik "Save" atau "Update"
npx prisma migrate deploy

# Seed database (optional, untuk test data)
npm run db:seed
```

**Option B: Dari Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Run command di production
vercel env pull
DATABASE_URL=[railway-url] npx prisma migrate deploy
```

---

## STEP 4: VERIFY DEPLOYMENT

**4.1 Check App Status**
```
1. Buka https://[project-name].vercel.app
2. Seharusnya redirect ke /login
3. Jika login page muncul ✅ berarti berhasil
```

**4.2 Test Login**
```
Email: admin@example.com
Password: password

(Sesuaikan dengan data di database Anda)
```

**4.3 Check Vercel Logs**
```
1. Buka Vercel dashboard
2. Klik project
3. Tab "Deployments" > klik latest deployment
4. Lihat "Function Logs" untuk error details
```

---

## ENVIRONMENT VARIABLES YANG DIPERLUKAN

Vercel Environment Variables harus include:

| Variable | Value | Diperlukan |
|----------|-------|-----------|
| `DATABASE_URL` | Railway connection string | ✅ WAJIB |
| `JWT_SECRET` | Random string (misal: `your-secret-key-here`) | ❌ Optional (ada default) |
| `NODE_ENV` | `production` | ✅ Otomatis by Vercel |

**Best Practice untuk JWT_SECRET:**
```bash
# Generate secret (jalankan di local)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output dan paste di Vercel Environment Variables
```

---

## TROUBLESHOOTING - COMMON ISSUES

### Issue 1: Build Failed - Prisma Error
**Gejala**: `Error: Failed to collect page data for /api/auth/login`

**Solusi:**
```bash
# Di Vercel, Prisma memerlukan DATABASE_URL saat build
# Pastikan DATABASE_URL sudah di-set di Environment Variables

# Verifikasi:
1. Buka Vercel dashboard
2. Project > Settings > Environment Variables
3. Pastikan DATABASE_URL ada
```

### Issue 2: Database Connection Error
**Gejala**: `Error: Could not connect to database`

**Solusi:**
```
1. Verifikasi DATABASE_URL benar (copy-paste dari Railway)
2. Pastikan Railway database sudah running
3. Check firewall/IP whitelist di Railway:
   - Railway > Project > Data > PostgreSQL
   - Cek IP yang diallow
```

### Issue 3: Migrations Not Applied
**Gejala**: Tabel tidak ada, data tidak sesuai

**Solusi:**
```bash
# Run migrations manually
DATABASE_URL=[railway-url] npx prisma migrate deploy

# Atau seed database
DATABASE_URL=[railway-url] npm run db:seed
```

---

## VERCEL BUILD OPTIMIZATION

Untuk memastikan build selalu berhasil:

### 1. Disable Prisma Telemetry
```bash
# Di .env atau .env.local
PRISMA_SKIP_VALIDATION_WARNING=true
PRISMA_TELEMETRY_DISABLED=true
```

### 2. Pre-build Script
Create `vercel.json`:
```json
{
  "buildCommand": "npx prisma generate && next build",
  "outputDirectory": ".next"
}
```

### 3. Environment Setup
```
Vercel otomatis load .env variables dari Settings
Tidak perlu commit .env ke GitHub
```

---

## MONITORING & MAINTENANCE

### Check Deployment Status
```
https://vercel.com/dashboard/[project-name]
- Status: ✅ Running atau ❌ Failed
- Last deployment time
- Environment variables
```

### Database Backups
```
Railway otomatis backup setiap hari
Untuk extra safety:
1. Railway > Data > PostgreSQL
2. Tab "Backups"
3. Download backup jika perlu
```

### Performance Monitoring
```
Vercel Dashboard:
- Analytics tab: Lihat traffic & response time
- Function logs: Debug error messages
- Deployment history: Revert jika ada issue
```

---

## ROLLBACK STRATEGY

Jika deployment bermasalah:

**Quick Rollback:**
```
1. Vercel Dashboard > Deployments
2. Cari deployment sebelumnya yang stable
3. Klik "..."
4. Pilih "Promote to Production"
```

**Git Rollback:**
```bash
# Revert last commit di GitHub
git revert HEAD
git push origin main

# Vercel otomatis redeploy
```

---

## DEVELOPMENT VS PRODUCTION

### Development (Local)
```bash
# Local machine dengan local PostgreSQL
npm run dev

# Access: http://localhost:3000
# Database: localhost:5432
```

### Staging (Optional - di Vercel)
```
Buat branch terpisah (staging)
Connect ke Vercel sebagai preview
Test sebelum merge ke main
```

### Production (Vercel + Railway)
```
Main branch di GitHub
Auto-deploy saat push
Database: Railway PostgreSQL
URL: https://[project].vercel.app
```

---

## FIRST TIME SETUP CHECKLIST

- [ ] GitHub repo created: ProjectQCBerkas
- [ ] Railway PostgreSQL created
- [ ] DATABASE_URL dari Railway siap
- [ ] Vercel account created
- [ ] Import project dari GitHub ke Vercel
- [ ] Add DATABASE_URL di Vercel Environment Variables
- [ ] Deploy di Vercel
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Test login di https://[project].vercel.app/login
- [ ] Verify database: Pastikan tables ada di Railway

---

## VERCEL DEPLOYMENT SUMMARY

| Item | Status |
|------|--------|
| Build Time | ~3-5 menit |
| Database | Railway PostgreSQL |
| Cost | FREE (free tier Vercel + Railway) |
| Auto Deploy | ✅ Saat push ke GitHub main branch |
| Uptime | 99.95% (Vercel SLA) |
| Scaling | Automatic (serverless) |

---

## NEXT STEPS AFTER DEPLOYMENT

1. **Setup Custom Domain** (Optional)
   ```
   Vercel Settings > Domains > Add custom domain
   Update DNS di domain registrar
   ```

2. **Setup Email Notifications** (Optional)
   ```
   Vercel > Notifications > Add email
   Notifikasi jika deployment failed
   ```

3. **Setup Monitoring** (Optional)
   ```
   Vercel Analytics untuk track performance
   ```

4. **Database Backup Strategy**
   ```
   Railway otomatis backup
   Download backup mingguan ke S3/Google Drive
   ```

---

## SUPPORT & RESOURCES

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Ready to deploy? Start with STEP 1 above!** 🚀

Questions? Refer ke section TROUBLESHOOTING atau check logs di Vercel dashboard.
