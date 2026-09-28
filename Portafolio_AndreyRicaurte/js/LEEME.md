# Portafolio · Andrey Julian Ricaurte Duran

Sitio web estático (HTML + CSS + JavaScript, sin instalar nada), en **español e inglés** con botón **ES / EN**, modo oscuro/claro y diseño responsive. Incluye: perfil, servicios, stack, proyectos (con rol y resultado), trayectoria, certificados y contacto (correo, WhatsApp y formulario).

## 1. Cómo abrirlo

1. Descomprime el zip y abre la carpeta en **VS Code** (`Archivo > Abrir carpeta`).
2. Instala la extensión **Live Server** (Ritwick Dey) y haz clic en **Go Live** (abajo a la derecha). Se abre en el navegador y se actualiza solo cada vez que guardas.
   - También funciona haciendo doble clic en `index.html`.

## 2. Cómo encontrar lo que falta por completar

En VS Code presiona **Ctrl + Shift + F** y busca:

```
EDITAR
```

Verás cada mensaje `✏️ EDITAR` con la instrucción exacta. Cuando termines cada cosa, borra su comentario. También busca `TU-` y `[` para encontrar los textos de relleno que faltan cambiar.

## 3. Lista de pendientes

| Qué | Dónde | Qué hacer |
|---|---|---|
| Foto | `assets/img/foto.jpg` | Guarda tu foto con ese nombre (vertical, fondo limpio, ~300 KB). Mientras no exista se muestran tus iniciales "AR". |
| CV | `assets/cv/CV-Andrey-Ricaurte.pdf` | Guarda tu CV en PDF con ese nombre. Activa los 2 botones "Descargar CV". |
| Correo | `index.html` (sección Contacto) | Cambia `tu-correo@ejemplo.com` en 3 partes: `href`, texto y `data-copy`. |
| GitHub y LinkedIn | `index.html` (sección Contacto) | Cambia `TU-USUARIO`. Si no tienes LinkedIn, borra ese `<li>`. |
| Proyectos (4 borradores) | `js/i18n.js` y `index.html` | Cambia título y descripción (`p1_title`, `p1_desc`… en ambos idiomas), los enlaces `TU-USUARIO/TU-REPO-#` y las tecnologías. |
| Capturas de proyectos | `assets/img/proyecto-1.png` … `proyecto-4.png` | Imágenes 16:9 (ej. 1280×720). Si no existen, se ve un dibujo técnico. |
| Trayectoria | `js/i18n.js` (claves `t1_…`, `t2_…`, `t3_…`) | Reemplaza los textos entre `[corchetes]`. Para quitar una fila, borra su `<li class="tl__item">` en `index.html`. |
| Rol y resultado de cada proyecto | `js/i18n.js` (`p1_role`, `p1_result`… hasta `p4_`) | Cuenta qué hiciste tú y qué lograste, con verbos de acción (diseñé, implementé, logré). No inventes cifras: usa solo datos reales. |
| Certificados y formación | `js/i18n.js` (`cert1_name`, `cert1_place`…) | Reemplaza los textos entre `[corchetes]`. Para quitar uno, borra su `<li>` en `index.html`. |
| Servicios ("Qué ofrezco") | `js/i18n.js` (`s1_title`, `s1_desc`… hasta `s6_`) | Deja solo lo que de verdad puedes hacer. Para quitar uno, borra su `<li class="offer__item">`. |
| WhatsApp | `index.html` (sección Contacto) | Cambia el número en el enlace (`wa.me/57...`, sin espacios ni signos) y en el texto. Si no lo quieres, borra ese `<li>`. |
| Recomendaciones (opcional) | `index.html` (busca `RECOMENDACIONES`) | Está desactivada. Actívala solo si tienes una recomendación real de un profesor, jefe o compañero. |
| Tecnologías | `index.html` (sección Stack y cinta en movimiento) | Agrega o quita `<li>` dentro de cada capa y en la cinta (hay 2 listas iguales). Deja solo lo que realmente dominas. |
| Descripción "Quién soy" | `js/i18n.js` (`about_p1`, `about_p2`) | Ya tiene el texto que enviaste; ajústalo si quieres. |

> Los proyectos, tecnologías y trayectoria que trae la plantilla son **borradores** armados a partir de tu descripción. Reemplázalos por tu información real antes de publicar.

## Consejos para que se vea profesional

- **Muestra de 3 a 6 proyectos**, los mejores, no todos. Cada uno con contexto, tu rol y el resultado.
- **Empieza tus frases con verbos de acción:** "Diseñé", "Implementé", "Logré".
- **Usa lenguaje claro.** Piensa en quién lo va a leer: un reclutador no siempre es técnico.
- **Mantén el CV actualizado** y con el mismo contenido que el portafolio.
- **Solo publica cosas reales:** borra cualquier texto entre `[corchetes]` que no hayas reemplazado.

## 4. Cómo funciona el cambio de idioma

Todos los textos viven en **`js/i18n.js`**, con un bloque `es` y otro `en`. En `index.html` cada texto tiene `data-i18n="clave"`. Para cambiar un texto, busca su clave en `i18n.js` y edita las dos versiones.

**Agregar un proyecto nuevo:**
1. En `index.html`, copia un bloque `<article class="proj">…</article>` completo y pégalo debajo.
2. Cambia `p1_title` / `p1_desc` por `p5_title` / `p5_desc`.
3. En `js/i18n.js` crea esas dos claves en `es` y en `en`.
4. Ajusta `data-cat` (`web`, `desktop`, `auto` o `vision`), los enlaces y la imagen `proyecto-5.png`.

## Movimiento y efectos

La página "se dibuja" como un plano técnico. Todo es CSS puro, salvo tres detalles con JavaScript (aparición al hacer scroll, cruz de coordenadas y luz de las tarjetas).

| Efecto | Dónde se controla |
|---|---|
| El nombre entra subiendo y "ensanchándose" | `css/styles.css`, busca `name-in` |
| Cinta de tecnologías en movimiento | `index.html` (busca `CINTA DE TECNOLOGÍAS`). Velocidad: `55s` en `.marquee__track` (menos segundos = más rápido) |
| Cruz con coordenadas en el inicio | `index.html` (bloque `xhair`). Para quitarla, borra ese bloque |
| Cuadrícula de fondo que deriva muy despacio | `css/styles.css`, busca `drift` (`90s`). Para quitarla, borra la animación `drift` |
| Barra amarilla de progreso al hacer scroll | `index.html` (`id="progress"`) |
| Aparición al hacer scroll (textos suben, cajas se dibujan) | `css/styles.css`, sección "Aparición al hacer scroll" |
| Luz dorada que sigue al cursor en tarjetas | `css/styles.css`, busca `radial-gradient` |
| Línea de tiempo que crece | `css/styles.css`, busca `grow` |

**Accesibilidad:** si la persona activó "reducir movimiento" en su dispositivo, todo el movimiento se apaga solo y el contenido se muestra completo. En celulares no aparece la cruz de coordenadas.

**Al agregar secciones nuevas:** para que también tengan animación de aparición, agrega su clase a las dos listas: la de `css/styles.css` (sección "Aparición al hacer scroll") y la variable `RV` de `js/main.js`.

## 5. Cambiar colores

Abre `css/styles.css` y edita las variables del inicio:

- `--paper`: azul del "plano"
- `--signal`: amarillo de acento
- `[data-theme="light"]`: los mismos colores para el modo claro

## 6. Estructura

```
index.html          Contenido de la página
css/styles.css      Diseño
js/i18n.js          Textos ES / EN (todo el contenido editable)
js/main.js          Idioma, tema, menú, diagrama, filtros
assets/fonts/       Fuentes incluidas (funciona sin internet)
assets/img/         Tu foto y capturas
assets/cv/          Tu CV en PDF
assets/favicon.svg  Ícono de la pestaña
```

## 7. Publicarlo gratis

- **GitHub Pages:** sube la carpeta a un repositorio y activa `Settings > Pages > Deploy from a branch > main`.
- **Netlify:** entra a app.netlify.com/drop y arrastra la carpeta.
- **Vercel:** importa el repositorio desde vercel.com.

Cuando ya esté publicado, revisa en el celular que todo se vea bien y que los enlaces abran correctamente.

## Créditos

Fuentes: *Archivo* e *IBM Plex Sans*, ambas con licencia SIL Open Font License 1.1 (uso libre).
