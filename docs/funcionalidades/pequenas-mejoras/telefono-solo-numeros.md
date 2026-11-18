# Teléfono: solo números al escribir y con espacios en la tabla

Dos mejoras del teléfono de pacientes: mientras escribes, el campo solo acepta cifras (se borran letras y espacios al instante), y en la tabla el número se ve agrupado: `600 111 222`.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`).

## La idea

Lo que se **guarda** debe seguir siendo `600111222`. Lo que cambia es lo que se **escribe** (se limpia con una expresión regular en el evento `@input`) y lo que se **ve** (una columna con `formato`, que no toca el dato).

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | El campo y la columna |

## Paso 1 · Solo cifras al escribir

En `src/components/XestionPacientes.vue`, busca la línea `title="9 díxitos, sen espazos"` y **sustitúyela** por estas dos líneas:

```vue
          title="9 díxitos, sen espazos"
          @input="datos.movilpac = datos.movilpac.replace(/\D/g, '')"
```

Qué hace: `\D` significa «cualquier cosa que no sea una cifra» y `g` «en todo el texto». Se sustituye por nada, es decir, se borra.

## Paso 2 · Agrupar en la tabla

Busca la línea `{ clave: "movilpac", titulo: "Telefono" },` y **sustitúyela** por:

```js
  {
    clave: "movilpac",
    titulo: "Telefono",
    // Solo cambia lo que se VE (el dato guardado sigue siendo 600111222).
    // (\d{3}) captura tres cifras; "$1 $2 $3" las vuelve a escribir separadas por espacios.
    formato: (p) => (p.movilpac ?? "").replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3"),
  },
```

Qué hace: parte el número en tres grupos de tres cifras y los une con espacios. Si el número no tiene nueve cifras, se queda igual.

## Qué deberías ver

1. Escribes `6a00 11-1222` y en el campo queda `600111222`.
2. En la tabla, `600 111 222`.
3. El PDF también lleva el formato agrupado (usa las mismas columnas).

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El campo sigue aceptando letras | El `@input` no está o tiene una errata en `datos.movilpac` |
| La tabla sigue sin espacios | Falta el `formato` o no sustituiste la línea de la columna |
| Si pego un texto con espacios, se corta antes de limpiarse | `maxlength="9"` cuenta también los espacios y letras pegados; escribiendo tecla a tecla no pasa |
| Se guarda con espacios | El `formato` solo cambia la vista; revisa que el `@input` borre los espacios |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `@input` | Reaccionar a cada tecla | `03_lecciones/vue/02_v_model.md` |
| Columnas con `formato` | Cambiar lo que se ve sin tocar el dato | `03_lecciones/06_pdf.md §7` |

## Guías relacionadas

- [Columna calculada](../columnas-y-filtros/columna-calculada.md)
- [Guía: validación nueva](../../guias/validacion-nueva.md)
