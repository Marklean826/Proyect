document.addEventListener('DOMContentLoaded', () => {
    const agregarProductoForm = document.getElementById('agregarProductoForm');
    const productosVenta = document.getElementById('productosVenta').getElementsByTagName('tbody')[0];
    const totalVenta = document.getElementById('totalVenta');

    let total = 0; // Inicializamos el total
    let productos = []; // Array para almacenar los productos en la venta

    // Manejo de la adición de productos
    async function agregarProducto() {
        const codigoProducto = document.getElementById('codigoProducto').value;
        const cantidadProducto = document.getElementById('cantidadProducto').value;
    
        const data = {
            ID: codigoProducto,
            stock: cantidadProducto
        };
    
        try {
            const response = await fetch('PHP/agregar_producto.php', { // Asegúrate de que esta ruta sea correcta
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            // Verifica si la respuesta es válida
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
    
            const result = await response.json();
    
            // Verificar si hay un error en la respuesta
            if (!result.success) {
                throw new Error(result.message);
            }
    
            console.log('Producto agregado:', result.producto);
    
        } catch (error) {
            console.error('Ocurrió un error:', error);
        }
    
        return false; // Evita el envío del formulario de forma tradicional
    }
    
    agregarProductoForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const codigoProducto = document.getElementById('codigoProducto').value;
        const cantidadProducto = parseInt(document.getElementById('cantidadProducto').value, 10);

        try {
            const response = await fetch('../MARKLEAN/PHP/buscarVenta.php', {  // Asegúrate de que la ruta es correcta
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ codigoProducto, cantidadProducto }) // Enviar el código y cantidad
            });

            const data = await response.json();

            if (data.success) {
                // Agregar producto a la lista
                const producto = data.producto;
                agregarProductoATabla(producto, cantidadProducto);
                calcularTotal(producto.precio, cantidadProducto);
                // Limpiar los campos del formulario
                agregarProductoForm.reset();
            } else {
                alert(`Ocurrió un error al agregar el producto: ${data.message}`);
            }
        } catch (error) {
            alert(`Ocurrió un error al agregar el producto: ${error.message}`);
        }
    });

    // Función para agregar producto a la tabla de ventas
    function agregarProductoATabla(producto, cantidad) {
        const row = productosVenta.insertRow();
        row.insertCell(0).innerText = producto.codigo;
        row.insertCell(1).innerText = cantidad;
        row.insertCell(2).innerText = producto.nombre; // Asumiendo que el producto tiene un nombre
        row.insertCell(3).innerText = new Date().toLocaleDateString(); // Fecha actual
        row.insertCell(4).innerText = (producto.precio * cantidad).toFixed(2); // Precio total por cantidad
        row.insertCell(5).innerHTML = '<button class="eliminar">Eliminar</button>'; // Botón de eliminar

        // Añadir el producto a la lista de productos
        productos.push({ ...producto, cantidad });

        // Manejar el evento de eliminar producto
        row.querySelector('.eliminar').addEventListener('click', () => {
            eliminarProducto(row, producto.precio, cantidad);
        });
    }

    // Función para calcular el total de la venta
    function calcularTotal(precio, cantidad) {
        total += precio * cantidad;
        totalVenta.innerText = total.toFixed(2);
    }

    // Función para eliminar producto de la venta
    function eliminarProducto(row, precio, cantidad) {
        productos = productos.filter(p => p.codigo !== row.cells[0].innerText);
        total -= precio * cantidad;
        totalVenta.innerText = total.toFixed(2);
        row.remove(); // Eliminar la fila de la tabla
    }

    // Generar la venta
    document.getElementById('generarVentaBtn').addEventListener('click', () => {
        // Aquí deberías implementar la lógica para generar la venta en la base de datos
        alert('Generar venta con los siguientes productos: ' + JSON.stringify(productos));
    });
});
