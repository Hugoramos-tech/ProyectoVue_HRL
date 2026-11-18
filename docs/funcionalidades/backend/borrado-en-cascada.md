# Borrado en cascada

Al borrar un paciente se borran también sus citas. Hoy tu servidor borra el paciente y **deja las citas sueltas**.

**Antes de empezar:** el backend no recarga solo. Si lo arrancaste con `npm start`, párarlo con Ctrl+C y volver a arrancarlo al terminar.

## Lo que hace hoy tu servidor

`DELETE /api/pacientes/:dni` hace solo esto:

```js
const paciente = await Paciente.findOneAndDelete({ dnipac: req.params.dni });
```

No comprueba nada y no toca la colección `citas`. Resultado: las citas de ese paciente **se quedan en la base de datos** apuntando a un DNI que ya no existe. Son datos **huérfanos**. En la pantalla de citas aparecerían como «Paciente no disponible», que es justo el texto que devuelve `nombrePaciente()` cuando no encuentra el DNI.

MongoDB no tiene claves ajenas, así que esto no lo impide nadie: hay que resolverlo en el código. Tu backend ya lo hace **al crear** una cita (la función `validarRelaciones` comprueba que el paciente y el doctor existan), pero no al borrar.

## Cascada o rechazo: cuál elegir

Hay dos formas correctas de arreglarlo. Elige según lo que pida el enunciado:

| | Cascada | Rechazar |
|---|---|---|
| Qué hace | Borra el paciente y sus citas | No deja borrar si tiene citas (error 409) |
| Si borras sin querer | Pierdes las citas | No pierdes nada |
| Datos huérfanos | Ninguno | Ninguno |
| Cuándo | El enunciado dice «eliminar igualmente» o «borrar con sus citas» | El enunciado dice «no permitir borrar si tiene citas» |

Las dos están abajo. **Lo que no se puede dejar es lo de ahora**, que genera huérfanos.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/rutas/pacientes.rutas.js` | El import del modelo de citas y la ruta de borrado |

## Opción A · Cascada

### Paso 1 · Importar el modelo de citas

En `backend/rutas/pacientes.rutas.js`, busca la línea `import Paciente from "../modelos/Paciente.js"` y pega esto **justo debajo**:

```js
// Hace falta para poder borrar las citas del paciente junto con el.
import Cita from "../modelos/Cita.js"
```

### Paso 2 · Borrar las citas con el paciente

Busca la línea `const paciente = await Paciente.findOneAndDelete({ dnipac: req.params.dni });` y pega esto **justo debajo**:

```js
        if (!paciente) {
            return res.status(404).json({ mensaje: "Paciente no encontrado" });
        }

        // Borrado en cascada: las citas guardan el DNI del paciente, no su _id.
        // deleteMany borra todas las que coincidan de una sola vez.
        // Se hace DESPUES de comprobar que el paciente existia, para no borrar
        // citas si el DNI era inventado.
        const resultado = await Cita.deleteMany({ pacienteDNI: paciente.dnipac });
        res.json({
            mensaje: `Paciente eliminado junto con ${resultado.deletedCount} cita(s)`
        });
        return;
```

Las líneas que venían después (el `if (!paciente)` original y el `res.json({ mensaje: "Paciente eliminado" })`) se quedan donde están: no se llegan a ejecutar porque el `return` sale antes. Si prefieres dejarlo limpio, bórralas.

**Reinicia el backend.**

## Opción B · Rechazar el borrado

Si lo que quieres es lo contrario, el Paso 1 es el mismo y el Paso 2 cambia. Busca la misma línea `const paciente = await Paciente.findOneAndDelete({ dnipac: req.params.dni });` y **sustitúyela** por:

```js
        // Primero se comprueba si tiene citas, SIN borrar nada todavia.
        // exists() es mas rapido que find(): solo mira si hay al menos uno.
        const dni = String(req.params.dni).trim().toUpperCase();
        if (await Cita.exists({ pacienteDNI: dni })) {
            // 409 Conflict: la peticion es valida pero choca con el estado actual de los datos.
            return res.status(409).json({
                mensaje: "No se puede eliminar: el paciente tiene citas"
            });
        }

        const paciente = await Paciente.findOneAndDelete({ dnipac: dni });
```

Fíjate en el orden: aquí la comprobación va **antes** del borrado. En la cascada iba después, porque ahí sí queremos borrar.

## Lo mismo para los doctores

En `backend/rutas/doctores.rutas.js` es igual, pero las citas guardan el **_id** del doctor, no un DNI. Busca la línea `import Doctor from "../modelos/Doctor.js"` y pega debajo `import Cita from "../modelos/Cita.js"`. Después busca la línea `const doctor = await Doctor.findByIdAndDelete(req.params.id);` y pega debajo:

```js
        if (!doctor) {
            return res.status(404).json({ mensaje: "Doctor no encontrado" });
        }

        // Aqui el campo es doctorId y guarda el _id, no un DNI.
        const resultado = await Cita.deleteMany({ doctorId: doctor._id });
        res.json({
            mensaje: `Doctor eliminado junto con ${resultado.deletedCount} cita(s)`
        });
        return;
```

## Qué deberías ver

Con la cascada: borras un paciente con 3 citas y la respuesta dice «Paciente eliminado junto con 3 cita(s)». Si pides `GET /api/citas` ya no aparecen.

Puedes comprobarlo sin la web:

```bash
curl "localhost:3000/api/citas"
curl -X DELETE "localhost:3000/api/pacientes/12345678Z"
curl "localhost:3000/api/citas"
```

Con el rechazo: el borrado devuelve `409` y el mensaje «No se puede eliminar: el paciente tiene citas». En la web saldrá como alerta de error, porque `mensaxeDoErro` lee precisamente `error.response.data.mensaje`.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `Cita is not defined` | Falta el Paso 1, el import del modelo |
| Borra el paciente pero quedan las citas | Buscaste por `pacienteId` o `paciente._id`: las citas guardan `pacienteDNI` |
| No cambia nada | No reiniciaste el backend. Node no recarga solo |
| Borra citas de otro paciente | El DNI no está normalizado: el backend guarda los DNI en mayúsculas |
| Sigue sin dar 409 en la opción B | Dejaste el `findOneAndDelete` encima del `if`: el orden importa |
| En la web la tabla sigue mostrando las citas borradas | La pantalla recarga con `cargarDatos()`: pulsa el botón de actualizar o recarga con F5 |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `deleteMany` | Borra todos los documentos que coincidan con el filtro |
| `exists` | Comprueba si hay al menos uno, sin traerlo |
| `deletedCount` | Cuántos documentos borró de verdad |
| Datos huérfanos | Registros que apuntan a algo que ya no existe |
| Código 409 | La petición es válida pero choca con el estado de los datos |

## Guías relacionadas

- [Aviso al borrar un paciente con citas](../alertas-y-pdf/aviso-al-borrar.md)
- [Dar de baja a un paciente](../mejoras-de-la-clinica/dar-de-baja-a-un-paciente.md)
- [Filtro en el backend](filtro-en-backend.md)
