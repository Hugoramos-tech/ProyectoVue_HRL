# Checklist

Cinco minutos al empezar y cinco al acabar.

## Al empezar

1. **El `.env`.** Tiene que existir en la raíz del proyecto, al lado de `package.json`, con
   `PORT` y `MONGO_URI`. Si no está, copia `.env.example`:

   ```bash
   cp .env.example .env
   ```

   **Sin él, las tres pantallas de datos salen vacías y todo responde `503`.** Es lo primero
   que hay que comprobar, porque el servidor arranca igual y no parece roto.

2. **Mongo arrancado:** `docker compose up -d` en la carpeta del proyecto.

3. **Arrancar todo:** `npm start` (Vite y el backend a la vez). No `npm run dev`: eso levanta
   solo Vue y ninguna lista carga.

4. **Comprobar que hay datos.** Abre Pacientes: si sale la lista, el camino completo funciona.
   Si no, mira la consola.

5. **Consola abierta** (F12 → Console): cualquier error rojo se ve ahí.

6. **Lee el enunciado entero** antes de tocar nada. Subraya los datos concretos: nombres de
   campos, textos exactos, en qué pantalla.

7. **Busca la frase en** [«Si te piden esto…»](../funcionalidades/si-te-piden.md).

### Los dos minutos que más rentan

```
http://localhost:3000/api/especialidades   ¿responde?  -> el backend está vivo
http://localhost:3000/api/pacientes        ¿responde?  -> hay base de datos
```

Si el primero va y el segundo da `503`: falta Mongo o falta el `.env`. Si no va ninguno: el
backend no está arrancado. Saber esto te ahorra media hora de buscar en el sitio equivocado.

## Mientras haces cada punto

- Cambia **una cosa cada vez** y mira la web antes de seguir. Si la rompes, sabes qué fue.
- Si tocas algo de `backend/`, **reinicia el backend**: no recarga solo.
- Si el campo es nuevo, tiene que estar en **cinco sitios**: el schema, el objeto del
  formulario, el `<input>`, el `<th>` + `<td>`, y las `cabeceras` + `filas` del PDF.
- Los textos nuevos, **en castellano**, como casi todo el proyecto. Quedan dos frases en
  gallego (`Non hai doctores cargados.` y `Non hai pacientes cargados.`): no las toques si no
  te lo piden, pero no las imites.
- Si añades un `computed` en `XestionPacientes.vue`, **añádelo al import de Vue**: ese fichero
  solo importa `ref`, `reactive` y `onMounted`.
- Haz un commit cada vez que algo funcione. Así siempre puedes volver a lo último que iba.

## Antes de entregar

| Comprobación | Cómo |
|---|---|
| Compila | `npm run build` |
| Sin errores de lint | `npm run lint`: los `warning` no cuentan, los `error` sí |
| Consola limpia | Recarga con F12 abierto y recorre las pantallas que tocaste |
| El caso que funciona | Crea, edita y borra algo con tu cambio |
| El caso que falla | Un campo vacío, un duplicado, una fecha pasada |
| El PDF | Si el enunciado lo toca, descárgalo y ábrelo |
| Sin restos | Nada de `console.log` de pruebas, ni bloques comentados a medias |
| Backend reiniciado | Para que lo que entregas sea lo que corre |
| Desde cero | Para y vuelve a arrancar `npm start`, recarga con Ctrl+F5 y comprueba que todo sigue |

Ese último es el que más veces salva: muchas cosas «funcionan» solo porque el estado anterior
sigue en memoria o en la caché de Tailwind.

## Si te queda tiempo

- Vuelve al enunciado y relee cada punto comprobando que lo hiciste **tal como lo pide**:
  el nombre exacto del campo, el texto exacto del mensaje.
- Mira si tu cambio rompió algo de al lado: si tocaste la tabla de pacientes, prueba también
  el PDF y la pantalla de citas.
- Si algo quedó a medias, **déjalo funcionando aunque sea sin la parte bonita**. Media
  funcionalidad que no rompe nada vale más que una completa que tumba la pantalla.
