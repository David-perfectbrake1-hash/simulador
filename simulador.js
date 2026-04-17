// ==========================================
// SIMULADOR DE CRÉDITO - LÓGICA DE INTERFAZ
// ==========================================

/**
 * Función principal vinculada al botón "Calcular"
 */
function calcular() {
    limpiarErrores();

    // Captura de elementos de entrada
    const txtIngresos = document.getElementById("txtIngresos");
    const txtEgresos = document.getElementById("txtEgresos");
    const txtMonto = document.getElementById("txtMonto");
    const txtTasa = document.getElementById("txtTasaInteres");
    const txtPlazo = document.getElementById("txtPlazo");

    // VALIDACIONES SEGÚN REQUERIMIENTOS
    const v1 = validarCampo(txtIngresos, "errIngresos", 460, 50000);
    const maxEgresos = parseFloat(txtIngresos.value) || 0;
    const v2 = validarCampo(txtEgresos, "errEgresos", 0, maxEgresos);
    const v3 = validarCampo(txtMonto, "errMonto", 500, 100000);
    const v4 = validarCampo(txtPlazo, "errPlazo", 1, 40);
    const v5 = validarCampo(txtTasa, "errTasa", 1, 100);

    // Detener si hay errores visuales
    if (!(v1 && v2 && v3 && v4 && v5)) return;

    // --- PROCESAMIENTO DE DATOS ---
    let ingresos = parseFloat(txtIngresos.value);
    let egresos = parseFloat(txtEgresos.value);
    
    // Cálculos de disponibilidad (desde funciones.js)
    let disponible = calcularDisponible(ingresos, egresos);
    let capacidad = calcularCapacidadPago(disponible);

    document.getElementById("IblDisponibleValor").innerText = disponible.toFixed(2);
    document.getElementById("IblCapacidadValor").innerText = capacidad.toFixed(2);

    let monto = parseInt(txtMonto.value);
    let tasa = parseInt(txtTasa.value);
    let plazo = parseInt(txtPlazo.value);

    // Cálculos de préstamo (desde funciones.js)
    let interes = calcularInteresSimple(monto, tasa, plazo);
    let total = calcularTotalPagar(monto, interes);
    let cuota = calcularCuotaMensual(total, plazo);

    document.getElementById("IblinteresValor").innerText = interes.toFixed(2);
    document.getElementById("IblTotalValor").innerText = total.toFixed(2);
    document.getElementById("IblCuotaValor").innerText = cuota.toFixed(2);

    // --- LÓGICA DE ESTADO Y MENSAJE EXPLICATIVO ---
    let aprobado = aprobarCredito(capacidad, cuota);
    const lblEstado = document.getElementById("IblEstadoCredito");
    let mensajeExplicativo = "";

    if (aprobado) {
        lblEstado.innerText = "✔ CRÉDITO APROBADO";
        lblEstado.className = "mensaje-aprobado";
        mensajeExplicativo = `Análisis exitoso: Su capacidad de pago ($${capacidad.toFixed(2)}) cubre cómodamente la cuota mensual calculada de $${cuota.toFixed(2)}.`;
    } else {
        lblEstado.innerText = "✘ CRÉDITO RECHAZADO";
        lblEstado.className = "mensaje-rechazado";
        
        if (disponible <= 0) {
            mensajeExplicativo = "No cuenta con excedentes mensuales (Ingresos ≤ Egresos). No es posible asignar una cuota de pago.";
        } else {
            mensajeExplicativo = `Su capacidad de pago actual ($${capacidad.toFixed(2)}) es insuficiente para la cuota de $${cuota.toFixed(2)}. Recomendación: Aumente el plazo en años o solicite un monto menor.`;
        }
    }

    // Insertar el detalle debajo del título de estado
    lblEstado.innerHTML += `<br><small style="font-size: 0.85rem; font-weight: normal; display: block; margin-top: 10px; line-height: 1.4;">${mensajeExplicativo}</small>`;
}

/**
 * Valida rangos, aplica estilos rojos y gestiona mensajes de error
 */
function validarCampo(input, idError, min, max) {
    let valor = parseFloat(input.value);
    let errorSpan = document.getElementById(idError);
    let hint = input.nextElementSibling; 

    let mensajeError = "";
    let esInvalido = false;

    if (input.value === "" || isNaN(valor)) {
        mensajeError = "Campo requerido";
        esInvalido = true;
    } else if (valor < min) {
        mensajeError = `Mínimo permitido: ${min}`;
        esInvalido = true;
    } else if (valor > max) {
        mensajeError = (input.id === "txtEgresos") ? "Supera sus ingresos disponibles" : `Máximo permitido: ${max}`;
        esInvalido = true;
    }

    if (esInvalido) {
        input.classList.add("input-error"); 
        errorSpan.innerText = mensajeError; 
        if (hint) hint.style.color = "red";
        return false;
    } else {
        input.classList.remove("input-error");
        errorSpan.innerText = "";
        if (hint) hint.style.color = "#666";
        return true;
    }
}

/**
 * Inicialización de controles de teclado y validación en tiempo real
 */
document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        // Bloqueo físico de signos y caracteres científicos
        input.addEventListener("keydown", (e) => {
            const invalidChars = ["-", "+", "e", "E"];
            if (invalidChars.includes(e.key)) {
                e.preventDefault();
            }
        });

        // Validación visual instantánea mientras el usuario escribe
        input.addEventListener("input", () => {
            const idMap = {
                "txtIngresos": { err: "errIngresos", min: 460, max: 50000 },
                "txtEgresos": { err: "errEgresos", min: 0, max: parseFloat(document.getElementById("txtIngresos").value) || 0 },
                "txtMonto": { err: "errMonto", min: 500, max: 100000 },
                "txtPlazo": { err: "errPlazo", min: 1, max: 40 },
                "txtTasaInteres": { err: "errTasa", min: 1, max: 100 }
            };

            const config = idMap[input.id];
            if (config) validarCampo(input, config.err, config.min, config.max);
        });
    });
});

/**
 * Limpia los estilos de error
 */
function limpiarErrores() {
    let errores = document.getElementsByClassName("msg-error");
    for (let i = 0; i < errores.length; i++) { errores[i].innerText = ""; }
    let hints = document.getElementsByClassName("hint-text");
    for (let i = 0; i < hints.length; i++) { hints[i].style.color = "#666"; }
    let inputs = document.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) { inputs[i].classList.remove("input-error"); }
}

/**
 * Función para resetear el simulador
 */
function limpiar() {
    const inputs = ["txtIngresos", "txtEgresos", "txtMonto", "txtTasaInteres", "txtPlazo"];
    inputs.forEach(id => document.getElementById(id).value = "");
    
    const labels = ["IblDisponibleValor", "IblCapacidadValor", "IblinteresValor", "IblTotalValor", "IblCuotaValor"];
    labels.forEach(id => document.getElementById(id).innerText = "0.00");

    const estado = document.getElementById("IblEstadoCredito");
    estado.innerText = "";
    estado.className = "";
    
    limpiarErrores();
}