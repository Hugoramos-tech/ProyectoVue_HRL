# Elegir en una página y usarlo en otra (Pinia)

Al editar un paciente en la página de pacientes, su nombre queda guardado en un store compartido. La portada lo lee y muestra «Último paciente: …». Sirve para entender cómo dos páginas comparten un dato, que es lo que el profesor explica en UD8.

**Antes de empezar:** arranca el proyecto (`npm start`). Necesitas al menos un paciente.

## La idea

Un **store de Pinia** es un objeto compartido: cualquier página puede escribir en él y cualquier otra leerlo. Como vive fuera de las páginas, no se pierde al cambiar de una a otra (sí al recargar con F5).

`Pacientes` → `seleccion.seleccionar(paciente)` → **store** → `{{ nomePaciente }}` → `Portada`

Esto ya lo hace el proyecto con `citaStore.idPaciente`: al editar un paciente, la página de citas arranca filtrada por él. Aquí lo montas tú desde cero con un store nuevo.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/store/seleccionStore.js` | **Nuevo.** El dato compartido |
| `src/components/XestionPacientes.vue` | Escribe en el store al editar |
| `src/components/Inicio.vue` | Lee del store |

## Paso 1 · El store

Crea `src/store/seleccionStore.js`:

```js
import { ref } from "vue";
import { defineStore } from "pinia";

// defineStore(nombre, función): crea un store, un "almacén" de datos compartido por todas las páginas.
// Lo que se devuelve en el return es lo que pueden usar los demás.
export const useSeleccionStore = defineStore("seleccion", () => {
  // Estado: lo que se comparte entre páginas. ref = caja vigilada por Vue.
  const dni = ref("");
  const nomePaciente = ref("");

  // Acción: guarda el paciente elegido. Dentro del store, los ref se leen y escriben con .value
  function seleccionar(paciente) {
    dni.value = paciente.dnipac;
    nomePaciente.value = `${paciente.nomepac} ${paciente.apelpac}`;
  }

  // Acción: borra la selección
  function limpar() {
    dni.value = "";
    nomePaciente.value = "";
  }

  return { dni, nomePaciente, seleccionar, limpar };
});
```

## Paso 2 · Escribir desde pacientes

En `src/components/XestionPacientes.vue`, hay tres cambios.

Busca la línea `import { useMunicipioStore } from "../store/municipioStore.js";` y pega **justo debajo**:

```js
// Trae el store nuevo para poder usarlo en esta página
import { useSeleccionStore } from "../store/seleccionStore.js";
```

Busca la línea `const municipioStore = useMunicipioStore();` y pega **justo debajo**:

```js
// Se llama a la función `use...` para obtener el store; `seleccion` da acceso a sus acciones
const seleccion = useSeleccionStore();
```

Busca la línea `function editarPaciente(paciente) {` y pega **justo debajo** (como primera línea de la función):

```js
  // Guarda el paciente elegido en el store: cualquier otra página podrá leerlo
  seleccion.seleccionar(paciente);
```

## Paso 3 · Leer desde la portada

En `src/components/Inicio.vue`, hay tres cambios.

Busca la línea `import { Users, Stethoscope, CalendarDays, HeartPulse } from "lucide-vue-next";` y pega **justo debajo**:

```js
// storeToRefs convierte los datos del store en refs para usarlos en la pantalla sin perder la reactividad
import { storeToRefs } from "pinia";
import { useSeleccionStore } from "../store/seleccionStore.js";
```

Busca la línea `const accesos = [` y pega **justo encima**:

```js
// storeToRefs saca los datos del store sin perder la reactividad. Si se escribiera
// `const { nomePaciente } = useSeleccionStore()` se copiaría el valor y la pantalla no se actualizaría.
const { nomePaciente } = storeToRefs(useSeleccionStore());
```

Busca la línea que contiene `aria-label="Accesos rápidos"`. Es la etiqueta `<nav`. Pega esto **justo encima de ese `<nav`**:

```vue
  <!-- v-if: solo se pinta si hay un paciente guardado en el store -->
  <p v-if="nomePaciente" class="mb-4 text-sm text-fg-soft">
    Último paciente: <strong>{{ nomePaciente }}</strong>
  </p>
```

## Qué deberías ver

1. Entra en Pacientes y pulsa editar en uno (por ejemplo Lucía López).
2. Ve a la portada con el menú: aparece «Último paciente: Lucía López».
3. Recarga la página con F5: desaparece. Un store no sobrevive a recargar.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| La portada no muestra nada | No se llamó a `seleccionar`: revisa el Paso 2, tercera parte |
| Se ve «undefined undefined» | El paciente no tiene `nomepac` o `apelpac`: mira el objeto que llega |
| Se ve pero no se actualiza | Desestructuraste el store sin `storeToRefs` |
| `useSeleccionStore is not a function` | El nombre del import no coincide con el `export` del store |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Store de Pinia | Un objeto compartido entre páginas, con estado y acciones | `03_lecciones/07_pinia.md §4` |
| `storeToRefs` | Sacar datos de un store sin perder la reactividad | `03_lecciones/07_pinia.md §6` |
| Selección compartida | Elegir en una página y leerlo en otra | `03_lecciones/07_pinia.md §7` |
