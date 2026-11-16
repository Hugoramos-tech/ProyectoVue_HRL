// ===========================================================================
//  src/utils/alertas.js   (UD6 - SweetAlert2 en Vue.js)
//
//  Centraliza TODOS los avisos de la aplicación en un único sitio.
//  Ventaja: si mañana queremos cambiar el aspecto de los mensajes, solo
//  tocamos este fichero y cambian en toda la aplicación.
//
//  Librería instalada con:  npm install sweetalert2
// ===========================================================================

import Swal from 'sweetalert2'

// Alerta de éxito (operación correcta: guardar, modificar, borrar...)
export const alertaExito = (mensaje, titulo = 'Correcto') => {
    return Swal.fire({
        icon: 'success',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar'
    })
}

// Alerta de error (algo ha fallado: validación, backend caído, duplicado...)
export const alertaError = (mensaje, titulo = 'Error') => {
    return Swal.fire({
        icon: 'error',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar'
    })
}

// Alerta informativa (avisos que no son ni error ni éxito)
export const alertaInfo = (mensaje, titulo = 'Información') => {
    return Swal.fire({
        icon: 'info',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar'
    })
}

// Confirmación de una acción (sí / no) antes de algo irreversible.
// Devuelve una PROMESA, por eso en los componentes se usa con await:
//
//    const resultado = await alertaConfirmacion('¿Eliminar o paciente?')
//    if (!resultado.isConfirmed) return;   // el usuario pulsó Cancelar
//
export const alertaConfirmacion = (mensaje, titulo = '¿Estás seguro?') => {
    return Swal.fire({
        icon: 'question',
        title: titulo,
        text: mensaje,
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    })
}
