# Filtros en la tabla de citas: especialidad, fecha y cancelada

Tres filtros encima de la tabla de citas: un desplegable de **especialidad** (la de su doctor), un desplegable de **cuándo** (hoy, futuras, pasadas) y una casilla para **ocultar las canceladas**. Se pueden usar a la vez.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Recuerda que esta pantalla solo carga datos si antes seleccionaste un paciente o un doctor en su pestaña.

## La idea

Las citas ya están en pantalla, así que el filtro se hace en el navegador con un `computed`. La especialidad no está en la cita, sino en su doctor: se busca el doctor en la lista `doctores`, igual que hace la función `nombreDoctor` que ya existe. La fecha es un texto `aaaa-mm-dd`, que se puede comparar con otro texto igual para saber si es anterior o posterior.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | Los filtros, la lista filtrada, la tabla y el PDF |

## Paso 1 · Los imports

**No hay que tocar nada.** La primera línea del `<script setup>` ya es:

```js
import { computed, onMounted, reactive, ref, watch } from "vue"
```

`ref` y `computed` ya están.

## Paso 2 · La lista filtrada

Busca la línea `// Al abrir la pantalla basta con que haya un paciente o un doctor seleccionado.` y pega esto **justo encima**:

```js
// Lo que ha elegido el usuario en cada control ("" = sin filtrar).
const filtroEspecialidade = ref("")
const filtroCuando = ref("")
const ocultarCanceladas = ref(false)

// La fecha de hoy como texto "aaaa-mm-dd", para compararla con la de las citas.
// getMonth() cuenta desde 0, por eso el +1; padStart(2, "0") convierte 5 en "05".
const hoy = new Date()
const hoyTexto = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`

// Las especialidades que existen, sin repetir.
// new Set(...) elimina los duplicados y [...] lo vuelve lista otra vez.
const especialidadesDisponibles = computed(() => [
  ...new Set(doctores.value.map((d) => d.espedoc).filter(Boolean)),
])

// La especialidad de la cita: la cita solo guarda el id del doctor, asi que hay que
// buscarlo en la lista. idRelacionado() ya existe mas abajo y deja el id como texto.
function especialidadDeCita(cita) {
  const id = idRelacionado(cita.doctorId)
  return doctores.value.find((d) => String(d._id) === id)?.espedoc ?? ""
}

// La lista que se ensena: cada `if` descarta la cita (return false) si no cumple un filtro.
// Si pasa por todos, return true y se queda.
const citasFiltradas = computed(() =>
  citas.value.filter((c) => {
    if (filtroEspecialidade.value && especialidadDeCita(c) !== filtroEspecialidade.value) {
      return false
    }
    // Las fechas son textos aaaa-mm-dd, asi que ===, < y > comparan en orden cronologico
    if (filtroCuando.value === "hoy" && c.fecha !== hoyTexto) return false
    if (filtroCuando.value === "futuras" && c.fecha <= hoyTexto) return false
    if (filtroCuando.value === "pasadas" && c.fecha >= hoyTexto) return false
    if (ocultarCanceladas.value && c.estado === "cancelada") return false
    return true
  })
)

// True si el usuario ha elegido algo en cualquiera de los controles.
// Sirve para cambiar el texto de "no hay nada que ensenar".
const hayFiltro = computed(() =>
  Boolean(filtroEspecialidade.value || filtroCuando.value || ocultarCanceladas.value)
)
```

## Paso 3 · Los controles

En el `<template>`, busca la línea `<div class="citas-cabecera-lista">` y pega esto **justo encima**:

```vue
      <!-- Barra de filtros. Cada control esta atado con v-model a su ref del script -->
      <div class="mb-3 flex flex-wrap items-center gap-3">
        <select v-model="filtroEspecialidade">
          <option value="">Todas as especialidades</option>
          <option v-for="e in especialidadesDisponibles" :key="e" :value="e">{{ e }}</option>
        </select>
        <select v-model="filtroCuando">
          <option value="">Todas as datas</option>
          <option value="hoy">Hoxe</option>
          <option value="futuras">Futuras</option>
          <option value="pasadas">Pasadas</option>
        </select>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="ocultarCanceladas" type="checkbox"> Ocultar canceladas
        </label>
      </div>
```

## Paso 4 · La tabla lee la lista filtrada

**4.1** Busca la línea `v-else-if="citas.length"` (está dentro de un `<div>` repartido en varias líneas, encima de la tabla) y **sustitúyela** por:

```vue
        v-else-if="citasFiltradas.length"
```

**4.2** Busca `v-for="item in citas"` y **sustitúyela** por:

```vue
              v-for="item in citasFiltradas"
```

> Aquí **no hay problema de índices**: los botones de esta tabla reciben la cita entera (`editarCita(item)`), no su número de fila.

## Paso 5 · El texto de «sin resultados»

Busca estas líneas:

```vue
      <p
        v-else
        class="citas-mensaje-lista"
      >
        No hay citas cargadas.
      </p>
```

y **sustitúyelas** por:

```vue
      <p
        v-else
        class="citas-mensaje-lista"
      >
        {{ hayFiltro ? "Ningunha cita coincide cos filtros." : "No hay citas cargadas." }}
      </p>
```

Así distingues «no hay citas» de «hay citas, pero ninguna pasa el filtro», que es justo lo que despista cuando algo no sale.

## Paso 6 · El PDF lee la lista filtrada

Dentro de `exportarCitas()`, busca `filas: citas.value.map((item) => [` y **sustitúyela** por:

```js
      filas: citasFiltradas.value.map((item) => [
```

Y para que el botón se apague cuando el filtro no deja nada, busca `:disabled="cargando || citas.length === 0"` y **sustitúyela** por:

```vue
          :disabled="cargando || citasFiltradas.length === 0"
```

## Variante · Rango de fechas

Para «entre dos fechas», dos `<input type="date">` con `v-model` a `desde` y `hasta`, y dentro del `filter`:

```js
    // Si hay fecha "desde", se descartan las citas anteriores; si hay "hasta", las posteriores
    if (desde.value && c.fecha < desde.value) return false
    if (hasta.value && c.fecha > hasta.value) return false
```

## Qué deberías ver

1. Tres controles encima de «📋 Listado de citas».
2. Elegir «Cardioloxía» deja solo las citas de doctores de esa especialidad.
3. «Hoxe» deja las de hoy; «Futuras» las posteriores; «Pasadas» las anteriores.
4. La casilla esconde las canceladas. Todo se combina.
5. Con un filtro que no deja nada, sale «Ningunha cita coincide cos filtros.».
6. El PDF trae solo lo que ves.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El desplegable de especialidades sale vacío | Los doctores aún no han cargado: esta pantalla solo los pide si hay una selección |
| Al filtrar por especialidad no queda nada | `especialidadDeCita` compara con `d._id`; en Mongo el campo es `_id`, no `id` |
| «Hoxe» no deja nada y sí hay citas hoy | El formato de `hoyTexto` no coincide con el de `c.fecha` |
| La tabla no cambia | Falta el Paso 4.1 o el 4.2 |
| Sale «No hay citas cargadas» con filtros puestos | Falta el Paso 5 |
| `especialidadDeCita is not defined` | El Paso 2 quedó dentro de otra función |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `computed` | Se recalcula solo cuando cambia algo que lee |
| `v-model` en select y checkbox | Ata el control a un dato |
| `new Set` | Quitar los valores repetidos de una lista |

## Guías relacionadas

- [Guía: filtro nuevo](../../guias/filtro-nuevo.md)
- [Filtro en el cliente (citas)](../listas/filtro-en-cliente.md)
- [Filtro en el backend](../backend/filtro-en-backend.md)
