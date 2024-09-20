/*
  Warnings:

  - Added the required column `fecha_expiracion` to the `Tarjeta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tarjeta" ADD COLUMN     "fecha_expiracion" TIMESTAMP(3) NOT NULL;
