// Rutas del CRUD de doctores, montadas bajo /api/doctores desde server.js.
// A diferencia de los pacientes, el doctor se localiza por su _id de MongoDB.
import express from "express"
import Doctor from "../modelos/Doctor.js"

// Agrupa las operaciones HTTP disponibles para doctores.
const router = express.Router()

// GET /api/doctores: devuelve todos los doctores como objetos JavaScript simples.
router.get("/", async (req, res) => {
    try {
        // Lista de documentos simplificados para enviarlos en la respuesta JSON.
        const doctores = await Doctor.find().lean()
        res.json(doctores)
    } catch (error) {
        res.status(500).json({ mensaje: ("Error al listar los doctores", error)})
    }
})

// POST /api/doctores: normaliza el movil y crea un documento validado por Mongoose.
router.post("/", async (req, res) => {
    try {
        // Copia el cuerpo para no mutar req.body y quita espacios del numero de contacto.
        const datosDoctor = {
            ...req.body,
            movildoc: String(req.body.movildoc ?? "").replace(/\s+/g, "")
        };

        // Formato nacional: empieza por 6 o 7 y suma nueve digitos en total.
        if (!/^[67]\d{8}$/.test(datosDoctor.movildoc)) {
            return res.status(400).json({
                mensaje: "El móvil debe empezar por 6 o 7 y tener 9 dígitos"
            });
        }

        // Instancia del modelo: Mongoose comprueba los campos obligatorios al guardar.
        // La instancia vive en memoria hasta que save la escribe en la base de datos.
        const doctor = new Doctor(datosDoctor)

        // Documento persistido que se devuelve al cliente con estado HTTP 201.
        const nuevoDoctor = await doctor.save()

        res.status(201).json(nuevoDoctor)
        
    } catch (error) {
        // El codigo 11000 de MongoDB avisa de un valor unico repetido.
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: "Ya existe un doctor con ese ID" });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({ mensaje: error.message });
        }

        res.status(500).json({
            mensaje: "Error al crear el doctor"
        })
    }
})

// DELETE /api/doctores/:id: busca por el identificador MongoDB del doctor.
router.delete("/:id", async (req, res) => {
    try {
        // Resultado de la busqueda y eliminacion por el _id del documento.
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!doctor) {
            return res.status(404).json({ mensaje: "Doctor no encontrado" });
        }
        res.json({ mensaje: "Doctor eliminado" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar el doctor", error });
    }
});

// PUT /api/doctores/:id: actualiza los campos enviados del doctor.
router.put("/:id", async (req, res) => {
    try {
        // Se trabaja sobre una copia para normalizar el movil sin alterar la peticion.
        const datosDoctor = { ...req.body };
        if (datosDoctor.movildoc !== undefined) {
            datosDoctor.movildoc = String(datosDoctor.movildoc).replace(/\s+/g, "");
            if (!/^[67]\d{8}$/.test(datosDoctor.movildoc)) {
                return res.status(400).json({
                    mensaje: "El móvil debe empezar por 6 o 7 y tener 9 dígitos"
                });
            }
        }

        // Documento actualizado por _id; runValidators aplica las reglas del esquema.
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            datosDoctor,
            { new: true, runValidators: true }
        );

        if (!doctor) {
            return res.status(404).json({ mensaje: "Doctor no encontrado" });
        }

        res.json(doctor);
        
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: "Ya existe un doctor con ese ID" });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ mensaje: error.message });
        }
        res.status(500).json({ mensaje: "Error al modificar el doctor" });
    }
});

// GET /api/doctores/:especialidad: filtra doctores por el nombre de especialidad.
// Va al final porque Express prueba las rutas en orden y esta acepta cualquier valor.
router.get("/:especialidad", async (req, res) => {
    try {
        // Lista de doctores cuya especialidad coincide con el segmento de la URL.
        const doctores = await Doctor.find({ espedoc: req.params.especialidad });
        res.json(doctores);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener los doctores", error });
    }
});

export default router;