// ===========================================================================
//  backend/rutas/pacientes.rutas.js
//
//  Rutas (endpoints) de la API REST para los pacientes. Todas cuelgan de
//  /api/pacientes porque así se montan en server.js:
//        app.use('/api/pacientes', pacientesRutas)
//
//  Recordatorio de los verbos HTTP y el CRUD:
//        GET    -> leer        (Read)
//        POST   -> crear       (Create)
//        PUT    -> modificar   (Update)
//        DELETE -> borrar      (Delete)
// ===========================================================================

import express from "express";
import Paciente from "../modelos/Paciente.js";

// Router: mini-aplicación de Express donde colgamos las rutas.
const router = express.Router();

// --------------------------------------------------------------------------
// READ -> Obtener TODOS los pacientes.      GET /api/pacientes
// --------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const pacientes = await Paciente.find(); // find() sin filtro = "SELECT *"

    res.json(pacientes); // devolvemos el array en formato JSON
  } catch (error) {
    console.error("Error al obtener pacientes:", error);
    res.status(500).json({
      message: "Error al obtener pacientes",
    });
  }
});

// --------------------------------------------------------------------------
// READ -> Obtener UN paciente por su DNI.   GET /api/pacientes/12345678Z
//  :dni es un parámetro variable, se lee con req.params.dni
// --------------------------------------------------------------------------
router.get("/:dni", async (req, res) => {
  try {
    const paciente = await Paciente.findOne({
      dnipac: req.params.dni,
    });

    // Si no existe devolvemos un 404 (no encontrado) y salimos con return.
    if (!paciente) {
      return res.status(404).json({
        message: "Paciente no encontrado",
      });
    }

    res.json(paciente);
  } catch (error) {
    console.error("Error al obtener paciente:", error);
    res.status(500).json({
      message: "Error al obtener paciente",
    });
  }
});

// --------------------------------------------------------------------------
// CREATE -> Crear un paciente nuevo.        POST /api/pacientes
//  Los datos llegan en el cuerpo de la petición: req.body
// --------------------------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    // Primero comprobamos que no exista ya otro paciente con ese DNI.
    const pacienteExistente = await Paciente.findOne({
      dnipac: req.body.dnipac,
    });

    if (pacienteExistente) {
      return res.status(400).json({
        message: "El paciente con este DNI ya existe",
      });
    }

    // si no existe, se crea el paciente nuevo
    console.log("Datos recibidos:", req.body);
    const paciente = new Paciente(req.body); // objeto en memoria

    const nuevoPaciente = await paciente.save(); // lo guarda en MongoDB

    // 201 = "Created". Devolvemos el paciente ya con su _id.
    res.status(201).json(nuevoPaciente);
  } catch (error) {
    console.error("Error al crear paciente:", error);

    res.status(500).json({
      message: "Error al crear paciente",
    });
  }
});

// --------------------------------------------------------------------------
// UPDATE -> Modificar un paciente.          PUT /api/pacientes/12345678Z
//  { new: true } hace que nos devuelva el documento YA modificado
//  (si no, devolvería cómo estaba antes del cambio).
// --------------------------------------------------------------------------
router.put("/:dnipac", async (req, res) => {
  try {
    const paciente = await Paciente.findOneAndUpdate(
      { dnipac: req.params.dnipac }, // a quién modificamos
      req.body,                      // datos nuevos
      { new: true },                 // devuélvemelo ya modificado
    );

    if (!paciente) {
      return res.status(404).json({
        mensaje: "Paciente no encontrado",
      });
    }

    res.json(paciente);
  } catch (error) {
    console.error("Error al actualizar paciente:", error);
    res.status(500).json({
      mensaje: "Error al actualizar paciente",
    });
  }
});

// --------------------------------------------------------------------------
// DELETE -> Borrar un paciente.             DELETE /api/pacientes/12345678Z
// --------------------------------------------------------------------------
router.delete("/:dnipac", async (req, res) => {
  try {
    const paciente = await Paciente.findOneAndDelete({
      dnipac: req.params.dnipac,
    });

    if (!paciente) {
      return res.status(404).json({
        mensaje: "Paciente no encontrado",
      });
    }

    res.json({ mensaje: "paciente eliminado" });
  } catch (error) {
    console.error("Error al eliminar paciente:", error);
    res.status(500).json({
      mensaje: "Error al eliminar paciente",
    });
  }
});

// Exportamos el router para poder usarlo en server.js
export default router;
