const express = require('express'); 
const session = require('express-session');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const cors = require('cors');
const path = require('path');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT;
app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', "front")));

app.use(session({
    secret: 'mi-secreto-super-seguro',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000 // 1 hora en milisegundos
    }
}));
const { Client } = require('pg');

// Configuración de la conexión a la base de datos
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'usuarios',
    password: 'umgcobanthebest',
    port: 5432,
});
// configuración de la base de datos para POOL 
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'usuarios',
  password: 'umgcobanthebest',
  port: 5432,
});

module.exports = { pool };
//----obtener id de cliente para sesssion--------------------------------
app.use((req, res, next) => {
    // Verificar si el usuario está autenticado y tiene un ID de usuario en la sesión
    if (req.session && req.session.userId) {
      res.locals.userId = req.session.userId;
    } else {
      res.locals.userId = null;
    }
    next();
  });

//------------GET/POST AUTH-LOGIN---------------------
// Ruta para servir el archivo login.html en /auth
app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'front', 'templates', 'login.html'));
});
// Ruta de autenticación para verificar credenciales
app.post('/auth', async (req, res) => {
    const { nombre_usuario, clave } = req.body;
    try {
        const user = await prisma.usuarios.findUnique({
            where: { nombre_usuario },
            include: {
                cliente: true,
                empleado: true
            }
        });

        if (user && user.clave === clave) {
            let redirectionPath = '/';
            let userId = null; // Inicializa el ID del usuario como nulo
            if (user.empleado) {
                const role = await prisma.rol.findUnique({
                    where: { id_rol: user.empleado.id_rol }
                });
                if (role.descripcion === 'Administrador') {
                    redirectionPath = '/cuenta';
                } else if (role.descripcion === 'Cajero') {
                    redirectionPath = '/empleado';
                }
            } else {
                redirectionPath = '/clientes';
                // Si el usuario autenticado es un cliente, establece el ID del cliente como userId
                userId = user.cliente.id_cliente;
            }
            // Envía el ID del usuario junto con la redirección
            res.status(200).json({ message: 'Autenticación exitosa', redirectionPath, userId });
        } else {
            res.status(401).json({ message: 'Nombre de usuario o clave incorrectos' });
        }
    } catch (error) {
        console.error('Error durante la autenticación:', error);
        res.status(500).send('Error del servidor');
    }
});

//--output------
// Endpoint para cerrar sesión
app.post('/logout', (req, res) => {
    // Verifica si la sesión está disponible antes de intentar destruirla
    if (req.session) {
        // Destruye la sesión
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al cerrar sesión:', err);
                res.status(500).json({ error: 'Error interno del servidor' });
            } else {
                res.json({ message: 'Sesión cerrada exitosamente' });
                res.redirect('/front/templates/login.html');
            }
        });
    } else {
        // Si la sesión no está disponible, devuelve un error
        res.status(400).json({ error: 'Sesión no encontrada' });
    }
});


//------------GET/POST CUENTA---------------------
app.get('/cuenta', async (req, res)=>{
    res.sendFile(path.join(__dirname, '..', 'front', 'templates', 'homeCuentas.html'));
});

app.post('/cuenta', async (req, res)=>{
    const cuenta = await prisma.Cuenta.create({
        data: req.body
    })
    res.json(cuenta);
});
//----------obtener saldo para tarjeta----------------
app.get('/api/saldo/:noTarjeta', async (req, res) => {
    const { noTarjeta } = req.params;
    try {
        const cuenta = await prisma.Cuenta.findFirst({
            where: { no_tarjeta: noTarjeta },
            select: {
                saldo: true
            }
        });

        if (cuenta) {
            res.json({ saldo: cuenta.saldo });
        } else {
            res.status(404).json({ error: 'Cuenta no encontrada' });
        }
    } catch (error) {
        console.error('Error obteniendo el saldo:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});
//---------- obtener cuenta --------------------
app.get('/api/saldo/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT saldo FROM "Tarjeta" WHERE no_tarjeta = $1', [userId]);
        client.release();
        
        if (result.rows.length > 0) {
            res.json({ saldo: result.rows[0].saldo });
        } else {
            res.status(404).json({ error: 'Cuenta no encontrada' });
        }
    } catch (error) {
        console.error('Error obteniendo el saldo:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

//------------OBTENER CUENTAS USUARIOS------------
app.get('/api/cuenta-origen/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const cuenta = await prisma.Cuenta.findFirst({
            where: { id_cliente: parseInt(userId) },
            select: {
                no_cuenta: true,
                saldo: true
            }
        });

        if (cuenta) {
            res.json(cuenta);
        } else {
            res.status(404).json({ error: 'Cuenta no encontrada' });
        }
    } catch (error) {
        console.error('Error obteniendo la cuenta de origen:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

//---------POST TRANSFERENCIAS--------------------------------
app.post('/api/transferir', async (req, res) => {
    const { userId, monto, descripcion, no_cuenta_destino } = req.body;

    try {
        // Obtener la cuenta de origen del usuario
        const cuentaOrigen = await prisma.cuenta.findFirst({
            where: { id_cliente: parseInt(userId) }
        });

        if (!cuentaOrigen) {
            return res.status(404).json({ error: 'Cuenta de origen no encontrada' });
        }
        if (!no_cuenta_destino) {
            return res.status(404).json({ error: 'Cuenta de destino no encontrada' });
        }
        const no_cuenta_origen = cuentaOrigen.no_cuenta;

        // Verificar que la cuenta de origen y destino no sean la misma
        if (no_cuenta_origen === no_cuenta_destino) {
            return res.status(400).json({ error: 'Operación inválida: no puede transferir entre la misma cuenta' });
        }

        // Verificar que el saldo sea suficiente
        if (cuentaOrigen.saldo < monto) {
            return res.status(400).json({ error: 'Saldo insuficiente' });
        }

        // Realizar la transferencia
        const transferencia = await prisma.$transaction([
            prisma.cuenta.update({
                where: { no_cuenta: no_cuenta_origen },
                data: { saldo: { decrement: monto } }
            }),
            prisma.cuenta.update({
                where: { no_cuenta: no_cuenta_destino },
                data: { saldo: { increment: monto } }
            }),
            prisma.transferencia.create({
                data: {
                    monto: monto,
                    fecha_transferencia: new Date(),
                    descripcion: descripcion,
                    no_cuenta_origen: no_cuenta_origen,
                    no_cuenta_destino: no_cuenta_destino
                }
            })
        ]);

        res.json({ saldo: cuentaOrigen.saldo - monto });
    } catch (error) {
        console.error('Error realizando la transferencia:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

  
//------------OBETENER LAS TRANSACCIONES----------------------
app.get('/api/transacciones/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const transacciones = await prisma.transferencia.findMany({
            where: {
                OR: [
                    { cuenta_origen: { id_cliente: parseInt(userId) } },
                    { cuenta_destino: { id_cliente: parseInt(userId) } }
                ]
            },
            select: {
                id_transferencia: true,
                descripcion: true,
                monto: true,
                fecha_transferencia: true,
                cuenta_origen: {
                    select: {
                        no_cuenta: true
                    }
                },
                cuenta_destino: {
                    select: {
                        no_cuenta: true
                    }
                }
            }
        });
        res.json(transacciones);
    } catch (error) {
        console.error('Error obteniendo las transacciones:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});


//------------GET obtener cuenta origen---------------------
// Obtener saldo por número de tarjeta
// Conectar a la base de datos
client.connect()
    .then(() => {
        console.log('Conexión exitosa a la base de datos');
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos:', err);
    });

// Consulta para obtener el saldo por número de tarjeta
const obtenerSaldoPorTarjeta = async (noTarjeta) => {
    try {
<<<<<<< HEAD
        // Verificar si el tipo de servicio existe
        const servicio = await prisma.tipoServicio.findUnique({
            where: { id_tipo_servicio: parseInt(id_tipo_servicio) }
        });

        if (!servicio) {
            return res.status(404).json({ error: 'Tipo de servicio no encontrado' });
        }

        // Verificar el saldo suficiente
        const saldoCliente = await obtenerSaldoCliente(no_cuenta);
        if (saldoCliente < parseFloat(monto)) {
            return res.status(400).json({ error: 'Saldo insuficiente' });
        }

        // Crear el pago del servicio
        const pago = await prisma.pagoServicio.create({
            data: {
                fecha_pago: new Date(),
                monto: parseFloat(monto),
                descripcion: descripcion,
                no_cuenta: no_cuenta,
                id_tipo_servicio: parseInt(id_tipo_servicio),
                no_tarjeta:"1234"
            }
        });

        // Actualizar el saldo del cliente
        await actualizarSaldoCliente(no_cuenta, saldoCliente - parseFloat(monto));
        
        res.json(pago);
=======
        const query = 'SELECT saldo FROM cuentas WHERE no_tarjeta = $1';
        const result = await client.query(query, [noTarjeta]);
        return result.rows.length > 0 ? result.rows[0].saldo : null;
>>>>>>> 4b0e7a17fe900aaca07b1e5c3d2519d276ddca93
    } catch (error) {
        console.error('Error al obtener el saldo de la tarjeta:', error);
        throw error;
    }
};

module.exports = { obtenerSaldoPorTarjeta };
//------------obtener salod por tarjeta ------------------
// Endpoint para obtener el saldo por número de tarjeta
app.get('/saldo', async (req, res) => {
    const { noTarjeta } = req.query;
    try {
        const saldo = await obtenerSaldoPorTarjeta(noTarjeta);
        res.json({ saldo });
    } catch (error) {
        console.error('Error al obtener el saldo:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
//------------GET/POST PAGOS SERVICIOS---------------------
app.post('/pagos', async (req, res) => {
    const { id_tipo_servicio, monto, descripcion, fecha_pago, no_tarjeta, no_cuenta } = req.body;
    const client = await pool.connect();
    
    try {
<<<<<<< HEAD
        const cuentaCliente = await prisma.cuenta.findUnique({
            where: { no_cuenta }
        });
        return cuentaCliente ? cuentaCliente.saldo : 0; // Devolver el saldo si se encuentra la cuenta, de lo contrario, devolver 0
=======
        await client.query('BEGIN');
        
        // Insertar el pago en la tabla PagoServicio
        const pagoResult = await client.query(
            'INSERT INTO "PagoServicio" (fecha_pago, monto, descripcion, no_cuenta, no_tarjeta, id_tipo_servicio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [fecha_pago, monto, descripcion, no_cuenta, no_tarjeta, id_tipo_servicio]
        );

        // Actualizar el saldo de la cuenta
        const updateSaldoResult = await client.query(
            'UPDATE "Cuenta" SET saldo = saldo - $1 WHERE no_cuenta = $2 RETURNING saldo',
            [monto, no_cuenta]
        );

        const updatedSaldo = updateSaldoResult.rows[0].saldo;

        await client.query('COMMIT');
        
        res.json({ saldo: updatedSaldo });
>>>>>>> 4b0e7a17fe900aaca07b1e5c3d2519d276ddca93
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al realizar el pago:', error);
        res.status(500).json({ error: 'Error al realizar el pago' });
    } finally {
        client.release();
    }
});

app.get('/api/cuenta-por-tarjeta/:noTarjeta', async (req, res) => {
    const { noTarjeta } = req.params;
    try {
        const cuenta = await prisma.cuenta.findFirst({
            where: {
                no_tarjeta: noTarjeta
            }
        });
        if (cuenta) {
            res.json({ no_cuenta: cuenta.no_cuenta });
        } else {
            res.status(404).json({ error: 'Cuenta no encontrada' });
        }
    } catch (error) {
        console.error('Error al obtener la cuenta por tarjeta:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

async function actualizarSaldoCliente(no_cuenta, nuevoSaldo) {
    try {
        await prisma.Cuenta.update({
            where: { no_cuenta },
            data: { saldo: nuevoSaldo }
        });
    } catch (error) {
        console.error('Error al actualizar el saldo del cliente:', error);
        throw new Error('Error al actualizar el saldo del cliente');
    }
}



  
//------------GET/POST CLIENTE---------------------
app.get('/clientes', async (req, res)=>{
    try{
        res.sendFile(path.join(__dirname, '..', 'front', 'templates', 'homeUsuario.html'));

    }catch(error){
        console.error('error buscando usuarios:', error);
        res.status(500).send('error del serivor')
    }
});

// Endpoint POST para crear un nuevo cliente
app.post('/clientes', async (req, res) => {
    try {
        const { nombres, apellidos, telefono, e_mail, fecha_nacimiento, fecha_creacion, DPI } = req.body;

        console.log('Datos del cliente recibidos:', req.body);

        // Verificar si ya existe un cliente con el mismo DPI
        const existingClient = await prisma.cliente.findUnique({
            where: { DPI }
        });

        if (existingClient) {
            return res.status(400).json({ error: 'Ya existe un cliente con este DPI' });
        }

        // Si no existe, guardar el cliente en la base de datos
        const cliente = await prisma.cliente.create({
            data: {
                nombres,
                apellidos,
                telefono,
                e_mail,
                fecha_nacimiento: new Date(fecha_nacimiento), // Convertir fecha a objeto Date
                DPI,
                fecha_creacion: new Date() // Establecer la fecha de creación automáticamente
            }
        });

        res.json(cliente);
    } catch (error) {
        console.error('Error en el endpoint /clientes:', error); // Registrar cualquier error con detalles
        res.status(500).json({ error: 'Error interno del servidor', details: error.message }); // Devolver un mensaje de error detallado
    }
});
//-----------post tarjeta----------------------------
app.post('/tarjetas', async (req, res) => {
    try {
        const { no_tarjeta, titular, fecha_afiliacion, fecha_expiracion, saldo, id_cliente } = req.body;

        console.log('Datos de la tarjeta recibidos:', req.body);

        // Verificar si ya existe una tarjeta con el mismo número
        const existingCard = await prisma.tarjeta.findUnique({
            where: {
                no_tarjeta: no_tarjeta
            }
        });

        // Si ya existe una tarjeta con el mismo número, devolver un error
        if (existingCard) {
            return res.status(400).json({ error: 'Ya existe una tarjeta con este número' });
        }

        // Calcular la fecha de expiración sumando 3 años a la fecha de afiliación
        const fecha_expiracions = new Date(fecha_afiliacion);
        fecha_expiracions.setFullYear(fecha_expiracions.getFullYear() + 3);

        // Si no existe, guardar la tarjeta en la base de datos
        const tarjeta = await prisma.tarjeta.create({
            data: {
                no_tarjeta,
                titular,
                fecha_afiliacion: new Date(),
                fecha_expiracion,
                saldo,
                // Conectar la tarjeta con el cliente utilizando la relación `tarjeta`
                cliente: {
                    connect: {
                        id_cliente: parseInt(id_cliente)
                    }
                }
            }
        });

        res.json(tarjeta);
    } catch (error) {
        console.error('Error en el endpoint /tarjetas:', error); // Registrar cualquier error
        res.status(500).json({ error: 'Error interno del servidor' }); // Devolver un mensaje de error
    }
});
//-----------obtener la tarjeta-----
// Endpoint para obtener la información de la tarjeta
app.get('/tarjetas/:no_tarjeta', async (req, res) => {
    const { no_tarjeta } = req.params;

    try {
        const tarjeta = await pool.query('SELECT no_tarjeta, titular, saldo FROM "Tarjeta" WHERE no_tarjeta = $1', [no_tarjeta]);

        if (tarjeta.rows.length === 0) {
            return res.status(404).json({ error: 'Tarjeta no encontrada' });
        }

        res.json(tarjeta.rows[0]);
    } catch (error) {
        console.error('Error al obtener la tarjeta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Endpoint para actualizar el saldo de la tarjeta
app.post('/tarjetas/:no_tarjeta/add-saldo', async (req, res) => {
    const { no_tarjeta } = req.params;
    const { monto } = req.body;

    try {
        const tarjeta = await pool.query('SELECT saldo FROM "Tarjeta" WHERE no_tarjeta = $1', [no_tarjeta]);

        if (tarjeta.rows.length === 0) {
            return res.status(404).json({ error: 'Tarjeta no encontrada' });
        }

        const nuevoSaldo = tarjeta.rows[0].saldo + monto;

        await pool.query('UPDATE "Tarjeta" SET saldo = $1 WHERE no_tarjeta = $2', [nuevoSaldo, no_tarjeta]);

        res.json({ nuevoSaldo });
    } catch (error) {
        console.error('Error al agregar saldo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
app.get('/check-uid', async (req, res) => {
    try {
        const { uid } = req.query;

        const existingCard = await prisma.tarjeta.findUnique({
            where: {
                no_tarjeta: uid
            }
        });

        if (existingCard) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error en el endpoint /check-uid:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


let pendingUIDs = []; // Cola en memoria para almacenar los UIDs pendientes

app.post('/send-uid', (req, res) => {
    const { uid } = req.body;
    pendingUIDs.push(uid); // Añadir el UID a la cola
    res.status(200).json({ message: 'UID recibido' });
});

app.get('/get-uid', (req, res) => {
    if (pendingUIDs.length > 0) {
        const uid = pendingUIDs.shift(); // Sacar el primer UID de la cola
        res.json({ uid });
    } else {
        res.status(204).json({ message: 'No hay UIDs pendientes' });
    }
});

//-------------POST PARA CREAR CUENTAS --------------------------------
app.post('/cuentas', async (req, res) => {
    try {
        const { no_cuenta, descripcion, tipo_cuenta, fecha_creacion, saldo, id_cliente, no_tarjeta } = req.body;

        // Verificar si ya existe una cuenta con el mismo número
        const existingAccount = await prisma.cuenta.findUnique({
            where: {
                no_cuenta: no_cuenta
            }
        });

        // Si ya existe una cuenta con el mismo número, devolver un error
        if (existingAccount) {
            return res.status(400).json({ error: 'Ya existe una cuenta con este número' });
        }

        // Si no existe, guardar la cuenta en la base de datos
        const cuenta = await prisma.cuenta.create({
            data: {
                no_cuenta,
                descripcion,
                tipo_cuenta,
                fecha_creacion: new Date(),
                saldo,
                id_cliente: parseInt(id_cliente),
                no_tarjeta
            }
        });

        res.json(cuenta);
    } catch (error) {
        console.error('Error en el endpoint /cuentas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//---- obtener la cruenta de cliente con id---

app.get('/clientes/:idCliente', async (req, res) => {
    try {
        const idCliente = parseInt(req.params.idCliente);

        // Consulta para obtener datos del cliente y sus cuentas asociadas
        const cliente = await prisma.cliente.findUnique({
            where: {
                id_cliente: idCliente
            },
            include: {
                cuenta: true,
                tarjeta: true
            }
        });

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.json(cliente);
    } catch (error) {
        console.error('Error al obtener los datos del cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
//-------------POST PARA USUARIOS --------------------------------
// Endpoint para crear usuarios
app.post('/usuarios', async (req, res) => {
    try {
        const { nombre_usuario, fecha_creacion, clave, descripcion, id_empleado, id_cliente } = req.body;

        // Verificar que al menos uno de los dos ID (id_empleado o id_cliente) esté presente
        if (!id_empleado && !id_cliente) {
            return res.status(400).json({ error: 'Debe proporcionar un id_empleado o un id_cliente' });
        }

        // Crear el usuario
        const usuario = await prisma.usuarios.create({
            data: {
                nombre_usuario,
                fecha_creacion: new Date(fecha_creacion),
                clave,
                descripcion,
                id_empleado: id_empleado || null,
                id_cliente: id_cliente || null,
            },
        });

        res.json(usuario);
    } catch (error) {
        console.error('Error en el endpoint /usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Endpoint para obtener el nombre del cliente basado en el ID
app.get('/clientes/nombre/:idCliente', async (req, res) => {
    try {
        const idCliente = parseInt(req.params.idCliente);
        const cliente = await prisma.cliente.findUnique({
            where: {
                id_cliente: idCliente
            },
            select: {
                nombres: true,
                apellidos: true
            }
        });

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.json({ nombre: `${cliente.nombres} ${cliente.apellidos}` });
    } catch (error) {
        console.error('Error al obtener el nombre del cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// Endpoint para obtener el nombre del empleado basado en el ID
app.get('/empleados/nombre/:idEmpleado', async (req, res) => {
    try {
        const idEmpleado = parseInt(req.params.idEmpleado);
        const empleado = await prisma.empleado.findUnique({
            where: {
                id_empleado: idEmpleado
            },
            select: {
                nombres: true,
                apellidos: true
            }
        });

        if (!empleado) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        res.json({ nombre: `${empleado.nombres} ${empleado.apellidos}` });
    } catch (error) {
        console.error('Error al obtener el nombre del empleado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//------------GET/POST EMPLEADOS---------------------
app.get('/empleado', async (req, res)=>{
    try{
        res.sendFile(path.join(__dirname, '..', 'front', 'templates', 'homeAddSaldo.html'));

    }catch(error){
        console.error('error buscando usuarios:', error);
        res.status(500).send('error del serivor')
    }
});

app.post('/empleados', async (req, res) => {
    try {
        const { nombres, apellidos, telefono, e_mail, fecha_nacimiento, id_rol } = req.body;

        // Verificar si el rol existe
        const rol = await prisma.Rol.findUnique({
            where: { id_rol: parseInt(id_rol) }
        });

        if (!rol) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }

        const empleado = await prisma.empleado.create({
            data: {
                nombres,
                apellidos,
                telefono,
                e_mail,
                fecha_nacimiento: new Date(),
                rol: {
                    connect: { id_rol: parseInt(id_rol) }
                }
            }
        });

        res.json(empleado);
    } catch (error) {
        console.error('Error en el endpoint /empleados:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


//------------GET/POST ROLES---------------------
app.get('/rol', async (req, res)=>{
    try{
        const rol = await prisma.Rol.findMany();
        res.json(rol);

    }catch(error){
        console.error('error buscando usuarios:', error);
        res.status(500).send('error del serivor')
    }
});
//----------obtener el id rol--------------------------------
app.get('/roles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const rol = await prisma.Rol.findUnique({
            where: { id_rol: parseInt(id) }
        });
        if (!rol) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }
        res.json({ id: rol.id_rol });
    } catch (error) {
        console.error('Error al obtener el ID del rol:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.post('/rol', async (req, res)=>{
    const rol = await prisma.Rol.create({
        data: req.body
    })
    res.json(rol);
});

//------------GET/POST TARJETA---------------------

app.get('/tarjeta', async (req, res)=>{
    try{
        const tarjeta = await prisma.Tarjeta.findMany();
        res.json(tarjeta);

    }catch(error){
        console.error('error buscando usuarios:', error);
        res.status(500).send('error del serivor')
    }
});

app.post('/tarjeta', async (req, res)=>{
    const tarjeta = await prisma.Tarjeta.create({
        data: req.body
    })
    res.json(tarjeta);
});

//------------GET/POST TIPO SERVICIO---------------------
app.get('/servicios', async (req, res)=>{
    try{
        const servicios = await prisma.tipoServicio.findMany();
        res.json(servicios);

    }catch(error){
        console.error('error buscando usuarios:', error);
        res.status(500).send('error del serivor')
    }
});

app.post('/servicios', async (req, res)=>{
    const servicios = await prisma.tipoServicio.create({
        data: req.body
    })
    res.json(servicios);
});

//----------- Endpoint para obtener el monto de un servicio específico----------// Obtener el monto de un servicio por su ID
app.get('/servicios/:id/monto', async (req, res) => {
    const { id } = req.params;
    try {
        const servicio = await prisma.tipoServicio.findUnique({
            where: { id_tipo_servicio: parseInt(id) }
        });
        if (!servicio) {
            return res.status(404).json({ error: 'Tipo de servicio no encontrado' });
        }
        res.json({ monto: servicio.monto });
    } catch (error) {
        console.error('Error al obtener el monto del servicio:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});


//------------GET/POST TRANSFERENCIA---------------------
app.get('/transferencias', async (req, res)=>{
    try{
        const transferencias = await prisma.transferencia.findMany();
        res.json(transferencias);

    }catch(error){
        console.error('error buscando usuarios:', error);
        res.status(500).send('error del serivor')
    }
});

app.post('/transferencias', async (req, res)=>{
    const transferencias = await prisma.transferencia.create({
        data: req.body
    })
    res.json(transferencias);
});

//------------GET/POST USUARIOS---------------------
app.get('/usuario', async (req, res)=>{
    try{
        const usuario = await prisma.usuarios.findMany();
        res.json(usuario);

    }catch(error){
        console.error('error buscando usuarios:', error);
        res.status(500).send('error del serivor')
    }
});

app.post('/usuario', async (req, res)=>{
    try{
        const usuario = await prisma.usuarios.create({
        data: req.body
    })
    res.json(usuario);
    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).send('Error del servidor');
    }
});

//------------PUERTO EN ESCUCHA---------------------
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});
