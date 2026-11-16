// ===========================================================================
//  src/api/doctores.js
//  Capa de ACCESO A DATOS de doctores (cliente de la API REST con axios).
//  Mismo patrón que pacientes.js, pero cambiando "pacientes" por "doctores".
// ===========================================================================

import axios from "axios";

// En produccion se usa la url del servidor
// const API_URL = "https://servidor.com/api";
const API_URL = "http://localhost:3000/api";

// --------------------------- C de CREATE ----------------------------------
// Guardar doctor
export async function saveDoctor(doctor) {
    const res = await axios.post(`${API_URL}/doctores`, doctor);
    return res.data;
}

// ---------------------------- R de READ -----------------------------------
// Obtener todos los doctores
export async function getDoctores() {
    const res = await axios.get(`${API_URL}/doctores`);

    res.data.sort((a, b) =>
        a.apeldoc.localeCompare(b.apeldoc, "es", { sensitivity: "base" }));
    // Ordena por apellido de forma ascendente

    return res.data;
}

// Obtener UN doctor por su ID de doctor (campo iddoc, no el _id de MongoDB)
export async function getDoctorById(iddoc) {
    const res = await axios.get(`${API_URL}/doctores/${iddoc}`);
    return res.data;
}

// Obtener los doctores de una especialidad concreta.
// encodeURIComponent evita problemas con espacios y acentos en la URL
// (por ejemplo "Ginecología y Obstetricia").
export async function getDoctorByEspecialidad(especialidad) {
    const res = await axios.get(
        `${API_URL}/doctores/especialidade/${encodeURIComponent(especialidad)}`
    );
    return res.data;
}

// --------------------------- U de UPDATE ----------------------------------
// Actualizar doctor
export async function modifyDoctor(iddoc, doctor) {
    const res = await axios.put(`${API_URL}/doctores/${iddoc}`, doctor);
    return res.data;
}

// --------------------------- D de DELETE ----------------------------------
// Eliminar doctor
export async function deleteDoctor(iddoc) {
    const res = await axios.delete(`${API_URL}/doctores/${iddoc}`);
    return res.data;
}
