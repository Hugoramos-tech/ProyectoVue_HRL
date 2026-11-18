# Pedir un tutor si el paciente es menor de edad

Cuando la fecha de nacimiento del formulario corresponde a un menor de 18 años, aparece un campo «Tutor» obligatorio y el botón Guardar no se activa hasta rellenarlo. Para un mayor de edad, el campo no existe.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/XestionPacientes`). El backend no recarga solo: se reinicia tras el Paso 1.

## La idea

Un **campo condicional** se pinta con `v-if`: si la condición es falsa, el campo no existe en
la página, no es que esté oculto. La condición es un `computed` que calcula la edad a partir
de la fecha que hay escrita en el formulario.

Es el ejemplo típico de «un campo que depende de otro», y por eso cae a menudo.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/modelos/Paciente.js` | El campo `tutorpac` |
| `src/components/XestionPacientes.vue` | El import, el molde, el cálculo, el campo y el botón |

## Paso 1 · El schema

En `backend/modelos/Paciente.js`, busca la línea `lopdpac: { type: Boolean, required: true },` y pega esto **justo debajo**:

```js
        // Texto opcional en la base de datos: NO lleva required, porque solo se pide
        // en la web y solo si el paciente es menor. default: "" evita que los
        // pacientes que ya existian den error al editarlos.
        tutorpac: { type: String, trim: true, default: "" },
```

**Reinicia el backend.** Sin esto, el tutor se envía pero Mongoose lo descarta en silencio.

## Paso 2 · El import

En `src/components/XestionPacientes.vue`, busca la línea `import { ref, reactive, onMounted } from "vue";` y **sustitúyela** por:

```js
import { ref, reactive, computed, onMounted } from "vue";
```

Este fichero **no importaba `computed`**: es el paso que más se olvida y da
`computed is not defined`.

## Paso 3 · El molde del formulario

Busca la línea `  lopdpac: false,` (está dentro de `novoPaciente`) y pega esto **justo encima**:

```js
  // Al estar en novoPaciente, limpiaFormpac() lo vacia solo y editarPaciente()
  // lo rellena solo al cargar una fila.
  tutorpac: "",
```

## Paso 4 · El cálculo de la edad

Busca la línea `// Comparte el paciente seleccionado con otras pantallas mediante el store de Pinia.` y pega esto **justo encima**:

```js
// ¿Es menor de edad el paciente que hay en el formulario? Con la fecha vacia, no.
// computed se recalcula solo cuando cambia novoPaciente.nacipac.
const esMenor = computed(() => {
  if (!novoPaciente.nacipac) {
    return false;
  }

  // La fecha se guarda como texto aaaa-mm-dd. map(Number) convierte los tres trozos.
  const [anyo, mes, dia] = novoPaciente.nacipac.split("-").map(Number);
  const hoy = new Date();

  let edad = hoy.getFullYear() - anyo;
  // getMonth() cuenta desde 0 (enero es 0), de ahi el +1.
  // Si este anyo todavia no ha cumplido, se le resta uno.
  const mesActual = hoy.getMonth() + 1;
  if (mesActual < mes || (mesActual === mes && hoy.getDate() < dia)) {
    edad--;
  }

  return edad < 18;
});
```

Ese ajuste del mes y el día es lo que diferencia una edad bien calculada de una restada a
ojo. Si solo restas los años, alguien nacido en diciembre aparece un año mayor durante casi
todo el año.

## Paso 5 · El campo condicional

En el `<template>`, busca el comentario `<!-- Provincia cambia cargarMunicipios(); el selector de municipio usa su lista resultante. -->` y pega esto **justo encima**:

```vue
      <!-- v-if: este bloque solo EXISTE en la pagina si esMenor es true.
           No esta oculto: no esta. Con v-show si estaria, solo invisible. -->
      <div v-if="esMenor" class="fila">
        <div class="campo">
          <label for="pac-tutor">Tutor legal:</label>
          <input
            id="pac-tutor"
            v-model="novoPaciente.tutorpac"
            type="text"
            required
          >
          <small>Obligatorio para menores de 18 años.</small>
        </div>
      </div>
```

## Paso 6 · El botón

Busca la línea `            !novoPaciente.lopdpac"` (es la última condición del `:disabled` del botón Guardar) y **sustitúyela** por:

```vue
            !novoPaciente.lopdpac ||
            (esMenor && !novoPaciente.tutorpac.trim())"
```

Qué hace: el botón se desactiva si falta algo de lo de siempre, **o** si el paciente es menor
y el tutor está vacío. El `.trim()` evita que valga escribir solo espacios.

## Ojo con esto

El campo desaparece, pero **el valor se queda** en `novoPaciente.tutorpac`. Si escribes un
tutor y luego cambias la fecha a la de un adulto, el tutor sigue ahí y se guardará aunque no
se vea.

Si quieres que se borre, añade esto debajo del Paso 4 (y añade `watch` al import del Paso 2):

```js
// Al dejar de ser menor, se vacia el tutor para no guardar un dato invisible.
watch(esMenor, (menor) => {
  if (!menor) {
    novoPaciente.tutorpac = "";
  }
});
```

Es el tipo de detalle que distingue un campo condicional bien hecho.

## Variante · `v-if` o `v-show`

```vue
      <div v-show="esMenor" class="fila">
```

`v-show` lo deja en la página con `display: none`. Diferencias que conviene saber explicar:

| | `v-if` | `v-show` |
|---|---|---|
| Si es falso | El elemento **no existe** | Existe, pero invisible |
| El `required` del `<input>` | No se aplica: no hay input | **Se aplica**: bloquearía el envío aunque esté oculto |
| Coste | Crea y destruye el elemento | Solo cambia una clase CSS |
| Cuándo usarlo | Algo que aparece pocas veces | Algo que se enseña y oculta constantemente |

Para un campo de formulario con `required`, **`v-if`**: con `v-show` el formulario no se
podría enviar nunca para un adulto.

## Variante · Obligarlo también en el servidor

En `backend/rutas/pacientes.rutas.js`, dentro del `POST`, antes de crear el paciente:

```js
        // La misma regla en el servidor: la web se puede saltar.
        const nacimiento = String(req.body.nacipac ?? "")
        const hace18 = new Date()
        hace18.setFullYear(hace18.getFullYear() - 18)
        // Si nacio DESPUES de esa fecha, tiene menos de 18.
        if (nacimiento && nacimiento > hace18.toLocaleDateString("sv-SE")) {
            if (!String(req.body.tutorpac ?? "").trim()) {
                return res.status(400).json({ mensaje: "Un menor de edad necesita tutor legal" })
            }
        }
```

`setFullYear` cambia el año de la fecha en el sitio, y `toLocaleDateString("sv-SE")` la
escribe como `aaaa-mm-dd` para poder compararla como texto.

## Qué deberías ver

1. Con una fecha de hace 10 años aparece «Tutor legal» y el botón Guardar se desactiva hasta rellenarlo.
2. Con una fecha de hace 30 años el campo desaparece y el botón se activa.
3. Escribes el tutor, guardas, y al editar a ese paciente vuelve a salir con su valor.
4. Prueba con la fecha de tu cumpleaños de hace 18 años justos: hoy ya no es menor; con un día menos, sí.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `computed is not defined` | Falta el Paso 2: este fichero no importaba `computed` |
| El campo no aparece nunca | El Paso 4 quedó dentro de otra función, o el `v-if` no usa `esMenor` |
| El campo aparece siempre | La fecha se llama `nacipac`; comprueba que el `v-model` del campo de fecha es ese |
| El tutor no se guarda | No reiniciaste el backend tras el Paso 1 |
| El botón no se activa con un mayor de edad | Falta el `esMenor &&` del Paso 6: así lo exigiría siempre |
| El botón sigue activo sin tutor | La condición quedó fuera de las comillas del `:disabled` |
| Sale un tutor en un paciente adulto | Es lo que explica «Ojo con esto» |
| La edad sale un año de más | Falta el ajuste del mes y el día |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `v-if` | Pintar algo solo si se cumple una condición |
| `v-if` frente a `v-show` | No existe, frente a existe pero invisible |
| `computed` | Un valor que se recalcula solo |
| Calcular la edad | Restar los años y ajustar por mes y día |
| `watch` | Reaccionar a que algo cambie |
| Campo nuevo | Schema, molde, formulario |

## Guías relacionadas

- [Campo nuevo en un modelo](../datos/campo-nuevo.md)
- [Columna calculada: la edad](../columnas-y-filtros/columna-calculada.md)
- [Validaciones](../validacion/validaciones.md)
