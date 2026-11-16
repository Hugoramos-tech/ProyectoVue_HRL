// ===========================================================================
//  backend/rutas/doctores.rutas.js
//
//  Rutas (endpoints) de la API REST para los doctores. Cuelgan de
//  /api/doctores porque en server.js se monta así:
//        app.use('/api/doctores', doctoresRutas)
//
//  MUY IMPORTANTE el ORDEN de las rutas: Express las comprueba de arriba a
//  abajo. Por eso "/especialidade/:espedoc" va ANTES que "/:iddoc"; si no,
//  la palabra "especialidade" se tomaría como si fuese un ID de doctor.
// ===========================================================================

import express from "express";
import Doctor from "../modelos/Doctor.js";

const router = express.Router();

// --------------------------------------------------------------------------
// READ -> Obtener TODOS los doctores.       GET /api/doctores
// --------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const doctores = await Doctor.find(); // es el SELECT * de SQL

    res.json(doctores);
  } catch (error) {
    console.error("Error al obtener doctores:", error);
    res.status(500).json({
      message: "Error al obtener doctores",
    });
  }
});

// --------------------------------------------------------------------------
// READ -> Doctores de UNA especialidad.
//         GET /api/doctores/especialidade/Cardiología
// --------------------------------------------------------------------------
router.get("/especialidade/:espedoc", async (req, res) => {
  try {
    const doctores = await Doctor.find({
      espedoc: req.params.espedoc,
    });

    res.json(doctores);
  } catch (error) {
    console.error("Error al obtener doctores por especialidad:", error);
    res.status(500).json({
      message: "Error al obtener doctores por especialidad",
    });
  }
});

// --------------------------------------------------------------------------
// READ -> Obtener UN doctor por su ID de doctor.   GET /api/doctores/D001
// --------------------------------------------------------------------------
router.get("/:iddoc", async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      iddoc: req.params.iddoc,
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor no encontrado",
      });
    }

    res.json(doctor);
  } catch (error) {
    console.error("Error al obtener doctor:", error);
    res.status(500).json({
      message: "Error al obtener doctor",
    });
  }
});

// --------------------------------------------------------------------------
// CREATE -> Crear un doctor nuevo.          POST /api/doctores
// --------------------------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    // No permitimos dos doctores con el mismo ID.
    const doctorExistente = await Doctor.findOne({
      iddoc: req.body.iddoc,
    });

    if (doctorExistente) {
      return res.status(400).json({
        message: "El doctor con este ID ya existe",
      });
    }

    // si no existe, se crea el doctor nuevo
    console.log("Datos recibidos:", req.body);
    const doctor = new Doctor(req.body);

    const nuevoDoctor = await doctor.save();

    res.status(201).json(nuevoDoctor); // 201 = creado correctamente
  } catch (error) {
    console.error("Error al crear doctor:", error);

    res.status(500).json({
      message: "Error al crear doctor",
    });
  }
});

// --------------------------------------------------------------------------
// UPDATE -> Modificar un doctor.            PUT /api/doctores/D001
// --------------------------------------------------------------------------
router.put("/:iddoc", async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { iddoc: req.params.iddoc }, // a quién modificamos
      req.body,                    // datos nuevos
      { new: true },               // devuélvemelo ya modificado
    );

    if (!doctor) {
      return res.status(404).json({
        mensaje: "Doctor no encontrado",
      });
    }

    res.json(doctor);
  } catch (error) {
    console.error("Error al actualizar doctor:", error);
    res.status(500).json({
      mensaje: "Error al actualizar doctor",
    });
  }
});

// --------------------------------------------------------------------------
// DELETE -> Borrar un doctor.               DELETE /api/doctores/D001
// --------------------------------------------------------------------------
router.delete("/:iddoc", async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndDelete({
      iddoc: req.params.iddoc,
    });

    if (!doctor) {
      return res.status(404).json({
        mensaje: "Doctor no encontrado",
      });
    }

    res.json({ mensaje: "doctor eliminado" });
  } catch (error) {
    console.error("Error al eliminar doctor:", error);
    res.status(500).json({
      mensaje: "Error al eliminar doctor",
    });
  }
});

export default router;
