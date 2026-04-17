//AQUI EL JAVASCRIPT PARA MANIPULAR EL HTML
// simulador.js

function calcular() {
    // 1. Leer ingresos y egresos y convertirlos a número decimal (float) (Paso 3)
    let valorIngresos = document.getElementById("txtIngresos").value;
    let ingresos = parseFloat(valorIngresos);

    let valorEgresos = document.getElementById("txtEgresos").value;
    let egresos = parseFloat(valorEgresos);

    // 3. Llamar a la función calcularDisponible y guardar el resultado en una variable
    let resultadoDisponible = calcularDisponible(ingresos, egresos);

    // 4. Mostrar el resultado en pantalla
    // .toFixed(2) agrega automáticamente los 2 decimales (ej: 400 → "400.00")
    document.getElementById("spnDisponible").textContent = "USD " + resultadoDisponible.toFixed(2);

    // PASO 5: Calcular capacidad de pago
    // Llamamos a la función pasándole el disponible que ya calculamos
    let resultadoCapacidad = calcularCapacidadPago(resultadoDisponible);

    // Mostramos el resultado en pantalla
    document.getElementById("spnCapacidadPago").textContent = "USD " + resultadoCapacidad.toFixed(2);
}