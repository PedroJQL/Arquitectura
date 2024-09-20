/*
  Warnings:

  - Added the required column `monto` to the `TipoServicio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TipoServicio" ADD COLUMN     "monto" DOUBLE PRECISION NOT NULL;
