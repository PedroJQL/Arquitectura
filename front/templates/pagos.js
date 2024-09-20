document.addEventListener('DOMContentLoaded', () => {
    const userId = 1; // Reemplaza esto con el ID correcto del usuario autenticado

    // Función para obtener el saldo
    function obtenerSaldo() {
        fetch(`/api/cuenta-origen/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.no_cuenta) {
                    document.getElementById('NoCuenta').value = data.no_cuenta;
                    document.getElementById('saldoActual').textContent = `Saldo Actual: Q ${data.saldo}`;
                } else {
                    console.error('Respuesta inesperada:', data);
                }
            })
            .catch(error => console.error('Error obteniendo la cuenta de origen:', error));
    }

    // Llamar a la función para obtener el saldo al cargar la página
    obtenerSaldo();

    // Rellenar la fecha automáticamente
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('Fecha').value = today;

    // Agregar un event listener para el cambio en el combobox de servicios
    document.getElementById('pagos').addEventListener('change', async function() {
        const tipoServicioId = this.value;

        if (tipoServicioId) {
            try {
                const response = await fetch(`/servicios/${tipoServicioId}/monto`);
                if (response.ok) {
                    const data = await response.json();
                    document.getElementById('Monto').value = data.monto;
                } else {
                    console.error('Error al obtener el monto del servicio');
                    alert('Error al obtener el monto del servicio');
                }
            } catch (error) {
                console.error('Error al obtener el monto del servicio:', error);
                alert('Error al obtener el monto del servicio');
            }
        } else {
            document.getElementById('Monto').value = '';
        }
    });

    // Seleccionar el botón por su id
    const btnPagar = document.getElementById('btnPagar');

    // Agregar un event listener para el clic en el botón
    btnPagar.addEventListener('click', async function(event) {
        event.preventDefault();

        const tipoServicio = document.getElementById('pagos').value;
        const monto = document.getElementById('Monto').value;
        const descripcion = document.getElementById('Descripcion').value;
        const fecha = document.getElementById('Fecha').value;
        const noCuenta = document.getElementById('NoCuenta').value;

        try {
            const response = await fetch('/pagos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_tipo_servicio: tipoServicio,
                    monto: monto,
                    descripcion: descripcion,
                    fecha_pago: fecha,
                    no_cuenta: noCuenta
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.error) {
                    alert(data.error);
                } else if (data.saldo !== undefined) {
                    document.getElementById('saldoActual').textContent = `Saldo Actual: Q ${data.saldo}`;
                } else {
                    console.error('Respuesta inesperada:', data);
                }

                // Pago realizado exitosamente
                alert('Pago realizado exitosamente');
                obtenerSaldo(); // Obtener el saldo actualizado después de realizar el pago
                
                // Resetear la página después de 1 segundo para mostrar el saldo actualizado
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                const errorMessage = await response.json();
                alert('Error al realizar el pago: ' + errorMessage.error);
            }
        } catch (error) {
            console.error('Error al realizar el pago:', error);
            alert('Error al realizar el pago. Por favor, inténtalo de nuevo más tarde.');
        }
    });
});
