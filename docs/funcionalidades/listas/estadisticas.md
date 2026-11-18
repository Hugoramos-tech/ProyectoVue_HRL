# Totales y estadísticas

Tarjetas encima de la tabla de citas con el total y cuántas hay en cada estado, y debajo una línea por doctor con su número de citas.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Necesitas unas cuantas citas con estados distintos.

## La idea

Todo son `computed`: valores que se calculan a partir de `citas` y se rehacen solos cuando
esa lista cambia. No hay que llamar a nada después de crear o borrar una cita, los números se
actualizan por su cuenta. Eso es lo que hay que saber explicar de esta receta.

> **Los números cuentan la lista que hay cargada en la pantalla**, no toda la base de datos.
> Si has entrado con un paciente seleccionado, el «Total» es el de ese paciente. Para totales
> reales está [resumen con aggregate](../backend/resumen-aggregate.md), que los calcula en
> MongoDB.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | Los cálculos y las tarjetas |

## Paso 1 · Los cálculos

Busca la línea `// Al abrir la pantalla basta con que haya un paciente o un doctor seleccionado.` y pega esto **justo encima**:

```js
// Los cuatro estados, en el orden en que se quieren ver.
// Son los mismos valores que guarda el backend; etiquetaEstado() ya los traduce.
const ESTADOS = ["pendente", "confirmada", "realizada", "cancelada"]

// Una tarjeta por estado, con cuantas citas hay en el.
// computed se recalcula solo al crear, editar o borrar citas.
const totalesPorEstado = computed(() =>
  ESTADOS.map((estado) => ({
    estado,
    // etiquetaEstado() ya existe en este fichero: traduce "pendente" a "Pendiente".
    texto: etiquetaEstado(estado),
    // filter deja las de ese estado y .length dice cuantas son.
    total: citas.value.filter((item) => item.estado === estado).length,
  }))
)

// Cuantas citas tiene cada doctor.
// Se cuenta primero en un objeto { idDoctor: total } y despues se convierte en lista.
const citasPorDoctor = computed(() => {
  const cuenta = {}

  for (const item of citas.value) {
    const id = String(item.doctorId)
    // ?? 0 = si ese doctor todavia no estaba en el objeto, empieza en 0 y suma 1.
    cuenta[id] = (cuenta[id] ?? 0) + 1
  }

  // Object.entries convierte { "id1": 3, "id2": 1 } en [["id1", 3], ["id2", 1]].
  return (
    Object.entries(cuenta)
      // nombreDoctor() ya existe en este fichero y traduce el id al nombre.
      .map(([id, total]) => ({ id, nombre: nombreDoctor(id), total }))
      // De mas citas a menos. b - a es descendente; a - b seria ascendente.
      .sort((a, b) => b.total - a.total)
  )
})

// El doctor con mas citas, o null si no hay ninguna.
// Como la lista ya esta ordenada, es simplemente el primero.
const doctorConMasCitas = computed(() => citasPorDoctor.value[0] ?? null)
```

`computed`, `etiquetaEstado` y `nombreDoctor` ya están en ese fichero: no hay que importar ni
escribir nada más.

## Paso 2 · Las tarjetas

En el `<template>`, busca la línea `      <div class="citas-cabecera-lista">` y pega esto **justo encima**:

```vue
      <!-- Rejilla de tarjetas. auto-fit reparte las columnas segun el ancho:
           una en movil y varias en pantalla ancha, sin escribir media queries. -->
      <div class="mb-6 grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
        <div class="rounded-xl bg-[#f3f7f5] p-4">
          <p class="text-sm text-[#64737a]">
            Total
          </p>
          <p class="text-2xl font-bold text-[#14543a]">
            {{ citas.length }}
          </p>
        </div>

        <!-- Una tarjeta por estado. :key es su identificador unico -->
        <div
          v-for="t in totalesPorEstado"
          :key="t.estado"
          class="rounded-xl bg-[#f3f7f5] p-4"
        >
          <p class="text-sm text-[#64737a]">
            {{ t.texto }}
          </p>
          <p class="text-2xl font-bold text-[#14543a]">
            {{ t.total }}
          </p>
        </div>
      </div>

      <!-- v-if: la lista solo se pinta si hay algo que contar -->
      <div v-if="citasPorDoctor.length" class="mb-6">
        <h4>Citas por doctor</h4>
        <ul>
          <li
            v-for="d in citasPorDoctor"
            :key="d.id"
          >
            {{ d.nombre }}: {{ d.total }}
          </li>
        </ul>
        <p v-if="doctorConMasCitas">
          <strong>El que más:</strong> {{ doctorConMasCitas.nombre }}
          ({{ doctorConMasCitas.total }} citas)
        </p>
      </div>
```

## Variante · El porcentaje de cada estado

En el Paso 1, dentro del `map`:

```js
    // Math.round redondea. El ?? 0 evita dividir entre cero cuando no hay citas.
    porcentaje: citas.value.length
      ? Math.round((citas.value.filter((item) => item.estado === estado).length / citas.value.length) * 100)
      : 0,
```

Y en la tarjeta: `<p class="text-xs">{{ t.porcentaje }}%</p>`.

## Variante · Solo las de hoy

```js
const hoyTexto = new Date().toLocaleDateString("sv-SE")

const citasDeHoy = computed(() => citas.value.filter((item) => item.fecha === hoyTexto).length)
```

Una tarjeta más con `{{ citasDeHoy }}`. `toLocaleDateString("sv-SE")` da `aaaa-mm-dd` en hora
local, que es el formato en que se guarda la fecha.

## Variante · Que las tarjetas filtren al pulsarlas

Combinada con [filtro en el cliente](filtro-en-cliente.md), cada tarjeta puede servir de
filtro:

```vue
        <button
          v-for="t in totalesPorEstado"
          :key="t.estado"
          type="button"
          class="rounded-xl bg-[#f3f7f5] p-4 text-left"
          :class="{ 'ring-2 ring-[#14543a]': filtroEstado === t.estado }"
          @click="filtroEstado = filtroEstado === t.estado ? '' : t.estado"
        >
```

Pulsar una la activa, volver a pulsarla la quita. Es el tipo de detalle que convierte una
tabla de números en algo que se usa.

## Variante · Calcularlo en el servidor

Con muchos registros, contar en el navegador obliga a traérselos todos. MongoDB lo hace mejor
con `aggregate`, y está en [resumen con aggregate](../backend/resumen-aggregate.md). La
diferencia que conviene saber explicar: **en el cliente los números son de lo que hay
cargado; en el servidor, de toda la colección.**

## Qué deberías ver

1. Encima de la tabla, cinco tarjetas: Total, Pendiente, Confirmada, Realizada y Cancelada.
2. Debajo, una línea por doctor con su número de citas, de más a menos, y cuál es el que más.
3. Cambia el estado de una cita o borra una: **los números se actualizan solos**, sin recargar. Eso es `computed` funcionando.
4. Los cuatro estados suman el total.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `totalesPorEstado is not defined` | El Paso 1 quedó dentro de otra función |
| Los estados no suman el total | Hay citas con un estado que no está en `ESTADOS`, por ejemplo escrito con mayúscula |
| Sale «Doctor no disponible» o un guion | Los doctores todavía no han cargado, o esa cita apunta a un doctor borrado |
| Todas las tarjetas a cero | `citas` está vacía: ¿hay un paciente seleccionado que no tiene citas? |
| Los totales son solo de un paciente | Es correcto: cuentan la lista cargada. Mira el aviso del principio |
| Las tarjetas salen una debajo de otra | La clase de la rejilla tiene que estar entera, sin cortar |
| Los números no cambian al borrar | Usaste una variable normal en vez de `computed` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `computed` | Un valor que se calcula solo y se rehace cuando cambian sus datos |
| `filter(...).length` | Contar cuántos cumplen una condición |
| Contar en un objeto | `cuenta[clave] = (cuenta[clave] ?? 0) + 1` |
| `Object.entries` | Convertir un objeto en una lista de pares |
| `sort((a, b) => b.total - a.total)` | Ordenar de mayor a menor |
| `grid-cols-[repeat(auto-fit,...)]` | Una rejilla que se adapta sola al ancho |

## Guías relacionadas

- [Contadores y el que más](../columnas-y-filtros/contador-de-resultados.md)
- [Resumen con aggregate](../backend/resumen-aggregate.md)
- [Filtro en el cliente](filtro-en-cliente.md)
- [Citas de hoy en la portada](../pinia/citas-de-hoy.md)
