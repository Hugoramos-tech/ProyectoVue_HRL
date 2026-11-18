# Horario laboral y sin fines de semana

Las citas solo pueden ser entre las 09:00 y las 20:00, y no en sábado ni domingo. Se valida en el modelo, así que vale también si alguien llama a la API sin pasar por la web.

**Antes de empezar:** el backend no recarga solo: reinícialo al terminar.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/modelos/Cita.js` | Las dos reglas |

## Paso 1 · Las reglas

En `backend/modelos/Cita.js`, busca estas dos líneas y **sustitúyelas** por el bloque de debajo:

```js
        fecha: { type: String, required: true, validate: FECHA },
        hora: { type: String, required: true, match: HORA },
```

```js
        fecha: {
            type: String,
            required: true,
            // Una lista de validadores: el de siempre (formato y que exista) y el nuevo.
            // getDay() devuelve 0 para domingo y 6 para sábado. T00:00:00 hace que la fecha
            // se interprete en hora local; sin ello, 'AAAA-MM-DD' se toma como UTC y en
            // algunas zonas cae en el día anterior.
            validate: [
                FECHA,
                {
                    validator: (f) => ![0, 6].includes(new Date(`${f}T00:00:00`).getDay()),
                    message: 'Non hai citas en fin de semana',
                },
            ],
        },
        hora: {
            type: String,
            required: true,
            match: HORA,
            // Las horas son texto HH:MM: comparar texto con >= da el orden correcto
            validate: {
                validator: (h) => h >= '09:00' && h <= '20:00',
                message: 'A clínica atende de 09:00 a 20:00',
            },
        },
```

Si ya hiciste la receta de **validaciones** (fecha no pasada), tu `fecha` ya tiene una lista `validate: [FECHA, {...}]`: no sustituyas esa línea; añade dentro de la lista este objeto y sustituye solo la línea de `hora`:

```js
                {
                    validator: (f) => ![0, 6].includes(new Date(`${f}T00:00:00`).getDay()),
                    message: 'Non hai citas en fin de semana',
                },
```

**Reinicia el backend.**

## Qué deberías ver

- Un sábado (`2026-11-21`): `400` con «Non hai citas en fin de semana».
- A las 08:00: `400` con «A clínica atende de 09:00 a 20:00».
- Un miércoles (`2026-11-18`) a las 10:00: se crea.

En el front, para que el usuario lo vea antes de enviar, el `<input type="time">` admite `min="09:00" max="20:00"`.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Acepta fines de semana | No reiniciaste el backend, o falta `T00:00:00` (el día sale mal según la zona horaria) |
| Rechaza todo | Los dos `validate` quedaron como propiedades repetidas de `fecha`: debe ser una sola lista |
| `FECHA is not defined` | Borraste el import de `FECHA` al sustituir; sigue estando arriba del fichero |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Schema de Mongoose | La forma de los documentos y sus validaciones | `03_lecciones/03_crud_api_rest.md §4` |
| REST y códigos de estado | Qué significan 200, 201, 204, 400, 404 y 409 | `03_lecciones/03_crud_api_rest.md §2` |

## Guías relacionadas

- [Guía: validación nueva](../../guias/validacion-nueva.md)
