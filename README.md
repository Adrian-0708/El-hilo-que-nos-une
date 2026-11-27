# 🎄 El hilo que nos une · Concurso de jerseys navideños

Web del concurso de jerseys navideños organizado por **Victoria FP** (Victoria Institute of Technology), con el patrocinio de **La Rondeña**.

Los participantes suben una foto de su jersey por delante y otra por detrás. Cuando termina la inscripción se abre la votación, y en Nochebuena se anuncia el jersey más navideño del año.

> **Estado:** el **frontend** está terminado (plantillas Thymeleaf, estilos y JavaScript de interfaz). El **backend en Spring Boot** está por hacer. Las plantillas ya tienen las rutas y los datos que el backend tendrá que darles (ver [Integración con Spring Boot](#integración-con-spring-boot)).

---

## Índice

- [Cómo funciona el concurso](#cómo-funciona-el-concurso)
- [Páginas](#páginas)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Probar el diseño sin servidor](#probar-el-diseño-sin-servidor)
- [Integración con Spring Boot](#integración-con-spring-boot)
- [Rendimiento y accesibilidad](#rendimiento-y-accesibilidad)
- [Personalización](#personalización)
- [Pendiente](#pendiente)

---

## Cómo funciona el concurso

| Fase | Fechas | Qué se puede hacer |
|------|--------|--------------------|
| **1. Subida** | Hasta el 14 de diciembre | Subir jerseys. La galería ya se puede consultar. |
| **2. Votación** | Del 15 al 23 de diciembre | Se cierra la inscripción y se vota: un voto por jersey. |
| **3. Ganador** | 24 de diciembre | Se anuncia el ganador en Nochebuena. |

Para **subir** o **votar** hay que iniciar sesión. Para ver la galería, no: la ventana de login solo aparece cuando alguien intenta hacer una de esas dos acciones.

---

## Páginas

| Plantilla | Ruta | Descripción |
|-----------|------|-------------|
| `index.html` | `/` | Portada: cuenta atrás hasta el cierre de la subida, accesos a subir y ver jerseys, fases del concurso y bola de Navidad en 3D con el logo. |
| `votar.html` | `/votar` | Galería de jerseys con buscador, orden (Recientes, Más antiguos, A–Z), visor de cada jersey por delante y por detrás, y botón de votar. |
| `subir.html` | `/subir` | Formulario de subida: nombre del jersey, foto delantera y trasera (arrastrar y soltar, con vista previa) y aceptación de bases y términos. |
| `perfil.html` | `/perfil` | Datos del usuario, sus jerseys (con opción de eliminarlos), votos emitidos y días que faltan para la votación. |
| `terminos.html` | `/terminos` | Términos y condiciones (texto pendiente). |

Todas las páginas comparten la cabecera con el menú, la ventana de login y registro, el menú de usuario y el pie con el contacto de Victoria FP y los patrocinadores.

---

## Tecnologías

- **HTML5 + [Thymeleaf](https://www.thymeleaf.org/)**: plantillas pensadas para servirse desde Spring Boot.
- **CSS** propio, sin frameworks: paleta dorada, decoración navideña y diseño responsive.
- **JavaScript** puro, sin dependencias, solo para la interfaz. La lógica real (guardar, votar, sesión) la pone el servidor.
- **Spring Boot + Spring Security** *(previsto)*: los formularios de login ya usan los nombres de campo por defecto de Spring Security (`username`, `password`, `remember-me`).

---

## Estructura del proyecto

```
Jerseys-Navidad/
├── Front/
│   ├── static/
│   │   ├── css/
│   │   │   └── styles.css          # Todos los estilos
│   │   ├── js/
│   │   │   └── main.js             # Interacciones de la interfaz
│   │   └── img/
│   │       ├── logo.png
│   │       ├── logo-horizontal.png
│   │       ├── logo-vertical.png
│   │       ├── logo-bola.png       # Logo dentro de la bola de Navidad
│   │       └── patrocinadores/
│   │           └── la-rondena.jpg
│   └── templates/
│       ├── index.html
│       ├── votar.html
│       ├── subir.html
│       ├── perfil.html
│       └── terminos.html
└── README.md
```

Al montar el backend, `Front/static` y `Front/templates` corresponden a `src/main/resources/static` y `src/main/resources/templates` de un proyecto Spring Boot.

---

## Probar el diseño sin servidor

No hace falta Spring para ver el diseño: basta con **abrir cualquier HTML de `Front/templates/` en el navegador**.

Cuando la página se abre como archivo local (`file://`), `main.js` lo detecta y simula el comportamiento del servidor:

- **Sesión simulada:** cualquier login o registro «entra» y se guarda en `localStorage`. Cerrar sesión la borra.
- **Votos simulados:** el botón de votar cambia entre *Votar* y *Votado* y actualiza el contador.
- **Datos de ejemplo:** las tarjetas de muestra (Rudolph Supremo, El Grinch Fashion, Noche Polar…) solo existen fuera de Spring. Thymeleaf las elimina con `th:remove="all"`.

> Las rutas a CSS, JS e imágenes usan `th:href` y `th:src`, y también llevan `href` y `src` relativos para que funcionen al abrir los archivos sin servidor.

---

## Integración con Spring Boot

Esto es lo que las plantillas esperan del backend.

### Rutas

| Método | Ruta | Uso |
|--------|------|-----|
| `GET` | `/` | Portada |
| `GET` | `/votar` | Galería de jerseys |
| `POST` | `/votar/{id}` | Votar un jersey |
| `GET` | `/subir` | Formulario de subida |
| `POST` | `/subir` | Subir jersey (`multipart/form-data`) |
| `GET` | `/perfil` | Perfil del usuario (requiere sesión) |
| `POST` | `/jerseys/{id}/eliminar` | Eliminar un jersey propio |
| `GET` | `/terminos` | Términos y condiciones |
| `POST` | `/login` | Inicio de sesión (Spring Security) |
| `POST` | `/registro` | Alta de usuario |
| `POST` | `/logout` | Cerrar sesión |

### Campos de los formularios

- **Login:** `username` (email), `password`, `remember-me`
- **Registro:** `nombre`, `email`, `password`, `password2`, `aceptaBases`
- **Subida:** `nombre`, `fotoDelantera`, `fotoTrasera` (PNG, JPEG o WebP), `aceptaBases`, `aceptaTerminos`

### Datos del modelo

| Atributo | Dónde se usa | Descripción |
|----------|--------------|-------------|
| `usuario` | Todas | Usuario con sesión iniciada (`nombre`, `email`, `fechaAlta`), o `null` si no hay sesión |
| `finSubida` | Inicio, votar, subir | Fecha ISO del cierre de la subida, para la cuenta atrás (p. ej. `2026-12-14T23:59:59`) |
| `finSubidaTexto` | Inicio, subir | Esa misma fecha en texto legible |
| `jerseys` | Votar | Lista de jerseys |
| `votacionAbierta` | Votar | `true` si la fase de votación está activa |
| `misJerseys` | Perfil | Jerseys del usuario |
| `votosEmitidos` | Perfil | Número de votos emitidos por el usuario |
| `diasParaVotar` | Perfil | Días que faltan para que se abra la votación |
| `mensaje` / `error` | Subir, votar | Avisos de éxito o error |

Cada **jersey** necesita: `id`, `nombre`, `imagenDelanteraUrl`, `imagenTraseraUrl` y `fechaSubida`.

### Detalles de la integración

- `<body data-logged="...">` indica a `main.js` si hay sesión. Sin sesión, al intentar subir o votar se abre la ventana de login.
- Si el login falla (`?error`), la ventana de login se abre sola (`data-auto-open`).
- Los formularios con `data-requires-auth="mensaje"` muestran ese mensaje en la ventana de login.

---

## Rendimiento y accesibilidad

La web ajusta las animaciones a la potencia del equipo:

| Nivel | Cuándo se aplica | Efectos |
|-------|------------------|---------|
| **Completo** | Equipos potentes | Nieve a pantalla completa, bola en 3D que sigue al ratón, apariciones al hacer scroll |
| **Ligero** (`.lite`) | Pantallas táctiles, ≤ 4 núcleos o ≤ 4 GB de RAM, ahorro de datos | Sin nieve ni 3D; decoración estática |
| **Mínimo** (`.lite.min`) | Sin aceleración gráfica (WebGL por software) o movimiento reducido | Lo imprescindible |

- El nivel inicial se decide en el `<head>`, antes de pintar nada.
- Un medidor de fotogramas baja de nivel automáticamente si la página va lenta.
- Se respeta `prefers-reduced-motion`.
- Las animaciones se paran cuando no están en pantalla.
- Ventanas con `<dialog>`, pestañas y menús con atributos ARIA, y cierre con `Esc`.

---

## Personalización

- **Fechas del concurso:** se cambian en `finSubida`, que viene del backend. Los textos de las fases están en `index.html`.
- **Añadir un patrocinador:** copiar el bloque de La Rondeña en el pie de cada plantilla, con su web, y guardar el logo en `static/img/patrocinadores/`.
- **Fase activa:** marcar con la clase `is-active` la fase en curso (p. ej. `th:classappend` según `${fase}`).
- **Colores y estilos:** en `static/css/styles.css`.

---

## Pendiente

- [ ] Backend en Spring Boot: entidades `Usuario`, `Jersey` y `Voto`, controladores, seguridad y almacenamiento de imágenes
- [ ] Redactar los términos y condiciones (`terminos.html`)
- [ ] Hacer funcionales el buscador y los filtros de orden en el servidor (ahora filtran solo en el navegador)
- [ ] Controlar que haya un único voto por usuario y jersey
- [ ] Página o sección del ganador

---

## Organiza

**Victoria FP** · Victoria Institute of Technology · [victoriafp.com](https://victoriafp.com)

Patrocinador: **La Rondeña**
