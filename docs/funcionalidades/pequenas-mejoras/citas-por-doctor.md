# Columnas de citas en la tabla de doctores: total, hoy y «ocupado ahora»

Tres columnas nuevas en la tabla de doctores: cuántas citas tiene cada uno, cuántas son de hoy y si ahora mismo está ocupado (tiene una cita que empezó hace menos de media hora).

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Doctores** (`/xestionDoctores`). Crea alguna cita para algún doctor, y una de hoy para ver las dos últimas columnas.

## La idea

La pantalla de doctores **no tiene las citas**: solo pide doctores y especialidades. Así que hay que pedir todas las citas una vez, al montar, y guardarlas en un `ref` para poder contarlas.

«Ocupado ahora» compara la hora actual con la de las citas de hoy, suponiendo que cada consulta dura 30 minutos.

> Esta pantalla **no tiene ningún componente de tabla**: el `<thead>` y el `<tr v-for>` están escritos a mano. Así que añadir una columna son dos cosas: un `<th>` en la cabecera y un `<td>` en el cuerpo. Y los dos tienen que ir en el mismo orden, o la tabla se descuadra.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionDoctores.vue` | El import, las funciones, la carga y las columnas |

## Paso 1 · El import

Busca la línea `import { generarPDF } from "../utils/pdf.js";` y pega esto **justo debajo**:

```js
// Esta pantalla no pedia citas: hace falta para poder contarlas.
import { getCitas } from "../api/citas.js";
```

## Paso 2 · Las funciones

Busca la línea `const doctorStore = useDoctorStore();` y pega esto **justo debajo**:

```js
// Todas las citas, solo para contarlas. ref([]) = caja vigilada que empieza vacia.
const todasLasCitas = ref([]);

// Fecha de hoy "aaaa-mm-dd" y minutos transcurridos desde las 00:00.
const ahoraCitas = new Date();
const hoyTexto = `${ahoraCitas.getFullYear()}-${String(ahoraCitas.getMonth() + 1).padStart(2, "0")}-${String(ahoraCitas.getDate()).padStart(2, "0")}`;
const minutosAhora = ahoraCitas.getHours() * 60 + ahoraCitas.getMinutes();

// doctorId puede llegar como id suelto o como objeto poblado por Mongoose:
// String(relacion?._id ?? relacion) deja las dos formas como texto comparable.
function idDeDoctor(relacion) {
  return String(relacion?._id ?? relacion ?? "");
}

// Las citas de un doctor que no estan canceladas.
function citasDe(doctor) {
  return todasLasCitas.value.filter(
    (item) => idDeDoctor(item.doctorId) === String(doctor._id) && item.estado !== "cancelada"
  );
}

function citasDeHoy(doctor) {
  return citasDe(doctor).filter((item) => item.fecha === hoyTexto).length;
}

// some devuelve true si ALGUNA cita cumple la condicion: que sea de hoy y que ahora
// caiga entre su hora de inicio y esa hora mas 30 minutos.
function ocupadoAhora(doctor) {
  return citasDe(doctor).some((item) => {
    if (item.fecha !== hoyTexto) {
      return false;
    }
    // "10:30" -> [10, 30]: split parte el texto y map(Number) pasa los trozos a numero.
    const [h, m] = String(item.hora).split(":").map(Number);
    const inicio = h * 60 + m;
    return minutosAhora >= inicio && minutosAhora < inicio + 30;
  });
}
```

> Aquí el doctor se identifica por `doctor._id`, no por `doctor.id`. En Mongo el campo se llama `_id` con guion bajo, y `doctor.id` sería `undefined`: todas las cuentas saldrían a 0.

## Paso 3 · Cargar las citas

Busca la línea `  especialidades.value = await cargarEspecialidades();` y pega esto **justo debajo**:

```js
  // .catch(() => []) deja la tabla funcionando aunque la API de citas falle:
  // las columnas nuevas saldran a 0 en vez de romper la pantalla.
  todasLasCitas.value = await getCitas().catch(() => []);
```

## Paso 4 · Las cabeceras

En el `<template>`, busca la línea `<th>Especialidade</th>` y pega esto **justo debajo**:

```vue
            <th>Citas</th>
            <th>Hoy</th>
            <th>Agora</th>
```

## Paso 5 · Las celdas

Busca la línea `<td>{{ doctor.espedoc }}</td>` y pega esto **justo debajo**:

```vue
            <td class="centrado">{{ citasDe(doctor).length }}</td>
            <td class="centrado">{{ citasDeHoy(doctor) }}</td>
            <!-- Las clases cambian segun el resultado para que se vea de un golpe -->
            <td class="centrado">
              <span :class="ocupadoAhora(doctor) ? 'font-bold text-[#b3261e]' : 'text-[#2f7d55]'">
                {{ ocupadoAhora(doctor) ? "Ocupado" : "Libre" }}
              </span>
            </td>
```

Las tres celdas van en el mismo orden que las tres cabeceras del Paso 4.

## Variante · Que las columnas salgan en el PDF

Dentro de `exportarDoctores()`, busca `cabeceras: ["ID", "Apellidos", "Nombre", "Móvil", "Especialidad"],` y **sustitúyela** por:

```js
      cabeceras: ["ID", "Apellidos", "Nombre", "Móvil", "Especialidad", "Citas", "Hoy"],
```

Y busca `doctor.espedoc ?? "",` y **sustitúyela** por:

```js
        doctor.espedoc ?? "",
        citasDe(doctor).length,
        citasDeHoy(doctor),
```

Las cabeceras y las filas tienen que tener **el mismo número de elementos**, o `autoTable` deja huecos.

## Qué deberías ver

1. Tres columnas nuevas al final de la tabla: «Citas», «Hoy» y «Agora».
2. El total cuenta las citas no canceladas de cada doctor.
3. «Ocupado» en rojo solo si el doctor tiene una cita de hoy que empezó hace menos de 30 minutos. El resto del tiempo, «Libre» en verde.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Todo sale 0 y «Libre» | Comparaste con `doctor.id`: en Mongo es `doctor._id` |
| Todo sale 0 aunque uses `_id` | Falta el Paso 3: `todasLasCitas` sigue vacío |
| Todo sale 0 y hay citas | `doctorId` llega como objeto: de ahí la función `idDeDoctor` |
| La tabla se descuadra | Hay más `<th>` que `<td>` o al revés: tienen que ser tres y tres |
| «Ocupado» no sale nunca | Prueba con una cita de hoy cuya hora sea hace 10 minutos |
| `citasDe is not defined` | El Paso 2 quedó dentro de otra función |
| La hora no se actualiza | `minutosAhora` se calcula una vez al cargar: recarga la página, o móntalo con el reloj de [saludo y reloj](saludo-y-reloj.md) |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| Columna escrita a mano | Un `<th>` y un `<td>`, en el mismo orden |
| `filter` y `some` | Contar los que cumplen algo, o saber si alguno lo cumple |
| `_id` de Mongo | El identificador lleva guion bajo |
| Horas en minutos | `h * 60 + m` permite comparar y sumar intervalos |
| `.catch(() => [])` | Si la petición falla, seguir con una lista vacía |

## Guías relacionadas

- [Columna contador](../columnas-y-filtros/columna-contador.md)
- [Columna de otra tabla](../columnas-y-filtros/columna-de-otra-tabla.md)
- [Horas libres](../mejoras-de-la-clinica/horas-libres.md)
