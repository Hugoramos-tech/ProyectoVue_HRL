# Teléfono: solo números al escribir y con espacios en la tabla

Dos mejoras del móvil de pacientes: mientras escribes, el campo solo acepta cifras (las letras y los espacios se borran al instante), y en la tabla el número se ve agrupado, `600 111 222`.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/XestionPacientes`).

## La idea

Lo que se **guarda** sigue siendo `600111222`. Lo que cambia es:

- Lo que se **escribe**: se limpia con una expresión regular en el evento `@input`.
- Lo que se **ve**: una función que agrupa las cifras al pintarlas, sin tocar el dato.

> Tu formulario ya tiene algo parecido: `@blur="sanitizarMobil"` quita los espacios, pero
> **solo al salir del campo** y **solo los espacios**. Esto lo hace en cada tecla y con
> cualquier carácter que no sea una cifra.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | El campo y la columna nueva |

## Paso 1 · Solo cifras al escribir

En el `<template>`, busca la línea `            @blur="sanitizarMobil"` y pega esto **justo encima**:

```vue
            @input="novoPaciente.movilpac = novoPaciente.movilpac.replace(/\D/g, '')"
```

Qué hace: `\D` significa «cualquier cosa que **no** sea una cifra» y la `g` «en todo el
texto, no solo en la primera coincidencia». Se sustituye por una cadena vacía, es decir, se
borra.

El `@blur="sanitizarMobil"` puede quedarse: ahora es redundante, pero no molesta.

## Paso 2 · La función que agrupa

En el `<script setup>`, busca la línea `function sanitizarMobil() {` y pega esto **justo encima**:

```js
// "600111222" -> "600 111 222". Solo cambia lo que se VE: el dato guardado no se toca.
function formatearMovil(numero) {
  // (\d{3}) captura un grupo de tres cifras. Se capturan tres grupos.
  // "$1 $2 $3" los vuelve a escribir en el mismo orden, separados por espacios.
  // Si el numero no tiene nueve cifras, replace no encuentra el patron y lo devuelve igual.
  return String(numero ?? "").replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
}
```

## Paso 3 · La columna en la tabla

La tabla de pacientes hoy no tiene columna de móvil, así que hay que añadirla: una cabecera
y una celda, las dos en la misma posición.

**3.1** Busca la línea `<th>Correo</th>` y pega esto **justo encima**:

```vue
            <th>Móbil</th>
```

**3.2** Busca la línea `<td>{{ u.mailpac }}</td>` y pega esto **justo encima**:

```vue
            <td class="centrado">{{ formatearMovil(u.movilpac) }}</td>
```

Si falta uno de los dos, la tabla se descuadra.

## Paso 4 · El PDF

Dentro de `exportarPacientes()`, busca la línea `        paciente.movilpac ?? "",` y **sustitúyela** por:

```js
        formatearMovil(paciente.movilpac),
```

El `?? ""` ya no hace falta: la función devuelve una cadena vacía si no hay número.

## Variante · Limitar también la longitud

El `<input>` ya tiene `pattern="[67][0-9]{8}"`, que el navegador comprueba al enviar. Para
que además no se puedan teclear más de nueve cifras, añade en el Paso 1:

```vue
            maxlength="9"
```

Ojo: `maxlength` cuenta los caracteres **antes** de que el `@input` los limpie, así que si
pegas un texto con espacios se cortará antes de limpiarse. Tecla a tecla no pasa.

## Variante · Con el prefijo

```js
function formatearMovil(numero) {
  const limpio = String(numero ?? "").replace(/\D/g, "");
  if (limpio.length !== 9) {
    return limpio;
  }
  return `+34 ${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6)}`;
}
```

`slice(desde, hasta)` corta un trozo del texto; sin el segundo número, llega hasta el final.
Es más largo pero más fácil de leer que la expresión regular.

## Variante · El mismo campo en doctores

`XestionDoctores.vue` tiene el mismo problema con `movildoc`. La función es idéntica: cópiala
en ese fichero, o mejor, pásala a `src/utils/` y la importan los dos.

## Qué deberías ver

1. Escribes `6a00 11-1222` y en el campo queda `600111222`.
2. En la tabla sale `600 111 222`.
3. El PDF también lleva el formato agrupado.
4. Mira el dato en la consola de F12 o en MongoDB: sigue guardado como `600111222`, sin espacios.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El campo sigue aceptando letras | El `@input` quedó fuera del `<input>`, o escribiste `datos.movilpac` en vez de `novoPaciente.movilpac` |
| `formatearMovil is not defined` | El Paso 2 quedó dentro de otra función |
| La tabla se descuadra | Falta el `<th>` o el `<td>` del Paso 3 |
| La columna sale vacía | El campo se llama `movilpac`, no `movil` ni `telefono` |
| Sale sin espacios | El número no tiene nueve cifras: el patrón no encaja y lo devuelve igual |
| Se guarda con espacios | Estás usando `formatearMovil` también en el `v-model`: eso cambiaría el dato, no solo la vista |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `@input` | Reaccionar a cada tecla |
| `@blur` | Reaccionar al salir del campo |
| `\D` y la bandera `g` | «Lo que no sea una cifra», en todo el texto |
| `$1 $2 $3` en un `replace` | Reordenar los grupos capturados |
| Formatear al pintar | Cambiar lo que se ve sin tocar lo que se guarda |

## Guías relacionadas

- [Móvil repetido](movil-repetido.md)
- [Columna calculada: la edad](../columnas-y-filtros/columna-calculada.md)
- [Fecha como dd/mm/aaaa](../como-el-profe/fecha-en-la-tabla.md)
- [Validaciones](../validacion/validaciones.md)
