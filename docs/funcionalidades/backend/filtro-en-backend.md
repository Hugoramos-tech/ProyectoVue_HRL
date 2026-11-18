# Filtro en el backend: `?estado=` y `?fecha=`

`GET /api/citas?estado=pendente&fecha=2026-11-19` devuelve solo esas citas, y la página de citas tiene un selector de estado y otro de fecha que usan esos parámetros.

*Versión extendida, con variantes y más casos: [apuntes a fondo, apartado 10](../../detalle/01-listas-filtros-y-busqueda.md).*

**Antes de empezar:** arranca el proyecto (`npm start`). El backend no recarga solo: reinícialo después del Paso 1.

## La idea

El filtro por paciente y por doctor ya existe: la ruta lee `req.query` (lo que va tras el `?`) y construye un objeto `filtro` que le pasa a Mongo. Aquí se añaden dos filtros más al mismo objeto, y se empuja la petición desde la web hasta la ruta pasando por la API y el store.

## Qué vas a tocar

| # | Fichero | Para qué |
|---|---|---|
| 1 | `backend/rutas/citas.rutas.js` | Que la ruta lea los parámetros nuevos |
| 2 | `src/api/citas.js` | Que la petición los envíe |
| 3 | `src/store/citaStore.js` | Guardar lo elegido y pasarlo al pedir |
| 4 | `src/components/Citas.vue` | Los controles |

## Paso 1 · La ruta

En `backend/rutas/citas.rutas.js`, busca la línea `if (req.query.paciente) filtro.pacienteDNI = req.query.paciente.toUpperCase()` y pega esto **justo debajo**:

```js
    if (req.query.estado) filtro.estado = req.query.estado
    if (req.query.fecha) filtro.fecha = req.query.fecha
    // Rango: ?desde=2026-11-14&hasta=2026-11-20. Las fechas son texto AAAA-MM-DD y comparar
    // ese texto con >= y <= da el orden correcto. $gte = mayor o igual; $lte = menor o igual.
    if (req.query.desde || req.query.hasta) {
        filtro.fecha = {}
        if (req.query.desde) filtro.fecha.$gte = req.query.desde
        if (req.query.hasta) filtro.fecha.$lte = req.query.hasta
    }
```

**Reinicia el backend** y prueba antes de tocar la web:

```bash
curl "localhost:3000/api/citas?estado=confirmada"
curl "localhost:3000/api/citas?desde=2026-11-14&hasta=2026-11-20"
curl "localhost:3000/api/citas"
```

Los dos primeros devuelven solo las citas que cumplen; el tercero, todas, como antes.

## Paso 2 · La API del frontend

En `src/api/citas.js`, hay dos cambios.

Busca la línea `export async function obtenerCitas({ paciente = "", doctor = "" } = {}) {` y **sustitúyela** por:

```js
export async function obtenerCitas({ paciente = "", doctor = "", estado = "", fecha = "" } = {}) {
```

Busca la línea `if (doctor) params.doctor = doctor;` y pega **justo debajo**:

```js
  if (estado) params.estado = estado;
  if (fecha) params.fecha = fecha;
```

## Paso 3 · El store

En `src/store/citaStore.js`, hay tres cambios.

Busca la línea `const idDoctor = ref("");` y pega **justo debajo**:

```js
  const estado = ref("");
  const fecha = ref("");
```

Busca la línea `citas.value = await obtenerCitas({ paciente: idPaciente.value, doctor: idDoctor.value });` y **sustitúyela** por:

```js
    citas.value = await obtenerCitas({
      paciente: idPaciente.value,
      doctor: idDoctor.value,
      estado: estado.value,
      fecha: fecha.value,
    });
```

Busca la línea `return { citas, idPaciente, idDoctor, cargarCitas, gardarCita, eliminarCitaPorId };` y **sustitúyela** por:

```js
  return { citas, idPaciente, idDoctor, estado, fecha, cargarCitas, gardarCita, eliminarCitaPorId };
```

## Paso 4 · Los controles en la página

En `src/components/Citas.vue`, hay dos cambios.

Busca la línea `const { citas, idPaciente, idDoctor } = storeToRefs(citaStore);` y **sustitúyela** por:

```js
const { citas, idPaciente, idDoctor, estado, fecha } = storeToRefs(citaStore);
```

Busca el comentario `<!-- Exporta a PDF todas las citas que hay ahora en la tabla -->`. Justo debajo hay un `<template #acciones>`. **Dentro de él, antes del `<AppButton`**, pega:

```vue
<select v-model="estado" @change="filtrarCitas">
  <option value="">Todos os estados</option>
  <option v-for="e in estados" :key="e.valor" :value="e.valor">{{ e.texto }}</option>
</select>
<input v-model="fecha" type="date" @change="filtrarCitas">
<AppButton @click="estado = ''; fecha = ''; filtrarCitas()">Limpar filtros</AppButton>
```

Qué hace: `filtrarCitas` ya existe en el fichero: vuelve a pedir las citas al servidor con lo que haya en el store.

## Qué deberías ver

1. Un selector de estado, un calendario y un botón «Limpar filtros» junto al PDF.
2. Elegir un estado recarga la tabla con solo esas citas.
3. Elegir una fecha filtra por ese día; las dos cosas a la vez se combinan.
4. «Limpar filtros» devuelve la lista completa.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El `curl` devuelve todas las citas | No reiniciaste el backend, o la línea del Paso 1 está fuera de `router.get('/', ...)` |
| La web no filtra pero el `curl` sí | Falta algún cambio de los pasos 2 o 3: la petición no lleva los parámetros |
| `estado is not defined` en la vista | Falta cambiar el `storeToRefs` del Paso 4 |
| Filtra pero al limpiar no vuelve | El botón no vacía `estado` y `fecha` antes de pedir |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Router de Express | Rutas agrupadas, y cómo leer `req.query` y `req.params` | `03_lecciones/03_crud_api_rest.md §3` |
| axios | Llamar a la API desde Vue | `03_lecciones/03_crud_api_rest.md §5` |
| REST y códigos de estado | Qué significan 200, 201, 204, 400, 404 y 409 | `03_lecciones/03_crud_api_rest.md §2` |

## Guías relacionadas

- [Guía: filtro nuevo](../../guias/filtro-nuevo.md)
- [Guía: endpoint nuevo](../../guias/endpoint-nuevo.md)
