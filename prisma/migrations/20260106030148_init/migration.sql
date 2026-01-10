-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berkas" (
    "id" TEXT NOT NULL,
    "noBerkas" TEXT NOT NULL,
    "di302" TEXT,
    "tanggal302" TIMESTAMP(3),
    "namaPemohon" TEXT NOT NULL,
    "jenisPermohonan" TEXT NOT NULL,
    "statusTanah" TEXT,
    "kecamatan" TEXT,
    "desa" TEXT,
    "luas" TEXT,
    "nib" TEXT,
    "notaris" TEXT,
    "biayaUkur" DOUBLE PRECISION,
    "statusBerkas" TEXT NOT NULL DEFAULT 'DATA_BERKAS',
    "tanggalBerkas" TIMESTAMP(3),
    "keterangan" TEXT,
    "koordinatorUkur" TEXT,
    "nip" TEXT,
    "suratTugasAn" TEXT,
    "petugasUkur" TEXT,
    "noGu" TEXT,
    "noStpPersiapuanUkur" TEXT,
    "tanggalStpPersiapuan" TIMESTAMP(3),
    "posisiBerkasUkur" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "berkas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riwayat_berkas" (
    "id" TEXT NOT NULL,
    "berkasId" TEXT NOT NULL,
    "statusLama" TEXT NOT NULL,
    "statusBaru" TEXT NOT NULL,
    "diterima" TEXT,
    "diteruskan" TEXT,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riwayat_berkas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "berkas_noBerkas_key" ON "berkas"("noBerkas");
