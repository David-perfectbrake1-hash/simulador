//AQUI EL JAVASCRIPT PARA MANIPULAR EL HTML
// simulador.js

function calcular() {
    // 1. Leer el valor de ingresos y convertirlo a número decimal (float)
    let valorIngresos = document.getElementById("txtIngresos").value;
    let ingresos = parseFloat(valorIngresos);

    // 2. Leer el valor de egresos y convertirlo a número decimal (float)
    let valorEgresos = document.getElementById("txtEgresos").value;
    let egresos = parseFloat(valorEgresos);

    // 3. Llamar a la función que ya creaste y guardar el resultado en una variable
    let resultadoDisponible = calcularDisponible(ingresos, egresos);

    // 4. Mostrar el resultado en pantalla (en el componente spnDisponible)
    // .toFixed(2) agrega automáticamente los 2 decimales (ej: 400 → "400.00")
    document.getElementById("spnDisponible").textContent = "USD " + resultadoDisponible.toFixed(2);
}