-- AddColumn noStp and tanggalStp to berkas table
ALTER TABLE "berkas" ADD COLUMN "noStp" TEXT;
ALTER TABLE "berkas" ADD COLUMN "tanggalStp" TIMESTAMP(3);
