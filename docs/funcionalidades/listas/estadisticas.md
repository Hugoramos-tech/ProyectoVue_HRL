# Totales y estadísticas

Tarjetas encima de la tabla de citas con el total y cuántas hay en cada estado, y una lista de citas por doctor.

*Versión extendida, con variantes y más casos: [apuntes a fondo, apartado 9](../../detalle/01-listas-filtros-y-busqueda.md).*

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | Los cálculos y las tarjetas |

## Paso 1 · Los cálculos

En `src/components/Citas.vue`, busca la línea `// Texto de la tabla cuando no hay filas: distingue "no hay citas" de "no hay con este filtro".` y pega este bloque **justo encima**:

```js
// Una tarjeta por estado, con cuántas citas hay en él. Recorre la lista `estados` que ya existe.
// computed = se recalcula solo al crear, editar o borrar citas.
const totalesPorEstado = computed(() =>
  estados.map((e) => ({
    ...e, // copia valor y texto del estado ({ valor: "pendente", texto: "Pendente" })
    // se cuentan las citas con ese estado: filter las filtra y .length dice cuántas hay
    total: citas.value.filter((c) => c.estado === e.valor).length,
  }))
);

// Cuántas citas tiene cada doctor: se cuenta en un objeto { idDoctor: total } y después se
// convierte en una lista con el nombre del doctor.
const citasPorDoctor = computed(() => {
  const cuenta = {};
  for (const c of citas.value) {
    // `?? 0` = si ese doctor aún no estaba en el objeto, empieza en 0; luego suma 1
    cuenta[c.doctorId] = (cuenta[c.doctorId] ?? 0) + 1;
  }
  // Object.entries(cuenta) -> [["id1", 3], ["id2", 1]]; map lo convierte en { doctor, total }
  return Object.entries(cuenta).map(([id, total]) => ({
    doctor: doctorStore.nombrePorId(id), // el store traduce el id al nombre
    total,
  }));
});
```

Qué hace: `computed` se recalcula solo cuando cambia `citas`, así que los números se actualizan al crear, editar o borrar una cita.

## Paso 2 · Las tarjetas

En `src/components/Citas.vue`, busca la línea `titulo="Listaxe de citas"`. Justo encima está la etiqueta `<AppSection`. Pega este bloque **encima de ese `<AppSection`**:

```vue
<!-- Rejilla de tarjetas: auto-fit reparte las columnas sola según el ancho disponible -->
<div class="mb-6 grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
  <div class="rounded-xl bg-subtle p-4">
    <p class="text-sm text-fg-soft">Total</p>
    <p class="text-2xl font-semibold">{{ citas.length }}</p>
  </div>
  <!-- v-for: una tarjeta por estado; :key = identificador único de cada una -->
  <div v-for="t in totalesPorEstado" :key="t.valor" class="rounded-xl bg-subtle p-4">
    <p class="text-sm text-fg-soft">{{ t.texto }}</p>
    <p class="text-2xl font-semibold">{{ t.total }}</p>
  </div>
</div>

<!-- Una línea por doctor con su número de citas -->
<ul class="mb-6 text-sm">
  <li v-for="d in citasPorDoctor" :key="d.doctor">{{ d.doctor }}: {{ d.total }}</li>
</ul>
```

Qué hace: la rejilla `grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]` reparte las tarjetas sola: una columna en móvil y varias en pantalla ancha.

## Qué deberías ver

1. Encima de la tabla, una tarjeta «Total» y una por cada estado (Pendente, Confirmada, Realizada, Cancelada).
2. Debajo, una línea por doctor con su número de citas.
3. Crea una cita o cambia un estado y los números se actualizan sin recargar.

**Ojo:** los números cuentan la lista `citas` que hay cargada en la página. Si has filtrado por paciente o doctor, el «Total» es el de ese filtro, no el de toda la base. Para totales reales usa la receta [Resumen con aggregate](../backend/resumen-aggregate.md).

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Error `totalesPorEstado is not defined` | Falta el Paso 1, o el bloque está dentro de otra función |
| Los números no suman el total | Hay citas con un estado que no está en la lista `estados` |
| Salen guiones «—» en lugar del doctor | Los doctores aún no han cargado |
| Los totales cuentan solo un paciente | La lista `citas` del store está filtrada por paciente o doctor |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `computed` | Un dato que se calcula solo a partir de otros y se rehace cuando cambian | `03_lecciones/vue/07_computed.md` |
| `v-for` con `:key` | Repite un elemento por cada elemento de una lista | `03_lecciones/vue/03_v_for.md` |
| Grid y responsive | Rejillas y prefijos `sm:`, `md:`, `lg:` | `03_lecciones/04_tailwind.md §6 y §7` |
