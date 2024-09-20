/*
  Warnings:

  - You are about to drop the `estudiante` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "estudiante";

-- CreateTable
CREATE TABLE "estudiantes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "carne" TEXT NOT NULL,
    "latitud" DECIMAL(65,30) NOT NULL,
    "longitud" DECIMAL(65,30) NOT NULL,
    "humedad" DECIMAL(65,30) NOT NULL,
    "temperatura" DECIMAL(65,30) NOT NULL,
    "device" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estudiantes_pkey" PRIMARY KEY ("id")
);
