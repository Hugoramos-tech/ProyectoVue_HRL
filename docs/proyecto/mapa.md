# Mapa del proyecto

Gestión de una clínica (Sanidad Teis): pacientes, doctores y citas. Frontend en Vue 3 y
backend propio en Express con MongoDB.

## Cómo encaja todo
```
Navegador (Vue, :5173)  ->  axios  ->  API Express (:3000)  ->  Mongoose  ->  MongoDB (Docker, :27017)
```

1. El usuario usa una página (`src/components/Xestion*.vue`).
2. La página llama a un store de Pinia (`src/store/`), que usa una función de `src/api/`.
3. La función hace una petición HTTP con axios a `VITE_API_URL`.
4. Una ruta de `backend/rutas/` la recibe y usa un modelo de `backend/modelos/`.
5. Mongoose lee o guarda en MongoDB y la respuesta vuelve por el mismo camino.

## Árbol de ficheros
```
.
├── backend/
│   ├── server.js            Arranque: middlewares, rutas, errores y conexión a la BD
│   ├── config/
│   │   ├── db.js            Conexión a MongoDB (MONGO_URI)
│   │   └── seed.js          Datos iniciales: provincias, municipios y especialidades
│   ├── data/                municipios.json (provincias y municipios del INE) y
│   │                        especialidades.json (lista de especialidades)
│   ├── modelos/             Schemas de Mongoose (Cita, Doctor, Especialidad, Municipio,
│   │                        Paciente, Provincia) y validaciones.js (reglas compartidas)
│   └── rutas/               Endpoints Express, uno por recurso
├── src/
│   ├── main.js              Monta la app con Pinia y el router
│   ├── App.vue              Esqueleto: ventana flotante con barra superior + contenido + pie
│   ├── style.css            Tokens de diseño (@theme de Tailwind) y estilos base
│   ├── router/routes.js     Lista única de pantallas (ruta + título + icono del menú)
│   ├── router/index.js      Crea el router a partir de routes.js
│   ├── api/                 Una función por petición HTTP (axios)
│   ├── store/               Stores de Pinia (pacientes, doctores, citas, especialidades, municipios)
│   ├── composables/         useFormulario (alta/edición) y useCargaInicial (cargando/error)
│   ├── utils/               Alertas, PDF, errores, tablas (columnas) y texto (capitalizar)
│   ├── views/               Una página por ruta
│   ├── components/          NavBar, FooTer y PrivacidadCheck
│   │   └── ui/              Piezas base: AppButton, FormField, FormGrid, DataTable, RowActions,
│   │                        AppSection, PageHeader
│   └── assets/              Logo, imagen 404, vídeo de inicio, fondo de página y fotos de servizos
├── docs/                    Documentación (ver docs/README.md)
├── docker-compose.yml       MongoDB 8
├── .env                     VITE_API_URL, PORT y MONGO_URI (va en el repo: proyecto didáctico)
└── vite.config.js           Plugins de Vue y Tailwind
```

## Arrancar el proyecto

```bash
docker compose up -d   # MongoDB
npm install
npm start              # Vue (:5173) y backend (:3000) a la vez
```

Más detalle de la base de datos en [mongodb.md](../backend/mongodb.md).
