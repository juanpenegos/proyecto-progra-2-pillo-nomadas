# Pillo Nómadas

## Descripción

Pillo Nómadas es una página web para buscar alojamientos de estadía temporal, cotizar una estadía y simular una reserva. Es el proyecto del curso Desarrollo de Sistemas de Información 3 de la Universidad El Bosque.

No tiene backend ni base de datos. Los alojamientos y las reseñas salen de un archivo JSON, y las reservas y reseñas nuevas se guardan solo en memoria, así que se pierden al recargar la página.

## Integrantes

- Juan Esteban Penagos Fetecua (trabajo individual)

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

No hace falta instalar Angular CLI aparte, ya viene en las dependencias del proyecto.

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
├── public/assets/
│   ├── data/          marketplace-data.json (alojamientos y reseñas)
│   ├── images/        fotos de los alojamientos y placeholder.svg
│   └── logos/         logos
├── src/
│   ├── index.html
│   ├── styles/        estilos globales
│   └── app/
│       ├── core/      modelos, servicios, repositorio, validadores y utilidades
│       ├── pages/     una carpeta por pantalla (inicio, explorar, detalle, galería...)
│       └── shared/    componentes que se reutilizan
├── angular.json
├── package.json
└── tsconfig*.json
```

Las páginas piden los datos a los servicios y se los pasan a los componentes compartidos. El JSON solo se lee desde un servicio, nunca directo desde las pantallas, y las reglas de negocio están en `core`, separadas de la interfaz.

## Diseño

- Baja fidelidad: https://drive.google.com/file/d/1LvzEUqMN1osvlI4sXCa9QhiiCnT9VthR/view?usp=sharing
- Alta fidelidad (diseño en Figma): https://www.figma.com/design/8xiFFFCTM05oEbLwyGIWCB/pillo-nomadas-version-final?node-id=0-1&t=BUaSUAEQkp1QYYbI-1
- Alta fidelidad (prototipo interactivo en Figma): https://www.figma.com/proto/8xiFFFCTM05oEbLwyGIWCB/pillo-nomadas-version-final?node-id=1-4428&p=f&t=YnYGhPDv3KRmlCOd-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1
