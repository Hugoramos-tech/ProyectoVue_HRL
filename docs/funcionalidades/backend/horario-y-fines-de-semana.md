# Horario laboral y sin fines de semana

Las citas solo pueden ser entre las 09:00 y las 20:00, y no en sábado ni domingo. Se valida en
el modelo, así que vale también si alguien llama a la API sin pasar por la web.

**Antes de empezar:** el backend no recarga solo. Reinícialo al terminar (Ctrl+C y `npm start`).

## La idea

Las dos reglas solo miran el valor del campo, así que van en el **schema**, no en la ruta. Un
`validate` del schema se aplica solo, al crear y al modificar, y sin repetir código.

La hora es un texto `hh:mm`, y como va de lo más general a lo más concreto, se compara como
texto: `"08:30" < "09:00"` es cierto. No hay que convertir nada.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/modelos/Cita.js` | Las dos reglas |

## Paso 1 · Las reglas

En `backend/modelos/Cita.js`, busca estas dos líneas y **sustitúyelas** por el bloque de debajo:

```js
        fecha: { type: String, required: true },
        hora: { type: String, required: true },
```

```js
        fecha: {
            type: String,
            required: true,
            validate: {
                // getDay() devuelve 0 para domingo y 6 para sabado.
                // El T00:00:00 hace que la fecha se interprete en hora LOCAL; sin el,
                // aaaa-mm-dd se toma como UTC y en algunas zonas cae en el dia anterior.
                validator: (valor) => ![0, 6].includes(new Date(`${valor}T00:00:00`).getDay()),
                message: "No hay citas en fin de semana"
            }
        },
        hora: {
            type: String,
            required: true,
            validate: {
                // hh:mm se compara como texto: "08:30" < "09:00" es cierto.
                validator: (valor) => valor >= "09:00" && valor <= "20:00",
                message: "El horario de la clinica es de 09:00 a 20:00"
            }
        },
```

El `validator` tiene que devolver **`true` cuando el valor VALE**. Es fácil confundirse y
escribir la condición al revés: entonces se rechaza justo lo correcto.

## Paso 2 · Reiniciar el backend

Ctrl+C y `npm start`. Sin esto no cambia nada, y parecerá que la receta no funciona.

## Variante · También en la web, para que avise antes

En `src/components/Citas.vue`, debajo de la línea
`// Habilita el envio solo cuando los campos necesarios tienen contenido util.`:

```js
// Devuelve el texto del error, o cadena vacia si la fecha y la hora valen.
const errorHorario = computed(() => {
  if (cita.fecha) {
    const dia = new Date(`${cita.fecha}T00:00:00`).getDay()
    if (dia === 0 || dia === 6) {
      return "No hay citas en fin de semana"
    }
  }
  if (cita.hora && (cita.hora < "09:00" || cita.hora > "20:00")) {
    return "El horario de la clinica es de 09:00 a 20:00"
  }
  return ""
})
```

En el `<template>`, debajo de la línea `              id="hora-cita"`… mejor justo antes del
botón de guardar, para que el mensaje se vea:

```vue
        <p v-if="errorHorario" class="mensaxe-erro" role="alert">{{ errorHorario }}</p>
```

Y para que el botón no deje enviar, añade la condición al `computed` que ya existe:
`formularioValido` termina en `    cita.estado`. Puedes envolverlo o comprobar las dos cosas
en el `:disabled`.

**La del servidor no se quita.** La de la web es comodidad; la del servidor es la que no se
puede saltar.

## Variante · Solo el horario, sin tocar los fines de semana

Sustituye únicamente la línea de `hora` y deja la de `fecha` como está.

## Variante · Limitar las horas en el propio desplegable

Si el enunciado pide que ni se puedan elegir, cambia el `<input type="time">` por un `<select>`
con las horas válidas:

```js
// De 09:00 a 19:30 en tramos de media hora.
const horasPosibles = []
for (let h = 9; h < 20; h++) {
  horasPosibles.push(`${String(h).padStart(2, "0")}:00`)
  horasPosibles.push(`${String(h).padStart(2, "0")}:30`)
}
```

`padStart(2, "0")` convierte `9` en `"09"`: sin él saldría `9:00` y el orden como texto
dejaría de funcionar.

## Cómo comprobarlo

Con la web abierta, en la consola de F12:

```js
await fetch("http://localhost:3000/api/citas", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ pacienteDNI: "UN_DNI_QUE_EXISTA", doctorId: "UN_ID_QUE_EXISTA", fecha: "2026-11-21", hora: "10:00", motivo: "prueba" }),
}).then((r) => r.status)
```

- Un sábado (`2026-11-21`): **`400`** con «No hay citas en fin de semana».
- Un martes a las `08:30`: **`400`** con «El horario de la clinica es de 09:00 a 20:00».
- Un martes a las `10:00`: **`201`**.

Esa prueba es la respuesta a «¿y si alguien llama a la API directamente?».

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Sigue aceptando sábados | No se reinició el backend |
| Rechaza TODO | El `validator` está al revés: tiene que devolver `true` si el valor vale |
| El sábado pasa y el domingo no (o al revés) | Falta el `T00:00:00`: la fecha se está leyendo en UTC |
| `Cannot read properties of undefined` | El `validator` recibió `undefined`: el `required: true` ya lo cubre, pero si el campo es opcional hay que comprobarlo antes |
| Sale un `400` sin mensaje | La ruta devuelve `error.message`; mira que el `message` esté dentro del objeto `validate` |
| `errorHorario is not defined` | En la web, el `computed` quedó fuera del `<script setup>` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `validate` con `validator` y `message` | Una regla propia en el schema |
| Devolver `true` si vale | El sentido del validador, al contrario de lo que parece |
| `getDay()` | 0 domingo, 6 sábado |
| `T00:00:00` | Fuerza a leer la fecha en hora local, no en UTC |
| Comparar `hh:mm` como texto | Funciona porque va de lo general a lo concreto |
| `padStart` | Rellena con ceros para que el orden de texto valga |

## Guías relacionadas

- [Validaciones, las tres capas](../validacion/validaciones.md)
- [Horas libres de un doctor](../mejoras-de-la-clinica/horas-libres.md)
- [Horario del doctor](../pequenas-mejoras/horario-del-doctor.md)
- [Un paciente no puede tener dos citas a la vez](../mejoras-de-la-clinica/paciente-sin-dos-citas-a-la-vez.md)
