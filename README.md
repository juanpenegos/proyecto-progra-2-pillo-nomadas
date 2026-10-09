# Pillo Nómadas

> NUESTRA CASA ES EL MUNDO

## Descripción

**Pillo Nómadas** es una aplicación web (solo frontend) para explorar alojamientos de estadía temporal, cotizar una estancia y simular una reserva. Es el proyecto del curso *Desarrollo de Sistemas de Información 3* (Ingeniería de Sistemas, Universidad El Bosque), con cliente ficticio *Inversiones LR*.

No hay backend ni base de datos: los alojamientos y reseñas salen de un archivo JSON que se consulta desde un servicio de Angular, y las reservas y reseñas nuevas se guardan **solo en memoria** (se pierden al recargar la página, lo que permite el enunciado).

## Integrantes

- Juan Esteban Penagos Fetecua (trabajo individual)

## Tecnologías utilizadas

- [Angular](https://angular.dev/) 22 con componentes *standalone* y plantillas con `@if` / `@for`
- TypeScript 6 en modo estricto
- CSS puro (variables CSS, Flexbox y Grid), sin librerías de interfaz
- Formularios reactivos y enrutador de Angular
- Vitest y jsdom para las pruebas unitarias
- Fuentes DM Serif Display y Outfit (Google Fonts)
- Datos en JSON (`public/assets/data/marketplace-data.json`)

## Requisitos para ejecutar la aplicación

- [Node.js](https://nodejs.org/) 24.x (probado con 24.18.1)
- npm 11.x (viene con Node.js; probado con 11.16.0)
- [Git](https://git-scm.com/) para clonar el repositorio
- Conexión a internet para cargar las fuentes y el mapa de ubicación (sin conexión la aplicación sigue funcionando, con las fuentes del sistema y un mensaje en lugar del mapa)

No hace falta instalar Angular CLI por separado: viene como dependencia del proyecto y se ejecuta con los scripts de `npm`.

## Instrucciones de instalación

```bash
git clone https://github.com/juanpenegos/proyecto-progra-2-pillo-nomadas.git
cd proyecto-progra-2-pillo-nomadas
npm install
```

## Instrucciones de ejecución

Servidor de desarrollo:

```bash
npm start
```

Abre http://localhost:4200 en el navegador. Si el puerto 4200 está ocupado, usa otro: `npm start -- --port 4300`.

Otros comandos útiles:

```bash
npm test          # ejecuta las pruebas unitarias una vez
npm run build     # genera la versión de producción en dist/proyecto-progra-2-pillo-nomadas
```

## Principales funcionalidades

- **Inicio:** presentación de la plataforma, buscador (destino y huéspedes), cifras calculadas con los datos, exploración por destino y los 3 alojamientos mejor calificados.
- **Explorar:** listado de alojamientos con imagen, nombre, ciudad, tipo, capacidad, precio por noche, calificación y servicios. Filtros dinámicos por ciudad, número de huéspedes, tipo y precio máximo; orden (mejor valorados, menor y mayor precio); botón **Limpiar filtros**; mensaje cuando no hay resultados. Los filtros viven en la URL, así que sobreviven a una recarga y se pueden compartir.
- **Detalle del alojamiento:** descripción, ubicación con mapa, habitaciones, camas, baños, servicios, reglas básicas, calificación, reseñas e imágenes.
- **Cotización:** fecha de llegada, fecha de salida y huéspedes. Calcula noches, subtotal (noches × precio), tarifa de limpieza, tarifa de servicio (10 % del subtotal) y total, con errores visibles junto a cada campo. Si se cambian fechas o huéspedes, la cotización anterior se invalida.
- **Reserva simulada:** solo después de una cotización válida; pide nombre y correo, crea una reserva en estado **CONFIRMADA** y muestra la confirmación.
- **Mis reservas:** alojamiento, ciudad, llegada, salida, huéspedes, valor total y estado de cada reserva, o un mensaje si todavía no hay ninguna.
- **Galería completa:** todas las fotos de un alojamiento, con pestañas por categoría.
- **Escribir una reseña:** calificación de 1 a 5 estrellas y comentario; la reseña aparece de inmediato en el alojamiento y **actualiza su calificación**.
- **Página no encontrada:** para rutas desconocidas y para alojamientos inexistentes o inactivos.
- **Diseño adaptable** a móvil, tableta y escritorio, con estados de carga, vacío y error.

### Reglas de negocio

- La salida debe ser posterior a la llegada, y la llegada no puede ser anterior a hoy.
- Los huéspedes deben ser más de cero y no superar la capacidad del alojamiento.
- El precio por noche debe ser mayor que cero.
- No se cotiza sin fechas válidas, y no se reserva sin una cotización válida.
- Tarifa de servicio = 10 % del subtotal; total = subtotal + limpieza + servicio.
- Los alojamientos inactivos (`activo: false`) nunca se muestran.
- La calificación de un alojamiento cambia con las reseñas nuevas: la calificación del JSON se toma como el promedio de sus reseñas actuales y cada reseña nueva se suma a ese promedio (por ejemplo, 4.5 con una reseña de 4 estrellas pasa a 4.3).

## Estructura general del proyecto

```
proyecto-progra-2-pillo-nomadas/
├── public/                        Archivos estáticos que se publican tal cual
│   └── assets/
│       ├── data/                  marketplace-data.json (alojamientos y reseñas)
│       ├── images/                Fotos de los alojamientos y placeholder.svg
│       └── logos/                 Logos de la marca
├── src/
│   ├── index.html                 Página base (fuentes, idioma, viewport)
│   ├── styles.css                 Importa los estilos globales
│   ├── styles/                    tokens, base, layout y botones (CSS)
│   └── app/
│       ├── core/                  Lógica de la aplicación, sin pantallas
│       │   ├── models/            Interfaces TypeScript (Accommodation, Review, Quote, Booking…)
│       │   ├── repositories/      Acceso a datos: puerto abstracto y lectura del JSON
│       │   ├── services/          Alojamientos, cotización, reservas y reseñas
│       │   ├── validators/        Reglas de fechas, huéspedes, precio y contacto
│       │   └── utils/             Fechas, formato de pesos y filtros de la URL
│       ├── pages/                 Una página por ruta (componentes "inteligentes")
│       │   ├── home/  explore/  detail/  gallery/  review-form/
│       │   └── confirmation/  my-bookings/  not-found/
│       └── shared/components/     Piezas reutilizables (componentes "tontos")
├── angular.json                   Configuración del proyecto Angular
├── package.json                   Dependencias y scripts
└── tsconfig*.json                 Configuración de TypeScript
```

**Cómo se organiza el código:** las páginas piden los datos a los servicios y se los pasan a los componentes compartidos con `@Input()`; estos avisan con `@Output()` y no saben de dónde vienen los datos. El JSON solo se consulta desde un servicio (a través de un repositorio), nunca desde la interfaz. Las reglas de negocio están en `core/validators` y `core/services`, separadas de las pantallas.

### Rutas

| Ruta | Pantalla |
|---|---|
| `/` | Inicio |
| `/explorar` | Listado con filtros (`?ciudad=&huespedes=&tipo=&precioMax=&orden=`) |
| `/alojamientos/:id` | Detalle, cotización y reserva |
| `/alojamientos/:id/galeria` | Galería completa |
| `/alojamientos/:id/resena` | Escribir una reseña |
| `/reserva-confirmada/:id` | Confirmación de la reserva |
| `/mis-reservas` | Reservas hechas |
| `**` | Página no encontrada |

## Imágenes de los alojamientos

Las fotos van en `public/assets/images/` con los nombres que usa el JSON. Si falta alguna, la aplicación muestra `placeholder.svg` y el diseño no se rompe.

| Archivo | Uso |
|---|---|
| `loft-bogota.jpg`, `loft-bogota-2.jpg` | Loft moderno en Chapinero |
| `cartagena.jpg`, `cartagena-2.jpg` | Apartamento frente al mar |
| `guatape.jpg`, `guatape-2.jpg` | Cabaña en Guatapé |
| `guatape-galeria-1.jpg` a `guatape-galeria-7.jpg` | Galería completa de la Cabaña en Guatapé (7 fotos, en el orden del diseño) |
| `villa-leyva.jpg`, `villa-leyva-2.jpg` | Casa colonial en Villa de Leyva |
| `villa-leyva-galeria-1.jpg` a `villa-leyva-galeria-7.jpg` | Galería completa de la Casa colonial en Villa de Leyva (7 fotos) |
| `medellin.jpg` | Apartamento ejecutivo Medellín |
| `armenia.jpg` | Casa campestre (inactivo, no se muestra) |
| `hero.jpg` | Fondo de la portada del inicio |
| `anfitriones.jpg` | Bloque "¿Tienes un espacio para compartir?" |

## Prototipo

https://www.figma.com/design/ZvvSezJi9JoGXtPDnm2meV/pillos-nomadas-final

## Nota sobre los datos

Las reservas y las reseñas nuevas se guardan solo en memoria: al recargar la página se pierden, y la calificación de los alojamientos vuelve a la del JSON. Los alojamientos y las reseñas iniciales vienen del archivo `public/assets/data/marketplace-data.json`, que conserva la estructura del enunciado y agrega la fecha de las reseñas y, para la Cabaña en Guatapé, una galería de fotos descritas.
