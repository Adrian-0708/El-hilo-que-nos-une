# 🎄 El hilo que nos une · I Concurso Jersey Navideño

Web del concurso de fotografía de jerséis navideños organizado por **Victoria FP** (Victoria Institute of Technology), con el dulce apoyo de **La Rondeña**.

Cada participante sube una foto de su jersey por delante y otra por detrás. Después vota el público y un jurado elige al resto de ganadores. Hay cuatro categorías y cada ganador se lleva un lote de polvorones de La Rondeña.

> **Estado:** el **frontend** está terminado (plantillas Thymeleaf, estilos y JavaScript de interfaz). El **backend en Spring Boot** está por hacer. Las plantillas ya tienen las rutas y los datos que el backend tendrá que darles (ver [Integración con Spring Boot](#integración-con-spring-boot)).

---

## Índice

- [Cómo funciona el concurso](#cómo-funciona-el-concurso)
- [Páginas](#páginas)
- [Diseño](#diseño)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Probar el diseño sin servidor](#probar-el-diseño-sin-servidor)
- [Integración con Spring Boot](#integración-con-spring-boot)
- [Personalización](#personalización)
- [Pendiente](#pendiente)

---

## Cómo funciona el concurso

Todas las fechas son de diciembre de 2026, en horario peninsular español.

| Fase | Fecha | Qué pasa |
|------|-------|----------|
| **Inscripción** | Del 6 al 10 de diciembre (12:00 h) | Se suben las fotos del jersey. |
| **Votación popular** | Del 10 (12:00 h) al 13 de diciembre (12:00 h) | El público vota: un voto por persona. |
| **Jurado** | Del 13 al 14 de diciembre (12:00 h) | El jurado elige a los otros tres ganadores. |
| **Aviso** | 14 de diciembre, desde las 12:00 h | Se avisa en privado a las cuatro personas seleccionadas. |
| **Entrega** | 16 de diciembre, 11:30 h | Entrega de premios y sorteo presencial en Victoria FP. |

**Categorías:** El más navideño, El más creativo u original y El más extravagante (jurado), y El favorito del público (votación).

Para **presentar un jersey** o **votar** hay que tener cuenta. El resto de la web se puede ver sin sesión. Las bases completas están en `templates/bases.html` y en `static/docs/bases-concurso.pdf`.

---

## Páginas

| Plantilla | Ruta | Descripción |
|-----------|------|-------------|
| `index.html` | `/` | Portada: «¿Tienes el jersey más navideño?», botones Participar y Votar, cuenta atrás, hueco para el flyer, cómo funciona, categorías y patrocinio. |
| `participar.html` | `/participar` | Normas, requisitos y formulario de candidatura: foto delantera y trasera, aceptación de las bases y confirmación de la foto. |
| `votar.html` | `/votar` | Galería **anónima** de jerséis (solo se ve el nº de cada jersey) y botón de votar. |
| `premios.html` | `/premios` | El premio, las cuatro categorías, cómo se eligen, la recogida presencial y el sorteo. |
| `fechas.html` | `/fechas` | Cuenta atrás y línea de tiempo con las fases del concurso. |
| `bases.html` | `/bases` | Bases legales completas, con índice y descarga en PDF. |
| `privacidad.html` | `/privacidad` | Aviso de privacidad (pendiente de publicar por la organización). |
| `verificar.html` | `/verificar?token=…` | Enlace del correo de verificación: botón «Verificar cuenta» y mensaje «¡Cuenta verificada!». |
| `recuperar.html` | `/recuperar` | «¿Has olvidado la contraseña?»: pide el correo y muestra «Revisa tu correo». |
| `restablecer.html` | `/restablecer?token=…` | Enlace del correo de recuperación: contraseña nueva y mensaje «¡Contraseña cambiada!». |
| `admin-login.html` | `/admin/login` | Acceso al panel con usuario y contraseña. |
| `admin.html` | `/admin` | Panel de administración: elegir ganadores y borrar jerséis (con confirmación). |

Todas las páginas públicas comparten la cabecera con el menú y el botón **Entrar**, la ventana de iniciar sesión / crear cuenta, el menú de usuario, las guirnaldas de los márgenes y el pie con el contacto de Victoria FP y el patrocinador. Las dos páginas de administración tienen su propia cabecera.

---

## Diseño

- **Colores:** fondo `#FFF6E5`, verde `#004724` y rojo `#990000` (variables en `:root` de `static/css/styles.css`).
- **Tipografía:** [Lilita One](https://fonts.google.com/specimen/Lilita+One) en títulos y números (la más parecida a la del logo) y [Montserrat](https://fonts.google.com/specimen/Montserrat) en el texto (la del subtítulo del logo). Ambas de Google Fonts.
- **Motivo:** el *hilo*. Tarjetas con borde cosido, un hilo rojo que se dibuja al hacer scroll y guirnaldas de abeto que caen por los márgenes al cargar la página.
- **Sin frameworks:** HTML con Thymeleaf, CSS propio y JavaScript puro, sin dependencias.
- **Accesibilidad:** se respeta `prefers-reduced-motion`, ventanas con `<dialog>`, pestañas y menús con atributos ARIA, y cierre con `Esc`.

---

## Estructura del proyecto

```
Jerseys-Navidad/
├── static/
│   ├── css/
│   │   └── styles.css                  # Todos los estilos
│   ├── js/
│   │   └── main.js                     # Interacciones de la interfaz
│   ├── docs/
│   │   └── bases-concurso.pdf          # Bases legales en PDF
│   └── img/
│       ├── logo.png                    # Logo del concurso a color (cabecera, ventana de entrar)
│       ├── logo-icono.png              # Solo el icono (cabeceras de página, galería vacía)
│       ├── logo-blanco.png             # Versión blanca, para fondos oscuros (aún sin uso)
│       ├── logo-negro.png              # Versión negra (aún sin uso)
│       ├── favicon.png
│       ├── logo-victoria.png           # Logo de Victoria FP (pie)
│       ├── guirnalda.svg               # Guirnalda de los márgenes
│       ├── logo-horizontal.png         # Logo anterior (sin uso)
│       ├── logo-vertical.png           # Logo anterior (sin uso)
│       ├── arbol.png                   # Árbol del logo anterior (sin uso)
│       └── patrocinadores/
│           ├── la-rondena.png
│           └── surtido-la-rondena.jpg  # Caja del premio
├── templates/
│   ├── index.html
│   ├── participar.html
│   ├── votar.html
│   ├── premios.html
│   ├── fechas.html
│   ├── bases.html
│   ├── privacidad.html
│   ├── verificar.html
│   ├── recuperar.html
│   ├── restablecer.html
│   ├── admin-login.html
│   └── admin.html
└── README.md
```

Al montar el backend, `static/` y `templates/` van en `src/main/resources/static` y `src/main/resources/templates` del proyecto Spring Boot.

---

## Probar el diseño sin servidor

No hace falta Spring para ver el diseño: basta con **abrir cualquier HTML de `templates/` en el navegador** o usar Live Server.

Sin servidor (`file://` o Live Server en el puerto 5500), `main.js` simula la sesión: cualquier inicio de sesión o registro «entra» y se guarda en `localStorage`, y cerrar sesión la borra.

> Las rutas a CSS, JS e imágenes usan `th:href` y `th:src`, y también llevan `href` y `src` relativos para que funcionen al abrir los archivos sin servidor.

---

## Integración con Spring Boot

Esto es lo que las plantillas esperan del backend.

### Rutas

| Método | Ruta | Uso |
|--------|------|-----|
| `GET` | `/` | Portada |
| `GET` | `/participar` | Normas y formulario de candidatura |
| `POST` | `/participar` | Enviar candidatura (`multipart/form-data`, requiere sesión) |
| `GET` | `/votar` | Galería de jerséis |
| `POST` | `/votar/{id}` | Votar un jersey (requiere sesión) |
| `GET` | `/premios` | Premios |
| `GET` | `/fechas` | Fechas |
| `GET` | `/bases` | Bases legales |
| `GET` | `/privacidad` | Aviso de privacidad |
| `POST` | `/login` | Inicio de sesión (Spring Security) |
| `POST` | `/registro` | Alta de usuario |
| `POST` | `/logout` | Cerrar sesión |
| `GET` · `POST` | `/verificar` | Verificar la cuenta (`token` en la URL del correo) |
| `GET` · `POST` | `/recuperar` | Pedir el enlace para cambiar la contraseña |
| `GET` · `POST` | `/restablecer` | Poner la contraseña nueva (`token` en la URL del correo) |
| `GET` | `/admin/login` | Acceso de administración |
| `POST` | `/admin/login` | Inicio de sesión de administración (Spring Security, rol ADMIN) |
| `GET` | `/admin` | Panel de administración (solo rol ADMIN) |
| `POST` | `/admin/ganadores` | Guardar ganadores |
| `POST` | `/admin/jerseys/{id}/eliminar` | Borrar un jersey |

### Campos de los formularios

- **Login:** `username` (correo), `password`, `remember-me`
- **Registro:** `nombre`, `email`, `password`, `password2`, `mayorEdad`, `aceptaBases`
- **Candidatura:** `fotoDelantera`, `fotoTrasera` (JPG, PNG o WebP), `aceptaBases`, `confirmaRequisitos`. Los datos del participante salen de su cuenta.
- **Verificar cuenta:** `token`
- **Recuperar contraseña:** `email`
- **Contraseña nueva:** `token`, `password`, `password2`
- **Acceso admin:** `username`, `password`
- **Ganadores:** `navideno`, `creativo`, `extravagante`, `publico` = id del jersey ganador (si una categoría no se elige, no se envía)

### Datos del modelo

| Atributo | Dónde se usa | Descripción |
|----------|--------------|-------------|
| `usuario` | Todas | Usuario con sesión (`nombre`, `email`), o `null` si no hay sesión |
| `inscripcionAbierta` | Participar | `true` activa el formulario; si falta, queda desactivado |
| `votacionAbierta` | Votar | `true` muestra votos y el botón de votar |
| `jerseys` | Votar | Lista de jerséis: `id`, `imagenDelanteraUrl`, `votos`. **Anónimo:** no enviar a esta vista ningún dato del participante |
| `jerseys` | Admin | Lista de jerséis: `id`, `autor`, `autorId`, `autorEmail`, `imagenDelanteraUrl`, `imagenTraseraUrl`, `votos`, `fechaSubida` |
| `totalVotos`, `ganadores`, `masVotado` | Admin | Total de votos; ganadores actuales (`navideno`, `creativo`, `extravagante`, `publico`: id o `null`); jersey más votado (opcional) |
| `finSubida` / `finSubidaTexto` | Inicio | Cierre de la subida para la cuenta atrás (ISO y texto). Por defecto, 10 de diciembre a las 12:00 |
| `fechaEntregaTexto` | Premios, fechas | Fecha del acto. Si falta: «Fecha pendiente de confirmar» |
| `verificada` / `enviado` / `cambiada` | Verificar, recuperar, restablecer | `true` muestra el mensaje de éxito de cada página |
| `mensaje` / `error` | Participar, votar, admin, cuenta | Avisos de éxito o error tras un envío |

Los jerséis **no tienen nombre**: se identifican por su nº (`id`). Una cuenta puede subir hasta 3, así que en el panel se distinguen por nº, fecha y fotos. Cada participante (`autorId`) solo puede ganar una categoría: el panel lo avisa, pero conviene comprobarlo también en el servidor.

### Detalles de la integración

- `<body data-logged="...">` indica a `main.js` si hay sesión.
- Sin sesión, al tocar una foto del formulario de candidatura, soltar una foto o pulsar «Votar», se abre la ventana de iniciar sesión / crear cuenta (`data-requires-auth="mensaje"`).
- Si el login falla (`?error`), la ventana se abre sola con el aviso (`data-auto-open`).
- El enlace «¿Has olvidado la contraseña?» de la ventana de entrar lleva a `/recuperar`.
- `/admin` debe estar protegido con el rol ADMIN; sin sesión, Spring Security redirige a `/admin/login` (`?error` si falla, `?logout` al salir).
- En el panel, «Borrar» pide confirmación en una ventana antes de enviar.
- La cuenta atrás de `fechas.html` cambia de fase sola según el calendario (`FASES` en `main.js`) y la línea de tiempo marca los hitos pasados y el siguiente según su `data-date`.

---

## Personalización

- **Flyer de la portada:** guardar la imagen como `static/img/flyer.jpg` y sustituir el bloque `hero__flyer-empty` de `index.html` por la etiqueta `<img>` que hay en el comentario. Está pensado para A4 vertical.
- **Fechas:** en `FASES` (`main.js`) y en los `data-date` de `fechas.html`.
- **Añadir un patrocinador:** copiar el bloque `<a class="sponsor">` del pie de cada plantilla, con su web, y guardar el logo en `static/img/patrocinadores/`.
- **Colores y estilos:** en `static/css/styles.css`.

---

## Pendiente

- [ ] Backend en Spring Boot: entidades `Usuario`, `Jersey` y `Voto`, controladores, seguridad y almacenamiento de imágenes
- [ ] Publicar el aviso de privacidad definitivo (`privacidad.html`)
- [ ] Controlar que haya un único voto por persona
- [ ] Añadir el flyer a la portada
- [ ] Decidir si el registro pide teléfono (las bases lo exigen para inscribirse)
- [ ] Decidir qué foto se ve en la galería: la candidatura sube dos (`fotoDelantera` y `fotoTrasera`), pero `votar.html` solo muestra una (`imagenDelanteraUrl`)

---

## Organiza

**Victoria FP** · Victoria Institute of Technology · [victoriafp.com](https://victoriafp.com)

Con el dulce apoyo de **La Rondeña**
