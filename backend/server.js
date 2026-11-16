// ===========================================================================
//  backend/server.js
//  SERVIDOR de la aplicación (API REST con Express + MongoDB con Mongoose).
//
//  Esquema de funcionamiento del proyecto:
//
//    Navegador (Vue + Vite, puerto 5173)
//            |  axios
//            v
//    API REST (Express, puerto 3000)   <-- ESTE FICHERO
//            |  mongoose
//            v
//    MongoDB (contenedor de Docker, puerto 27017)  <-- se ve en Compass
//
//  Se arranca con:  npm start   (levanta Vite y este servidor a la vez)
//               o:  npm run backend  (solo este servidor)
// ===========================================================================

import express from "express";
import fs from "fs";               // para leer ficheros JSON del disco
import path from "path";           // para construir rutas de ficheros
import { fileURLToPath } from "url";
import cors from "cors";           // evita bloqueos entre servidores (puerto 5173 -> 3000)
import "dotenv/config";            // para poder usar variables de entorno (.env)
import mongoose from "mongoose";   // importa módulo de conexión a MongoDB

// Importamos los ficheros de rutas (un fichero por cada colección)
import pacientesRutas from './rutas/pacientes.rutas.js';
import doctoresRutas from './rutas/doctores.rutas.js';
import citasRutas from './rutas/citas.rutas.js';

// --------------------------------------------------------------------------
// Carpeta donde está este fichero.
// Con módulos ES (import/export) no existe __dirname, así que lo calculamos.
// Gracias a esto los JSON se leen bien aunque arranquemos el servidor desde
// otra carpeta distinta a la raíz del proyecto.
// --------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARPETA_DATOS = path.join(__dirname, "data");

// --------------------------------------------------------------------------
// Creamos la aplicación Express y le añadimos los "middlewares"
// (funciones por las que pasa toda petición antes de llegar a su ruta).
// --------------------------------------------------------------------------
const app = express();
app.use(cors());           // permite que el front (5173) llame al back (3000)
app.use(express.json());   // para poder recibir json en el body de las peticiones

// Montamos las rutas: todo lo que empiece por /api/pacientes lo atiende
// pacientes.rutas.js, y así con el resto.
app.use('/api/pacientes', pacientesRutas);
app.use('/api/doctores', doctoresRutas);
app.use('/api/citas', citasRutas);

// USA EL PUERTO DEFINIDO EN LAS VARIABLES DE ENTORNO, SI NO COGE EL 3000
const PORT = process.env.PORT || 3000;

// URL de conexión con MongoDB. Está en el fichero .env:
// MONGO_URI="mongodb://admin:abc123@localhost:27017/bbdd?authSource=admin"
//
// El "||" es una red de seguridad: si no existe el fichero .env (por ejemplo
// al descargar el proyecto de GitHub, donde no se sube por llevar contraseñas),
// se usa la misma conexión que crea el docker-compose.yaml y la aplicación
// sigue funcionando sin tener que configurar nada.
const MONGO_URI = process.env.MONGO_URI
    || "mongodb://admin:abc123@localhost:27017/bbdd?authSource=admin";

// --------------------------------------------------------------------------
// Rutas de CATÁLOGOS (datos fijos que NO están en MongoDB, sino en ficheros
// JSON dentro de backend/data). Se leen con el módulo fs.
// --------------------------------------------------------------------------

// Provincias y municipios de España
app.get('/api/municipios', (req, res) => {
    console.log("peticion recibida: municipios");

    try {
        // Leer el fichero JSON (devuelve texto)
        const datos = fs.readFileSync(path.join(CARPETA_DATOS, "municipios.json"), "utf8");

        // Convertimos el texto JSON en un objeto JavaScript
        const datosJson = JSON.parse(datos);

        // Enviamos los datos como respuesta al cliente
        res.json(datosJson);
    } catch (error) {
        console.error("Error al leer municipios.json:", error);
        res.status(500).json({ message: "Error al leer los municipios" });
    }
});

// Especialidades médicas
app.get('/api/especialidades', (req, res) => {
    console.log("peticion recibida: especialidades");

    try {
        const datos = fs.readFileSync(path.join(CARPETA_DATOS, "especialidades.json"), "utf8");

        const datosJson = JSON.parse(datos);

        res.json(datosJson);
    } catch (error) {
        console.error("Error al leer especialidades.json:", error);
        res.status(500).json({ message: "Error al leer las especialidades" });
    }
});

// Ruta de prueba: sirve para comprobar rápido en el navegador que la API
// está viva -> http://localhost:3000/api
app.get('/api', (req, res) => {
    res.json({
        mensaxe: "API de XestiónApp funcionando",
        rutas: ["/api/pacientes", "/api/doctores", "/api/citas",
                "/api/municipios", "/api/especialidades"]
    });
});

// --------------------------------------------------------------------------
// Arranque: PRIMERO nos conectamos a MongoDB y SOLO SI funciona encendemos
// el servidor. Así evitamos tener la API funcionando sin base de datos.
// --------------------------------------------------------------------------
async function iniciaServer() {
    try {
        // conectamos con la base de datos
        await mongoose.connect(MONGO_URI);
        console.log("Conectado a MongoDB");

        // iniciamos el servidor
        app.listen(PORT, () => {
            console.log(`Servidor iniciado en el http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error al conectar con MongoDB:", error.message);
        console.error("¿Está levantado el contenedor? ->  docker compose up -d");
    }
}

iniciaServer();
