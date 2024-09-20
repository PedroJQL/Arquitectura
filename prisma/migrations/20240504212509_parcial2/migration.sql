/*
  Warnings:

  - Added the required column `ldr` to the `estudiantes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pot` to the `estudiantes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "estudiantes" ADD COLUMN     "ldr" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "pot" DECIMAL(65,30) NOT NULL;
