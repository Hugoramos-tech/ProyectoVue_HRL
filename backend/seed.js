// ===========================================================================
//  backend/seed.js
//  Script de CARGA INICIAL de datos ("semilla" o seed).
//
//  Mete en MongoDB los pacientes y los doctores de ejemplo que hay en
//  backend/data/*.json, y crea unas cuantas citas relacionándolos.
//  Sirve para tener la base de datos con datos en MongoDB Compass sin
//  escribirlos a mano uno a uno.
//
//  Se ejecuta con:   npm run seed
//
//  CUIDADO: borra lo que haya en las colecciones pacientes, doctores y citas
//  antes de insertar, para no duplicar registros.
// ===========================================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import mongoose from "mongoose";

import Paciente from "./modelos/Paciente.js";
import Doctor from "./modelos/Doctor.js";
import Cita from "./modelos/Cita.js";

// Carpeta donde están los ficheros JSON con los datos de ejemplo
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARPETA_DATOS = path.join(__dirname, "data");

// Lee un fichero JSON y lo convierte en objeto JavaScript
function leerJson(nombre) {
    const texto = fs.readFileSync(path.join(CARPETA_DATOS, nombre), "utf8");
    return JSON.parse(texto);
}

async function cargarDatos() {
    try {
        // 1) Conectamos con MongoDB usando la URL del fichero .env.
        //    Si no hay .env, usamos la conexión por defecto del docker-compose.
        const MONGO_URI = process.env.MONGO_URI
            || "mongodb://admin:abc123@localhost:27017/bbdd?authSource=admin";

        await mongoose.connect(MONGO_URI);
        console.log("Conectado a MongoDB");

        // 2) Vaciamos las tres colecciones
        await Paciente.deleteMany({});
        await Doctor.deleteMany({});
        await Cita.deleteMany({});
        console.log("Colecciones vaciadas");

        // 3) Insertamos pacientes y doctores (insertMany inserta un array)
        const pacientes = await Paciente.insertMany(leerJson("pacientes.json"));
        console.log(`Pacientes insertados: ${pacientes.length}`);

        const doctores = await Doctor.insertMany(leerJson("doctores.json"));
        console.log(`Doctores insertados: ${doctores.length}`);

        // 4) Creamos 5 citas de ejemplo relacionando los _id que acabamos
        //    de generar (así las relaciones son válidas de verdad).
        const hoxe = new Date();
        const dentroDe = (dias) => {
            const d = new Date(hoxe);
            d.setDate(d.getDate() + dias);
            return d.toISOString().slice(0, 10); // formato aaaa-mm-dd
        };

        const citas = await Cita.insertMany([
            {
                pacienteId: pacientes[0]._id,
                doctorId: doctores[0]._id,
                fecha: dentroDe(1),
                hora: "09:30",
                motivo: "Revisión xeral",
                observacions: "Primeira consulta",
                estado: "pendente"
            },
            {
                pacienteId: pacientes[1]._id,
                doctorId: doctores[1]._id,
                fecha: dentroDe(2),
                hora: "10:15",
                motivo: "Control de tensión",
                observacions: "",
                estado: "confirmada"
            },
            {
                pacienteId: pacientes[2]._id,
                doctorId: doctores[3]._id,
                fecha: dentroDe(3),
                hora: "11:00",
                motivo: "Mancha na pel",
                observacions: "Trae informe anterior",
                estado: "pendente"
            },
            {
                pacienteId: pacientes[3]._id,
                doctorId: doctores[4]._id,
                fecha: dentroDe(5),
                hora: "12:45",
                motivo: "Dor no xeonllo",
                observacions: "",
                estado: "confirmada"
            },
            {
                pacienteId: pacientes[4]._id,
                doctorId: doctores[7]._id,
                fecha: dentroDe(-2),
                hora: "08:45",
                motivo: "Cefaleas",
                observacions: "Consulta xa realizada",
                estado: "realizada"
            }
        ]);
        console.log(`Citas insertadas: ${citas.length}`);

        console.log("CARGA INICIAL COMPLETADA. Mira la base de datos en Compass.");
    } catch (error) {
        console.error("Error en la carga inicial:", error.message);
    } finally {
        // 5) Pase lo que pase, cerramos la conexión para que el script termine
        await mongoose.disconnect();
    }
}

cargarDatos();
