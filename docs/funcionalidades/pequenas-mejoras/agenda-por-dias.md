# Agenda: las citas agrupadas por día

Debajo de la tabla de citas, una «Agenda por días» con un título por cada día y, debajo, sus citas por orden de hora.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Necesitas citas de varios días.

## La idea

Agrupar es recorrer la lista y meter cada cita en una caja que lleva el nombre de su día: un
objeto `{ "2026-12-01": [cita, cita], "2026-12-02": [cita] }`. Después se convierte en una
lista de `{ fecha, lista }` para recorrerla con **dos `v-for` anidados**: uno por día y otro
por cita.

Esos dos `v-for` anidados son el motivo por el que esta receta se pide: demuestran que
entiendes que el `v-for` interior lee la lista del elemento exterior.

Y como los días son textos `aaaa-mm-dd`, ordenarlos alfabéticamente los ordena
cronológicamente. No hace falta convertir nada a fecha.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | El agrupado y el bloque nuevo |

## Paso 1 · El agrupado

Busca la línea `// Al abrir la pantalla basta con que haya un paciente o un doctor seleccionado.` y pega esto **justo encima**:

```js
// Un { fecha, lista } por cada dia que tiene citas, con los dias y las horas ordenados.
// computed se recalcula solo cuando cambia la lista de citas.
const citasPorDia = computed(() => {
  // grupos = { "2026-12-01": [cita, cita], "2026-12-02": [cita] }
  const grupos = {}

  for (const item of citas.value) {
    // ??= significa "si esa clave todavia no tiene valor, ponle este".
    // Asi se crea la lista del dia la primera vez que aparece, y se le anade la cita.
    ;(grupos[item.fecha] ??= []).push(item)
  }

  // Object.keys saca los dias. Como son aaaa-mm-dd, sort() los deja en orden cronologico.
  return Object.keys(grupos)
    .sort()
    .map((fecha) => ({
      fecha,
      // [...lista] hace una COPIA antes de ordenar: sort() ordena en el sitio,
      // y modificar la lista original dentro de un computed da problemas.
      // localeCompare compara dos textos y dice cual va antes.
      lista: [...grupos[fecha]].sort((a, b) => String(a.hora).localeCompare(String(b.hora))),
    }))
})
```

El punto y coma delante de `(grupos[...` no es un error: hace falta porque la línea anterior
es un comentario y la siguiente empieza por paréntesis. Si te molesta, escríbelo en dos
líneas:

```js
    if (!grupos[item.fecha]) {
      grupos[item.fecha] = []
    }
    grupos[item.fecha].push(item)
```

`computed`, `citas`, `nombrePaciente()` y `nombreDoctor()` ya están en ese fichero.

## Paso 2 · El bloque de la agenda

En el `<template>`, busca la línea `      <div class="citas-cabecera-lista">` y pega esto **justo encima**:

```vue
      <!-- v-if: si no hay citas, no se pinta nada de la agenda -->
      <div v-if="citasPorDia.length" class="mb-6">
        <h4>🗓️ Agenda por días</h4>

        <!-- Bucle EXTERIOR: un bloque por dia -->
        <div
          v-for="dia in citasPorDia"
          :key="dia.fecha"
          class="mb-4"
        >
          <h5>{{ formatearDia(dia.fecha) }}</h5>
          <ul>
            <!-- Bucle INTERIOR: una linea por cita de ESE dia.
                 dia.lista es la lista del elemento exterior: eso es el anidamiento. -->
            <li
              v-for="item in dia.lista"
              :key="item._id"
            >
              <strong>{{ item.hora }}</strong>
              ·
              {{ nombrePaciente(item.pacienteDNI) }}
              con
              {{ nombreDoctor(item.doctorId) }}
              <em>({{ etiquetaEstado(item.estado) }})</em>
            </li>
          </ul>
        </div>
      </div>
```

Cada `v-for` necesita **su propio `:key`**, y tienen que ser únicos dentro de su lista: la
fecha para los días, el `_id` para las citas.

## Paso 3 · El título del día

Para que el título diga «martes, 1 de diciembre» en vez de `2026-12-01`, añade esto debajo
del Paso 1:

```js
function formatearDia(fecha) {
  // El T00:00:00 fuerza a interpretar la fecha en hora LOCAL.
  // Sin el, new Date("2026-12-01") se interpreta en UTC y en algunos husos
  // horarios sale el dia anterior.
  const d = new Date(`${fecha}T00:00:00`)
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}
```

Si prefieres no usar `Date`, parte el texto como en
[fecha en la tabla](../como-el-profe/fecha-en-la-tabla.md) y deja `01/12/2026`. Es más seguro
y se explica igual de bien.

## Variante · Marcar el día de hoy

```js
const hoyTexto = new Date().toLocaleDateString("sv-SE")
```

```vue
          <h5 :class="{ 'text-[#14543a] font-bold': dia.fecha === hoyTexto }">
            {{ formatearDia(dia.fecha) }}{{ dia.fecha === hoyTexto ? " · HOY" : "" }}
          </h5>
```

## Variante · Solo de hoy en adelante

```js
const citasPorDia = computed(() => {
  const hoy = new Date().toLocaleDateString("sv-SE")
  const grupos = {}

  // Se filtra ANTES de agrupar: asi no se crean grupos que luego habria que quitar.
  for (const item of citas.value.filter((c) => c.fecha >= hoy)) {
    ;(grupos[item.fecha] ??= []).push(item)
  }
  // ...el resto igual
})
```

## Variante · Cuántas citas tiene cada día

En el `map` del Paso 1 ya tienes `lista`, así que en el título basta:

```vue
          <h5>{{ formatearDia(dia.fecha) }} ({{ dia.lista.length }})</h5>
```

## Variante · Agrupar por doctor en vez de por día

El mismo código cambiando la clave del grupo:

```js
    ;(grupos[item.doctorId] ??= []).push(item)
```

Y el título pasa a ser `nombreDoctor(dia.fecha)`. Conviene renombrar la propiedad de `fecha` a
`clave` para que no engañe. **Agrupar es siempre el mismo patrón: cambia solo la clave.**

## Qué deberías ver

1. Un bloque «Agenda por días» encima de la tabla.
2. Un título por día y debajo «10:00 · Lucía López con Ana García (Pendiente)».
3. Los días de más antiguo a más reciente, y dentro de cada uno, las citas por hora.
4. Al crear o borrar una cita, la agenda se actualiza sola: eso es `computed`.
5. Si no hay citas, el bloque no aparece.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| La agenda sale vacía habiendo citas | El Paso 1 usa `citas` sin `.value` |
| Los días salen desordenados | Falta el `.sort()` sobre las claves |
| Las horas de un día salen desordenadas | Falta el `sort` de dentro del `map` |
| `citasPorDia is not defined` | El Paso 1 quedó dentro de otra función |
| `formatearDia is not defined` | Falta el Paso 3 |
| El día sale uno menos | Falta el `T00:00:00` en el `new Date(...)` |
| Vue avisa de las `key` | Cada `v-for` necesita su propio `:key` único |
| Avisos raros de repintado | Falta el `[...]` que copia la lista antes de ordenarla |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| Agrupar en un objeto | Una clave por grupo, y una lista como valor |
| `??=` | «Si no tiene valor, ponle este» |
| `Object.keys(...).sort()` | Las claves, ordenadas |
| `v-for` anidado | El interior recorre la lista del exterior |
| `:key` en cada `v-for` | Uno por bucle, único dentro de su lista |
| `localeCompare` | Comparar dos textos respetando el idioma |
| Copiar antes de `sort` | `sort` ordena en el sitio y no se debe tocar el original |

## Guías relacionadas

- [Totales y estadísticas](../listas/estadisticas.md)
- [Citas de hoy en la portada](../pinia/citas-de-hoy.md)
- [Fecha como dd/mm/aaaa](../como-el-profe/fecha-en-la-tabla.md)
