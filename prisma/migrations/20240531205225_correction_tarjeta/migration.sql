/*
  Warnings:

  - Made the column `no_tarjeta` on table `Cuenta` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Cuenta" DROP CONSTRAINT "Cuenta_no_tarjeta_fkey";

-- AlterTable
ALTER TABLE "Cuenta" ALTER COLUMN "no_tarjeta" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Cuenta" ADD CONSTRAINT "Cuenta_no_tarjeta_fkey" FOREIGN KEY ("no_tarjeta") REFERENCES "Tarjeta"("no_tarjeta") ON DELETE RESTRICT ON UPDATE CASCADE;
