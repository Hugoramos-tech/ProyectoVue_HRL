# Filtro por rango de edad

Dos campos «edad mínima» y «edad máxima» encima de la tabla de pacientes: solo salen los que están entre las dos. Si dejas uno vacío, ese límite no cuenta.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). Necesitas pacientes con fecha de nacimiento (`nacipac`).

## La idea

La edad no está guardada: se calcula con la fecha de nacimiento. El filtro calcula la edad de cada paciente dentro del `filter` y la compara con los dos límites. Un campo vacío vale `""`, y eso se trata como «sin límite».

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | El import, los campos, el cálculo de edad, la lista filtrada, la tabla y el PDF |

## Paso 1 · Importar `computed`

Esta pantalla **todavía no importa `computed`**. Busca:

```js
import { ref, reactive, onMounted } from "vue";
```

y **sustitúyela** por:

```js
import { ref, reactive, onMounted, computed } from "vue";
```

> Si ya hiciste la receta [Filtros en pacientes](filtro-pacientes.md), este paso ya está.

## Paso 2 · La lista filtrada

Busca la línea `const pacienteStore = usepacienteStore();` y pega esto **justo debajo**:

```js
// Limites escritos por el usuario. "" = campo vacio = sin limite.
const edadMinima = ref("");
const edadMaxima = ref("");

// La edad no esta guardada: se calcula con la fecha "aaaa-mm-dd". null si no hay fecha.
function edadDe(fecha) {
  if (!fecha) return null;
  const [anyo, mes, dia] = fecha.split("-").map(Number);
  const hoy = new Date();
  let edad = hoy.getFullYear() - anyo;
  // Si este anyo aun no llego su cumpleanyos, tiene un anyo menos.
  // getMonth() cuenta desde 0, de ahi el +1.
  if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) edad--;
  return edad;
}

// Los pacientes que estan dentro del rango.
const pacientesPorEdad = computed(() =>
  pacientes.value.filter((p) => {
    // Sin ningun limite escrito, pasan todos (incluidos los que no tienen fecha)
    if (edadMinima.value === "" && edadMaxima.value === "") return true;
    const edad = edadDe(p.nacipac);
    // Con algun limite puesto, quien no tiene fecha no se puede comparar: fuera
    if (edad === null) return false;
    // El campo da texto ("18"): Number() lo pasa a numero para comparar bien
    if (edadMinima.value !== "" && edad < Number(edadMinima.value)) return false;
    if (edadMaxima.value !== "" && edad > Number(edadMaxima.value)) return false;
    return true;
  })
);
```

## Paso 3 · Los campos

En el `<template>`, busca la línea `<div class="cabecera-informe">` y pega esto **justo encima**:

```vue
    <div class="mb-3 flex flex-wrap items-center gap-3 text-sm">
      <!-- type="number" + v-model: el valor escrito llega a `edadMinima` (como texto) -->
      <label class="flex items-center gap-2">
        Idade mínima
        <input v-model="edadMinima" type="number" min="0" class="w-20 rounded border border-[#cfe0d6] px-2 py-1">
      </label>
      <label class="flex items-center gap-2">
        Idade máxima
        <input v-model="edadMaxima" type="number" min="0" class="w-20 rounded border border-[#cfe0d6] px-2 py-1">
      </label>
    </div>
```

## Paso 4 · La tabla lee la lista filtrada

Igual que en [Filtros en pacientes](filtro-pacientes.md). **Ojo con los botones**: reciben el número de fila y con él buscan al paciente en la lista completa, así que si la tabla pinta una lista filtrada hay que recalcular la posición real.

**4.1** Busca `<div v-if="pacientes.length > 0" class="tabla-wrapper">` y **sustitúyela** por:

```vue
    <div v-if="pacientesPorEdad.length > 0" class="tabla-wrapper">
```

**4.2** Busca `<tr v-for="(u, index) in pacientes" :key="index">` y **sustitúyela** por:

```vue
          <tr v-for="u in pacientesPorEdad" :key="u.dnipac">
```

**4.3** Busca `@click="editarPaciente(index)"` y `@click="eliminarPaciente(index)"` y **sustitúyelas** por:

```vue
                @click="editarPaciente(pacientes.indexOf(u))"
```
```vue
                @click="eliminarPaciente(pacientes.indexOf(u))"
```

**4.4** Busca `{{ index + 1 }}` y **sustitúyela** por:

```vue
              {{ pacientesPorEdad.indexOf(u) + 1 }}
```

## Paso 5 · El PDF lee la lista filtrada

Dentro de `exportarPacientes()`, busca `filas: pacientes.value.map((paciente) => [` y **sustitúyela** por:

```js
      filas: pacientesPorEdad.value.map((paciente) => [
```

## Variante · Mayores y menores de edad con un desplegable

Un solo `<select v-model="grupoEdad">` con `""`, `"menores"` y `"mayores"`, y dentro del `filter`:

```js
    // "menores": solo si tiene menos de 18; "mayores": solo si tiene 18 o mas. Con "" no se filtra.
    if (grupoEdad.value === "menores" && !(edad < 18)) return false;
    if (grupoEdad.value === "mayores" && !(edad >= 18)) return false;
```

## Variante · Mostrar la edad en una columna

Si además quieres una columna de edad, añade una cabecera `<th>Idade</th>` en el `<thead>` y una celda en el `<tr>`:

```vue
            <td class="centrado">{{ edadDe(u.nacipac) ?? "—" }}</td>
```

## Qué deberías ver

1. Dos campos numéricos encima de «Listaxe de pacientes».
2. Con mínima 18, solo los mayores de edad; con máxima 17, solo los menores.
3. Con las dos, los que están en el rango (ambos límites incluidos).
4. Con los dos vacíos, salen todos.
5. El PDF trae solo lo que ves, y editar/eliminar siguen actuando sobre el paciente correcto.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `computed is not defined` | Falta el Paso 1 |
| Al escribir un límite, no sale nadie | Se compara texto con número: usa `Number(edadMinima.value)` |
| Los pacientes sin fecha siguen saliendo | Falta el `if (edad === null) return false;` |
| `edadDe is not defined` | El Paso 2 quedó dentro de otra función |
| `index is not defined` | Hiciste 4.2 pero te falta 4.3 o 4.4 |
| Borra al paciente equivocado | Falta el Paso 4.3 |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `computed` y `filter` | La lista que cumple las condiciones, siempre al día |
| `v-model` en `type="number"` | Ata el campo a un dato (ojo: llega como texto) |

## Guías relacionadas

- [Guía: filtro nuevo](../../guias/filtro-nuevo.md)
- [Filtros en pacientes](filtro-pacientes.md)
- [Combinar varios filtros y ordenar](combinar.md)
