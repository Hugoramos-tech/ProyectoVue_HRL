# Guía rápida para el examen — HugoRamosLopez_Vue

Chuleta con las operaciones que más se piden "completar o modificar" en el
examen. Todo está ya implementado en el proyecto: aquí se indica **dónde** se
toca cada cosa y **qué** se escribe.

---

## 0. Arrancar todo (en este orden)

```bash
docker compose up -d     # 1. base de datos MongoDB
npm install              # 2. solo la primera vez
npm run seed             # 3. (opcional) datos de ejemplo
npm start                # 4. front (5173) + backend (3000)
```

Comprobaciones rápidas:
- API viva → <http://localhost:3000/api>
- Web → <http://localhost:5173>
- Compass → `mongodb://admin:abc123@localhost:27017/?authSource=admin`

---

## 1. Añadir un CAMPO NUEVO a una entidad (lo más pedido)

Ejemplo: añadir `alerxias` al paciente. Hay que tocar **4 sitios**:

**1) Modelo** — `backend/modelos/Paciente.js`

```js
alerxias: { type: String, required: false },
```

**2) Objeto del formulario** — `src/components/XestionPacientes.vue`, en `novoPaciente`:

```js
const novoPaciente = reactive({
  ...
  alerxias: "",
})
```
Añadirlo también en `clear()` y en `limpiaFormpac()`.

**3) Campo en el formulario** (template):

```html
<div class="campo">
  <label>Alerxias:</label>
  <input v-model="novoPaciente.alerxias" type="text" />
</div>
```

**4) Columna en la tabla** (template): un `<th>Alerxias</th>` en el `<thead>` y
`<td>{{ p.alerxias }}</td>` en el `<tbody>`.

> No hace falta tocar `src/api/pacientes.js`: envía el objeto entero.

---

## 2. Añadir una PÁGINA nueva

1. Crear `src/components/MiPaxina.vue`.
2. En `src/router/index.js`: importarlo y añadir la ruta **antes** de la comodín:

```js
import MiPaxina from '../components/MiPaxina.vue';
...
{ path: '/mi-paxina', name: 'MiPaxina', component: MiPaxina },
```

3. En `src/components/NavBar.vue`, añadir el enlace:

```html
<li><RouterLink to="/mi-paxina" @click="isOpen = false">A miña páxina</RouterLink></li>
```

---

## 3. Añadir un ENDPOINT nuevo en el backend

En `backend/rutas/<entidad>.rutas.js`. **Ojo al orden**: las rutas con texto
fijo van ANTES que las de parámetro (`/:id`).

```js
// GET /api/pacientes/provincia/Pontevedra
router.get("/provincia/:propac", async (req, res) => {
  try {
    const pacientes = await Paciente.find({ propac: req.params.propac });
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pacientes" });
  }
});
```

Y la función que lo llama, en `src/api/pacientes.js`:

```js
export async function getPacientesByProvincia(propac) {
    const res = await axios.get(`${API_URL}/pacientes/provincia/${propac}`);
    return res.data;
}
```

---

## 4. Directivas que suelen pedir

| Qué piden | Cómo se escribe |
|-----------|-----------------|
| Enlazar input con dato | `v-model="novoPaciente.nomepac"` |
| Mostrar solo si… | `v-if="pacientes.length > 0"` / `v-else` |
| Ocultar (sigue en el DOM) | `v-show="visible"` |
| Recorrer una lista | `v-for="(p, index) in pacientes" :key="p.dnipac"` |
| Click | `@click="funcion()"` |
| Enviar formulario sin recargar | `@submit.prevent="guardarPaciente"` |
| Atributo dinámico | `:disabled="novoPaciente.dnipac === ''"` |
| Clase dinámica | `:class="['menu', { open: isOpen }]"` |
| Al perder el foco | `@blur="corrixirNome()"` |
| Al pulsar Enter | `@keyup.enter="corrixirNome()"` |

---

## 5. Reactividad (UD2)

```js
const contador = ref(0)              // valores sueltos -> .value en el script
const novoPaciente = reactive({ })   // objetos -> sin .value

// computed: valor calculado que se recalcula solo
const pacientesFiltrados = computed(() =>
  pacientes.value.filter(p => p.nomepac.toLowerCase().includes(busca.value.toLowerCase()))
)

// watch: ejecuta algo cuando cambia un dato
watch(() => novoPaciente.propac, () => cargarMunicipios())

onMounted(async () => { ... })       // se ejecuta al cargar el componente
```

---

## 6. Añadir un FILTRO o una ORDENACIÓN a una tabla

```js
const busca = ref("")

const pacientesFiltrados = computed(() => {
  const texto = busca.value.trim().toLowerCase()
  if (texto === "") return pacientes.value
  return pacientes.value.filter(p =>
    (p.nomepac || "").toLowerCase().includes(texto)
  )
})
```

Ordenar por un campo (en `src/api/*.js` o en el componente):

```js
lista.sort((a, b) => a.apelpac.localeCompare(b.apelpac, "es", { sensitivity: "base" }))
```

---

## 7. Validaciones (están en "Funcións auxiliares")

- **DNI**: `validarDni()` (formato `8 números + letra`) y `validarDni2()`
  (letra de control: `letras[numero % 23]`).
- **Teléfono**: `validarTelf()` → `/^[67]\d{8}$/`.
- **Correo**: lo valida el navegador con `type="email"`.
- **Obligatorios**: `required` en el input y `:disabled` en el botón Gardar.

Para validar también **NIE** (empieza por X, Y o Z):

```js
const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;
const nie = valor.replace("X", "0").replace("Y", "1").replace("Z", "2");
return "TRWAGMYFPDXBNJZSQVHLCKE"[parseInt(nie.slice(0, 8), 10) % 23] === valor.charAt(8);
```

---

## 8. SweetAlert2 (UD6) — `src/utils/alertas.js`

```js
import { alertaExito, alertaError, alertaInfo, alertaConfirmacion } from "../utils/alertas.js"

alertaExito("Paciente gardado")
alertaError("Non se puido gardar")

const r = await alertaConfirmacion("¿Eliminar o paciente?")
if (!r.isConfirmed) return
```

---

## 9. Informe PDF (UD7) — `src/utils/informes.js`

```js
import { exportarTablaPDF } from "../utils/informes.js"

exportarTablaPDF({
  titulo: "Listaxe de pacientes",
  columnas: ["DNI", "Apelidos", "Nome"],
  filas: pacientes.value.map(p => [p.dnipac, p.apelpac, p.nomepac]),
  nombreFichero: "pacientes.pdf"
})
```

---

## 10. Pinia (UD8) — `src/store/`

```js
import { usepacienteStore } from "../store/pacienteStore.js"

const pacienteStore = usepacienteStore()        // ¡la instancia, una sola vez!
pacienteStore.seleccionarPaciente(paciente)     // action
pacienteStore.dnipac                            // state
pacienteStore.nomeCompleto                      // getter
```

Crear un store nuevo: copiar `pacienteStore.js`, cambiar el nombre del store
(primer parámetro de `defineStore`) y sus campos.

---

## 11. Relación entre colecciones (citas)

```js
// Modelo: guarda el _id de la otra colección
pacienteId: { type: mongoose.Schema.Types.ObjectId, ref: "Paciente", required: true }

// Ruta: populate rellena los datos reales (como un JOIN)
const citas = await Cita.find()
  .populate("pacienteId", "dnipac nomepac apelpac")
  .populate("doctorId", "iddoc nomedoc apeldoc espedoc");
```

En el componente: al **leer** llegan objetos (`cita.pacienteId.nomepac`), al
**guardar** se manda solo el id (`pacienteId: "65f..."`).

---

## 12. Errores típicos y cómo se arreglan

| Error | Causa |
|-------|-------|
| `usepacienteStore.seleccionarPaciente is not a function` | Falta crear la instancia: `const pacienteStore = usepacienteStore()` |
| `error is not defined` | `catch { }` sin parámetro → `catch (error) { }` |
| `Cannot read properties of undefined` | Leer `.algo` de un objeto que aún no llegó: usar `?.` |
| La lista sale vacía | Backend parado o Docker sin levantar |
| Las dos primeras filas desaparecen al borrar | `splice` llamado dos veces |
| Los cambios del `.env` no se aplican | Reiniciar el backend |
| Error 404 al modificar/borrar | La clave de la URL no coincide (DNI en pacientes, `iddoc` en doctores, `_id` en citas) |
