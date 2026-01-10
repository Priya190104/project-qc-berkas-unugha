# Sistem QC Berkas

Aplikasi tracking dan quality control berkas pertanahan untuk BPN Cilacap, dibangun dengan Next.js 14, TypeScript, PostgreSQL, TailwindCSS, dan Shadcn/ui.

## Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript
- **Styling**: TailwindCSS + Shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Form**: React Hook Form + Zod

## Prerequisites

- Node.js 18+ dan npm
- PostgreSQL 12+
- Git

## Setup

### 1. Setup Database

Buat database PostgreSQL baru:
\\\ash
createdb qc_berkas_db
\\\

### 2. Environment Variables

Salin \.env.local\ dan update DATABASE_URL Anda:
\\\ash
cp .env.example .env.local
\\\

Edit DATABASE_URL di .env.local:
\\\
DATABASE_URL="postgresql://user:password@localhost:5432/qc_berkas_db"
\\\

### 3. Install Dependencies

\\\ash
npm install
\\\

### 4. Setup Database Schema

\\\ash
npx prisma migrate dev --name init
\\\

### 5. Run Development Server

\\\ash
npm run dev
\\\

Aplikasi akan berjalan di http://localhost:3000

## Project Structure

\\\
src/
 app/                    # Next.js App Router
    dashboard/         # Halaman dashboard
    berkas/            # Halaman daftar berkas
       create/        # Form tambah berkas baru
    settings/          # Halaman pengaturan & user management
    api/               # API routes
    layout.tsx         # Root layout
 components/            # React components
    sidebar.tsx        # Sidebar navigasi
    app-layout.tsx     # Layout wrapper
    ui/                # Shadcn/ui components
    dashboard/         # Dashboard components
    berkas/            # Berkas components
 lib/
    db.ts              # Prisma client
    constants.ts       # Konstanta dan utility functions
    utils.ts           # Shadcn utility functions
 styles/                # Global styles
prisma/
 schema.prisma          # Database schema
 migrations/            # Database migrations
\\\

## Features

-  Dashboard dengan statistik berkas
-  Daftar berkas dengan filter dan search
-  Form pembuatan berkas baru dengan validasi
-  Multi-tahap status berkas (Data Berkas, Ukur, Pemetaan, KKS, KASI, Selesai)
-  Manajemen user dan role (Admin, Quality Control, Petugas Ukur, Pemetaan, KKS, KASI)
-  Tracking riwayat perjalanan berkas
-  SLA configuration per jenis permohonan
-  Export data ke Excel
-  Responsive UI dengan TailwindCSS

## Workflow

### Proses Pengelolaan Berkas

1. **Data Berkas** - Input awal berkas dari loket
2. **Data Ukur** - KKS membuat ST Pengukuran
3. **Pemetaan** - Petugas ukur melakukan pengukuran dan integrasi pemetaan
4. **KKS** - Koreksi dan approval dari KKS (revisi atau ACC)
5. **KASI** - Approval final dari KASI (revisi atau ACC)
6. **Selesai** - Berkas selesai dan siap diserahkan

## API Endpoints (TODO)

- \GET /api/berkas\ - Daftar berkas
- \POST /api/berkas\ - Buat berkas baru
- \GET /api/berkas/:id\ - Detail berkas
- \PUT /api/berkas/:id\ - Update berkas
- \DELETE /api/berkas/:id\ - Hapus berkas
- \GET /api/users\ - Daftar user
- \POST /api/users\ - Buat user baru

## Development

### Generate Prisma Client

\\\ash
npx prisma generate
\\\

### View Database

\\\ash
npx prisma studio
\\\

### Format Code

\\\ash
npm run format
\\\

### Lint

\\\ash
npm run lint
\\\

## Production Deployment

### 1. Build

\\\ash
npm run build
\\\

### 2. Start

\\\ash
npm start
\\\

### Recommended Hosting

- Vercel (Next.js native)
- Railway (Full-stack)
- AWS (EC2 + RDS)
- DigitalOcean (VPS)

## Troubleshooting

### Database Connection Error
- Pastikan PostgreSQL running
- Cek DATABASE_URL di .env.local
- Run \
px prisma migrate dev\

### Port 3000 sudah digunakan
\\\ash
npm run dev -- -p 3001
\\\

### Prisma Client error
\\\ash
npx prisma generate
npm install
\\\

## Contributing

1. Create feature branch (\git checkout -b feature/AmazingFeature\)
2. Commit changes (\git commit -m 'Add AmazingFeature'\)
3. Push to branch (\git push origin feature/AmazingFeature\)
4. Open Pull Request

## License

MIT

## Contact

BPN Cilacap - Sistem QC Berkas
