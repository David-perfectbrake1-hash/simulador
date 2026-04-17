// ==========================================
// SIMULADOR DE CRÉDITO - LÓGICA DE INTERFAZ
// ==========================================

// Configuración centralizada de límites por campo
const FIELD_CONFIG = {
    txtIngresos:   { err: "errIngresos",  min: 460,  max: 50000,  maxD: 5 },
    txtEgresos:    { err: "errEgresos",   min: 0,    max: 50000,  maxD: 5, dynamicMax: true },
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
        mensajeError = (input.id === "txtEgresos") ? "Supera sus ingresos disponibles" : `Máximo permitido: ${max}`;
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
    const ids = ["txtIngresos", "txtEgresos", "txtMonto", "txtTasaInteres", "txtPlazo"];
    const inputs = {};
    ids.forEach(id => inputs[id] = document.getElementById(id));

    // Validaciones con límite de dígitos
    const maxEgresos = parseFloat(inputs.txtIngresos.value) || 0;
    const v1 = validarCampo(inputs.txtIngresos, "errIngresos", 460, 50000, 5);
    const v2 = validarCampo(inputs.txtEgresos, "errEgresos", 0, maxEgresos, 5);
    const v3 = validarCampo(inputs.txtMonto, "errMonto", 500, 100000, 6);
    const v4 = validarCampo(inputs.txtPlazo, "errPlazo", 1, 40, 2);
    const v5 = validarCampo(inputs.txtTasaInteres, "errTasa", 1, 100, 3);

    if (!(v1 && v2 && v3 && v4 && v5)) return;

    // Procesamiento con parseFloat (evita truncamiento de decimales)
    const ingresos = parseFloat(inputs.txtIngresos.value);
    const egresos = parseFloat(inputs.txtEgresos.value);
    const monto = parseFloat(inputs.txtMonto.value);
    const tasa = parseFloat(inputs.txtTasaInteres.value);
    const plazo = parseFloat(inputs.txtPlazo.value);

    const disponible = calcularDisponible(ingresos, egresos);
    const capacidad = calcularCapacidadPago(disponible);

    document.getElementById("IblDisponibleValor").textContent = disponible.toFixed(2);
    document.getElementById("IblCapacidadValor").textContent = capacidad.toFixed(2);

    const interes = calcularInteresSimple(monto, tasa, plazo);
    const total = calcularTotalPagar(monto, interes);
    const cuota = calcularCuotaMensual(total, plazo);

    document.getElementById("IblinteresValor").textContent = interes.toFixed(2);
    document.getElementById("IblTotalValor").textContent = total.toFixed(2);
    document.getElementById("IblCuotaValor").textContent = cuota.toFixed(2);

    // Estado de aprobación
    const aprobado = aprobarCredito(capacidad, cuota);
    const lblEstado = document.getElementById("IblEstadoCredito");

    if (aprobado) {
        lblEstado.textContent = "✔ CRÉDITO APROBADO";
        lblEstado.className = "mensaje-aprobado";
        lblEstado.innerHTML += `<br><small style="font-size: 0.85rem; font-weight: normal; display: block; margin-top: 10px; line-height: 1.4;">Análisis exitoso: Su capacidad de pago ($${capacidad.toFixed(2)}) cubre cómodamente la cuota mensual de $${cuota.toFixed(2)}.</small>`;
    } else {
        lblEstado.textContent = "✘ CRÉDITO RECHAZADO";
        lblEstado.className = "mensaje-rechazado";
        let mensaje = disponible <= 0 
            ? "No cuenta con excedentes mensuales (Ingresos ≤ Egresos)." 
            : `Capacidad insuficiente ($${capacidad.toFixed(2)} < $${cuota.toFixed(2)}). Aumente el plazo o reduzca el monto.`;
        lblEstado.innerHTML += `<br><small style="font-size: 0.85rem; font-weight: normal; display: block; margin-top: 10px; line-height: 1.4;">${mensaje}</small>`;
    }
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
            const max = config.dynamicMax ? (parseFloat(document.getElementById("txtIngresos").value) || 0) : config.max;
            validarCampo(input, config.err, config.min, max, config.maxD);
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
    ["txtIngresos", "txtEgresos", "txtMonto", "txtTasaInteres", "txtPlazo"].forEach(id => {
        document.getElementById(id).value = "";
    });
    ["IblDisponibleValor", "IblCapacidadValor", "IblinteresValor", "IblTotalValor", "IblCuotaValor"].forEach(id => {
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