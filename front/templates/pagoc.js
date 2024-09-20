document.addEventListener('DOMContentLoaded', () => {
    // Función para obtener el saldo de la cuenta asociada a un usuario
    async function obtenerSaldoPorUsuario(noTarjeta) {
        try {
            const response = await fetch(`/api/saldo/${noTarjeta}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.saldo !== undefined) {
                    document.getElementById('saldoActual').textContent = `Saldo Actual: Q ${data.saldo}`;
                    return data.saldo;
                } else {
                    console.error('Respuesta inesperada:', data);
                    return null;
                }
            } else {
                console.error('Error al obtener el saldo de la cuenta');
                const errorData = await response.json();
                console.error(errorData.error);
                return null;
            }
        } catch (error) {
            console.error('Error obteniendo la cuenta de origen:', error);
            return null;
        }
    }

    // Función para obtener el número de cuenta asociado a una tarjeta
    async function obtenerCuentaPorTarjeta(noTarjeta) {
        try {
            const response = await fetch(`/api/cuenta-por-tarjeta/${noTarjeta}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.no_cuenta) {
                    return data.no_cuenta;
                } else {
                    console.error('Respuesta inesperada:', data);
                    return null;
                }
            } else {
                console.error('Error al obtener la cuenta por tarjeta');
                const errorData = await response.json();
                console.error(errorData.error);
                return null;
            }
        } catch (error) {
            console.error('Error obteniendo la cuenta por tarjeta:', error);
            return null;
        }
    }

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

    // Agregar un event listener para el cambio en el campo de NoTarjeta
    document.getElementById('NoTarjeta').addEventListener('input', async function() {
        const noTarjeta = this.value;

        if (noTarjeta.length > 0) {
            const saldo = await obtenerSaldoPorUsuario(noTarjeta);

            if (saldo !== null) {
                const tipoServicio = document.getElementById('pagos').value;
                const monto = document.getElementById('Monto').value;
                const descripcion = document.getElementById('Descripcion').value;
                const fecha = document.getElementById('Fecha').value;
                const noCuenta = await obtenerCuentaPorTarjeta(noTarjeta); // Obtener el número de cuenta asociado

                if (!noCuenta) {
                    alert('No se pudo obtener el número de cuenta asociado a la tarjeta.');
                    return;
                }

                if (saldo >= monto) {
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
                                no_tarjeta: noTarjeta,
                                no_cuenta: noCuenta // Asegurarse de enviar el número de cuenta
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
                            obtenerSaldoPorUsuario(noTarjeta); // Obtener el saldo actualizado después de realizar el pago
                            
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
                } else {
                    alert('Saldo insuficiente para realizar el pago');
                }
            }
        }
    });
});
