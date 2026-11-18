# Avisar si el móvil ya lo tiene otro paciente

Al salir del campo «Móbil» del formulario de pacientes, si otro paciente ya tiene ese número, sale una alerta con su nombre. Y en el servidor, un `409` para que no se cuele por la API.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/XestionPacientes`). Tiene que haber un paciente con un móvil conocido.

## La idea

La lista de pacientes **ya está cargada** en la pantalla, en `pacientes.value`. No hace falta
preguntar al servidor: basta buscar en esa lista a otro paciente con el mismo número cuando
el campo pierde el foco (`@blur`).

Es el mismo patrón que `dniDuplicado()`, que ya está en ese fichero, pero con el móvil.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | La función y el `@blur` del campo |
| `backend/rutas/pacientes.rutas.js` | El mismo control en el servidor |

## Paso 1 · La función

En `src/components/XestionPacientes.vue`, busca la línea `function sanitizarMobil() {` y pega esto **justo encima**:

```js
// Avisa si otro paciente ya tiene el movil escrito en el formulario.
// Es el mismo patron que dniDuplicado(), unas lineas mas abajo.
function avisarMovilRepetido() {
  // Se quitan los espacios antes de comparar, igual que hace sanitizarMobil.
  const movil = String(novoPaciente.movilpac ?? "").replace(/\s+/g, "");

  // Con el campo vacio no hay nada que comparar.
  if (!movil) {
    return;
  }

  // El DNI del paciente que se esta editando, para no avisarlo contra si mismo.
  const dniActual = String(novoPaciente.dnipac ?? "").trim().toUpperCase();

  // find devuelve el PRIMERO que cumple la condicion, o undefined.
  const otro = pacientes.value.find(
    (p) =>
      String(p.movilpac ?? "").replace(/\s+/g, "") === movil &&
      // Y que no sea el propio paciente: el DNI es lo que los identifica aqui.
      String(p.dnipac ?? "").trim().toUpperCase() !== dniActual
  );

  if (otro) {
    // El segundo argumento de alertaError es el titulo de la ventana.
    alertaError(
      `Ese móvil ya lo tiene ${otro.nomepac} ${otro.apelpac} (${otro.dnipac}).`,
      "Móvil repetido"
    );
  }
}
```

Fíjate en que la comparación es por **DNI**, no por `_id`: en esta pantalla el `_id` no está
en el formulario, y el DNI es el identificador del paciente en todo el proyecto.

## Paso 2 · El `@blur`

En el `<template>`, busca la línea `            @blur="sanitizarMobil"` y **sustitúyela** por:

```vue
            @blur="sanitizarMobil(); avisarMovilRepetido()"
```

Las dos cosas separadas por punto y coma: primero se limpian los espacios, y luego se
compara el número ya limpio. El orden importa.

## Paso 3 · En el servidor

Tu backend ya rechaza el DNI repetido con `409`. Esto es lo mismo con el móvil.

En `backend/rutas/pacientes.rutas.js`, busca la línea `        const pacienteDuplicado = await Paciente.findOne({ dnipac });` y pega esto **justo encima**:

```js
        // findOne devuelve el primer paciente con ese movil, o null.
        // movilpac ya viene normalizado unas lineas arriba, sin espacios.
        const movilDuplicado = await Paciente.findOne({ movilpac });

        if (movilDuplicado) {
            // 409 Conflict: el dato choca con uno que ya existe.
            return res.status(409).json({
                mensaje: "Ya existe un paciente con ese móvil"
            });
        }

```

**Reinicia el backend.** Con esto el servidor rechaza el duplicado aunque la web no avise, o
aunque alguien llame a la API directamente.

La clave se llama `mensaje` porque es la que lee `mensaxeDoErro(...)` en
`XestionPacientes.vue`: así el texto sale solo en la alerta.

## Variante · Al editar, en el PUT

El Paso 3 solo cubre el alta. Para que tampoco se pueda **cambiar** un móvil al de otro, en
el `PUT` de ese mismo fichero, antes de actualizar:

```js
        // $ne = "distinto de": se deja fuera al propio paciente, que si puede
        // conservar su movil. Sin esto, editar sin tocar el movil daria 409.
        if (req.body.movilpac) {
            const movil = String(req.body.movilpac).replace(/\s+/g, "")
            const otro = await Paciente.findOne({ movilpac: movil, dnipac: { $ne: req.params.dni } })
            if (otro) {
                return res.status(409).json({ mensaje: "Ya existe un paciente con ese móvil" })
            }
        }
```

Ese `$ne` es el detalle que distingue un control de duplicados bien hecho: sin él, guardar un
paciente sin cambiarle nada daría error contra sí mismo.

## Variante · Con un índice único, sin código

En `backend/modelos/Paciente.js`, al campo del móvil:

```js
        movilpac: { type: String, required: true, unique: true },
```

MongoDB rechaza el duplicado por sí solo y el error llega como código `11000`. Hay que
traducirlo en el `catch`:

```js
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: "Ese móvil ya está registrado" })
        }
```

Es más corto y no se puede saltar, pero **el índice se crea al arrancar**: si ya hay móviles
repetidos en la base de datos, no se crea y no avisa de nada. Hay que limpiarlos primero.

## Variante · Avisar sin alerta, debajo del campo

Más suave que una ventana modal. En vez de la función del Paso 1:

```js
const movilRepetido = computed(() => {
  const movil = String(novoPaciente.movilpac ?? "").replace(/\s+/g, "");
  const dniActual = String(novoPaciente.dnipac ?? "").trim().toUpperCase();
  if (!movil) {
    return "";
  }
  const otro = pacientes.value.find(
    (p) =>
      String(p.movilpac ?? "").replace(/\s+/g, "") === movil &&
      String(p.dnipac ?? "").trim().toUpperCase() !== dniActual
  );
  return otro ? `Ese móvil ya lo tiene ${otro.nomepac} ${otro.apelpac}.` : "";
});
```

Y en el `<template>`, debajo del `<input>` del móvil:

```vue
          <small v-if="movilRepetido" class="erro-campo">{{ movilRepetido }}</small>
```

Esta versión avisa **mientras se escribe**, no al salir del campo, y necesita que
`computed` esté en el import de Vue de ese fichero (no lo está: hay que añadirlo).

## Qué deberías ver

1. Escribes el móvil de otro paciente y sales del campo: alerta roja «Ese móvil ya lo tiene Ana López (12345678Z).».
2. Con un móvil nuevo, no pasa nada.
3. Edita a un paciente **sin** cambiarle el móvil: no avisa.
4. Con el Paso 3, intenta crear por la API un paciente con un móvil repetido: `409`.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| No avisa nunca | Falta el Paso 2, o el `@blur` quedó fuera del `<input>` |
| Avisa al editar al propio paciente | Falta la comparación del DNI; o el DNI del formulario está vacío porque entraste por «Buscar» |
| `avisarMovilRepetido is not defined` | El Paso 1 quedó dentro de otra función |
| La alerta sale sin título | `alertaError(mensaje, titulo)`: el título es el segundo argumento |
| No detecta el repetido | Los espacios: hay que quitarlos en los dos lados antes de comparar |
| Con el Paso 3 no responde `409` | No reiniciaste el backend |
| Con el Paso 3, editar un paciente da `409` | El Paso 3 solo toca el `POST`; mira la variante del `PUT`, con el `$ne` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `@blur` | Hacer algo al salir de un campo |
| `Array.find` | El primer elemento que cumple una condición, o `undefined` |
| Comparar normalizando | Quitar espacios y pasar a mayúsculas en los dos lados |
| Código `409` | Conflicto: el dato choca con otro |
| `$ne` | «Distinto de», para dejar fuera el propio registro |
| `unique: true` | Que MongoDB garantice la unicidad, con error `11000` |

## Guías relacionadas

- [Teléfono solo números](telefono-solo-numeros.md)
- [DNI con autocarga](../como-el-profe/dni-autocarga.md)
- [Validaciones](../validacion/validaciones.md)
- [Índice único](../backend/indice-unico.md)
