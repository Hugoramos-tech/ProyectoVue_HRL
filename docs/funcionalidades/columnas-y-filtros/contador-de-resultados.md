# Contadores y «el que más»: totales de las citas

Una línea encima de la tabla de citas con el total, cuántas están pendientes, y quién es el paciente y el doctor con más citas.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Recuerda que esta pantalla solo carga datos si antes has seleccionado un paciente o un doctor en su pestaña. Necesitas varias citas.

## La idea

Contar es recorrer la lista con `filter` (cuántas cumplen algo) o con un objeto `{ clave: total }` (cuántas hay de cada). El que más tiene es el de mayor total. Todo en `computed`, para que se recalcule al crear o borrar citas.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | Los cálculos y la línea de resumen |

> `computed` ya está importado en esta pantalla, así que no hay que tocar los imports.

## Paso 1 · Los cálculos

En `src/components/Citas.vue`, busca la línea `// Al abrir la pantalla basta con que haya un paciente o un doctor seleccionado.` y pega esto **justo encima**:

```js
// Cuantas citas hay con estado "pendente": se filtran y se cuenta la longitud de la lista.
const totalPendentes = computed(() => citas.value.filter((c) => c.estado === "pendente").length)

// Recibe una lista de claves (una por cita) y devuelve la que mas se repite, con su total.
function masRepetido(clavesDeCadaCita) {
  // cuenta = { clave: veces }. ?? 0 = si aun no estaba, empieza en 0. Luego suma 1.
  const cuenta = {}
  for (const clave of clavesDeCadaCita) cuenta[clave] = (cuenta[clave] ?? 0) + 1
  // Object.entries(cuenta) -> [["abc", 3], ["def", 1]]; se ordena de mayor a menor.
  const ordenado = Object.entries(cuenta).sort((a, b) => b[1] - a[1])
  // El primero es el ganador; si no hay citas, null.
  return ordenado.length ? { clave: ordenado[0][0], total: ordenado[0][1] } : null
}

// map saca el DNI (o el id del doctor) de cada cita y masRepetido busca el que sale mas veces.
// idRelacionado ya existe mas abajo en este fichero: deja el id siempre como texto.
const pacienteTop = computed(() => masRepetido(citas.value.map((c) => c.pacienteDNI)))
const doctorTop = computed(() => masRepetido(citas.value.map((c) => idRelacionado(c.doctorId))))
```

Qué hace: `masRepetido` recibe la lista de DNIs (o de ids de doctor), cuenta cuántas veces sale cada uno y devuelve el de mayor número. `Object.entries` convierte `{ a: 2, b: 5 }` en `[["a", 2], ["b", 5]]`, que se puede ordenar.

## Paso 2 · La línea de resumen

En el `<template>`, busca la línea `<div class="citas-cabecera-lista">` y pega esto **justo encima**:

```vue
      <p class="mb-3 text-sm text-[#64737a]">
        {{ citas.length }} citas · {{ totalPendentes }} pendentes
        <!-- v-if: solo se pinta si hay un ganador (con la lista vacia, pacienteTop vale null) -->
        <template v-if="pacienteTop">
          · Paciente con máis citas: {{ nombrePaciente(pacienteTop.clave) }} ({{ pacienteTop.total }})
        </template>
        <template v-if="doctorTop">
          · Doctor con máis citas: {{ nombreDoctor(doctorTop.clave) }} ({{ doctorTop.total }})
        </template>
      </p>
```

Qué hace: `v-if` evita pintar el texto si todavía no hay citas. **`nombrePaciente` y `nombreDoctor` ya existen** en tu `Citas.vue` (son las funciones que usa la tabla para convertir el DNI y el id en nombres), así que no hay que escribir nada nuevo.

## Qué deberías ver

1. Una línea encima de «📋 Listado de citas»: «6 citas · 3 pendentes · Paciente con máis citas: … (4)».
2. Al crear una cita o cambiarla a «realizada», los números se actualizan sin recargar.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `masRepetido is not defined` | El Paso 1 quedó dentro de otra función |
| Sale «Paciente no disponible» | Los catálogos aún no han cargado, o falta `.clave` |
| Sale `NaN` o `undefined` | `pacienteTop` vale `null`: falta el `v-if` |
| No se ve nada | La línea quedó fuera del `<template v-else>`: tiene que ir dentro, como la tabla |
| Con un empate, sale siempre el mismo | Es normal: con empate gana el primero que aparece |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `computed` | Un dato que se recalcula solo cuando cambian los datos que usa |
| `filter` y `v-if` | Contar los que cumplen algo y mostrar solo si hay datos |
| `Object.entries` | Convierte un objeto en una lista de pares para poder ordenarla |
