// ===========================================================================
//  backend/modelos/Cita.js
//  Plantilla (schema) de los documentos de la colección "citas".
//
//  Una cita RELACIONA un paciente con un doctor. En vez de copiar sus datos,
//  guardamos su _id con "ref": es la forma que tiene MongoDB/Mongoose de
//  hacer lo que en SQL sería una clave ajena (FOREIGN KEY).
//  Luego, al leer, usamos .populate() para que nos devuelva los datos reales.
// ===========================================================================

import mongoose from "mongoose";

const CitaSchema = new mongoose.Schema(
    {
        pacienteId: {
            type: mongoose.Schema.Types.ObjectId, // guarda el _id del paciente
            ref: "Paciente",                      // apunta al modelo Paciente
            required: true
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId, // guarda el _id del doctor
            ref: "Doctor",                        // apunta al modelo Doctor
            required: true
        },
        fecha: { type: String, required: true },  // día de la cita (aaaa-mm-dd)
        hora: { type: String, required: true },   // hora de la cita (hh:mm)
        motivo: { type: String, required: true }, // motivo de la consulta
        observacions: {
            type: String,
            default: ""                           // si no se envía, queda vacío
        },
        estado: {
            type: String,
            default: "pendente"                   // estado inicial de toda cita
        }
    },
    {
        collection: "citas", // nombre de la colección en MongoDB
        timestamps: true     // guarda cuándo se creó y se modificó
    }
);

export default mongoose.model("Cita", CitaSchema);
