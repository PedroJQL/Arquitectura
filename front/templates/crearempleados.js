document.addEventListener('DOMContentLoaded', () => {
    

// Agregar un event listener para el cambio en el combobox de servicios
document.getElementById('rolE').addEventListener('change', async function() {
    const rolId = this.value;

    if (rolId) {
        try {
            const response = await fetch(`/roles/${rolId}`);
            if (response.ok) {
                const data = await response.json();
                console.log('ID del rol seleccionado:', data.id);
            } else {
                console.error('Error al obtener el rol del empleado');
                alert('Error al obtener el rol del empleado');
            }
        } catch (error) {
            console.error('Error al obtener el rol', error);
            alert('Error al obtener el rol', error);
        }
    }
});

const btnGuardarE = document.getElementById('btnGuardarE');
    btnGuardarE.addEventListener('click', function () {
        console.log('Botón de guardar empleado clickeado');

        // Obtener los datos del formulario
        const nombres = document.getElementById('nombreE').value;
        const apellidos = document.getElementById('apellidoE').value;
        const telefono = document.getElementById('telefonoE').value;
        const correo = document.getElementById('correoE').value;
        const fecha_nacimiento = document.getElementById('nacimientoE').value;
        const rol = document.getElementById('rolE').value;


        // Crear objeto con los datos del empleado
        const empleadoData = {
            nombres,
            apellidos,
            telefono,
            e_mail: correo,
            fecha_nacimiento,
            id_rol: rol
        };

        console.log('Datos del empleado:', empleadoData);

        // Enviar datos al servidor
        fetch('/empleados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(empleadoData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al enviar los datos del empleado');
            }
            return response.json();
        })
        .then(data => {
            console.log('Empleado creado:', data);
            // Puedes realizar alguna acción adicional aquí, como mostrar un mensaje de éxito al usuario
            alert('Empleado creado exitosamente');
            // Reiniciar el formulario
            document.getElementById('nombreE').value = '';
            document.getElementById('apellidoE').value = '';
            document.getElementById('telefonoE').value = '';
            document.getElementById('correoE').value = '';
            document.getElementById('nacimientoE').value = '';
            document.getElementById('rolE').value = '';
        })
        .catch(error => {
            console.error('Error al crear el empleado:', error);
            // Puedes manejar el error aquí, como mostrar un mensaje de error al usuario
            alert('Error al crear el empleado');
        });
    });
});
