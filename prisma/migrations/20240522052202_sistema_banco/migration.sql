/*
  Warnings:

  - You are about to drop the `estudiantes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sensor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "estudiantes";

-- DropTable
DROP TABLE "sensor";

-- DropTable
DROP TABLE "usuarios";

-- CreateTable
CREATE TABLE "Tarjeta" (
    "no_tarjeta" INTEGER NOT NULL,
    "titular" TEXT NOT NULL,
    "fecha_afiliacion" TIMESTAMP(3) NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Tarjeta_pkey" PRIMARY KEY ("no_tarjeta")
);

-- CreateTable
CREATE TABLE "TipoServicio" (
    "id_tipo_servicio" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "TipoServicio_pkey" PRIMARY KEY ("id_tipo_servicio")
);

-- CreateTable
CREATE TABLE "PagoServicio" (
    "id_pago" SERIAL NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT NOT NULL,
    "no_cuenta" TEXT NOT NULL,
    "no_tarjeta" INTEGER NOT NULL,
    "id_tipo_servicio" INTEGER NOT NULL,

    CONSTRAINT "PagoServicio_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id_cliente" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "e_mail" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "DPI" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "Cuenta" (
    "no_cuenta" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo_cuenta" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL,
    "estado" BOOLEAN NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_empleado" INTEGER,
    "no_tarjeta" INTEGER,

    CONSTRAINT "Cuenta_pkey" PRIMARY KEY ("no_cuenta")
);

-- CreateTable
CREATE TABLE "Transferencia" (
    "id_transferencia" SERIAL NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha_transferencia" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "no_cuenta_origen" TEXT NOT NULL,
    "no_cuenta_destino" TEXT NOT NULL,

    CONSTRAINT "Transferencia_pkey" PRIMARY KEY ("id_transferencia")
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id_empleado" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "e_mail" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "id_rol" INTEGER NOT NULL,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id_empleado")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id_rol" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "Usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre_usuario" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL,
    "contrasena" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_empleado" INTEGER,
    "id_cliente" INTEGER,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- AddForeignKey
ALTER TABLE "PagoServicio" ADD CONSTRAINT "PagoServicio_no_tarjeta_fkey" FOREIGN KEY ("no_tarjeta") REFERENCES "Tarjeta"("no_tarjeta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoServicio" ADD CONSTRAINT "PagoServicio_id_tipo_servicio_fkey" FOREIGN KEY ("id_tipo_servicio") REFERENCES "TipoServicio"("id_tipo_servicio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoServicio" ADD CONSTRAINT "PagoServicio_no_cuenta_fkey" FOREIGN KEY ("no_cuenta") REFERENCES "Cuenta"("no_cuenta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuenta" ADD CONSTRAINT "Cuenta_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuenta" ADD CONSTRAINT "Cuenta_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado"("id_empleado") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuenta" ADD CONSTRAINT "Cuenta_no_tarjeta_fkey" FOREIGN KEY ("no_tarjeta") REFERENCES "Tarjeta"("no_tarjeta") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_no_cuenta_origen_fkey" FOREIGN KEY ("no_cuenta_origen") REFERENCES "Cuenta"("no_cuenta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_no_cuenta_destino_fkey" FOREIGN KEY ("no_cuenta_destino") REFERENCES "Cuenta"("no_cuenta") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "Rol"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado"("id_empleado") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuarios" ADD CONSTRAINT "Usuarios_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id_cliente") ON DELETE SET NULL ON UPDATE CASCADE;
