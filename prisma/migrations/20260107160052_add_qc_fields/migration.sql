-- AlterTable
ALTER TABLE "berkas" ADD COLUMN     "qcKasiKeterangan" TEXT,
ADD COLUMN     "qcKasiOleh" TEXT,
ADD COLUMN     "qcKasiStatus" TEXT,
ADD COLUMN     "qcKasiTanggal" TIMESTAMP(3),
ADD COLUMN     "qcKksKeterangan" TEXT,
ADD COLUMN     "qcKksOleh" TEXT,
ADD COLUMN     "qcKksStatus" TEXT,
ADD COLUMN     "qcKksTanggal" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "riwayat_berkas" ADD COLUMN     "qcStatus" TEXT,
ADD COLUMN     "qcType" TEXT;
