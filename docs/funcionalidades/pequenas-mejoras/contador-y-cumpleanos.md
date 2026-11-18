# Contador de pacientes y cumpleaños de hoy

Dos detalles en la tabla de pacientes: una línea con cuántos pacientes hay (y cuántos son menores), y un icono de tarta junto al nombre de quien cumple años hoy.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). Para ver la tarta, un paciente con la fecha de nacimiento de hoy (de cualquier año).

## La idea

El contador es un `computed` con `filter().length`. El icono va en la celda del nombre con el hueco `#celda-nomepac`, y solo se pinta (`v-if`) cuando el día y el mes de la fecha de nacimiento coinciden con los de hoy.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | Los cálculos, el icono y la línea del contador |

## Paso 1 · El icono

En `src/components/XestionPacientes.vue`, busca la línea `import { Users, ClipboardList, Save, FileDown, Search, Eraser } from "lucide-vue-next";` y **sustitúyela** por:

```js
// Cake = el icono de la tarta (lucide-vue-next: cada icono es un componente de Vue)
import { Users, ClipboardList, Save, FileDown, Search, Eraser, Cake } from "lucide-vue-next";
```

## Paso 2 · Los cálculos

Busca la línea `// Columnas de la tabla (y del PDF).` y pega esto **justo encima**:

```js
// "mm-dd" de hoy, para comparar con el día y el mes de nacimiento (el año no importa)
const ahoraMD = new Date();
const mesDiaHoy = `${String(ahoraMD.getMonth() + 1).padStart(2, "0")}-${String(ahoraMD.getDate()).padStart(2, "0")}`;

// "2000-05-10".slice(5) corta desde la posición 5 y deja "05-10"
function cumpleHoy(paciente) {
  return Boolean(paciente.nacipac) && paciente.nacipac.slice(5) === mesDiaHoy;
}

function esMenorDeEdad(paciente) {
  if (!paciente.nacipac) return false;
  const [anyo, mes, dia] = paciente.nacipac.split("-").map(Number);
  const hoy = new Date();
  let edad = hoy.getFullYear() - anyo;
  if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) edad--;
  return edad < 18;
}

// filter(esMenorDeEdad) llama a la función con cada paciente y se queda con los que devuelven true;
// .length cuenta cuántos son. computed: se recalcula solo al cambiar la lista.
const totalMenores = computed(() => pacientes.value.filter(esMenorDeEdad).length);
```

## Paso 3 · El hueco del nombre

Busca la línea `<template #acciones="{ fila }">` y pega esto **justo encima**:

```vue
      <!-- #celda-nomepac = el hueco de la celda de la columna con clave nomepac.
           `valor` es el nombre que la tabla iba a escribir; se pone igual y se le añade la tarta si toca. -->
      <template #celda-nomepac="{ fila, valor }">
        {{ valor }}
        <Cake
          v-if="cumpleHoy(fila)"
          :size="14"
          class="ml-1 inline text-accent"
          title="Cumpre anos hoxe"
        />
      </template>
```

## Paso 4 · La línea del contador

Busca la línea `<DataTable` y pega esto **justo encima**:

```vue
    <p class="mb-3 text-sm text-fg-soft">
      {{ pacientes.length }} pacientes · {{ totalMenores }} menores de idade
    </p>

```

## Qué deberías ver

1. Encima de la tabla: «12 pacientes · 3 menores de idade».
2. Una tarta pequeña al lado del nombre de quien cumple años hoy.
3. Al crear un paciente, el número sube sin recargar.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| La tarta no sale | La fecha de nacimiento no tiene el formato `aaaa-mm-dd`, o falta el import del Paso 1 |
| Sale en todos | Falta `v-if` en el icono |
| Siempre «0 menores» | `esMenorDeEdad` no recibe al paciente: debe ir `filter(esMenorDeEdad)` sin paréntesis |
| El nombre desaparece de la celda | Falta `{{ valor }}` dentro del hueco |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Hueco de celda `#celda-CLAVE` | Personalizar una celda de la tabla | `03_lecciones/02_router_comunicacion.md` |
| `computed` y `filter` | Contar los que cumplen algo | `03_lecciones/vue/07_computed.md` |
| `v-if` | Mostrar el icono solo a veces | `03_lecciones/vue/06_v_if.md` |

## Guías relacionadas

- [Contadores y el que más](../columnas-y-filtros/contador-de-resultados.md)
- [Resaltar por valor](../columnas-y-filtros/resaltar-por-valor.md)
