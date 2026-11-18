# Columna con datos de otra tabla

En la tabla de citas, una columna con el **teléfono del paciente** y otra con el **correo del doctor**. La cita solo guarda el DNI del paciente y el id del doctor: el resto hay que buscarlo en sus listas.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Recuerda que esta pantalla solo carga datos si antes seleccionaste un paciente o un doctor en su pestaña.

## La idea

`Citas.vue` ya tiene cargadas las listas de pacientes y de doctores (`pacientes` y `doctores`, que se rellenan en `cargarDatos()`). Para una cita, se busca el paciente cuyo DNI coincide con `pacienteDNI` y se coge el campo que interese. Es exactamente lo que ya hacen `nombrePaciente()` y `nombreDoctor()` con el nombre, así que vamos a escribir dos funciones iguales al lado de ellas.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | Dos funciones, dos cabeceras y dos celdas |

## Paso 1 · Las dos funciones

En `src/components/Citas.vue`, busca la línea `// Devuelve siempre un string tanto si Mongoose entrega una referencia poblada como un ID.` y pega esto **justo encima**:

```js
// Telefono del paciente de una cita. La cita solo guarda el DNI, asi que hay que
// buscar a ese paciente en la lista `pacientes` y coger su movil.
// find devuelve el primero que cumple, o undefined si no hay ninguno.
// ?. = "si hay paciente, lee movilpac; si no, no falles". ?? "—" = "si no hay nada, pon un guion".
function movilPaciente(pacienteDNI) {
  const dni = normalizarDNI(pacienteDNI)
  return pacientes.value.find((p) => normalizarDNI(p.dnipac) === dni)?.movilpac ?? "—"
}

// Igual, pero con el doctor: la cita guarda su _id.
// idRelacionado() deja el id siempre como texto, venga suelto o venga poblado por Mongoose.
function mailDoctor(doctorId) {
  const id = idRelacionado(doctorId)
  return doctores.value.find((d) => String(d._id) === id)?.maildoc ?? "—"
}
```

Qué hace: `find` devuelve el paciente (o doctor) que cumple la condición; `?.movilpac` coge el teléfono y, si no se encontró a nadie, da `undefined` en vez de romper; `?? "—"` pone un guion en ese caso.

> `normalizarDNI` e `idRelacionado` **ya existen** en este fichero. Son importantes: el DNI puede venir con espacios o en minúsculas, y el id de doctor puede llegar como texto o como objeto.

## Paso 2 · Las cabeceras

En el `<thead>`, busca la línea `<th>Motivo</th>` y pega esto **justo encima**:

```vue
              <th>Tel. paciente</th>
              <th>Correo doctor</th>
```

## Paso 3 · Las celdas

En el `<tbody>`, busca la línea `<td>{{ item.motivo }}</td>` y pega esto **justo encima**:

```vue
              <!-- item es la cita de esta fila, la que reparte el v-for de arriba -->
              <td>{{ movilPaciente(item.pacienteDNI) }}</td>
              <td>{{ mailDoctor(item.doctorId) }}</td>
```

> El orden de los `<th>` y el de los `<td>` tiene que coincidir, o las columnas salen cambiadas.

## Paso 4 · Que salgan también en el PDF (opcional)

Dentro de `exportarCitas()`, busca:

```js
      cabeceras: ["Fecha", "Hora", "Paciente", "Doctor", "Motivo", "Estado"],
```

y **sustitúyela** por:

```js
      cabeceras: ["Fecha", "Hora", "Paciente", "Tel.", "Doctor", "Correo doctor", "Motivo", "Estado"],
```

Después, en el `map` de debajo, busca:

```js
        nombrePaciente(item.pacienteDNI),
        nombreDoctor(item.doctorId),
```

y **sustitúyela** por:

```js
        nombrePaciente(item.pacienteDNI),
        movilPaciente(item.pacienteDNI),
        nombreDoctor(item.doctorId),
        mailDoctor(item.doctorId),
```

> `cabeceras` y cada fila de `filas` tienen que llevar **el mismo número de elementos y en el mismo orden**.

## Variante · Cualquier otro campo

El patrón es siempre el mismo. Para la especialidad del doctor:

```js
function especialidadDoctor(doctorId) {
  const id = idRelacionado(doctorId)
  return doctores.value.find((d) => String(d._id) === id)?.espedoc ?? "—"
}
```

## Qué deberías ver

1. Dos columnas nuevas antes de «Motivo»: el teléfono del paciente y el correo del doctor.
2. Un guion «—» si el paciente o el doctor ya no existe, o si el doctor no tiene correo (es opcional).
3. Con el Paso 4, el PDF de citas incluye las dos columnas.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Todo sale «—» | Las listas aún no han cargado, o comparas sin `normalizarDNI` / `idRelacionado` |
| `movilPaciente is not defined` | El Paso 1 quedó dentro de otra función |
| `Cannot read properties of undefined` | Falta el `?.` antes del nombre del campo |
| Las columnas salen cambiadas de sitio | El orden de los `<th>` no coincide con el de los `<td>` |
| El correo del doctor sale «—» siempre | Compara con `d._id`, no con `d.id`: en Mongo el campo es `_id` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `Array.find` | Busca el primer elemento que cumple una condición |
| `?.` y `??` | Leer un campo sin romper si no existe, y poner un valor por defecto |
| Relaciones entre colecciones | La cita guarda un identificador, no una copia de los datos |

## Guías relacionadas

- [Guía: campo nuevo](../../guias/campo-nuevo.md)
