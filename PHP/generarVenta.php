<?php
session_start();
require '../PHP/conexionDB.php'; // Asegúrate de que esta ruta es correcta

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['productos'])) {
        $productos = $data['productos'];
        $conectar->beginTransaction(); // Iniciar una transacción

        try {
            // Insertar la factura en la tabla de facturas
            $sql = "INSERT INTO facturas (fecha, total) VALUES (NOW(), :total)";
            $stmt = $conectar->prepare($sql);
            $totalFactura = array_reduce($productos, function ($carry, $item) {
                return $carry + ($item['precio'] * $item['cantidad']);
            }, 0);
            $stmt->bindParam(':total', $totalFactura);
            $stmt->execute();
            $facturaId = $conectar->lastInsertId(); // Obtener el ID de la factura recién creada

            // Insertar los productos en la tabla de productos de la factura
            foreach ($productos as $producto) {
                $sql = "INSERT INTO productos_factura (factura_id, producto_codigo, cantidad, precio) VALUES (:facturaId, :codigo, :cantidad, :precio)";
                $stmt = $conectar->prepare($sql);
                $stmt->bindParam(':facturaId', $facturaId);
                $stmt->bindParam(':codigo', $producto['codigo']);
                $stmt->bindParam(':cantidad', $producto['cantidad']);
                $stmt->bindParam(':precio', $producto['precio']);
                $stmt->execute();
            }

            $conectar->commit(); // Confirmar transacción
            echo json_encode(['success' => true, 'facturaId' => $facturaId]);
        } catch (Exception $e) {
            $conectar->rollBack(); // Revertir transacción en caso de error
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No se proporcionaron productos.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
}
?>
