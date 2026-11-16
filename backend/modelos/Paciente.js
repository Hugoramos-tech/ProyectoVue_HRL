// ===========================================================================
//  backend/modelos/Paciente.js
//
//  Un MODELO de Mongoose describe cómo son los documentos de una colección
//  de MongoDB (qué campos tienen y de qué tipo son) y nos da los métodos
//  para trabajar con ellos: find(), findOne(), save(), findOneAndUpdate()...
// ===========================================================================

import mongoose from "mongoose";

// El esquema (schema) es la "plantilla" de un paciente.
// required: true  -> el campo es obligatorio
// required: false -> el campo es opcional
const pacienteSchema = new mongoose.Schema(
    {
        dnipac: { type: String, required: true, unique: true }, // DNI: no se puede repetir
        nomepac: { type: String, required: true },   // nombre
        apelpac: { type: String, required: true },   // apellidos
        nacipac: { type: String, required: false },  // fecha de nacimiento (aaaa-mm-dd)
        mailpac: { type: String, required: false },  // correo electrónico
        dirpac: { type: String, required: false },   // dirección postal
        movilpac: { type: String, required: true },  // teléfono móvil
        propac: { type: String, required: false },   // provincia
        munipac: { type: String, required: false },  // municipio
        lodpac: { type: Boolean, required: true }    // aceptó la política de privacidad
    },

    {
        collection: "pacientes", // nombre EXACTO de la colección en MongoDB
        timestamps: true         // añade createdAt y updatedAt automáticamente
    }
);

// Exportamos el modelo ya construido para usarlo en las rutas.
export default mongoose.model("Paciente", pacienteSchema);
