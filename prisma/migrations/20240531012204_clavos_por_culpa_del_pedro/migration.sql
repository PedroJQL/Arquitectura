-- DropForeignKey
ALTER TABLE "PagoServicio" DROP CONSTRAINT "PagoServicio_no_tarjeta_fkey";

-- AlterTable
ALTER TABLE "PagoServicio" ALTER COLUMN "no_tarjeta" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PagoServicio" ADD CONSTRAINT "PagoServicio_no_tarjeta_fkey" FOREIGN KEY ("no_tarjeta") REFERENCES "Tarjeta"("no_tarjeta") ON DELETE SET NULL ON UPDATE CASCADE;
