document.addEventListener('DOMContentLoaded', () => {
    async function obtenerInfoTarjeta(noTarjeta) {
        try {
            const response = await fetch(`/tarjetas/${noTarjeta}`);
            if (response.ok) {
                const data = await response.json();
                document.getElementById('Titular').textContent = data.titular;
                document.getElementById('Saldo').value = data.saldo;
            } else {
                const errorData = await response.json();
                alert(errorData.error);
            }
        } catch (error) {
            console.error('Error al obtener la información de la tarjeta:', error);
            alert('Error al obtener la información de la tarjeta.');
        }
    }

    document.getElementById('NoTarjeta').addEventListener('input', function() {
        const noTarjeta = this.value;
        if (noTarjeta.length > 0) {
            obtenerInfoTarjeta(noTarjeta);
        }
    });

    document.getElementById('btnGuardar').addEventListener('click', async function() {
        const noTarjeta = document.getElementById('NoTarjeta').value;
        const monto = parseFloat(document.getElementById('Saldo').value);

        try {
            const response = await fetch(`/tarjetas/${noTarjeta}/add-saldo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ monto })
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById('Saldo').value = data.nuevoSaldo;
                alert('Saldo agregado exitosamente');
                // Resetear la página después de 1 segundo para mostrar el saldo actualizado
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                const errorData = await response.json();
                alert(errorData.error);
            }
        } catch (error) {
            console.error('Error al agregar saldo:', error);
            alert('Error al agregar saldo. Por favor, inténtalo de nuevo más tarde.');
        }
    });
});
