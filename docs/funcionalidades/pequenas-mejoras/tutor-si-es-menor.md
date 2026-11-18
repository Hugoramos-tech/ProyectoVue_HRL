# Pedir un tutor si el paciente es menor de edad

Cuando la fecha de nacimiento del formulario corresponde a un menor de 18 años, aparece un campo «Titor» obligatorio y el botón «Gardar» no se activa hasta rellenarlo. Para un mayor de edad, el campo no existe.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). El backend no recarga solo: se reinicia tras el Paso 1.

## La idea

Un campo condicional se pinta con `v-if`. La condición es un `computed` que calcula la edad con la fecha del formulario. El campo nuevo hay que añadirlo al modelo de la base de datos y al molde del formulario.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/modelos/Paciente.js` | El campo `tutorpac` |
| `src/components/XestionPacientes.vue` | El molde, el cálculo, el campo y el botón |

## Paso 1 · El modelo

En `backend/modelos/Paciente.js`, busca la línea `lopdpac: { type: Boolean, required: true },` y pega esto **justo debajo**:

```js
        // Texto opcional en la base de datos (no lleva `required`: solo se pide en la web si es menor)
        tutorpac: { type: String, trim: true },
```

**Reinicia el backend.**

## Paso 2 · El molde del formulario

En `src/components/XestionPacientes.vue`, busca la línea `lopdpac: false, // aceptación de la política de protección de datos (LOPD)` y pega esto **justo encima**:

```js
  // Valor inicial del campo nuevo en el molde del formulario (y el que recupera "Limpar")
  tutorpac: "",
```

## Paso 3 · El cálculo

Busca la línea `// Columnas de la tabla (y del PDF).` y pega esto **justo encima**:

```js
// ¿Es menor de edad el paciente del formulario? Con la fecha vacía, no.
// computed = un valor que se recalcula solo cuando cambia la fecha de nacimiento escrita.
const esMenor = computed(() => {
  if (!datos.nacipac) return false;
  const [anyo, mes, dia] = datos.nacipac.split("-").map(Number);
  const hoy = new Date();
  let edad = hoy.getFullYear() - anyo;
  // Si este año aún no ha cumplido años, resta uno (getMonth() cuenta desde 0: de ahí el +1)
  if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) edad--;
  return edad < 18;
});
```

## Paso 4 · El campo

Busca el comentario `<!-- Dirección postal -->` y pega esto **justo encima**:

```vue
      <!-- v-if: este campo solo EXISTE en la página si esMenor es true -->
      <FormField
        v-if="esMenor"
        label="Titor:"
      >
        <input
          v-model="datos.tutorpac"
          type="text"
          required
        >
      </FormField>
```

## Paso 5 · El botón

Busca la línea `:disabled="datos.dnipac === '' || datos.nomepac === '' || !datos.lopdpac"` y **sustitúyela** por:

```vue
          :disabled="datos.dnipac === '' || datos.nomepac === '' || !datos.lopdpac || (esMenor && !datos.tutorpac?.trim())"
```

Qué hace: el botón se desactiva si falta algo de siempre, o si el paciente es menor (`esMenor`) y no hay tutor escrito. `?.` significa «si existe»: `tutorpac` puede no estar definido y `?.` evita el error.

## Qué deberías ver

1. Con una fecha de hace 10 años, aparece «Titor» y «Gardar» se desactiva hasta escribirlo.
2. Con una fecha de hace 30 años, desaparece el campo.
3. El tutor se guarda y al editar a ese paciente, vuelve a salir.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El tutor no se guarda | No reiniciaste el backend: sin el campo en el modelo, Mongoose lo ignora |
| El campo no aparece nunca | Falta el Paso 3 o `esMenor` no se usa en el `v-if` |
| El botón no se activa con un mayor de edad | El Paso 5 exige tutor siempre: debe ir con `esMenor &&` |
| Error `esMenor is not defined` | El Paso 3 quedó dentro de otra función |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `v-if` | Pintar un campo solo si se cumple algo | `03_lecciones/vue/06_v_if.md` |
| `computed` | La condición se recalcula sola | `03_lecciones/vue/07_computed.md` |
| Campo nuevo | Modelo, molde, formulario | [Campo nuevo](../datos/campo-nuevo.md) |

## Guías relacionadas

- [Guía: campo nuevo](../../guias/campo-nuevo.md)
- [Validaciones](../validacion/validaciones.md)
