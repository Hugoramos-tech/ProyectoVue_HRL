# Horas libres del doctor al pedir la cita

En el formulario de citas, la hora deja de ser un campo libre y pasa a ser un desplegable de huecos de media hora (de 09:00 a 19:30). Las horas en las que el doctor ya tiene cita ese día salen desactivadas y marcadas «(ocupada)».

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Crea una cita para un doctor a las 10:00.

## La idea

Cuando se elige un doctor y una fecha, se piden al servidor las citas de ese doctor. Las que son de esa fecha y no están canceladas son horas ocupadas. El desplegable genera todos los huecos y desactiva los ocupados. La cita que se está editando no cuenta, para poder dejarle su propia hora.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | Los huecos, las horas ocupadas y el desplegable |

## Paso 1 · Los imports

En `src/components/Citas.vue`, hay dos líneas que cambiar.

Busca `import { computed, watch } from "vue";` y **sustitúyela** por (si ya la cambiaste en otra receta, salta esta):

```js
import { ref, computed, watch } from "vue";
```

Busca la línea `import { datosParaPdf } from "../utils/tabla.js";` y pega esto **justo debajo**:

```js
// La función que pide las citas al servidor
import { obtenerCitas } from "../api/citas.js";
```

## Paso 2 · La lógica

Busca la línea `// Texto de la tabla cuando no hay filas: distingue "no hay citas" de "no hay con este filtro".` y pega esto **justo encima**:

```js
// Todos los huecos de media hora: 09:00, 09:30 ... 19:30.
// Array.from({ length: 22 }, (_, i) => ...) crea una lista de 22 elementos; `i` es la posición (0 a 21).
const HORAS = Array.from({ length: 22 }, (_, i) => {
  // La hora entera: 9 + (i dividido entre 2, sin decimales). padStart(2, "0") escribe 9 como "09".
  const hora = String(9 + Math.floor(i / 2)).padStart(2, "0");
  // Las posiciones pares (0, 2, 4...) son las y media: si i es impar, ":30"; si es par, ":00"
  return `${hora}:${i % 2 ? "30" : "00"}`;
});

// Las citas del doctor elegido. Se piden aparte porque la lista de la tabla puede estar filtrada por paciente.
const citasDoctor = ref([]);

async function cargarOcupadas() {
  // Sin doctor elegido no hay nada que pedir; con doctor, el servidor devuelve sus citas
  citasDoctor.value = datos.doctorId ? await obtenerCitas({ doctor: datos.doctorId }) : [];
}

// Las horas de ESE día en las que el doctor ya tiene cita. Las canceladas no ocupan, y la cita que
// se está editando tampoco (para que pueda conservar su propia hora).
const horasOcupadas = computed(() =>
  citasDoctor.value
    .filter((c) => c.fecha === datos.fecha && c.estado !== "cancelada" && c.id !== idEditando.value)
    .map((c) => c.hora)
);

// watch ejecuta una función cuando cambia algo. Aquí: al cambiar de doctor o de fecha, se vuelven a pedir.
// () => datos.doctorId es "una función que devuelve el valor a vigilar".
watch([() => datos.doctorId, () => datos.fecha], cargarOcupadas);
// Y también cuando cambia la lista de citas de la tabla (después de guardar una cita nueva)
watch(citas, cargarOcupadas);
```

Qué hace: `Array.from({ length: 22 }, ...)` crea 22 huecos. `watch` ejecuta `cargarOcupadas` cada vez que cambia el doctor o la fecha.

## Paso 3 · El desplegable

Busca estas cinco líneas y **sustitúyelas** por el bloque de debajo:

```vue
        <input
          v-model="datos.hora"
          type="time"
          required
        >
```

```vue
        <select
          v-model="datos.hora"
          required
        >
          <option
            value=""
            disabled
          >
            Selecciona hora
          </option>
          <!-- Una opción por hueco. :disabled la apaga si esa hora está en la lista de ocupadas -->
          <option
            v-for="h in HORAS"
            :key="h"
            :value="h"
            :disabled="horasOcupadas.includes(h)"
          >
            {{ h }}{{ horasOcupadas.includes(h) ? " (ocupada)" : "" }}
          </option>
        </select>
```

## Qué deberías ver

1. En «Hora», un desplegable de 09:00 a 19:30.
2. Eliges el doctor que tiene cita a las 10:00 y su fecha: «10:00 (ocupada)» sale gris y no se puede elegir.
3. Con otra fecha o con otro doctor, esa hora está libre.
4. Al editar esa cita, su hora sí se puede elegir.
5. Si el servidor rechaza la cita (`409`), sigue saliendo la alerta: la web evita el error, pero el servidor lo comprueba igual.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Ninguna hora sale ocupada | `citasDoctor` está vacío: falta el `watch`, o la fecha no coincide con `aaaa-mm-dd` |
| Al editar, la hora sale en blanco | La cita tiene una hora que no es múltiplo de media hora (por ejemplo 10:15); no está en `HORAS` |
| `obtenerCitas is not defined` | Falta el Paso 1 |
| Las horas ocupadas no se actualizan al guardar | Falta `watch(citas, cargarOcupadas)` |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `watch` | Hacer algo cuando cambia un dato | `03_lecciones/01_reactividad.md` |
| `computed` | Las horas ocupadas dependen de la fecha y del doctor | `03_lecciones/vue/07_computed.md` |
| Petición con parámetros | `obtenerCitas({ doctor })` | `03_lecciones/03_crud_api_rest.md §5` |

## Guías relacionadas

- [Límite de citas por día](../backend/limite-por-dia.md)
- [Índice único](../backend/indice-unico.md)
