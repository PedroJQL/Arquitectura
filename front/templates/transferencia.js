document.addEventListener('DOMContentLoaded', () => {
    const userId = 1; // Reemplaza esto con el ID correcto del usuario autenticado

    // Obtener la cuenta de origen y saldo
    function obtenerSaldo() {
        fetch(`/api/cuenta-origen/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.no_cuenta) {
                    document.getElementById('Origen').value = data.no_cuenta;
                    document.getElementById('saldoActual').textContent = `Saldo Actual: Q ${data.saldo}`;
                } else {
                    console.error('Respuesta inesperada:', data);
                }
            })
            .catch(error => console.error('Error obteniendo la cuenta de origen:', error));
    }

    obtenerSaldo(); // Llamar a la función para obtener el saldo al cargar la página

    // Rellenar la fecha automáticamente
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('Fecha').value = today;

    // Seleccionar el botón por su id
    const btnTransferir = document.getElementById('btnTransferir');

    // Agregar un event listener para el clic en el botón
    btnTransferir.addEventListener('click', function(event) {
        // Prevenir el comportamiento predeterminado del enlace
        event.preventDefault();

        // Manejar el botón de transferir
        const monto = parseFloat(document.getElementById('Monto').value);
        const descripcion = document.getElementById('Descripcion').value;
        
        const no_cuenta_origen = document.getElementById('Origen').value;
        const no_cuenta_destino = document.getElementById('Destino').value;

        if (no_cuenta_origen === no_cuenta_destino) {
            alert('Operación inválida: no puede transferir entre la misma cuenta');
            return;
        }
        if (isNaN(monto) || monto <= 0) {
            alert('Monto inválido');
            return;
        }

        fetch('/api/transferir', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, monto, descripcion,no_cuenta_destino})
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else if (data.saldo !== undefined) {
                document.getElementById('saldoActual').textContent = `Saldo Actual: Q ${data.saldo}`;
                alert('Transferencia realizada exitosamente');
                // Limpiar los campos del formulario
                document.getElementById('Monto').value = '';
                document.getElementById('Descripcion').value = '';
                document.getElementById('Destino').value = '';
            } else {
                console.error('Respuesta inesperada:', data);
            }
        })
        .catch(error => console.error('Error realizando la transferencia:', error));
    });
});
