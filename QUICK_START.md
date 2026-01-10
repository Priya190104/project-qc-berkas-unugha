# RBAC System - Quick Start Guide

## What's Been Implemented

✅ Complete Role-Based Access Control (RBAC) system
✅ JWT Authentication with login/logout
✅ 5 Roles with defined permissions
✅ Section-based edit restrictions
✅ 5 Test users pre-created
✅ All API endpoints protected

## 30-Second Quick Start

### Step 1: Start Dev Server
```bash
npm run dev
# Server runs at http://localhost:3000
```

### Step 2: Login & Get Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Copy the returned token
```

### Step 3: Test API with Token
```bash
curl -X GET http://localhost:3000/api/berkas \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password | ADMIN (Full Access) |
| berkas@example.com | password | DATA_BERKAS (Limited) |
| ukur@example.com | password | DATA_UKUR (Limited) |
| pemetaan@example.com | password | DATA_PEMETAAN (Limited) |
| qc@example.com | password | QUALITY_CONTROL (Read-only) |

## Key Features

### 5 Roles
- **ADMIN**: Full access, can delete, approve all
- **DATA_BERKAS**: Can create and edit DATA_BERKAS section
- **DATA_UKUR**: Can edit DATA_UKUR section only
- **DATA_PEMETAAN**: Can edit DATA_PEMETAAN section only
- **QUALITY_CONTROL**: Can view and approve (read-only edit)

### Secure Endpoints
- `GET /api/berkas` - List (all roles)
- `POST /api/berkas` - Create (ADMIN, DATA_BERKAS)
- `PUT /api/berkas/[id]` - Update (section-based)
- `POST /api/berkas/[id]/move-stage` - Approve (all except QC can initiate)
- `GET /api/berkas/[id]/print` - Print (all roles)

### Auth Endpoints
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/session` - Verify token
- `POST /api/auth/logout` - Logout

## What's in the Code

### Backend Files
- `src/lib/auth/roles.ts` - Permission definitions
- `src/lib/auth/middleware.ts` - Auth validation
- `src/app/api/auth/*` - Authentication endpoints
- `src/app/api/berkas/*` - Protected berkas endpoints

### Frontend Files
- `src/lib/auth/index.ts` - Utility functions
- `src/lib/auth/hooks.ts` - React hooks
- `src/lib/auth/context.tsx` - Auth context

### Documentation
- `RBAC_IMPLEMENTATION.md` - Detailed guide
- `AUTH_TESTING_GUIDE.md` - API testing examples
- `IMPLEMENTATION_STATUS.md` - Full status report

## Next: Frontend Integration (TODO)

1. Create login page at `/login`
2. Wrap app with `<AuthProvider>`
3. Use hooks in components:
   ```typescript
   import { useCanAction, useCanEditSection } from '@/lib/auth/hooks'
   
   const canCreate = useCanAction('create')
   const canEdit = useCanEditSection('DATA_BERKAS')
   ```
4. Build protected UI based on permissions

## Testing Workflow

### Test 1: ADMIN Can Do Everything
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' | jq -r '.token')

# Should work - can create
curl -X POST http://localhost:3000/api/berkas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"noBerkas":"TEST001","namaPemohon":"Test"}'
```

### Test 2: DATA_BERKAS Can Only Edit DATA_BERKAS
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"berkas@example.com","password":"password"}' | jq -r '.token')

# Should work - editing DATA_BERKAS field
curl -X PUT http://localhost:3000/api/berkas/[id] \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"noBerkas":"EDITED"}'

# Should FAIL - trying to edit DATA_UKUR field
curl -X PUT http://localhost:3000/api/berkas/[id] \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"noGu":"UKU123"}'  # Error: 403 Forbidden
```

### Test 3: QC Can Only View & Move Stage
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"qc@example.com","password":"password"}' | jq -r '.token')

# Should work - viewing
curl -X GET http://localhost:3000/api/berkas \
  -H "Authorization: Bearer $TOKEN"

# Should FAIL - cannot create
curl -X POST http://localhost:3000/api/berkas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'  # Error: 403 Forbidden
```

## Architecture

```
Request → JWT Parser → Extract User → Check Role → Check Action → Check Section → Execute
                                                         ↓
                                                  Permission Matrix
```

## Permission Matrix

```
         View  Create Edit  Delete MoveStage Print EditSections
ADMIN     ✓      ✓     ✓     ✓      ✓       ✓   All (3)
DATA_B    ✓      ✓     ✓     ✗      ✓       ✓   DATA_BERKAS
DATA_U    ✓      ✗     ✓     ✗      ✓       ✓   DATA_UKUR
DATA_P    ✓      ✗     ✓     ✗      ✓       ✓   DATA_PEMETAAN
QC        ✓      ✗     ✗     ✗      ✓       ✓   None
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build           # Production build
npm start               # Run production server

# Database
npm run db:seed         # Create test users
npx prisma studio      # View database GUI

# Testing
curl -X GET http://localhost:3000/api/berkas \
  -H "Authorization: Bearer TOKEN"
```

## Troubleshooting

**Q: JWT parsing error**
A: Check token format: `Authorization: Bearer <TOKEN>` (with space after Bearer)

**Q: 403 Permission Denied**
A: Check role in RBAC_CHECKLIST.md - role may not have that permission

**Q: Test users not found**
A: Run `npm run db:seed` to create them

**Q: Build fails**
A: Run `npm install` to ensure all deps are installed

## Files Changed

- Added: 20+ new auth files
- Modified: package.json, prisma/schema.prisma
- Documentation: 3 comprehensive guides

## Security Notes

⚠️ **For Production**:
1. Use proper JWT library (`jsonwebtoken`)
2. Add bcrypt for password hashing
3. Use environment variables for secrets
4. Add rate limiting
5. Add CSRF protection
6. Implement token refresh
7. Add input validation
8. Use HTTPS only

## Support

See detailed guides:
- `RBAC_IMPLEMENTATION.md` - Full technical details
- `AUTH_TESTING_GUIDE.md` - Complete API examples
- `IMPLEMENTATION_STATUS.md` - Status and next steps

---

**Status**: ✅ Complete & Working
**Build**: ✅ Passing (no errors)
**Test Users**: ✅ 5 created
**API**: ✅ 3 auth + 5 berkas endpoints protected
