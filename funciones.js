// AQUI TODA LA LOGICA DE LAS FUNCIONES DEL NEGOCIO
// funciones.js

// Calcula el valor disponible (ingresos - egresos). Retorna 0 si es negativo.
function calcularDisponible(ingresos, egresos) {
    let disponible = ingresos - egresos;
    if (disponible < 0) {
        return 0;
    }
    return disponible;
}

// Calcula la capacidad de pago (50% del disponible).
function calcularCapacidadPago(montoDisponible) {
    return montoDisponible * 0.5;
}

// Calcula el interés simple. La tasa se divide para 100.
function calcularInteresSimple(Monto, Tasa, plazoAnios) {
    return Monto * plazoAnios * (Tasa / 100);
}

// Calcula el total a pagar sumando monto, interés y 100 de impuestos/SOLCA.
function calcularTotalPagar(monto, interes) {
    return monto + interes + 100;
}

// Calcula la cuota mensual dividiendo el total para los meses (años * 12).
function calcularCuotaMensual(total, plazoAnios) {
    return total / (plazoAnios * 12);
}

// Retorna true si la capacidad es mayor a la cuota, caso contrario false.
function aprobarCredito(capacidadPago, cuotaMensual) {
    if (capacidadPago > cuotaMensual) {
        return true;
    } else {
        return false;
    }
}