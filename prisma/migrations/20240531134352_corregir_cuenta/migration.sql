/*
  Warnings:

  - You are about to drop the column `id_empleado` on the `Cuenta` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cuenta" DROP CONSTRAINT "Cuenta_id_empleado_fkey";

-- AlterTable
ALTER TABLE "Cuenta" DROP COLUMN "id_empleado";
