
// Centraliza los dialogos para que todas las pantallas compartan el mismo estilo y botones.
// Las cuatro funciones devuelven la promesa de SweetAlert2, por lo que admiten await.
import Swal from 'sweetalert2'

// Muestra un resultado satisfactorio y devuelve la promesa de SweetAlert2.
// mensaje describe la operacion; titulo permite reemplazar el encabezado por defecto.
export const alertaExito = (mensaje, titulo = 'Correcto') => {
    return Swal.fire({
        icon: 'success',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar'
    })
}

// Informa de una operacion fallida; devuelve la promesa para poder esperarla si hace falta.
export const alertaError = (mensaje, titulo = 'Error') => {
    return Swal.fire({
        icon: 'error',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar'
    })
}

// Presenta informacion neutral al usuario, por ejemplo el resultado de una busqueda.
export const alertaInfo = (mensaje, titulo = 'Información') => {
    return Swal.fire({
        icon: 'info',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar'
    })
}

// Pide confirmacion antes de una accion irreversible; el resultado incluye isConfirmed.
// Se emplea comprobando r.isConfirmed antes de continuar con la accion.
export const alertaConfirmacion = (mensaje, titulo = '¿Estás seguro?') => {
    return Swal.fire({
        icon: 'question',
        title: titulo,
        text: mensaje,
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: false
    })
}
