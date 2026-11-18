# Fecha como dd/mm/aaaa en la tabla de citas

En la tabla de citas, la fecha se ve `18/11/2026` y no `2026-11-18`. El profe lo añadió el día 18 («preparando para el examen»). Aquí se hace dentro de las columnas, así el PDF también la lleva con ese formato.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

La base de datos guarda la fecha como texto `aaaa-mm-dd`. Para enseñarla de otra forma no se cambia lo guardado: se le da a la columna una función `formato` que parte el texto y lo recompone.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/utils/fechas.js` | **Nuevo** (o ya creado en «Columna calculada»): la función |
| `src/components/Citas.vue` | El import y la columna |

## Paso 1 · La función

Si ya hiciste la receta «Columna calculada», salta este paso: `formatearFecha` ya existe. Si no, crea `src/utils/fechas.js`:

```js
// "2000-05-10" -> "10/05/2000". La base de datos guarda aaaa-mm-dd; esto solo cambia lo que se VE.
export function formatearFecha(fecha) {
  // Si la cita no tuviera fecha, se pone un guion en vez de "undefined/undefined/undefined"
  if (!fecha) return "—";
  // split("-") parte el texto en tres trozos; los nombres entre corchetes los reciben por orden
  const [anyo, mes, dia] = fecha.split("-");
  // La plantilla con `${...}` mete los trozos en otro orden
  return `${dia}/${mes}/${anyo}`;
}
```

## Paso 2 · El import

En `src/components/Citas.vue`, busca la línea `import { datosParaPdf } from "../utils/tabla.js";` y pega esto **justo debajo**:

```js
// Trae la función del fichero de utilidades para usarla en la columna
import { formatearFecha } from "../utils/fechas.js";
```

## Paso 3 · La columna

Busca la línea `{ clave: "fecha", titulo: "Data" },` y **sustitúyela** por:

```js
  // `formato` recibe la fila entera (c = la cita) y devuelve el texto de la celda y del PDF
  { clave: "fecha", titulo: "Data", formato: (c) => formatearFecha(c.fecha) },
```

## Variante · Con `toLocaleDateString` (como el profe)

En vez de la función del Paso 1, la columna puede ser:

```js
  {
    clave: "fecha",
    titulo: "Data",
    formato: (c) =>
      // new Date(...) crea la fecha y toLocaleDateString la escribe al estilo de España (día/mes/año)
      new Date(c.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }),
  },
```

Qué hace: el navegador da el formato de España. Ojo: con `new Date("2026-11-18")` en algunos husos horarios puede salir el día anterior; la versión con `split` no tiene ese problema.

## Qué deberías ver

1. La columna «Data» muestra `18/11/2026`.
2. El PDF de citas también.
3. Editar o crear una cita sigue funcionando: el formato solo cambia lo que se ve.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `formatearFecha is not defined` | Falta el Paso 2 |
| Sale `undefined/undefined/undefined` | La fecha no está como `aaaa-mm-dd`; mira el dato real en F12 |
| Sale el día anterior | Usaste `new Date(...)`; usa la versión con `split` |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Columnas con `formato` | Una función decide el texto de la celda | `03_lecciones/06_pdf.md §7` |
| Desestructurar un array | `const [a, b, c] = ...` | `03_lecciones/vue/03_v_for.md` |

## Guías relacionadas

- [Columna calculada](../columnas-y-filtros/columna-calculada.md)
