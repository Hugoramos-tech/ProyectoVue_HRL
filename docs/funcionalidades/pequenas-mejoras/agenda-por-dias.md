# Agenda: las citas agrupadas por día

Debajo de la tabla de citas, una sección «Axenda por días» con un título por cada día y, debajo, sus citas por orden de hora.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Necesitas citas de varios días.

## La idea

Agrupar es recorrer la lista y meter cada cita en una caja que tiene el nombre de su día: un objeto `{ "2026-12-01": [cita, cita], "2026-12-02": [cita] }`. Después se convierte en una lista de `{ fecha, lista }` para recorrerla con dos `v-for` anidados: uno por día y otro por cita.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | El agrupado y la sección nueva |

## Paso 1 · El agrupado

En `src/components/Citas.vue`, busca la línea `// Texto de la tabla cuando no hay filas: distingue "no hay citas" de "no hay con este filtro".` y pega esto **justo encima**:

```js
// { fecha, lista } por cada día que tiene citas, con los días y las citas ya ordenados.
// computed = se recalcula solo cuando cambia la lista de citas.
const citasPorDia = computed(() => {
  // grupos = { "2026-12-01": [cita, cita], "2026-12-02": [cita] }
  const grupos = {};
  for (const cita of citas.value) {
    // `??=` = "si ese día aún no tiene lista, créala vacía"; después se añade la cita
    (grupos[cita.fecha] ??= []).push(cita);
  }
  // Object.keys saca los días; .sort() los ordena (como son aaaa-mm-dd, el orden de texto es el cronológico)
  return Object.keys(grupos)
    .sort()
    .map((fecha) => ({
      fecha,
      // Dentro de cada día, por hora. localeCompare compara dos textos y dice cuál va antes.
      lista: grupos[fecha].sort((a, b) => a.hora.localeCompare(b.hora)),
    }));
});
```

Qué hace: `??=` crea la lista de ese día la primera vez que aparece. `Object.keys(...).sort()` ordena los días (como son `aaaa-mm-dd`, el orden de texto es el cronológico).

## Paso 2 · La sección

Busca estas dos líneas (son las últimas del fichero, juntas) y **sustitúyelas** por el bloque de debajo:

```vue
  </AppSection>
</template>
```

```vue
  </AppSection>

  <!-- Sección nueva debajo de la tabla -->
  <AppSection
    titulo="Axenda por días"
    :icono="CalendarDays"
  >
    <p
      v-if="citasPorDia.length === 0"
      class="text-sm text-fg-muted"
    >
      Non hai citas.
    </p>
    <!-- Bucle exterior: un bloque por día -->
    <div
      v-for="dia in citasPorDia"
      :key="dia.fecha"
      class="mb-4"
    >
      <h3 class="mb-1 font-semibold">
        {{ dia.fecha }}
      </h3>
      <ul class="text-sm">
        <!-- Bucle interior: una línea por cita de ese día. Dos v-for anidados. -->
        <li
          v-for="c in dia.lista"
          :key="c.id"
        >
          {{ c.hora }} · {{ pacienteStore.nombrePorDni(c.pacienteDNI) }} con {{ doctorStore.nombrePorId(c.doctorId) }}
        </li>
      </ul>
    </div>
  </AppSection>
</template>
```

## Variante · Solo un doctor

Si ya filtras por doctor en el formulario (o con la receta de filtros), la agenda muestra solo sus citas, porque lee la misma lista `citas`.

## Qué deberías ver

1. Una sección nueva debajo de la tabla.
2. Un título por día (`2026-12-01`) y debajo «10:00 · Lucía López con Ana García».
3. Los días van de más antiguo a más reciente y las citas de cada día por hora.
4. Al crear o borrar una cita, la agenda se actualiza sola.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Aparece la agenda pero vacía | El Paso 1 usa `citas` sin `.value` |
| Los días salen desordenados | Falta el `.sort()` sobre las claves |
| `Object.keys is not iterable` | Se escribió `Object.entries` sin convertir; usa el código de arriba |
| La sección sale dentro de la anterior | El bloque del Paso 2 no sustituyó las dos líneas finales exactas |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `computed` | El agrupado se recalcula solo | `03_lecciones/vue/07_computed.md` |
| `v-for` anidado con `:key` | Un bucle dentro de otro | `03_lecciones/vue/03_v_for.md` |

## Guías relacionadas

- [Estadísticas](../listas/estadisticas.md)
- [Citas de hoy](../pinia/citas-de-hoy.md)
