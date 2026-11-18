# Saludo según la hora y reloj en vivo en la portada

Debajo del texto de la portada, un saludo («Bos días», «Boas tardes» o «Boas noites») y la hora actual, que avanza cada segundo.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la portada (`/`).

## La idea

Un `ref` guarda la hora actual y un `setInterval` la actualiza cada segundo. El saludo es un `computed` que lee ese `ref`, así que cambia solo. Cuando se sale de la página hay que **parar** el intervalo con `onUnmounted`, o seguiría corriendo en segundo plano y cada vez que volvieras habría uno más.

Es la receta más corta de toda la wiki y toca los dos ganchos del ciclo de vida, así que es buena para practicar.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Inicio.vue` | La hora, el saludo y el texto |

## Paso 1 · La lógica

En `src/components/Inicio.vue`, busca la línea `const clinicVideoUrl = '/assets/videos/clinica.mp4'` y pega esto **justo debajo**:

```js
// onMounted / onUnmounted = "cuando la pantalla aparece" / "cuando la pantalla desaparece".
import { computed, onMounted, onUnmounted, ref } from 'vue'

// La hora actual como ref: cada vez que cambia su valor, lo que la lea se repinta.
const ahora = ref(new Date())
// Guarda el identificador del intervalo para poder pararlo despues.
// Es un let normal, no un ref: la pantalla no necesita verlo.
let temporizador

// Al entrar en la pantalla arranca el reloj: cada 1000 ms se guarda la hora nueva.
onMounted(() => {
  temporizador = setInterval(() => {
    ahora.value = new Date()
  }, 1000)
})

// Al salir HAY QUE pararlo. Si no, el intervalo sigue corriendo aunque la pantalla
// ya no exista, y al volver se arranca otro: el reloj iria a saltos de dos segundos.
onUnmounted(() => clearInterval(temporizador))

// computed: el saludo se recalcula solo cuando cambia `ahora`.
const saludo = computed(() => {
  const hora = ahora.value.getHours()  // 0 a 23
  if (hora < 14) return 'Bos días'
  if (hora < 21) return 'Boas tardes'
  return 'Boas noites'
})

// toLocaleTimeString escribe la hora al estilo de Espana: 17:42:09
const horaTexto = computed(() => ahora.value.toLocaleTimeString('es-ES'))
```

## Paso 2 · El texto

En el `<template>`, busca la línea `<div class="mt-7 flex flex-wrap gap-3">` y pega esto **justo encima**:

```vue
        <!-- Se lee del computed: cada segundo cambia `ahora` y esta linea se repinta sola -->
        <p class="mt-5 text-sm font-bold tracking-wide text-[#9de0c7]">
          {{ saludo }} · {{ horaTexto }}
        </p>
```

Queda dentro del bloque de texto de la portada, justo encima de los dos botones de «Gestionar pacientes» y «Gestionar doctores».

## Variante · Solo la hora, sin segundos

Si los segundos corriendo distraen, cambia el intervalo a un minuto y quita los segundos del texto:

```js
  }, 60000)
```

```js
const horaTexto = computed(() =>
  ahora.value.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
)
```

## Variante · La fecha completa

```js
const fechaTexto = computed(() =>
  ahora.value.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
)
```

Da «miércoles, 19 de noviembre». En la plantilla, `{{ fechaTexto }}`.

## Qué deberías ver

1. Debajo del texto de la portada: «Boas tardes · 17:42:09».
2. Los segundos avanzan solos.
3. Cambias a otra pantalla con el menú, vuelves, y el reloj sigue bien: **un segundo por segundo**, no dos. Si va a saltos, falta el `onUnmounted`.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El reloj no avanza | Falta el `setInterval`, o escribiste `ahora = new Date()` sin `.value` |
| Va más rápido cada vez que vuelves a la portada | Falta `clearInterval` en `onUnmounted`: hay varios intervalos a la vez |
| `ref is not defined` | El `import` del Paso 1 no se copió |
| Muestra siempre «Bos días» | Los umbrales están al revés: el primer `if` tiene que ser el más pequeño |
| El texto sale encima del vídeo y no se lee | Ponlo dentro del bloque con `class="relative z-20..."`, que es donde va el Paso 2 |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `onMounted` | Código que se ejecuta al aparecer la pantalla |
| `onUnmounted` | Código que se ejecuta al salir: aquí, limpiar |
| `setInterval` / `clearInterval` | Repetir algo cada X milisegundos, y pararlo |
| `computed` | El saludo y la hora en texto se recalculan solos |
| `toLocaleTimeString` | Dar formato a una hora según el idioma |

## Guías relacionadas

- [Citas de hoy en la portada](../pinia/citas-de-hoy.md)
- [Elegir en una página y usarlo en otra](../pinia/pinia-seleccion.md)
