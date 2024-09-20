/*
  Warnings:

  - A unique constraint covering the columns `[id_cliente]` on the table `Tarjeta` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_cliente` to the `Tarjeta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tarjeta" ADD COLUMN     "id_cliente" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tarjeta_id_cliente_key" ON "Tarjeta"("id_cliente");

-- AddForeignKey
ALTER TABLE "Tarjeta" ADD CONSTRAINT "Tarjeta_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;
