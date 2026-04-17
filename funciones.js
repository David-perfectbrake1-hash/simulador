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

function calcularTotalPagar(monto, interes) {
    // Sumamos: monto + interés + 100 (impuestos/SOLCA)
    let total = monto + interes + 100;
    
    // Devolvemos el resultado
    return total;
}

function calcularCuotaMensual(total, plazoAnios) {
    // Primero convertimos años a meses (1 año = 12 meses)
    let meses = plazoAnios * 12;
    
    // Dividimos el total entre el número de meses
    let cuota = total / meses;
    
    // Devolvemos el resultado
    return cuota;
}

function aprobarCredito(capacidadPago, cuotaMensual) {
    // Si la capacidad de pago es mayor o igual a la cuota mensual...
    if (capacidadPago >= cuotaMensual) {
        return true; // ✅ Crédito aprobado
    } else {
        return false; // ❌ Crédito rechazado
    }
}