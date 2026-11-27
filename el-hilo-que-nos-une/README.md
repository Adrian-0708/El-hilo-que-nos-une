# El hilo que nos une · Front (diseño 2)

Plantillas Thymeleaf y recursos estáticos para Spring Boot. Misma estructura que `jerseys-navidenos`:

```
src/main/resources/
├── templates/   index, participar, votar, premios, fechas, bases, privacidad
└── static/
    ├── css/styles.css
    ├── js/main.js
    ├── img/        logos (fondo transparente), árbol, favicon, logo Victoria FP
    │   └── patrocinadores/   La Rondeña (logo y caja del premio)
    └── docs/bases-concurso.pdf
```

Los HTML también se pueden abrir directamente en el navegador (sin Spring) para ver el diseño.

## Identidad

- Fondo `#FFF6E5` · verde `#004724` · rojo `#990000` (variables en `:root` de `styles.css`)
- Tipografía: Lora (Google Fonts)

## Rutas que esperan las plantillas

| Ruta | Plantilla |
|---|---|
| `GET /` | `index` |
| `GET /participar` · `POST /participar` | `participar` |
| `GET /votar` · `POST /votar/{id}` | `votar` |
| `GET /premios` | `premios` |
| `GET /fechas` | `fechas` |
| `GET /bases` | `bases` |
| `GET /privacidad` | `privacidad` |

## Cuentas (botón «Entrar» de la cabecera)

| Ruta | Campos |
|---|---|
| `POST /login` (Spring Security) | `username` (correo), `password`, `remember-me` |
| `POST /registro` | `nombre`, `email`, `password`, `password2`, `aceptaBases` |
| `POST /logout` | — |

- `${usuario}` (con `nombre` y `email`) en el modelo: muestra el menú del usuario en vez de «Entrar».
- Si el login falla, redirigir a `?error`: la ventana se abre sola con el aviso.
- El botón «Votar» de la galería pide sesión: sin ella abre la ventana de entrar.
- Abriendo los HTML sin Spring (archivo o Live Server) la sesión se simula con `localStorage`.

## Variables del modelo

| Variable | Tipo | Dónde | Uso |
|---|---|---|---|
| `inscripcionAbierta` | `boolean` | participar | Activa el formulario. Si falta o es `false`, queda desactivado. |
| `votacionAbierta` | `boolean` | votar | Muestra votos y botón «Votar». |
| `jerseys` | `List` con `id`, `nombre`, `imagenUrl`, `votos` | votar | Galería. Vacía → mensaje «Aquí empieza la magia». |
| `mensaje` / `error` | `String` | participar, votar | Avisos de éxito o error tras un POST. |
| `fechaEntregaTexto` | `String` | premios, fechas | Fecha del acto. Si falta: «Fecha pendiente de confirmar». |

## Formulario `POST /participar` (multipart/form-data)

`fotoDelantera`, `fotoTrasera` (MultipartFile), `aceptaBases`, `confirmaRequisitos`.
Los datos del participante salen de su cuenta (usuario en sesión). Sin sesión, al tocar una foto,
soltarla o enviar, se abre la ventana de entrar / crear cuenta.

## Cuenta atrás

`main.js` cambia de fase sola según el calendario de las bases (`FASES`): apertura de inscripciones,
cierre de inscripciones, cierre de votación y fin del jurado. La línea de tiempo de `fechas` marca
los hitos pasados y el siguiente según su `data-date`.
