// ===========================================================================
//  src/api/pacientes.js
//  Capa de ACCESO A DATOS de pacientes (el "cliente" de nuestra API REST).
//
//  Aquí NO hay nada de Vue: solo funciones que hablan con el backend usando
//  axios. Los componentes (.vue) importan estas funciones y se despreocupan
//  de las URLs, de los verbos HTTP y del formato de la respuesta.
// ===========================================================================

import axios from "axios"; // librería para hacer peticiones HTTP (GET, POST, PUT, DELETE)

// Dirección base de nuestra API.
// En producción se cambiaría por la URL del servidor real:
// const API_URL = "https://servidor.com/api";
const API_URL = "http://localhost:3000/api";

// --------------------------- C de CREATE ----------------------------------
// Guarda un paciente nuevo. Envía el objeto completo en el cuerpo (body).
export async function savePaciente(paciente) {
    const res = await axios.post(`${API_URL}/pacientes`, paciente);
    return res.data; // axios mete la respuesta del servidor dentro de .data
}

// ---------------------------- R de READ -----------------------------------
// Devuelve TODOS los pacientes, ordenados por apellidos (A-Z).
export async function getPacientes() {
    const res = await axios.get(`${API_URL}/pacientes`);

    // localeCompare compara textos respetando acentos y ñ del español.
    res.data.sort((a, b) =>
        a.apelpac.localeCompare(b.apelpac, "es", { sensitivity: "base" }));

    return res.data;
}

// Devuelve UN paciente buscándolo por su DNI.
export async function getPacienteByDni(dni) {
    const res = await axios.get(`${API_URL}/pacientes/${dni}`);
    return res.data;
}

// --------------------------- U de UPDATE ----------------------------------
// Modifica el paciente cuyo DNI se pasa, con los datos del segundo parámetro.
export async function modifyPaciente(dni, paciente) {
    const res = await axios.put(`${API_URL}/pacientes/${dni}`, paciente);
    return res.data;
}

// --------------------------- D de DELETE ----------------------------------
// Borra el paciente cuyo DNI se pasa.
export async function deletePaciente(dni) {
    const res = await axios.delete(`${API_URL}/pacientes/${dni}`);
    return res.data;
}
