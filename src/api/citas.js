// ===========================================================================
//  src/api/citas.js
//  Capa de ACCESO A DATOS de citas médicas (cliente de la API REST).
//
//  OJO: una cita NO guarda el nombre del paciente ni el del doctor, guarda
//  sus identificadores (_id de MongoDB). El backend, al leerlas, hace un
//  "populate" y nos devuelve ya rellenos los datos del paciente y del doctor.
// ===========================================================================

import axios from "axios";

const API_URL = "http://localhost:3000/api";

// --------------------------- C de CREATE ----------------------------------
// Crea una cita. Se envía:
// { pacienteId, doctorId, fecha, hora, motivo, observacions, estado }
export async function saveCita(cita) {
    const res = await axios.post(`${API_URL}/citas`, cita);
    return res.data;
}

// ---------------------------- R de READ -----------------------------------
// Devuelve todas las citas, con paciente y doctor ya incrustados (populate)
// y ordenadas por fecha y hora.
export async function getCitas() {
    const res = await axios.get(`${API_URL}/citas`);
    return res.data;
}

// Devuelve UNA cita por su _id de MongoDB.
export async function getCitaById(id) {
    const res = await axios.get(`${API_URL}/citas/${id}`);
    return res.data;
}

// --------------------------- U de UPDATE ----------------------------------
// Modifica la cita cuyo _id se pasa.
export async function modifyCita(id, cita) {
    const res = await axios.put(`${API_URL}/citas/${id}`, cita);
    return res.data;
}

// --------------------------- D de DELETE ----------------------------------
// Borra la cita cuyo _id se pasa.
export async function deleteCita(id) {
    const res = await axios.delete(`${API_URL}/citas/${id}`);
    return res.data;
}
