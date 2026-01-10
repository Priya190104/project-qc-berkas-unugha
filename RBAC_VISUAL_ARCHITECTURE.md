# RBAC SYSTEM - VISUAL ARCHITECTURE

---

## 1. ROLE HIERARCHY & PERMISSIONS

```
┌─────────────────────────────────────────────────────────────────┐
│                      APLIKASI RUKUN TERNAK                      │
│                    RBAC System Architecture                      │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────┐
                    │      5 ROLES         │
                    └──────────────────────┘
                              │
                    ┌─────────┼─────────┬─────────┬──────────┐
                    │         │         │         │          │
                    ▼         ▼         ▼         ▼          ▼
                 ┌────┐  ┌──────┐  ┌──────┐  ┌────────┐  ┌──┐
                 │ADMIN│  │DATA_B│  │DATA_U│  │DATA_P  │  │QC│
                 └────┘  │ERKAS │  │KUR   │  │EMETAAN │  └──┘
                   ▲     └──────┘  └──────┘  └────────┘   │
                   │        │        │          │         │
                   │        ▼        ▼          ▼         ▼
                   │      ┌─────────────────────────────┐
                   └─────▶│   PERMISSION MATRIX         │
                          │  (Role-Action-Section)      │
                          └─────────────────────────────┘
```

---

## 2. REQUEST FLOW - CREATE BERKAS

```
User (Frontend)
    │
    ├─ canCreate hook check ◄─ (Shows/Hides button)
    │
    ▼
    Form Input
    │
    ├─ Data validation (client-side)
    │
    ▼
    POST /api/berkas
    │
    ├─ Authorization Header: Bearer {JWT token}
    │
    ▼
    Backend: extractUserFromRequest()
    │
    ├─ Parse JWT token
    │
    ▼
    Backend: Role Validation
    │
    ├─ canPerformAction(role, 'create')
    │
    ├─ If not ADMIN or DATA_BERKAS:
    │   └─▶ Return 403 Forbidden
    │
    ├─ If DATA_BERKAS:
    │   └─▶ Validate field permissions ◄─ (NEW)
    │
    ▼
    Backend: Field Validation
    │
    ├─ Required fields check
    ├─ noBerkas uniqueness check
    │
    ▼
    Database: Create Berkas
    │
    ├─ Insert berkas record
    ├─ Insert riwayat record
    │
    ▼
    Response: 201 Created
    │
    └─▶ Frontend: Redirect to detail page
```

---

## 3. REQUEST FLOW - EDIT BERKAS

```
User (Frontend)
    │
    ├─ canEdit hook check ◄─ (Shows/Hides button)
    │
    ▼
    Edit Form Input
    │
    ├─ Sections conditionally disabled per role
    │
    ▼
    PUT /api/berkas/{id}
    │
    ├─ Authorization Header: Bearer {JWT token}
    │
    ▼
    Backend: extractUserFromRequest()
    │
    ▼
    Backend: Role Validation
    │
    ├─ canPerformAction(role, 'edit')
    │
    ├─ If not editable:
    │   └─▶ Return 403 Forbidden
    │
    ▼
    Backend: Section Detection
    │
    ├─ Detect which sections being edited
    │
    ▼
    Backend: Per-Section Validation
    │
    ├─ For each edited section:
    │   ├─ canEditSection(role, section)
    │   │
    │   ├─ If not authorized:
    │   │   └─▶ Return 403 Forbidden
    │   │
    │   └─ If authorized:
    │       └─▶ Filter & update only authorized fields
    │
    ▼
    Database: Update Berkas
    │
    ├─ Update authorized fields only
    ├─ Insert riwayat record
    │
    ▼
    Response: 200 OK
    │
    └─▶ Frontend: Show success message
```

---

## 4. REQUEST FLOW - DELETE BERKAS

```
User (Frontend)
    │
    ├─ canDelete hook check ◄─ (Shows/Hides button)
    │
    ▼
    DELETE /api/berkas/{id}
    │
    ├─ Authorization Header: Bearer {JWT token}
    │
    ▼
    Backend: extractUserFromRequest()
    │
    ▼
    Backend: Role Validation
    │
    ├─ canPerformAction(role, 'delete')
    │
    ├─ If not ADMIN:
    │   └─▶ Return 403 Forbidden
    │       "Only ADMIN can delete"
    │
    ▼
    Database: Delete Berkas
    │
    ├─ Delete berkas record
    ├─ Create riwayat: status = DELETED
    │
    ▼
    Response: 200 OK
    │
    └─▶ Frontend: Remove from list
```

---

## 5. REQUEST FLOW - LOGIN

```
User Input (Email, Password)
    │
    ▼
    POST /api/auth/login
    │
    ▼
    Backend: Validate Input
    │
    ├─ email required
    ├─ password required
    │
    ▼
    Backend: Find User
    │
    ├─ SELECT * FROM User WHERE email = ?
    │
    ├─ If not found:
    │   └─▶ Return 401 "Email atau password salah"
    │
    ▼
    Backend: Check Active Status ◄─ (CRITICAL)
    │
    ├─ IF user.active == false:
    │   └─▶ Return 403 "Akun Anda telah dinonaktifkan"
    │
    ├─ IF user.active == true:
    │   └─▶ Continue to password check
    │
    ▼
    Backend: Validate Password
    │
    ├─ Compare provided password with stored password
    │
    ├─ If not match:
    │   └─▶ Return 401 "Email atau password salah"
    │
    ▼
    Backend: Generate JWT Token
    │
    ├─ Create token with:
    │   ├─ userId
    │   ├─ email
    │   ├─ name
    │   ├─ role ◄─ (IMPORTANT)
    │
    ▼
    Response: 200 OK
    │
    ├─ token
    ├─ user data (including role)
    │
    ▼
    Frontend: Save Token & User
    │
    ├─ localStorage.setItem('token', token)
    ├─ localStorage.setItem('currentUser', user)
    ├─ setCurrentUser(user)
    │
    ▼
    Frontend: Redirect to Dashboard
    │
    ├─ Check user role
    ├─ Render menu accordingly
    │
    └─▶ Dashboard loaded with correct menu
```

---

## 6. MENU RENDERING - DYNAMIC

```
Sidebar Component Loads
    │
    ▼
    useEffect: Check if Admin
    │
    ├─ isAdmin() from auth library
    │
    ▼
    Conditional Menu Building
    │
    ├─ baseMenuItems = [Dashboard, Berkas]
    │
    ├─ If isAdmin():
    │   ├─ adminMenuItems = [Settings]
    │   └─ menuItems = [...baseMenuItems, ...adminMenuItems]
    │
    └─ If not Admin:
        └─ menuItems = baseMenuItems only
    │
    ▼
    Render Menu
    │
    ├─ Dashboard     ◄─ All roles
    ├─ Berkas        ◄─ All roles
    ├─ Pengaturan    ◄─ ADMIN only
    │
    └─▶ UI Updated
```

---

## 7. SETTINGS PAGE ACCESS

```
User Access /settings
    │
    ▼
    SettingsPage Component Loads
    │
    ▼
    useEffect: Check Admin Status
    │
    ├─ isAdmin() check
    │
    ├─ If NOT admin:
    │   ├─ router.push('/dashboard')
    │   └─▶ Redirect (seamless, no error)
    │
    └─ If Admin:
        ├─ fetchUsers() from API
        └─▶ Display user management UI
```

---

## 8. CREATE FORM - SECTION DISABLING

```
Data Berkas User opens Create Form
    │
    ▼
    Form Renders 3 Sections:
    │
    ├─ DATA_BERKAS
    │   ├─ canEditSection(role, 'DATA_BERKAS') = true
    │   ├─ Header: BLUE
    │   ├─ Inputs: ENABLED
    │   └─ Badge: (none)
    │
    ├─ DATA_UKUR
    │   ├─ canEditSection(role, 'DATA_UKUR') = false
    │   ├─ Header: GREY
    │   ├─ Inputs: DISABLED (can't type)
    │   ├─ Background: Light grey (opacity-60%)
    │   └─ Badge: "Read-Only"
    │
    └─ DATA_PEMETAAN
        ├─ canEditSection(role, 'DATA_PEMETAAN') = false
        ├─ Header: GREY
        ├─ Inputs: DISABLED (can't type)
        ├─ Background: Light grey (opacity-60%)
        └─ Badge: "Read-Only"
    │
    ▼
    Submit Button
    │
    ├─ canCreate && canEditSection('DATA_BERKAS') = true
    └─▶ Button ENABLED (blue)
```

---

## 9. PERMISSION CHECK - CODE FLOW

```
┌─────────────────────────────────────────────────────┐
│          PERMISSION CHECK FLOW                      │
└─────────────────────────────────────────────────────┘

Frontend Hook: useCanAction('create')
    │
    ▼
    Call checkAction('create') from auth/index.ts
    │
    ▼
    Get currentUser from localStorage/memory
    │
    ▼
    Call canPerformAction(user.role, 'create')
        from auth/roles.ts
    │
    ├─ Lookup: ROLE_PERMISSIONS[user.role]
    │
    ├─ Check: permissions.canCreate
    │
    └─▶ Return true or false
    │
    ▼
    Component receives boolean
    │
    ├─ If true:  Show button
    └─ If false: Hide button
```

---

## 10. SECTION EDITING - DECISION TREE

```
                    User edits Berkas
                          │
                          ▼
        Detect which sections are being edited
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
    DATA_BERKAS       DATA_UKUR        DATA_PEMETAAN
        │                 │                 │
        ▼                 ▼                 ▼
    Can user edit   Can user edit   Can user edit
    DATA_BERKAS?    DATA_UKUR?      DATA_PEMETAAN?
        │                 │                 │
    ┌───┴───┐          ┌───┴───┐       ┌───┴───┐
    │       │          │       │       │       │
   YES     NO        YES     NO      YES     NO
    │       │          │       │       │       │
    ▼       ▼          ▼       ▼       ▼       ▼
  Allow   Reject    Allow   Reject  Allow   Reject
   Edit   Edit      Edit    Edit    Edit    Edit
    │       │         │       │      │       │
    └───┬───┴─────────┼───┬───┴──────┼───┬───┘
        │             │   │         │   │
        └─────────────┤   └─────────┤───┘
                      │             │
                      ▼             ▼
                  All Sections   Summary
                   Checked       Response
                      │
                      ├─ If any rejected:
                      │   └─▶ 403 Forbidden
                      │       (list unauthorized sections)
                      │
                      └─ If all allowed:
                          └─▶ Update berkas
                              └─▶ 200 OK
```

---

## 11. SECURITY LAYERS

```
┌────────────────────────────────────────────────────┐
│            SECURITY DEFENSE IN DEPTH               │
└────────────────────────────────────────────────────┘

Layer 1: FRONTEND UI
┌──────────────────────────────────────────┐
│ - Buttons hidden per role                │
│ - Form sections disabled per role        │
│ - Page access redirect per role          │
│ - Menu filtered per role                 │
└──────────────────────────────────────────┘
         ↓ (Cannot bypass alone)
         ↓

Layer 2: AUTHENTICATION
┌──────────────────────────────────────────┐
│ - JWT token required for API calls       │
│ - Token contains role information        │
│ - Token expiry enforcement               │
└──────────────────────────────────────────┘
         ↓ (Cannot bypass with bad token)
         ↓

Layer 3: AUTHORIZATION (Role-Level)
┌──────────────────────────────────────────┐
│ - canPerformAction(role, action)         │
│ - ADMIN, DATA_BERKAS, DATA_UKUR, etc    │
│ - Separate check per endpoint            │
└──────────────────────────────────────────┘
         ↓ (Cannot bypass by guessing role)
         ↓

Layer 4: SECTION VALIDATION
┌──────────────────────────────────────────┐
│ - canEditSection(role, section)          │
│ - Per-section permission matrix          │
│ - Prevents cross-section editing         │
└──────────────────────────────────────────┘
         ↓ (Cannot bypass by finding pattern)
         ↓

Layer 5: FIELD VALIDATION
┌──────────────────────────────────────────┐
│ - Field-level validation                 │
│ - Required fields check                  │
│ - Email uniqueness check                 │
│ - noBerkas uniqueness check              │
│ - Data type validation                   │
└──────────────────────────────────────────┘
         ↓ (Cannot bypass with malformed data)
         ↓

Layer 6: USER STATUS
┌──────────────────────────────────────────┐
│ - user.active check at login             │
│ - Inactive users rejected                │
│ - Cannot be bypassed via API             │
└──────────────────────────────────────────┘
         ↓
         ▼
    ✅ SECURE
```

---

## 12. DATABASE STATE TRACKING

```
User Action
    │
    ▼
Berkas Created/Updated/Deleted
    │
    ├─▶ Update Berkas table
    │   ├─ id, noBerkas, statusBerkas, etc
    │   └─ updatedAt timestamp
    │
    └─▶ Insert RiwayatBerkas record
        ├─ berkasId
        ├─ statusLama
        ├─ statusBaru
        ├─ diterima: user.name
        ├─ catatan: action details
        └─ createdAt: timestamp
    │
    ▼
Audit Trail Created
    │
    └─▶ Can review:
        - Who made change
        - When change was made
        - What changed (old → new status)
        - Why (catatan field)
```

---

## 13. ROLE ASSIGNMENT FLOW

```
Admin edits User Role
    │
    ▼
User clicks Edit (pencil icon)
    │
    ▼
EditUserModal opens
    │
    ├─ Current role: DATA_BERKAS
    ├─ Dropdown options: [ADMIN, DATA_BERKAS, DATA_UKUR, DATA_PEMETAAN, QUALITY_CONTROL]
    │
    ▼
Admin selects: DATA_UKUR
    │
    ▼
Click Save
    │
    ▼
PATCH /api/petugas/users/{userId}
{
  "role": "DATA_UKUR"
}
    │
    ▼
Backend: Validate role
    │
    ├─ Is valid enum value?
    └─▶ Update user.role in database
    │
    ▼
Response: 200 OK
    │
    ├─ UI updates user list
    │
    ▼
Next time user logs in:
    │
    └─▶ New role active
        - Different menu
        - Different permissions
        - Different form sections
```

---

This visual architecture shows how all components work together to enforce RBAC throughout the application.
