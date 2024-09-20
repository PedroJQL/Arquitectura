/*
  Warnings:

  - You are about to alter the column `no_tarjeta` on the `Cuenta` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `no_tarjeta` on the `PagoServicio` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `Tarjeta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `no_tarjeta` on the `Tarjeta` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "Cuenta" DROP CONSTRAINT "Cuenta_no_tarjeta_fkey";

-- DropForeignKey
ALTER TABLE "PagoServicio" DROP CONSTRAINT "PagoServicio_no_tarjeta_fkey";

-- AlterTable
ALTER TABLE "Cuenta" ALTER COLUMN "no_tarjeta" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "PagoServicio" ALTER COLUMN "no_tarjeta" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Tarjeta" DROP CONSTRAINT "Tarjeta_pkey",
ALTER COLUMN "no_tarjeta" SET DATA TYPE INTEGER,
ADD CONSTRAINT "Tarjeta_pkey" PRIMARY KEY ("no_tarjeta");

-- AddForeignKey
ALTER TABLE "PagoServicio" ADD CONSTRAINT "PagoServicio_no_tarjeta_fkey" FOREIGN KEY ("no_tarjeta") REFERENCES "Tarjeta"("no_tarjeta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuenta" ADD CONSTRAINT "Cuenta_no_tarjeta_fkey" FOREIGN KEY ("no_tarjeta") REFERENCES "Tarjeta"("no_tarjeta") ON DELETE SET NULL ON UPDATE CASCADE;
