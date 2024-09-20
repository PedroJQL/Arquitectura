document.addEventListener('DOMContentLoaded', function () {
    const btnGuardarUsuario = document.getElementById('btnGuardarU');

    // Obtener la fecha actual y establecerla en el campo de fecha de creación
    const fechaActual = new Date().toISOString().split('T')[0];
    document.getElementById('creacionU').value = fechaActual;

    const idEmpleadoInput = document.getElementById('idEu');
    const idClienteInput = document.getElementById('idCu');
    const descripcionInput = document.getElementById('descripcionU');

    idEmpleadoInput.addEventListener('blur', function () {
        const idEmpleado = idEmpleadoInput.value;
        if (idEmpleado) {
            fetch(`/empleados/nombre/${idEmpleado}`)
                .then(response => response.json())
                .then(data => {
                    if (data.nombre) {
                        descripcionInput.value = data.nombre;
                    } else {
                        descripcionInput.value = 'Empleado no encontrado';
                    }
                })
                .catch(error => {
                    console.error('Error al obtener el nombre del empleado:', error);
                    descripcionInput.value = 'Error al obtener el nombre del empleado';
                });
        }
    });

    idClienteInput.addEventListener('blur', function () {
        const idCliente = idClienteInput.value;
        if (idCliente) {
            fetch(`/clientes/nombre/${idCliente}`)
                .then(response => response.json())
                .then(data => {
                    if (data.nombre) {
                        descripcionInput.value = data.nombre;
                    } else {
                        descripcionInput.value = 'Cliente no encontrado';
                    }
                })
                .catch(error => {
                    console.error('Error al obtener el nombre del cliente:', error);
                    descripcionInput.value = 'Error al obtener el nombre del cliente';
                });
        }
    });

    btnGuardarUsuario.addEventListener('click', function () {
        console.log('Botón de guardar usuario clickeado');

        const nombreUsuario = document.getElementById('nombreU').value;
        const fechaCreacion = document.getElementById('creacionU').value;
        const clave = document.getElementById('passwordU').value;
        const descripcion = descripcionInput.value;
        const idEmpleado = idEmpleadoInput.value ? parseInt(idEmpleadoInput.value) : null;
        const idCliente = idClienteInput.value ? parseInt(idClienteInput.value) : null;

        if (idEmpleado && idCliente) {
            alert('Debe proporcionar solo un id_empleado o un id_cliente, no ambos');
            return;
        }

        const usuarioData = {
            nombre_usuario: nombreUsuario,
            fecha_creacion: fechaCreacion,
            clave: clave,
            descripcion: descripcion,
            id_empleado: idEmpleado,
            id_cliente: idCliente
        };

        console.log('Datos del usuario:', usuarioData);

        fetch('/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuarioData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error(errData.error || 'Error al enviar los datos del usuario');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Usuario creado:', data);
            alert('Usuario creado exitosamente');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        })
        .catch(error => {
            console.error('Error al crear el usuario:', error);
            alert('Error al crear el usuario: ' + error.message);
        });
    });
});
