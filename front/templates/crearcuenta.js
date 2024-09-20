document.addEventListener('DOMContentLoaded', function () {
    const btnGuardarCu = document.getElementById('btnGuardarCu');
    const idClienteInput = document.getElementById('idClienteC');
    const nombreClienteField = document.getElementById('nombreCliente');
    const noTarjetaField = document.getElementById('noTarjeta');

    // Verificar que todos los elementos existen
    if (!btnGuardarCu || !idClienteInput || !nombreClienteField || !noTarjetaField) {
        console.error('No se pudieron encontrar todos los elementos en el DOM.');
        return;
    }

    // Obtener la fecha actual y establecerla en el campo de fecha de creación
    const fechaActual = new Date().toISOString().split('T')[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
    const fechaCreacionInput = document.getElementById('creacionC');

    if (fechaCreacionInput) {
        fechaCreacionInput.value = fechaActual;
    } else {
        console.error('Elemento fechaCreacionInput no encontrado');
    }

    idClienteInput.addEventListener('change', function () {
        const idCliente = idClienteInput.value;

        if (idCliente) {
            // Realizar la solicitud al servidor para obtener los datos del cliente
            fetch(`/clientes/${idCliente}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al obtener los datos del cliente');
                    }
                    return response.json();
                })
                .then(data => {
                    // Mostrar el nombre del cliente y su número de tarjeta
                    nombreClienteField.textContent = `${data.nombres} ${data.apellidos}`;
                    noTarjetaField.value = data.tarjeta ? data.tarjeta.no_tarjeta : '';

                    if (!data.tarjeta) {
                        alert('Este cliente no tiene una tarjeta asociada.');
                    }
                })
                .catch(error => {
                    console.error('Error al obtener los datos del cliente:', error);
                    alert('Error al obtener los datos del cliente: ' + error.message);
                });
        }
    });

    btnGuardarCu.addEventListener('click', function () {
        console.log('Botón de guardar cuenta clickeado');

        const noCuentaInput = document.getElementById('noCuenta');
        const descripcionInput = document.getElementById('descripcionC');
        const tipoCuentaInput = document.getElementById('tipoCuenta');
        const saldoInput = document.getElementById('saldoC');

        // Verificar que todos los elementos existen antes de acceder a sus valores
        if (!noCuentaInput || !descripcionInput || !tipoCuentaInput || !fechaCreacionInput || !saldoInput) {
            console.error('No se pudieron encontrar todos los elementos necesarios en el DOM.');
            return;
        }

        const noCuenta = noCuentaInput.value;
        const descripcion = descripcionInput.value;
        const tipoCuenta = tipoCuentaInput.value;
        const fechaCreacion = fechaCreacionInput.value;
        const saldo = parseFloat(saldoInput.value);
        const idCliente = parseInt(idClienteInput.value);
        const noTarjeta = noTarjetaField.value || null; // Asegurarse de que no sea 'undefined'

        // Crear el objeto cuentaData con los datos de la cuenta y enviarlo al servidor
        const cuentaData = {
            no_cuenta: noCuenta,
            descripcion,
            tipo_cuenta: tipoCuenta,
            fecha_creacion: fechaCreacion,
            saldo,
            id_cliente: idCliente,
            no_tarjeta: noTarjeta
        };

        console.log('Datos de la cuenta:', cuentaData);

        fetch('/cuentas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cuentaData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error(errData.error || 'Error al enviar los datos de la cuenta');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Cuenta creada:', data);
            alert('Cuenta creada exitosamente');
            // Resetear la página después de 1 segundo
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        })
        .catch(error => {
            console.error('Error al crear la cuenta:', error);
            alert('Error al crear la cuenta: ' + error.message);
        });
    });
});
