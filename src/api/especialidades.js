// ===========================================================================
//  src/api/especialidades.js
//  Lee el catálogo de especialidades médicas.
//  No está en MongoDB: el backend lo sirve desde el fichero
//  backend/data/especialidades.json.
// ===========================================================================

import axios from 'axios';

// Dirección de nuestra API
const URL = 'http://localhost:3000/api/especialidades';

// Obtener todas las especialidades.
// El JSON tiene la forma { "especialidades": [ { id, nm }, ... ] }, por eso
// devolvemos directamente respuesta.data.especialidades (el array de dentro).
export async function obtenerEspecialidades() {
    const respuesta = await axios.get(URL);

    return respuesta.data.especialidades;
}
