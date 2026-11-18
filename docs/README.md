# Documentación del proyecto

Wiki de `HugoRamosLope_VUE`: una clínica en Vue 3 con backend propio en Express y MongoDB.

**Por dónde empezar, según lo que necesites:**

| Quiero… | Voy a |
|---|---|
| Hacer lo que pide un enunciado | [`funcionalidades/si-te-piden.md`](funcionalidades/si-te-piden.md) — busca la frase y te lleva a la receta |
| Ver todas las recetas | [`funcionalidades/README.md`](funcionalidades/README.md) |
| Entender cómo encaja el proyecto | [`proyecto/mapa.md`](proyecto/mapa.md) |
| Repasar un tema a fondo | [`detalle/`](detalle/README.md) |
| Comprobar que todo arranca | [`comprobar/checklist.md`](comprobar/checklist.md) |
| Arreglar algo que no va | [`comprobar/errores-tipicos.md`](comprobar/errores-tipicos.md) |
| Saber en qué estado está esta wiki | [`ESTADO.md`](ESTADO.md) |

## Qué hay en cada carpeta

| Carpeta | Qué hay |
|---|---|
| `funcionalidades/` | **Las recetas.** Pasos para copiar y pegar, con el código de *este* proyecto: filtros, columnas, PDF, alertas, Pinia, rutas con parámetro, props y emit, validaciones, entidades nuevas. Empieza por su `README.md` |
| `guias/` | Resúmenes cortos: qué ficheros tocar para una pantalla, un campo, un filtro, una validación, un endpoint o el aspecto |
| `detalle/` | Apuntes largos por tema, con el porqué de cada cosa: listas y filtros, formularios y campos, rutas y componentes |
| `proyecto/` | `mapa.md` (cómo encaja todo y el árbol de ficheros), `paginas.md`, `modelos.md` y `analisis-profe.md` |
| `backend/` | `api.md` (los endpoints), `validaciones.md` y `mongodb.md` (Docker, el `.env` y el arranque) |
| `comprobar/` | `checklist.md` y `errores-tipicos.md` (síntoma → causa → arreglo) |

## Las tres cosas que más tiempo ahorran

1. **Si las pantallas de datos salen vacías y todo responde `503`:** falta el `.env` en la
   raíz del proyecto. Copia `.env.example` a `.env`. Está explicado en
   [`backend/mongodb.md`](backend/mongodb.md).

2. **Si tocas algo de `backend/` y no pasa nada:** el backend no recarga solo. Ctrl+C y
   `npm start`.

3. **Arranca con `npm start`, no con `npm run dev`.** `npm run dev` levanta solo Vue: la web
   se ve y ninguna lista carga.

## Cómo son las recetas

Cada receta tiene siempre la misma forma:

- **Qué vas a tocar**, con los ficheros en una tabla.
- **Pasos numerados**, del tipo «busca la línea `X` y pega esto justo debajo». Esas líneas
  están verificadas contra el código real: existen y son únicas.
- **Variantes**, por si el enunciado pide algo parecido pero no igual.
- **Qué deberías ver**, para saber si funcionó.
- **Si algo falla**, con el síntoma y la causa.
- **Conceptos que usa**, una línea por concepto.
