// ===========================================================================
//  backend/modelos/Doctor.js
//  Plantilla (schema) de los documentos de la colección "doctores".
// ===========================================================================

import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
    {
        iddoc: { type: String, required: true, unique: true }, // ID del doctor, no se repite
        nomedoc: { type: String, required: true },   // nombre
        apeldoc: { type: String, required: true },   // apellidos
        coledoc: { type: String, required: true },   // ¿colegiado? -> "Si" / "No"
        maildoc: { type: String, required: true },   // correo electrónico
        movildoc: { type: String, required: false }, // teléfono móvil
        espedoc: { type: String, required: true },   // especialidad médica
        loddoc: { type: Boolean, required: true }    // aceptó la política de privacidad
    },

    {
        collection: "doctores", // nombre de la colección en MongoDB
        timestamps: true        // guarda cuándo se creó y se modificó
    }
);

export default mongoose.model("Doctor", DoctorSchema);
