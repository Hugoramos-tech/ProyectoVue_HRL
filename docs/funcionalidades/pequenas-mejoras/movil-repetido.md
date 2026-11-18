# Avisar si el teléfono ya lo tiene otro paciente

Al salir del campo «Telefono» del formulario de pacientes, si otro paciente ya tiene ese número, sale una alerta con su nombre. También se puede hacer en el servidor, con un `409`.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). Tiene que haber un paciente con un móvil conocido.

## La idea

La lista de pacientes ya está cargada en la página. Basta buscar en ella a otro paciente (distinto del que se está editando) con el mismo número, cuando el campo pierde el foco (`@blur`).

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | La función y el `@blur` del campo |
| `backend/rutas/pacientes.rutas.js` | (Variante) El mismo control en el servidor |

## Paso 1 · La función

En `src/components/XestionPacientes.vue`, busca la línea `/// Funciones auxiliares` y pega esto **justo encima**:

```js
// Avisa si otro paciente (no el que se está editando) ya tiene el móvil escrito en el formulario
function avisarMovilRepetido() {
  // Con el campo vacío no hay nada que comparar
  if (!datos.movilpac) return;
  // find busca en la lista ya cargada a otro paciente con el mismo número.
  // `p.id !== idEditando.value` evita que el propio paciente se avise a sí mismo al editarlo.
  const otro = pacientes.value.find(
    (p) => p.movilpac === datos.movilpac && p.id !== idEditando.value
  );
  if (otro) {
    // Segundo parámetro de alertaError = el título de la ventana
    alertaError(`Ese teléfono xa o ten ${otro.nomepac} ${otro.apelpac}.`, "Teléfono repetido");
  }
}
```

Qué hace: `find` busca otro paciente con el mismo número. `p.id !== idEditando.value` evita que el propio paciente se avise a sí mismo al editarlo.

## Paso 2 · El `@blur`

Busca la línea `title="9 díxitos, sen espazos"` y **sustitúyela** por estas dos líneas:

```vue
          title="9 díxitos, sen espazos"
          @blur="avisarMovilRepetido"
```

## Variante · También en el servidor

En `backend/rutas/pacientes.rutas.js`, busca la línea `const paciente = await Paciente.create({ ...req.body, dnipac: dni })` y pega esto **justo encima**:

```js
    // findOne devuelve el primer paciente con ese móvil, o null. Si existe: 409 (Conflict, el dato ya existe).
    const mismoMovil = await Paciente.findOne({ movilpac: String(req.body.movilpac ?? '').trim() })
    if (mismoMovil) {
        return res.status(409).json({ error: 'Xa existe un paciente con ese teléfono' })
    }
```

Reinicia el backend. Con esto el servidor rechaza el duplicado aunque la web no avise.

## Qué deberías ver

1. Escribes el móvil de otro paciente y sales del campo: alerta roja «Ese teléfono xa o ten Ana López.».
2. Con un móvil nuevo, no pasa nada.
3. Al editar a un paciente sin cambiarle el móvil, no avisa.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| No avisa nunca | Falta el `@blur` del Paso 2 |
| Avisa al editar al propio paciente | Falta `p.id !== idEditando.value` |
| Alerta sin título | `alertaError(mensaje, titulo)` lleva el título como segundo valor |
| Con la variante, no responde `409` | No reiniciaste el backend |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `@blur` | Hacer algo al salir de un campo | `03_lecciones/vue/02_v_model.md` |
| `Array.find` | Buscar el primer elemento que cumple algo | `03_lecciones/vue/03_v_for.md` |
| SweetAlert2 | La alerta roja | `03_lecciones/05_sweetalert.md` |

## Guías relacionadas

- [Guía: validación nueva](../../guias/validacion-nueva.md)
- [DNI con autocarga](../como-el-profe/dni-autocarga.md)
