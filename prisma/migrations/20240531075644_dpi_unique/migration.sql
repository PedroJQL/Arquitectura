/*
  Warnings:

  - A unique constraint covering the columns `[DPI]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Cliente_DPI_key" ON "Cliente"("DPI");
