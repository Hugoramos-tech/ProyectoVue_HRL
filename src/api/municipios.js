// ===========================================================================
//  src/api/municipios.js
//  Lee el catálogo de provincias y municipios de España.
//  El backend lo sirve desde backend/data/municipios.json.
// ===========================================================================

import axios from 'axios';

// Dirección de nuestra API
const URL = 'http://localhost:3000/api/municipios';

// Obtener todas las provincias -> array de objetos { id, nm }
export async function obtenerProvincias() {
    const respuesta = await axios.get(URL);

    return respuesta.data.provincias;
}

// Obtener todos los municipios de UNA provincia.
// Truco del fichero de datos: el id de un municipio empieza por el id de su
// provincia (por ejemplo Vigo = "36057" pertenece a Pontevedra = "36").
// Por eso filtramos comparando los dos primeros caracteres del id.
export async function obtenerMunicipios(idProvincia) {
    const respuesta = await axios.get(URL);

    const municipios = respuesta.data.municipios;

    return municipios.filter(
        municipio => municipio.id.substring(0, 2) === idProvincia
    );
}
