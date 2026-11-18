# DNI válido: buscar el paciente y cargarlo solo

Al salir del campo DNI, si la letra de control cuadra, la web busca ese DNI en la base de datos. Si el paciente existe, rellena el formulario para editarlo. Si no existe, no hace nada y se puede dar de alta con normalidad.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/XestionPacientes`). Crea antes un paciente con un DNI válido, por ejemplo `12345678Z`.

## La idea

Tu pantalla ya tiene las tres piezas; solo están sueltas:

| Pieza | Qué hace hoy |
|---|---|
| `esDniCorrecto()` | Comprueba el formato y calcula la letra de control |
| `buscarPaciente()` | Pide el paciente al servidor y, si existe, rellena el formulario |
| `@blur="sanitizarDni"` | Al salir del campo, lo pasa a mayúsculas y quita espacios |
| El botón 🔎 | Llama a `buscarPaciente()` **a mano** |

Lo que falta es que el `@blur` encadene las tres: limpiar, validar y, si es válido, buscar.
Así el botón de la lupa deja de ser necesario, aunque se puede dejar.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | Una función nueva y el `@blur` del campo |

## Paso 1 · La función que encadena

Busca la línea `function esDniCorrecto() {` y pega esto **justo encima**:

```js
// Al salir del campo DNI: limpiar, validar y, si cuadra, buscarlo en la base de datos.
// async permite usar await dentro: esperar a que termine la peticion antes de seguir.
async function autocargarPorDni() {
  // Primero lo de siempre: mayusculas y sin espacios.
  sanitizarDni();

  // Sin DNI, o con la letra mal, no se molesta al servidor.
  // esDniCorrecto() ya comprueba el formato y calcula la letra de control.
  if (!novoPaciente.dnipac || !esDniCorrecto()) {
    return;
  }

  // Si ya se esta editando a alguien, no se vuelve a buscar: se perderian
  // los cambios que el usuario tenga a medio escribir.
  if (editando.value) {
    return;
  }

  // buscarPaciente() hace el resto: pide el paciente, rellena el formulario,
  // lo deja seleccionado en Pinia, carga sus municipios y avisa.
  // Si no existe, enseña "No se encontro ningun paciente con ese DNI".
  await autocargarSilencioso();
}

// Igual que buscarPaciente(), pero sin avisar cuando NO existe: en un alta
// nueva es lo normal y el aviso molestaria en cada DNI que se escriba.
async function autocargarSilencioso() {
  try {
    const paciente = await getPacienteByDni(novoPaciente.dnipac);
    seleccionarPaciente(paciente);
    // Object.assign copia las propiedades DENTRO del objeto reactive,
    // sin sustituirlo: si se sustituyera, se perderia la reactividad.
    Object.assign(novoPaciente, paciente);
    editando.value = true;
    await cargarMunicipios();
    alertaInfo("Ese DNI ya existe: se ha cargado el paciente para editarlo.");
  } catch (error) {
    // 404 es lo esperado en un alta: no se avisa de nada.
    if (error.response?.status !== 404) {
      alertaError(mensaxeDoErro(error, "No se pudo comprobar el DNI."));
    }
  }
}
```

Todo lo que usa (`sanitizarDni`, `esDniCorrecto`, `editando`, `getPacienteByDni`,
`seleccionarPaciente`, `cargarMunicipios`, `alertaInfo`, `alertaError`, `mensaxeDoErro`) ya
está en ese fichero: **no hay que importar nada**.

## Paso 2 · El `@blur`

En el `<template>`, busca la línea `              @blur="sanitizarDni"` y **sustitúyela** por:

```vue
              @blur="autocargarPorDni"
```

`autocargarPorDni` llama a `sanitizarDni()` en su primera línea, así que no se pierde nada.

## Variante · Más corta, reutilizando `buscarPaciente`

Si no te importa que avise cuando el DNI no existe, el Paso 1 se queda en esto:

```js
async function autocargarPorDni() {
  sanitizarDni();
  if (novoPaciente.dnipac && esDniCorrecto() && !editando.value) {
    await buscarPaciente();
  }
}
```

Son cinco líneas y aprueba igual. La única diferencia es que al escribir un DNI nuevo saldrá
un «No se encontró ningún paciente con ese DNI» que en un alta sobra.

## Variante · Avisar de la letra mal en vez de callarse

Tu campo ya marca el error en rojo con `:class="{ incorrecto: hayError('dni') ... }"`. Para
que además salte un aviso, dentro de `autocargarPorDni`:

```js
  if (novoPaciente.dnipac && !esDniCorrecto()) {
    alertaError("La letra del DNI no es correcta.", "DNI incorrecto");
    // Devuelve el foco al campo para que se corrija sin buscarlo con el raton.
    dniInput.value?.focus();
    return;
  }
```

`dniInput` es el `ref` que ya tiene ese `<input>`: por eso está puesto en el template.

## Variante · Buscar en la lista ya cargada, sin ir al servidor

Más rápido, pero solo encuentra a los que estén en la página:

```js
function autocargarPorDni() {
  sanitizarDni();
  if (!esDniCorrecto() || editando.value) {
    return;
  }
  const existente = pacientes.value.find((p) => p.dnipac === novoPaciente.dnipac);
  if (existente) {
    Object.assign(novoPaciente, existente);
    editando.value = true;
    alertaInfo("Ese DNI ya existe: se ha cargado el paciente para editarlo.");
  }
}
```

Esta versión no necesita `async` ni `await`, porque no hay petición. El coste: si la lista
está filtrada o paginada, un paciente que exista puede no aparecer.

## Qué deberías ver

1. Escribes `12345678Z` y sales del campo: el formulario se rellena con ese paciente, el botón pasa a «Guardar cambios» y sale el aviso.
2. Ese paciente queda seleccionado: ve a Citas y ya aparece.
3. Escribes un DNI válido que no existe: no pasa nada y se puede seguir rellenando el alta.
4. Escribes un DNI con la letra mal: el campo se marca en rojo y **no se llama al servidor**. Compruébalo en la pestaña Network de F12: no hay petición.
5. Con un paciente ya cargado, cambiar el DNI no vuelve a buscar.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| No hace nada al salir del campo | Falta el Paso 2, o el `@blur` quedó fuera del `<input>` |
| `autocargarPorDni is not defined` | El Paso 1 quedó dentro de otra función |
| `await` da error de sintaxis | Falta `async` delante de `function autocargarPorDni` |
| Sale «no encontrado» cada vez que escribo un DNI nuevo | Estás usando la variante corta, que llama a `buscarPaciente()` |
| El DNI ya no se pasa a mayúsculas | Falta el `sanitizarDni()` de la primera línea |
| Carga el paciente pero los municipios salen vacíos | Falta el `await cargarMunicipios()` |
| Busca aunque la letra esté mal | `esDniCorrecto()` se llama **sin** paréntesis: es una función, no un valor |
| Pierdo lo escrito al volver al campo del DNI | Falta la comprobación de `editando.value` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `async` / `await` | Esperar a que termine una petición antes de seguir |
| `@blur` | Reaccionar al salir de un campo |
| `try` / `catch` con `404` | Distinguir «no existe» de «ha fallado algo» |
| `Object.assign` en un `reactive` | Copiar propiedades sin sustituir el objeto |
| `ref` en una etiqueta | Poder enfocar ese elemento desde el script |
| Letra de control del DNI | El resto de dividir entre 23 elige la letra |

## Guías relacionadas

- [Móvil repetido](../pequenas-mejoras/movil-repetido.md)
- [Validaciones](../validacion/validaciones.md)
- [Elegir en una página y usarlo en otra](../pinia/pinia-seleccion.md)
