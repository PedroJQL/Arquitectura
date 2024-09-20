// homeDesing.js

// Ejemplo de datos de transacciones
const transacciones = [
    { id: 1, descripcion: 'Pago de luz', monto: 100, fecha: '2024-05-20' },
    { id: 2, descripcion: 'Pago de agua', monto: 50, fecha: '2024-05-21' },
    { id: 3, descripcion: 'Pago de internet', monto: 80, fecha: '2024-05-22' },
    // Agrega más transacciones según sea necesario
];

// Función para llenar la tabla con datos
function llenarTablaTransacciones() {
    const tableBody = document.querySelector('#transaccionesTable tbody');
    transacciones.forEach(transaccion => {
        const row = document.createElement('tr');

        const cellId = document.createElement('td');
        cellId.textContent = transaccion.id;
        row.appendChild(cellId);

        const cellDescripcion = document.createElement('td');
        cellDescripcion.textContent = transaccion.descripcion;
        row.appendChild(cellDescripcion);

        const cellMonto = document.createElement('td');
        cellMonto.textContent = transaccion.monto;
        row.appendChild(cellMonto);

        const cellFecha = document.createElement('td');
        cellFecha.textContent = transaccion.fecha;
        row.appendChild(cellFecha);

        tableBody.appendChild(row);
    });
}

// Llamar a la función para llenar la tabla cuando la página se cargue
document.addEventListener('DOMContentLoaded', llenarTablaTransacciones);
