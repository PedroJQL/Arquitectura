document.addEventListener('DOMContentLoaded', () => {
    const userId = 1; // Reemplaza esto con el ID correcto del usuario autenticado

    fetch(`/api/saldo/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el saldo');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.saldo !== undefined) {
                document.getElementById('saldo').value = data.saldo;
            } else {
                console.error('Respuesta inesperada:', data);
            }
        })
        .catch(error => console.error('Error obteniendo el saldo:', error));
});
