document.addEventListener('DOMContentLoaded', function () {
    const btnGuardarC = document.getElementById('btnGuardarC');
    const btnGuardarT = document.getElementById('btnGuardarT');

    // Rellenar la fecha automáticamente para el cliente
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('creacionC').value = today;

    
    btnGuardarC.addEventListener('click', function () {
        console.log('Botón de guardar cliente clickeado');

        const nombres = document.getElementById('nombreC').value;
        const apellidos = document.getElementById('apellidoC').value;
        const telefono = document.getElementById('telefonoC').value;
        const correo = document.getElementById('correoC').value;
        const fechaNacimiento = document.getElementById('nacimientoC').value;
        const dpi = document.getElementById('dpiC').value;
        const creacion = document.getElementById('creacionC').value;

        const clienteData = {
            nombres,
            apellidos,
            telefono,
            e_mail: correo,
            fecha_nacimiento: fechaNacimiento,
            fecha_creacion: creacion,
            DPI: dpi
        };

        console.log('Datos del cliente:', clienteData);

        document.getElementById('nombreC').disabled = true;
        document.getElementById('apellidoC').disabled = true;
        document.getElementById('telefonoC').disabled = true;
        document.getElementById('correoC').disabled = true;
        document.getElementById('nacimientoC').disabled = true;
        document.getElementById('dpiC').disabled = true;
        document.getElementById('creacionC').disabled = true;
        btnGuardarC.disabled = true;

        fetch('/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clienteData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error(errData.error || 'Error al enviar los datos del cliente');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Cliente creado:', data);
            alert('Cliente creado exitosamente');

            // Asignar el ID del cliente creado al campo oculto
            document.getElementById('id_cliente').value = data.id_cliente;
        })
        .catch(error => {
            console.error('Error al crear el cliente:', error);
            alert('Error al crear el cliente: ' + error.message);
        });
    });

    // Rellenar la fecha automáticamente para el cliente
    const fechinicial = new Date().toISOString().split('T')[0];
    document.getElementById('afiliacionT').value = fechinicial;
    
    // llenar titular con datos
    const nombres = document.getElementById('nombreC');
    const apellidos = document.getElementById('apellidoC');
    const titular = document.getElementById('titularT');

    function concatenar() {
        titular.value = nombres.value + ' ' + apellidos.value;
    }

    nombres.addEventListener('input', concatenar);
    apellidos.addEventListener('input', concatenar);

    btnGuardarT.addEventListener('click', function () {
        console.log('Botón de guardar tarjeta clickeado');

        const noTarjeta = document.getElementById('noTarjeta').value;
        const fechaAfiliacion = document.getElementById('afiliacionT').value;
        const saldo = document.getElementById('saldoT').value;
        const idCliente = document.getElementById('id_cliente').value;

        if (!idCliente) {
            alert('Primero debe crear un cliente.');
            return;
        }

        const tarjetaData = {
            no_tarjeta: noTarjeta,
            titular: titular.value,
            fecha_afiliacion: fechaAfiliacion,
            saldo: parseFloat(saldo),
            id_cliente: parseInt(idCliente)
        };

        console.log('Datos de la tarjeta:', tarjetaData);

        document.getElementById('noTarjeta').disabled = true;
        document.getElementById('titularT').disabled = true;
        document.getElementById('afiliacionT').disabled = true;
        document.getElementById('saldoT').disabled = true;
        btnGuardarT.disabled = true;

        fetch('/tarjetas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tarjetaData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error(errData.error || 'Error al enviar los datos de la tarjeta');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Tarjeta creada:', data);
            alert('Tarjeta creada exitosamente');
            // Resetear la página después de 1 segundo para mostrar el saldo actualizado
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        })
        .catch(error => {
            console.error('Error al crear la tarjeta:', error);
            alert('Error al crear la tarjeta: ' + error.message);
        });
    });
});
