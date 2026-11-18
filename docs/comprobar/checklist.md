# Checklist

Cinco minutos al empezar y cinco al acabar.

## Al empezar

1. **Mongo arrancado:** `docker start mongodb` (o `docker compose up -d` en la carpeta del proyecto).
2. **Variables:** existe `.env` con `PORT`, `MONGO_URI` y `VITE_API_URL` (la URL del backend, con el mismo puerto que `PORT`).
3. **Arrancar todo:** `npm start` (levanta Vite y el backend). Abre la web y comprueba que carga la lista de pacientes.
4. **Consola abierta** (F12 → Console): cualquier error rojo se ve ahí.
5. **Lee el enunciado entero** antes de tocar nada. Subraya los datos concretos (nombres de campos, textos, qué página).
6. **Busca la frase en** [«Si te piden esto…»](../funcionalidades/si-te-piden.md).

## Mientras haces cada punto

- Cambia **una cosa cada vez** y mira la web antes de seguir.
- Si tocas algo de `backend/`, **reinicia el backend**: no recarga solo.
- Si el campo es nuevo, tiene que estar en **cuatro sitios**: modelo, molde del formulario, el formulario y la lista de columnas.
- Los textos que ve el usuario van en **gallego**, como los que ya hay (`Gardar`, `Non hai…`).
- Guarda el trabajo con un commit cuando algo funcione.

## Antes de entregar

| Comprobación | Cómo |
|---|---|
| Sin errores de lint | `npm run lint` (los avisos `warning` no cuentan; los `error` sí) |
| Compila | `npm run build` |
| Consola limpia | Recarga la página con F12 abierto y recorre las pantallas tocadas |
| Probado el caso feliz | Crea, edita y borra algo con tu cambio |
| Probado un caso malo | Un campo vacío, un duplicado, un id falso |
| PDF | Si lo toca el enunciado, descárgalo y ábrelo |
| Sin restos | Nada de `console.log` de pruebas, ni código comentado |
| Backend reiniciado | Para que la entrega funcione con el código que hay |

Después de `npm run build` no hace falta dejar la carpeta `dist/` si el profe no la pide; mira antes si está en el `.gitignore`.
