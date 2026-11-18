# Mapa del proyecto

Gestión de una clínica: pacientes, doctores y citas. Frontend en Vue 3 y backend propio
en Express con MongoDB.

## Cómo encaja todo

```
Navegador (Vue, :5173)  ->  axios  ->  API Express (:3000)  ->  Mongoose  ->  MongoDB (Docker, :27017)
```

1. El usuario usa una pantalla (`src/components/`).
2. La pantalla llama a una función de `src/api/`, que hace la petición HTTP con axios.
3. Una ruta de `backend/rutas/` la recibe y usa un modelo de `backend/modelos/`.
4. Mongoose lee o guarda en MongoDB y la respuesta vuelve por el mismo camino.

Pinia (`src/store/`) **no** guarda las listas: solo recuerda **qué paciente y qué doctor
están seleccionados**, para que las tres pantallas se entiendan entre ellas. Las listas
se piden al servidor cada vez.

## Árbol de ficheros

```
.
├── backend/
│   ├── server.js              Arranque: cors, express.json, rutas, catálogos y conexión a Mongo
│   ├── data/
│   │   ├── municipios.json    Provincias y municipios (se sirven en /api/municipios)
│   │   └── especialidades.json Catálogo de especialidades (/api/especialidades)
│   ├── modelos/               Schemas de Mongoose: Paciente.js, Doctor.js, Cita.js
│   └── rutas/                 Endpoints Express: pacientes, doctores y citas (.rutas.js)
├── src/
│   ├── main.js                Monta la app con Pinia y el router
│   ├── App.vue                Esqueleto: NavBar + <RouterView> + FooTer
│   ├── style.css              Estilos base y clases propias (Tailwind v4)
│   ├── router/index.js        Las rutas, escritas a mano en un array
│   ├── api/                   Una función por petición (citas, doctores, pacientes,
│   │                          especialidades, municipios)
│   ├── store/                 Pinia: pacienteStore.js y doctorStore.js (la selección)
│   ├── utils/
│   │   ├── alertas.js         SweetAlert2: alertaExito, alertaError, alertaInfo,
│   │   │                      alertaConfirmacion
│   │   └── pdf.js             generarPDF() con jsPDF y jspdf-autotable
│   ├── components/            Todas las pantallas y la barra:
│   │                          Inicio, Servicios, SobreNos, AvisoLegal,
│   │                          PoliticaPrivacidad, NotFound, NavBar, FooTer,
│   │                          XestionPacientes, XestionDoctores, Citas
│   │                          y PlantillaComponente.vue (molde CRUD de ejemplo)
│   └── assets/                hero.png y 404.png
├── public/assets/             Imágenes de servicios y el vídeo de la portada
├── docker-compose.yaml        MongoDB 8
├── vite.config.js             Plugins de Vue y Tailwind
└── tools/generador-componentes/  Herramienta aparte para generar componentes
```

**No hay** carpeta `views/`, ni `composables/`, ni `components/ui/`, ni `router/routes.js`:
cada pantalla es un `.vue` suelto en `src/components/` y las tablas y los botones están
escritos a mano en cada una. Tampoco hay un fichero `.env`: la URL del backend está escrita
en cada fichero de `src/api/` como `http://localhost:3000/api/...`.

## Las tres pantallas de datos

| Pantalla | Ruta | Fichero |
|---|---|---|
| Pacientes | `/XestionPacientes` | `src/components/XestionPacientes.vue` |
| Doctores | `/XestionDoctores` | `src/components/XestionDoctores.vue` |
| Citas | `/citas` | `src/components/Citas.vue` |

Las tres tienen la misma forma: formulario arriba, tabla abajo, y un botón de PDF.
El menú está escrito enlace por enlace en `src/components/NavBar.vue`.

## La API

| Método y ruta | Qué hace |
|---|---|
| `GET /api/pacientes` | Todos los pacientes |
| `GET /api/pacientes/:dni` | Uno por su DNI |
| `POST /api/pacientes` | Crear |
| `PUT /api/pacientes/:dni` | Modificar |
| `DELETE /api/pacientes/:dni` | Borrar |
| `GET /api/doctores` | Todos los doctores |
| `GET /api/doctores/:especialidad` | Los de una especialidad |
| `POST /api/doctores` | Crear |
| `PUT /api/doctores/:id` | Modificar |
| `DELETE /api/doctores/:id` | Borrar |
| `GET /api/citas` | Citas, con filtros opcionales en la URL |
| `POST /api/citas` | Crear |
| `PUT /api/citas/:id` | Modificar |
| `DELETE /api/citas/:id` | Borrar |
| `GET /api/especialidades` | Catálogo, desde un JSON |
| `GET /api/municipios` | Provincias y municipios, desde un JSON |

Fíjate en el detalle: **el paciente se identifica por su DNI** y **el doctor por su `_id`**.
Las citas guardan `pacienteDNI` y `doctorId`, cada uno de su forma.

Todas las rutas de base de datos pasan por `requireDatabase`, un middleware de `server.js`
que responde **503** si Mongo no está conectado.

## Arrancar el proyecto

```bash
docker compose up -d   # MongoDB
npm install
npm start              # Vue (:5173) y backend (:3000) a la vez, con concurrently
```

`npm run dev` arranca solo Vue: la web se ve pero ninguna lista carga.

El backend **no se recarga solo**: si cambias algo en `backend/`, hay que parar con Ctrl+C
y volver a `npm start`.

## Dónde mirar cuando algo no va

| Síntoma | Dónde |
|---|---|
| `Network Error` | ¿Está arrancado el backend? ¿Responde `localhost:3000`? |
| `503` | Mongo no está conectado: `docker compose up -d` |
| Un cambio del backend no se nota | Hay que reiniciar `npm start` |
| Un campo nuevo no se guarda | Falta en el schema de `backend/modelos/` |
