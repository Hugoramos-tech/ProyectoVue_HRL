// ===========================================================================
//  backend/rutas/citas.rutas.js
//
//  Rutas (endpoints) de la API REST para las citas médicas. Cuelgan de
//  /api/citas porque en server.js se monta así:
//        app.use('/api/citas', citasRutas)
//
//  Novedad respecto a pacientes y doctores: aquí usamos .populate(), que
//  cambia el _id guardado en la cita por los datos reales del paciente y
//  del doctor (sería como el JOIN de SQL).
// ===========================================================================

import express from "express";
import Cita from "../modelos/Cita.js";

const router = express.Router();

// Campos que queremos que nos devuelva populate de cada relación.
// Así no mandamos al navegador datos que no se usan en la tabla.
const CAMPOS_PACIENTE = "dnipac nomepac apelpac";
const CAMPOS_DOCTOR = "iddoc nomedoc apeldoc espedoc";

// --------------------------------------------------------------------------
// READ -> Obtener TODAS las citas.          GET /api/citas
//  .sort({ fecha: 1, hora: 1 }) -> 1 = ascendente (de la más antigua a la
//  más reciente); si fuese -1 sería descendente.
// --------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const citas = await Cita.find()
      .populate("pacienteId", CAMPOS_PACIENTE)
      .populate("doctorId", CAMPOS_DOCTOR)
      .sort({ fecha: 1, hora: 1 });

    res.json(citas);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.status(500).json({
      message: "Error al obtener citas",
    });
  }
});

// --------------------------------------------------------------------------
// READ -> Obtener UNA cita por su _id de MongoDB.
//         GET /api/citas/6abb7e2721ef4c373289ef50
// --------------------------------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id)
      .populate("pacienteId", CAMPOS_PACIENTE)
      .populate("doctorId", CAMPOS_DOCTOR);

    if (!cita) {
      return res.status(404).json({
        message: "Cita no encontrada",
      });
    }

    res.json(cita);
  } catch (error) {
    console.error("Error al obtener cita:", error);
    res.status(500).json({
      message: "Error al obtener cita",
    });
  }
});

// --------------------------------------------------------------------------
// CREATE -> Crear una cita nueva.           POST /api/citas
// --------------------------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    // Un mismo doctor no puede tener dos citas el mismo día a la misma hora.
    const citaExistente = await Cita.findOne({
      doctorId: req.body.doctorId,
      fecha: req.body.fecha,
      hora: req.body.hora,
    });

    if (citaExistente) {
      return res.status(400).json({
        message: "Ese doctor xa ten unha cita nesa data e hora",
      });
    }

    console.log("Datos recibidos:", req.body);
    const cita = new Cita(req.body);

    const novaCita = await cita.save();

    // Volvemos a leerla con populate para devolverla ya con los nombres
    // del paciente y del doctor (así la tabla se pinta directamente).
    const citaCompleta = await Cita.findById(novaCita._id)
      .populate("pacienteId", CAMPOS_PACIENTE)
      .populate("doctorId", CAMPOS_DOCTOR);

    res.status(201).json(citaCompleta);
  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(500).json({
      message: "Error al crear cita",
    });
  }
});

// --------------------------------------------------------------------------
// UPDATE -> Modificar una cita.             PUT /api/citas/<_id>
// --------------------------------------------------------------------------
router.put("/:id", async (req, res) => {
  try {
    const cita = await Cita.findByIdAndUpdate(
      req.params.id, // cuál modificamos
      req.body,      // datos nuevos
      { new: true }, // devuélvemela ya modificada
    )
      .populate("pacienteId", CAMPOS_PACIENTE)
      .populate("doctorId", CAMPOS_DOCTOR);

    if (!cita) {
      return res.status(404).json({
        mensaje: "Cita no encontrada",
      });
    }

    res.json(cita);
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    res.status(500).json({
      mensaje: "Error al actualizar cita",
    });
  }
});

// --------------------------------------------------------------------------
// DELETE -> Borrar una cita.                DELETE /api/citas/<_id>
// --------------------------------------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const cita = await Cita.findByIdAndDelete(req.params.id);

    if (!cita) {
      return res.status(404).json({
        mensaje: "Cita no encontrada",
      });
    }

    res.json({ mensaje: "cita eliminada" });
  } catch (error) {
    console.error("Error al eliminar cita:", error);
    res.status(500).json({
      mensaje: "Error al eliminar cita",
    });
  }
});

export default router;
