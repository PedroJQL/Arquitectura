/*
  Warnings:

  - The primary key for the `Tarjeta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contrasena` on the `Usuarios` table. All the data in the column will be lost.
  - Added the required column `clave` to the `Usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cuenta" DROP CONSTRAINT "Cuenta_no_tarjeta_fkey";

-- DropForeignKey
ALTER TABLE "PagoServicio" DROP CONSTRAINT "PagoServicio_no_tarjeta_fkey";

-- AlterTable
ALTER TABLE "Cuenta" ALTER COLUMN "no_tarjeta" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "PagoServicio" ALTER COLUMN "no_tarjeta" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Tarjeta" DROP CONSTRAINT "Tarjeta_pkey",
ALTER COLUMN "no_tarjeta" SET DATA TYPE BIGINT,
ADD CONSTRAINT "Tarjeta_pkey" PRIMARY KEY ("no_tarjeta");

-- AlterTable
ALTER TABLE "Usuarios" DROP COLUMN "contrasena",
ADD COLUMN     "clave" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PagoServicio" ADD CONSTRAINT "PagoServicio_no_tarjeta_fkey" FOREIGN KEY ("no_tarjeta") REFERENCES "Tarjeta"("no_tarjeta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuenta" ADD CONSTRAINT "Cuenta_no_tarjeta_fkey" FOREIGN KEY ("no_tarjeta") REFERENCES "Tarjeta"("no_tarjeta") ON DELETE SET NULL ON UPDATE CASCADE;
