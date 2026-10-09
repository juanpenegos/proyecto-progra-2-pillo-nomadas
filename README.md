# Pillo Nómadas

## Descripción

Pillo Nómadas es una página web para buscar alojamientos de estadía temporal, cotizar una estadía y simular una reserva. 

No tiene backend ni base de datos. Los alojamientos y las reseñas salen de un archivo JSON, y las reservas y reseñas nuevas se guardan solo en memoria, así que se pierden al recargar la página.

## Integrantes

- Juan Esteban Penagos Fetecua 

## Tecnologías utilizadas

- Angular 22 (componentes standalone)
- TypeScript
- CSS puro, sin librerías de interfaz
- Formularios reactivos y el enrutador de Angular
- Vitest para las pruebas
- Datos en un archivo JSON

## Requisitos para ejecutar la aplicación

- Node.js 24 (probado con 24.18.1)
- npm 11 (viene con Node.js)
- Git



## Instrucciones de instalación

```bash
git clone https://github.com/juanpenegos/proyecto-progra-2-pillo-nomadas.git
cd proyecto-progra-2-pillo-nomadas
npm install
```

## Instrucciones de ejecución

```bash
npm start
```

Después se abre http://localhost:4200 en el navegador. Si el puerto 4200 está ocupado se puede usar otro con `npm start -- --port 4300`.

También están estos comandos:

```bash
npm test          # corre las pruebas
npm run build     # genera la versión de producción en dist/
```

## Principales funcionalidades

- Inicio con buscador por destino y huéspedes, los mejores alojamientos y exploración por destino.
- Explorar: listado de alojamientos con filtros por ciudad, huéspedes, tipo y precio máximo, orden y botón para limpiar filtros.
- Detalle de cada alojamiento con descripción, mapa, servicios, reglas, reseñas y fotos.
- Cotización con fechas y huéspedes: calcula noches, subtotal, limpieza, tarifa de servicio (10 %) y total.
- Reserva simulada, que solo se puede hacer después de una cotización válida.
- Mis reservas, con las reservas hechas durante la sesión.
- Galería completa de fotos de cada alojamiento, con pestañas por categoría.
- Reseñas con calificación de 1 a 5 estrellas; al agregar una, la calificación del alojamiento se actualiza.
- Los alojamientos inactivos no se muestran, y hay página de "no encontrado".
- Se adapta a celular, tableta y computador.

## Estructura general del proyecto

```
proyecto-progra-2-pillo-nomadas/
├── public/                    archivos que se publican tal cual
│   └── assets/
│       ├── data/              marketplace-data.json (alojamientos y reseñas)
│       ├── images/            fotos de los alojamientos y placeholder.svg
│       └── logos/             logos de la marca
├── src/
│   ├── index.html             página base
│   ├── main.ts                arranque de la aplicación
│   ├── styles.css             importa los estilos globales
│   ├── styles/                tokens (colores y medidas), base, layout y botones
│   └── app/
│       ├── app.ts             componente raíz (barra, contenido y pie de página)
│       ├── app.routes.ts      rutas de la aplicación
│       ├── app.config.ts      configuración (router, http)
│       ├── core/              lógica, sin pantallas
│       │   ├── models/        interfaces: alojamiento, reseña, cotización, reserva, filtros
│       │   ├── repositories/  acceso a los datos (clase abstracta y lectura del JSON)
│       │   ├── services/      alojamientos, cotización, reservas y reseñas
│       │   ├── validators/    validación de fechas, huéspedes y precio
│       │   └── utils/         fechas, formato de pesos, filtros de la URL y calificación
│       ├── pages/             una carpeta por pantalla
│       │   ├── home/          inicio (con su portada y el bloque de anfitriones)
│       │   ├── explore/       listado con filtros
│       │   ├── detail/        detalle, cotización y reserva
│       │   ├── gallery/       galería completa
│       │   ├── review-form/   escribir una reseña
│       │   ├── confirmation/  reserva confirmada
│       │   ├── my-bookings/   mis reservas
│       │   └── not-found/     página no encontrada
│       └── shared/components/ piezas que se reutilizan en varias pantallas
│           ├── navbar, mobile-menu, footer, page-banner
│           ├── accommodation-card, filter-bar, property-gallery, location-map
│           ├── quote-card, quote-summary, booking-card, contact-form
│           ├── review-card, rating-input, star-rating
│           └── empty-state, error-state, loading-indicator, image-with-fallback, info-list
├── angular.json               configuración del proyecto Angular
├── package.json               dependencias y comandos
└── tsconfig*.json             configuración de TypeScript
```

Cada componente tiene su archivo `.ts`, su `.html` y su `.css`, y las pruebas están junto al código en archivos `.spec.ts`.

Las páginas piden los datos a los servicios y se los pasan a los componentes compartidos con `@Input()`; estos avisan con `@Output()` y no saben de dónde vienen los datos. El JSON solo se lee desde un servicio (a través del repositorio), nunca directo desde las pantallas, y las reglas de negocio están en `core`, separadas de la interfaz.

## Reglas de negocio

- La fecha de salida debe ser posterior a la de llegada, y la llegada no puede ser anterior a hoy.
- Los huéspedes deben ser al menos 1 y no pasar la capacidad del alojamiento.
- El precio por noche debe ser mayor que cero.
- No se cotiza sin fechas válidas, y no se reserva sin una cotización válida.
- La tarifa de servicio es el 10 % del subtotal, y el total es subtotal + limpieza + servicio.
- Si se cambian las fechas o los huéspedes, la cotización anterior se descarta.
- Los alojamientos inactivos nunca se muestran.
- Una reseña nueva cambia la calificación del alojamiento.
- La búsqueda del inicio pide destino y huéspedes.

## Diseño

- Baja fidelidad: https://drive.google.com/file/d/1LvzEUqMN1osvlI4sXCa9QhiiCnT9VthR/view?usp=sharing
- Alta fidelidad (diseño en Figma): https://www.figma.com/design/8xiFFFCTM05oEbLwyGIWCB/pillo-nomadas-version-final?node-id=0-1&t=BUaSUAEQkp1QYYbI-1
- Alta fidelidad (prototipo interactivo en Figma): https://www.figma.com/proto/8xiFFFCTM05oEbLwyGIWCB/pillo-nomadas-version-final?node-id=1-4428&p=f&t=YnYGhPDv3KRmlCOd-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1
