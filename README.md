# HugoRamosLopez_Vue — XestiónApp (Sanidade Teis)

Proyecto de **Deseño de Interfaces Web — 2º DAW**
Autor: **Hugo Ramos López**

Aplicación web de gestión de una clínica: **pacientes, doctores y citas**.
Front-end con **Vue 3 + Vite**, back-end con **Express**, base de datos
**MongoDB** dentro de un contenedor de **Docker** (se consulta con **MongoDB
Compass**).

---

## 1. Arquitectura

```
Navegador  (Vue 3 + Vite)        http://localhost:5173
     |  axios (peticiones HTTP)
     v
API REST   (Express + Mongoose)  http://localhost:3000/api
     |  mongoose
     v
MongoDB    (contenedor Docker)   mongodb://localhost:27017  -> base de datos "bbdd"
```

---

## 2. Puesta en marcha (orden EXACTO)

### Paso 1 — Levantar la base de datos con Docker

Desde la carpeta del proyecto:

```bash
docker compose up -d      # levanta MongoDB en segundo plano
docker compose ps         # comprobar que el contenedor "mongodb" está UP
```

> Si `docker` no se reconoce, hay que instalar **Docker Desktop** y arrancarlo
> antes (debe verse la ballena en la barra de tareas).

### Paso 2 — Instalar las dependencias (solo la primera vez)

```bash
npm install
```

Descarga en `node_modules/` todo lo que indica el `package.json`. Esa carpeta
**no se entrega ni se sube a GitHub**: se regenera con este comando.

### Paso 2b — Variables de entorno (opcional)

El fichero `.env` lleva contraseñas, así que no se sube al repositorio. Si al
descargar el proyecto no está, se crea copiando la plantilla:

```bash
copy .env.example .env     # Windows
cp .env.example .env       # Linux / Mac
```

No es imprescindible: si falta el `.env`, `backend/server.js` y `backend/seed.js`
usan por defecto la misma conexión que crea el `docker-compose.yaml`
(`mongodb://admin:abc123@localhost:27017/bbdd?authSource=admin`), así que el
proyecto arranca igualmente. Solo hace falta tocarlo si se usa otro usuario,
otra contraseña, otro puerto u otro nombre de base de datos.

### Paso 3 — Cargar datos de ejemplo (opcional pero recomendado)

```bash
npm run seed
```

Inserta 20 pacientes, 10 doctores y 5 citas de ejemplo.
**Ojo:** vacía antes esas tres colecciones.

### Paso 4 — Arrancar la aplicación

```bash
npm start      # arranca a la vez el front (Vite) y el back (Express)
```

- Front: <http://localhost:5173>
- API:   <http://localhost:3000/api>

Otros comandos:

| Comando           | Qué hace                                  |
|-------------------|-------------------------------------------|
| `npm run dev`     | solo el front (Vite)                      |
| `npm run backend` | solo la API (Express)                     |
| `npm run seed`    | carga los datos de ejemplo en MongoDB     |
| `npm run build`   | compila la versión de producción (`dist`) |
| `npm run preview` | ver la versión compilada                  |

### Paso 5 — Ver los datos en MongoDB Compass

Cadena de conexión:

```
mongodb://admin:abc123@localhost:27017/?authSource=admin
```

Base de datos **`bbdd`** → colecciones **`pacientes`**, **`doctores`** y **`citas`**.

También se puede abrir Compass ya conectado desde la terminal:

```powershell
& "C:\Program Files\MongoDB Compass\MongoDBCompass.exe" "mongodb://admin:abc123@localhost:27017/?authSource=admin"
```

> Docker Desktop tiene que estar arrancado (icono de la ballena). Si una
> terminal abierta de antes no reconoce el comando `docker`, basta con
> cerrarla y abrir otra.

---

## 3. Estructura del proyecto

```
HugoRamosLopez_Vue/
├── docker-compose.yaml        # contenedor de MongoDB
├── .env                       # PORT y MONGO_URI (no se sube a GitHub)
├── index.html                 # única página (SPA)
├── vite.config.js
├── backend/                   # ---------- SERVIDOR ----------
│   ├── server.js              # arranque de Express + conexión a MongoDB
│   ├── seed.js                # carga inicial de datos (npm run seed)
│   ├── modelos/               # esquemas de Mongoose
│   │   ├── Paciente.js
│   │   ├── Doctor.js
│   │   └── Cita.js
│   ├── rutas/                 # endpoints de la API REST (CRUD)
│   │   ├── pacientes.rutas.js
│   │   ├── doctores.rutas.js
│   │   └── citas.rutas.js
│   └── data/                  # catálogos y datos de ejemplo (JSON)
│       ├── municipios.json
│       ├── especialidades.json
│       ├── pacientes.json
│       └── doctores.json
└── src/                       # ---------- CLIENTE (Vue) ----------
    ├── main.js                # crea la app, Pinia y el router
    ├── App.vue                # componente raíz (NavBar + router-view + FooTer)
    ├── style.css              # estilos globales
    ├── router/index.js        # tabla de rutas
    ├── api/                   # llamadas a la API con axios
    │   ├── pacientes.js
    │   ├── doctores.js
    │   ├── citas.js
    │   ├── municipios.js
    │   └── especialidades.js
    ├── store/                 # Pinia (estado compartido)
    │   ├── pacienteStore.js
    │   └── doctorStore.js
    ├── utils/
    │   ├── alertas.js         # SweetAlert2 (UD6)
    │   └── informes.js        # informes PDF con jsPDF (UD7)
    └── components/
        ├── NavBar.vue
        ├── FooTer.vue
        ├── IniCio.vue
        ├── XestionPacientes.vue
        ├── XestionDoctores.vue
        ├── XestionCitas.vue
        ├── SobreNos.vue
        ├── AvisoLegal.vue
        ├── PoliticaPrivacidad.vue
        ├── NotFound.vue
        └── HelloWorld.vue     # ejemplo de reactividad de la UD2
```

---

## 4. Rutas de la aplicación (vue-router)

| URL                     | Componente        | Qué muestra                  |
|-------------------------|-------------------|------------------------------|
| `/`                     | IniCio            | portada                      |
| `/xestionpacientes`     | XestionPacientes  | CRUD de pacientes            |
| `/xestion-doctores`     | XestionDoctores   | CRUD de doctores             |
| `/xestion-citas`        | XestionCitas      | CRUD de citas                |
| `/sobrenos`             | SobreNos          | acerca de                    |
| `/avisolegal`           | AvisoLegal        | aviso legal                  |
| `/politica-privacidad`  | PoliticaPrivacidad| política de privacidad       |
| cualquier otra          | NotFound          | error 404                    |

---

## 5. Endpoints de la API REST

| Método | Ruta                                       | Qué hace                         |
|--------|--------------------------------------------|----------------------------------|
| GET    | `/api/pacientes`                           | todos los pacientes              |
| GET    | `/api/pacientes/:dni`                      | un paciente por DNI              |
| POST   | `/api/pacientes`                           | crear paciente                   |
| PUT    | `/api/pacientes/:dni`                      | modificar paciente               |
| DELETE | `/api/pacientes/:dni`                      | borrar paciente                  |
| GET    | `/api/doctores`                            | todos los doctores               |
| GET    | `/api/doctores/:iddoc`                     | un doctor por ID                 |
| GET    | `/api/doctores/especialidade/:espedoc`     | doctores de una especialidad     |
| POST   | `/api/doctores`                            | crear doctor                     |
| PUT    | `/api/doctores/:iddoc`                     | modificar doctor                 |
| DELETE | `/api/doctores/:iddoc`                     | borrar doctor                    |
| GET    | `/api/citas`                               | todas las citas (con populate)   |
| GET    | `/api/citas/:id`                           | una cita por `_id`               |
| POST   | `/api/citas`                               | crear cita                       |
| PUT    | `/api/citas/:id`                           | modificar cita                   |
| DELETE | `/api/citas/:id`                           | borrar cita                      |
| GET    | `/api/municipios`                          | provincias y municipios (JSON)   |
| GET    | `/api/especialidades`                      | especialidades médicas (JSON)    |

---

## 6. Modelos de datos

**Paciente** → `dnipac`, `nomepac`, `apelpac`, `nacipac`, `mailpac`, `dirpac`,
`movilpac`, `propac`, `munipac`, `lodpac`

**Doctor** → `iddoc`, `nomedoc`, `apeldoc`, `coledoc` ("Si"/"No"), `maildoc`,
`movildoc`, `espedoc`, `loddoc`

**Cita** → `pacienteId` (ref Paciente), `doctorId` (ref Doctor), `fecha`,
`hora`, `motivo`, `observacions`, `estado` (pendente / confirmada /
cancelada / realizada)

---

## 7. Contenidos del módulo aplicados

- **UD1** Vite, estructura del proyecto, componentes `.vue`.
- **UD2** Reactividad (`ref`, `reactive`, `computed`), ciclo de vida
  (`onMounted`) y directivas (`v-model`, `v-if`, `v-for`, `v-on`, `v-bind`).
- **UD3** Enrutamiento con vue-router y comunicación entre componentes.
- **UD4** CRUD completo y consumo de API REST con axios + Express + Mongoose.
- **UD5** Diseño de interfaces (flexbox, media queries, responsive).
- **UD6** Avisos con SweetAlert2 (`src/utils/alertas.js`).
- **UD7** Informes PDF con jsPDF (`src/utils/informes.js`).
- **UD8** Estado centralizado con Pinia (`src/store/`).

---

## 8. Problemas frecuentes

| Síntoma | Causa y solución |
|---------|------------------|
| "Non hai ... cargados" en todas las listas | La API no responde: comprobar que `npm start` levantó Express y que el contenedor de Mongo está arriba (`docker compose ps`). |
| `Error al conectar con MongoDB` en la consola | El contenedor no está levantado → `docker compose up -d`. |
| El puerto 3000 está ocupado | Cambiar `PORT` en `.env` y la URL en `src/api/*.js`. |
| Compass no conecta | Usar `mongodb://admin:abc123@localhost:27017/?authSource=admin`. |
| Cambios en `.env` que no se aplican | Hay que reiniciar el backend (dotenv solo lo lee al arrancar). |
