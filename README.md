# IA práctica para emprendedores: página de inscripción

Página estática (HTML + CSS + JS, sin nada que compilar) publicada en Netlify.
Las inscripciones llegan a una planilla de Google a través de Apps Script (`apps-script/Code.gs`),
que valida los datos, frena el spam, guarda la fila y te manda un mail.

## Archivos
- `index.html`, `styles.css`, `app.js`: la página.
- `apps-script/Code.gs`: el "servidor". Se pega en la planilla; no se publica en Netlify.
- `netlify.toml`: cabeceras de seguridad (CSP y otras).
- `img/`: fotos.

---

## Publicarla, paso a paso (unos 15 minutos)

### Parte 1: la planilla y el Apps Script
1. Entrá a **https://sheets.new** con tu cuenta de Google. Ponele de nombre *Inscripciones curso IA*.
2. Menú **Extensiones → Apps Script**.
3. Borrá todo lo que aparece y pegá el contenido completo de `apps-script/Code.gs`. Tocá el ícono del disquete para guardar.
4. Arriba a la derecha: **Implementar → Nueva implementación**.
   - En el engranaje de "Seleccionar tipo", elegí **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**. Es lo que permite que la página mande inscripciones; solo acepta datos válidos.
   - Tocá **Implementar**.
5. Google te pide permisos. Como el script es tuyo y no está "verificado", aparece un aviso:
   **Configuración avanzada → Ir a (nombre del proyecto) (no seguro) → Permitir**.
   Pide permiso para editar la planilla y mandarte el mail de aviso; no toca nada más.
6. Copiá la **URL de la aplicación web** (termina en `/exec`).
7. Pegala en `app.js`, en la línea `var ENDPOINT = "";`, entre las comillas.

Si algún día cambiás el código del script: **Implementar → Administrar implementaciones → lápiz → Versión: nueva versión → Implementar**. Así la URL no cambia.

### Parte 2: Netlify (gratis, con HTTPS)
1. Entrá a **https://app.netlify.com** y registrate con **GitHub**.
2. **Add new project → Import an existing project → GitHub**. Autorizá y elegí `curso-ia-practica`.
3. No cambies nada de la configuración de build (la lee de `netlify.toml`) y tocá **Deploy**.
4. En **Project configuration → Change project name**, poné algo como `ia-practica-dani`.
   La página queda en `https://ia-practica-dani.netlify.app`.
5. Cada vez que se sube un cambio a GitHub, Netlify la vuelve a publicar sola.

### Parte 3: prueba final
1. Abrí la página desde tu celular e inscribite con tus datos.
2. Fijate que aparezca la fila en la planilla (pestaña *Inscripciones*) y que te llegue el mail.
3. Borrá la fila de prueba.

---

## Tareas de mantenimiento
- **Poner las fotos:** subí la foto a `img/` (JPG, menos de 300 KB), cambiá el `src` en `index.html` y sacá el `hidden` del `<figure>` (hay un comentario que lo marca).
- **Seguimiento de pagos:** usá la columna *Estado* de la planilla (por ejemplo: "pagó").
- **Cupo completo:** avisale a quien mantiene la página para cambiar el botón por "Cupo completo".
- **Datos personales:** al terminar el curso, borrá las filas con "No" en *Avisos próximos cursos*. Si alguien pide que borres sus datos, borrá su fila.
