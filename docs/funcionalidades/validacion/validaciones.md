# Validaciones: fecha no pasada y botón desactivado

En el formulario de citas, un mensaje bajo el campo «Data» si la fecha es anterior a hoy, y el botón Gardar desactivado mientras haya error. El mismo control en el servidor, por si alguien llama a la API sin pasar por la web.

*Versión extendida, con variantes y más casos: [apuntes a fondo, apartado 9](../../detalle/02-formularios-y-campos.md).*

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

Hay dos sitios y los dos cuentan. La **web** evita que el usuario se equivoque y le dice por qué. El **servidor** no se fía de nadie: la API se puede llamar sin la web.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | El mensaje de error y el botón desactivado |
| `backend/modelos/Cita.js` | La misma regla en el servidor |

## Paso 1 · En la web: el error

En `src/components/Citas.vue`, busca la línea `// Texto de la tabla cuando no hay filas: distingue "no hay citas" de "no hay con este filtro".` y pega esto **justo encima**:

```js
// Mensaje de error de la fecha ("" = sin error). computed = se recalcula solo cuando cambia la fecha escrita.
// toLocaleDateString("sv-SE") da AAAA-MM-DD en hora local, y comparar ese texto con < da el orden correcto.
const erroFecha = computed(() => {
  const hoxe = new Date().toLocaleDateString("sv-SE");
  // Si hay fecha y es anterior a hoy -> mensaje; si no -> texto vacío
  return datos.fecha && datos.fecha < hoxe ? "A data non pode ser pasada" : "";
});
```

## Paso 2 · En la web: mostrarlo

En `src/components/Citas.vue`, busca la línea `<FormField label="Data:">` y **sustitúyela** por:

```vue
<FormField label="Data:" :error="erroFecha">
```

Qué hace: `FormField` tiene una prop `error`; si lleva texto, lo pinta bajo el campo.

## Paso 3 · En la web: desactivar el botón

En `src/components/Citas.vue`, busca la línea `variante="primario"` (es la del botón Gardar) y pega **justo debajo**:

```vue
          :disabled="Boolean(erroFecha)"
```

## Paso 4 · En el servidor

En `backend/modelos/Cita.js`, busca la línea `fecha: { type: String, required: true, validate: FECHA },` y **sustitúyela** por:

```js
        fecha: {
            type: String,
            required: true,
            // Una LISTA de validadores: el de siempre (formato y que exista) y el nuevo.
            // Esta es la validación del SERVIDOR: aunque alguien se salte la web, aquí se rechaza igual.
            validate: [
                FECHA,
                {
                    // Debe devolver true si la fecha vale. El texto aaaa-mm-dd se compara con el de hoy.
                    validator: (f) => f >= new Date().toLocaleDateString('sv-SE'),
                    message: 'A data non pode ser pasada',
                },
            ],
        },
```

**Reinicia el backend.**

## Qué deberías ver

1. En el formulario, elige una fecha de ayer: aparece «A data non pode ser pasada» bajo el campo y el botón Gardar se desactiva.
2. Con la fecha de hoy o futura, el error desaparece.
3. Por la API: `curl -X POST localhost:3000/api/citas ...` con una fecha pasada devuelve `400` con ese mensaje.

## Ojo

La regla del servidor se aplica también al **editar**: no podrás cambiar la cita de ayer (por ejemplo, marcarla «realizada») si la petición lleva la fecha pasada. Si no lo quieres, deja solo los Pasos 1 a 3.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El mensaje no aparece | Falta el Paso 2, o escribiste `error` sin los dos puntos |
| El botón no se desactiva | La línea del Paso 3 no está dentro de la etiqueta `<AppButton` del botón Gardar |
| El servidor sigue aceptando fechas pasadas | No reiniciaste el backend |

## Más reglas

- **Atributos HTML** en el `<input>`: `required`, `pattern`, `min`, `max`, `minlength`. El navegador avisa al enviar.
- **Reglas del servidor** para teléfono, correo, DNI, hora y fecha: `backend/modelos/validaciones.js`.
- Más validaciones paso a paso: [formularios y campos](../../detalle/02-formularios-y-campos.md#9-validar-mientras-se-escribe).

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Schema de Mongoose | La forma de los documentos y sus validaciones | `03_lecciones/03_crud_api_rest.md §4` |
| `v-model` | Ata un campo del formulario a un dato en los dos sentidos | `03_lecciones/vue/02_v_model.md` |
| Router de Express | Rutas agrupadas, y cómo leer `req.query` y `req.params` | `03_lecciones/03_crud_api_rest.md §3` |

## Guías relacionadas

- [Guía: validación nueva](../../guias/validacion-nueva.md)
