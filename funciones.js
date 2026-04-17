//AQUI TODA LA LOGICA DE LAS FUNCIONES DEL NEGOCIO
//funciones.js

function calcularDisponible(ingresos, egresos) {
    let disponible = ingresos - egresos;
    if (disponible < 0) {
        return 0;
    }
    return disponible;
}

function calcularCapacidadPago(montoDisponible) {
    // Multiplicamos el disponible por 0.50 (que es el 50%)
    let capacidad = montoDisponible * 0.50;
    
    // Devolvemos el resultado
    return capacidad;
}

function calcularInteresSimple(monto, tasa, plazoAnios) {
    // Calculamos el interés: monto * (tasa / 100) * plazo en años
    let interes = monto * (tasa / 100) * plazoAnios;
    return interes;
}