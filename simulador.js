// ==========================================
// SIMULADOR DE CRÉDITO - LÓGICA DE INTERFAZ
// ==========================================

// Configuración centralizada de límites por campo
const FIELD_CONFIG = {
    txtIngresos:   { err: "errIngresos",  min: 460,  max: 50000,  maxD: 5 },
    // txtEgresos:    { err: "errEgresos",   min: 0,    max: 50000,  maxD: 5, dynamicMax: true },

    txtArriendo:      { err: "errArriendo",      min: 0,    max: 10000,  maxD: 5 },
    txtAlimentacion:  { err: "errAlimentacion",  min: 0,    max: 10000,  maxD: 5 },
    txtVarios:        { err: "errVarios",        min: 0,    max: 10000,  maxD: 5 },

    txtMonto:      { err: "errMonto",     min: 500,  max: 100000, maxD: 6 },
    txtPlazo:      { err: "errPlazo",     min: 1,    max: 40,     maxD: 2 },
    txtTasaInteres:{ err: "errTasa",      min: 1,    max: 100,    maxD: 3 }
};

/**
 * Validación de rangos y estado visual
 */
function validarCampo(input, idError, min, max, maxDigits = null) {
    const valor = parseFloat(input.value);
    const errorSpan = document.getElementById(idError);
    const hint = input.nextElementSibling;
    let mensajeError = "";
    let esInvalido = false;

    if (input.value.trim() === "" || isNaN(valor)) {
        mensajeError = "Campo requerido";
        esInvalido = true;
    } else if (valor < min) {
        mensajeError = `Mínimo permitido: ${min}`;
        esInvalido = true;
    } else if (valor > max) {
        // Personalizamos el mensaje para los nuevos campos de gastos
        const esGasto = ["txtArriendo", "txtAlimentacion", "txtVarios"].includes(input.id);
        mensajeError = esGasto ? "El valor excede el límite permitido" : `Máximo permitido: ${max}`;
        esInvalido = true;
    } else if (maxDigits !== null) {
        const digitosEnteros = Math.trunc(Math.abs(valor)).toString().length;
        if (digitosEnteros > maxDigits) {
            mensajeError = `Máximo ${maxDigits} dígitos en parte entera`;
            esInvalido = true;
        }
    }

    if (esInvalido) {
        input.classList.add("input-error");
        errorSpan.textContent = mensajeError;
        if (hint) hint.style.color = "var(--error-color, #d32f2f)";
        return false;
    } else {
        input.classList.remove("input-error");
        errorSpan.textContent = "";
        if (hint) hint.style.color = "var(--hint-color, #666)";
        return true;
    }
}

/**
 * 🔒 BLOQUEO FÍSICO: Recorta automáticamente si se exceden los dígitos permitidos
 */
function aplicarLimiteDigitos(input, maxDigits) {
    if (!maxDigits || !input.value) return;

    const parts = input.value.split('.');
    const intPart = parts[0];
    // Contar solo dígitos reales (ignora signos o caracteres residuales)
    const digitos = intPart.replace(/[^0-9]/g, '');

    if (digitos.length > maxDigits) {
        // Recortar al límite exacto manteniendo decimales si existen
        const allowedInt = digitos.slice(0, maxDigits);
        input.value = allowedInt + (parts[1] !== undefined ? '.' + parts[1] : '');
    }
}

/**
 * Función principal vinculada al botón "Calcular"
 */
function calcular() {
    limpiarErrores();
    
    // 1. Obtener referencias
    const inputs = {};
    Object.keys(FIELD_CONFIG).forEach(id => {
        inputs[id] = document.getElementById(id);
    });

    // 2. Validar todos los campos (Punto 4 de la rúbrica)
    let esValido = true;
    Object.keys(FIELD_CONFIG).forEach(id => {
        const config = FIELD_CONFIG[id];
        if (!validarCampo(inputs[id], config.err, config.min, config.max, config.maxD)) {
            esValido = false;
        }
    });

    if (!esValido) return;

    // 3. Convertir valores a números
    const ingresos = parseFloat(inputs.txtIngresos.value);
    const arriendo = parseFloat(inputs.txtArriendo.value);
    const alimentacion = parseFloat(inputs.txtAlimentacion.value);
    const varios = parseFloat(inputs.txtVarios.value);
    const monto = parseFloat(inputs.txtMonto.value);
    const plazo = parseFloat(inputs.txtPlazo.value);
    const tasa = parseFloat(inputs.txtTasaInteres.value);

    // 4. Calcular Total Gastos (Punto 3 de la rúbrica)
    const totalGastos = arriendo + alimentacion + varios;
    document.getElementById("IblTotalGastos").textContent = totalGastos.toFixed(2);

    // 5. Cálculos financieros (Punto 4 de la rúbrica)
    const disponible = calcularDisponible(ingresos, totalGastos);
    const capacidad = calcularCapacidadPago(disponible);
    const interes = calcularInteresSimple(monto, tasa, plazo);
    const totalPagar = calcularTotalPagar(monto, interes);
    const cuota = calcularCuotaMensual(totalPagar, plazo);

    // 6. Mostrar resultados en pantalla
    document.getElementById("IblDisponibleValor").textContent = disponible.toFixed(2);
    document.getElementById("IblCapacidadValor").textContent = capacidad.toFixed(2);
    document.getElementById("IblinteresValor").textContent = interes.toFixed(2);
    document.getElementById("IblTotalValor").textContent = totalPagar.toFixed(2);
    document.getElementById("IblCuotaValor").textContent = cuota.toFixed(2);

    // 7. Lógica de aprobación
    const aprobado = aprobarCredito(capacidad, cuota);
    const estado = document.getElementById("IblEstadoCredito");
    estado.textContent = aprobado ? "✔ CRÉDITO APROBADO" : "✘ CRÉDITO RECHAZADO";
    estado.className = aprobado ? "mensaje-aprobado" : "mensaje-rechazado";
}

/**
 * Inicialización de eventos y validación en tiempo real
 */
document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        // 1. Bloquear caracteres no financieros (-, +, e, E)
        input.addEventListener("keydown", (e) => {
            if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
        });

        // 2. Validación y bloqueo en tiempo real
        input.addEventListener("input", () => {
            const config = FIELD_CONFIG[input.id];
            if (!config) return;

            // 🔒 Aplica bloqueo físico inmediato
            aplicarLimiteDigitos(input, config.maxD);
            
            // ✅ Ejecuta validación visual y de rangos
            validarCampo(input, config.err, config.min, config.max, config.maxD);
        });
    });
});

/**
 * Limpia estilos y mensajes de error
 */
function limpiarErrores() {
    document.querySelectorAll(".msg-error").forEach(el => el.textContent = "");
    document.querySelectorAll(".hint-text").forEach(el => el.style.color = "var(--hint-color, #666)");
    document.querySelectorAll("input").forEach(el => el.classList.remove("input-error"));
}

/**
 * Reset completo del simulador
 */
function limpiar() {
    // Limpiar todos los inputs definidos en la configuración
    Object.keys(FIELD_CONFIG).forEach(id => {
        document.getElementById(id).value = "";
    });

    // Resetear etiquetas de resultados
    const labels = [
        "IblTotalGastos", "IblDisponibleValor", "IblCapacidadValor", 
        "IblinteresValor", "IblTotalValor", "IblCuotaValor"
    ];
    labels.forEach(id => {
        document.getElementById(id).textContent = "0.00";
    });

    const estado = document.getElementById("IblEstadoCredito");
    estado.textContent = "";
    estado.className = "";
    limpiarErrores();
}

// ==========================================
// DARK MODE TOGGLE CONTROLLER
// ==========================================
(function () {
  const toggleBtn = document.getElementById('btn-theme-toggle');
  if (!toggleBtn) return;

  const html = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const STORAGE_KEY = 'nb-theme';

  const applyTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  };

  // Inicialización respetando preferencia guardada o del sistema
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  // Escuchar cambios en la configuración del SO
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Acción de alternancia
  toggleBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
})();