
// Esquema de la coleccion citas: relaciona un paciente con un doctor en una fecha dada.
import mongoose from "mongoose";

const CitaSchema = new mongoose.Schema(
    {
        // El paciente se guarda por su DNI en texto, no como referencia de Mongoose.
        pacienteDNI: {
            type: String,
            required: true
        },
        // El doctor si es una referencia: conserva su _id y habilita populate en las rutas.
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },
        // Fecha y hora se almacenan como texto con los formatos aaaa-mm-dd y hh:mm.
        fecha: { type: String, required: true },
        hora: { type: String, required: true },
        motivo: { type: String, required: true },
        // Campo libre opcional; si no se envia queda como cadena vacia.
        observacions: {
            type: String,
            default: ""
        },
        // Situacion de la cita: pendente, confirmada, cancelada o realizada.
        estado: {
            type: String,
            default: "pendente"
        }
    },
    {
        // Nombre exacto de la coleccion tal como aparece en MongoDB.
        collection: "citas"
    }
);

export default mongoose.model("Cita", CitaSchema);
// Modelo que importan las rutas para consultar y modificar citas.
