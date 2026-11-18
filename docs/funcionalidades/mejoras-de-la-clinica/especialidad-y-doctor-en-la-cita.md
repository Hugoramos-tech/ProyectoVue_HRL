# Elegir primero la especialidad y después el doctor, al pedir una cita

En el formulario de citas, un desplegable de **especialidad** antes del de doctor. Al elegir una, el desplegable de doctores solo ofrece los de esa especialidad. Así se evita buscar un cardiólogo entre todos los doctores.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Necesitas doctores de al menos dos especialidades.

## La idea

Es el mismo patrón que provincia → municipio: el segundo desplegable lee una lista que depende del primero. Se guarda la especialidad elegida, un `computed` filtra los doctores por ella, y si el doctor que había elegido ya no está en la lista, se borra.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | La especialidad elegida, la lista filtrada y el desplegable |

## Paso 1 · La lógica

En `src/components/Citas.vue`, busca la línea `// Texto de la tabla cuando no hay filas: distingue "no hay citas" de "no hay con este filtro".` y pega esto **justo encima**:

```js
// Especialidad elegida en el desplegable nuevo ("" = todas). ref = caja vigilada por Vue.
const especialidadElegida = ref("");

// Las especialidades que existen, sin repetir. new Set(...) quita duplicados; [...] lo vuelve una lista.
const especialidadesDoctores = computed(() => [
  ...new Set(doctores.value.map((d) => d.espedoc)),
]);

// Los doctores que se pueden elegir: los de esa especialidad, o todos si no hay ninguna elegida.
// computed = se recalcula sola cuando cambia la especialidad o la lista de doctores.
const doctoresDaEspecialidade = computed(() =>
  especialidadElegida.value
    ? doctores.value.filter((d) => d.espedoc === especialidadElegida.value)
    : doctores.value
);

// Se ejecuta al cambiar la especialidad. Si el doctor que estaba elegido no es de la nueva
// especialidad, se vacía (si no, el formulario enviaría un doctor que ya no aparece en la lista).
function cambiarEspecialidade() {
  if (!doctoresDaEspecialidade.value.some((d) => d.id === datos.doctorId)) datos.doctorId = "";
}
```

## Paso 2 · Importar `ref`

Busca la línea `import { computed, watch } from "vue";` y **sustitúyela** por:

```js
import { ref, computed, watch } from "vue";
```

Si ya la cambiaste en otra receta, salta este paso.

## Paso 3 · El desplegable de especialidad

Busca el comentario `<!-- Doctor: misma idea, guarda el id y muestra el nombre -->` y pega esto **justo encima**:

```vue
      <FormField label="Especialidade:">
        <!-- v-model guarda la elección en `especialidadElegida`; @change llama a la función al cambiar -->
        <select
          v-model="especialidadElegida"
          @change="cambiarEspecialidade"
        >
          <option value="">
            Todas as especialidades
          </option>
          <!-- Una opción por especialidad. :key = identificador único de cada una -->
          <option
            v-for="e in especialidadesDoctores"
            :key="e"
            :value="e"
          >
            {{ e }}
          </option>
        </select>
      </FormField>
```

## Paso 4 · El desplegable de doctor lee la lista filtrada

Busca la línea `v-for="d in doctores"` y **sustitúyela** por:

```vue
            v-for="d in doctoresDaEspecialidade"
```

## Qué deberías ver

1. Un desplegable «Especialidade» antes de «Doctor».
2. Con «Cardiología» elegida, «Doctor» solo ofrece cardiólogos.
3. Si ya tenías un doctor de otra especialidad elegido, se vacía.
4. Con «Todas as especialidades» salen todos los doctores.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `ref is not defined` | Falta el Paso 2 |
| El desplegable de doctor no cambia | Falta el Paso 4: sigue leyendo `doctores` |
| Las especialidades salen vacías | Los doctores aún no han cargado |
| Al editar una cita, la especialidad sale en «Todas» | Es normal: solo filtra lo que eliges tú, el doctor de la cita sigue elegido |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `computed` | La lista de doctores depende de la especialidad | `03_lecciones/vue/07_computed.md` |
| `v-model` y `@change` | Guardar lo elegido y reaccionar al cambio | `03_lecciones/vue/02_v_model.md` |
| `v-for` con `:key` | Una opción por especialidad | `03_lecciones/vue/03_v_for.md` |

## Guías relacionadas

- [Filtro de provincia y municipio en cascada](../columnas-y-filtros/filtro-municipio-en-cascada.md)
- [Guía: filtro nuevo](../../guias/filtro-nuevo.md)
