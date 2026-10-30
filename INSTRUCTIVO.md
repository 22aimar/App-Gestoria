# MANUAL E INSTRUCTIVO DE USO Y PUBLICACIÓN
## GÓMEZ & HIJOS — Gestoría & Habilitaciones Sanitarias

---

### 📌 Contenido de la Guía
1. **Estructura y Archivos del Proyecto**
2. **Cómo abrir y probar el sistema localmente**
3. **Seguridad: PIN de Acceso para el Gestor**
4. **Conexión en la Nube con Google Firebase (Sincronización en Vivo)**
5. **Manual del Gestor (Administrador)**
   - Creación de nuevos trámites
   - Gestión de Responsabilidades y Firmas (Protección ante reclamos)
   - Registro de Presentaciones con Fecha y Hora exacta (Sello Digital)
   - Vinculación con Google Drive / Dropbox (Costo $0 de almacenamiento)
   - Copias de Seguridad (Exportar / Importar base de datos JSON)
   - Emisión e Impresión de Constancias Oficiales en PDF
6. **Manual del Cliente (Portal de Seguimiento 24/7)**
7. **Configuración de WhatsApp con tu número real**
8. **Guía Paso a Paso para Publicar en GitHub Pages**

---

## 1. Estructura y Archivos del Proyecto

La plataforma fue diseñada como una aplicación web moderna, rápida y sin servidores costosos (HTML5 + Tailwind CSS + JavaScript puro + Google Firebase):

| Archivo | Función |
| :--- | :--- |
| `index.html` | Estructura completa de la página: Portada, Propuesta de Valor, Servicios, Método, Recomendaciones/Testimonios, Portal 24/7, Test Diagnóstico, Footer, Modales de PIN y Panel Gestor. |
| `styles.css` | Reglas de estilo personalizadas: línea de tiempo, animación de badges de alerta, estilos de impresión PDF y paleta Azul Aciano (`#2563eb`). |
| `app.js` | Motor del sistema: sincronización en la nube con Firestore, cálculo de días de demora, sellos de tiempo, exportación/importación JSON y lógica del portal. |
| `firebase-config.js` | Archivo donde se configuran las claves de tu proyecto gratuito de Google Firebase. |
| `iniciar_web.ps1` | Script directo de Windows para abrir la página en tu navegador predeterminado con un doble clic. |

---

## 2. Cómo abrir y probar el sistema en tu computadora

Tienes dos formas directas de abrir la plataforma:

1. **Opción Directa**: Abre la carpeta `gestoria-tramites` y haz doble clic sobre `index.html`. Se abrirá en Chrome, Edge o tu navegador habitual.
2. **Opción por Script**: Haz clic derecho sobre `iniciar_web.ps1` y selecciona *"Ejecutar con PowerShell"*.

> **Códigos de prueba precargados:**
> - `GER-2026-01` (Geriátrico San Antonio — Simula demora en poder del cliente por firma).
> - `LAB-2026-02` (Laboratorio BioSalud — Simula trámite avanzado presentado ante ente público).

---

## 3. Seguridad: PIN de Acceso para el Gestor

Para que nadie en internet pueda alterar tus trámites o borrarlos al navegar en GitHub Pages:
- Al hacer clic en el botón **"Acceso Gestor"**, la web solicita un **PIN de seguridad**.
- **PIN por defecto:** `1234`
- **Cómo cambiar el PIN:**
  1. Ingresa al panel con `1234`.
  2. Haz clic en el botón blanco con ícono de llave **"PIN"**.
  3. Ingresa el PIN actual y escribe tu nueva clave personal.
  4. Presiona *"Guardar PIN"*.
- **Cerrar Sesión:** En el panel tienes un botón rojo de salida (`puerta con flecha`) para bloquear el panel cuando termines.

---

## 4. Conexión en la Nube con Google Firebase (Sincronización en Vivo)

Para que cuando vos cargues un trámite o registres una presentación oficial desde tu PC o celular, **el cliente lo vea en vivo desde su propio teléfono en cualquier lugar del país**:

### ¿Cómo obtener tus claves gratuitas de Firebase en 2 minutos?
1. Ingresa a [console.firebase.google.com](https://console.firebase.google.com/) con tu cuenta habitual de Gmail.
2. Haz clic en **"Crear un proyecto"** y nómbralo (por ejemplo: `gomez-y-hijos`).
3. En el paso de Google Analytics puedes desmarcarlo y hacer clic en **"Crear proyecto"**.
4. Una vez creado el proyecto:
   - En el menú lateral izquierdo, haz clic en **"Firestore Database"**.
   - Presiona **"Crear base de datos"** $\rightarrow$ Elige ubicación por defecto $\rightarrow$ Selecciona **"Modo de prueba (Test mode)"** $\rightarrow$ Presiona **"Habilitar"**.
5. Vuelve al inicio del proyecto (Panel General) y haz clic en el ícono web redondito: `</>`.
6. Asígnale un apodo (ej: `web`) y haz clic en **"Registrar app"**.
7. Verás en pantalla un bloque de código como este:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyD-xxxxxxxxxxxxxxxxxxxx",
     authDomain: "gomez-y-hijos.firebaseapp.com",
     projectId: "gomez-y-hijos",
     storageBucket: "gomez-y-hijos.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:xxxxxxxxxxxx"
   };
   ```
8. **Conectar en la web**:
   - Abre tu página web, entra a **"Acceso Gestor"** (PIN: `1234`).
   - En la tarjeta superior verás: `🟡 Modo Local`.
   - Haz clic en **"Configurar Nube"**.
   - Pega ese bloque de código en el casillero y presiona **"Guardar y Conectar a la Nube"**.
   - ¡Listo! La tarjeta cambiará a `🟢 Conectado a la Nube`.

> **Alternativa directa:** También puedes abrir el archivo `firebase-config.js` y pegar esos datos entre las llaves `{ ... }`.

---

## 5. Manual del Gestor (Administrador)

### A. Crear un Nuevo Trámite
1. En el panel de Gestor, haz clic en el botón azul **"+ Nuevo Trámite"**.
2. Completa los 4 campos requeridos:
   - **Nombre del Establecimiento / Cliente:** Ej. *Clínica Médica Los Andes S.R.L.*
   - **Tipo de Trámite:** Selecciona en el menú (Geriátricos, Centros Médicos, Laboratorios, o Inspección previa).
   - **Código Único de Trámite:** Elige un identificador fácil de recordar (Ej: `CLI-2026-03`).
   - **Organismo Receptor Principal:** Ej. *Ministerio de Salud de Mendoza*.
3. Presiona **"Crear Trámite"**. Quedará activo e inmediatamente sincronizado en la nube.

### B. Gestión de Responsabilidad y Firmas (Blindaje ante reclamos)
- **Cuando entregas las planillas al cliente para firmar:**
  1. En el panel gestor, selecciona el trámite en el menú desplegable.
  2. Haz clic en el botón amarillo: **"1. Formulario Entregado a Cliente"**.
  3. El sistema activa un **cronómetro automático**. Cuando el cliente consulte su trámite en el portal, verá una alerta amarilla destacada indicando exactamente qué día y hora se le entregó y cuántos días lleva en su poder.
- **Cuando el cliente te devuelve todo firmado y sellado:**
  1. Selecciona el trámite y presiona el botón azul: **"2. Formulario Firmado Recibido"**.
  2. El sistema detiene el cómputo de demora del cliente y registra el evento con fecha y hora.

### C. Registro de Presentaciones con Fecha y Hora Exacta (Sello Digital)
Cuando ingresas una presentación oficial ante el Ministerio, Dirección de Fiscalización o Municipio:
1. En el panel gestor, haz clic en el botón verde: **"3. Envió Mail a Ente Público"**.
2. Completa el formulario:
   - **Detalle de la Presentación:** Ej. *Presentación de planimetría contra incendios y protocolo de evacuación vía mail oficial.*
   - **Porcentaje de Avance:** (Ej. 75%).
   - **Enlace al Comprobante / Expediente:** Pega el link de Google Drive o Dropbox.
3. Presiona **"Guardar Evento con Fecha y Hora"**.
4. El sistema guardará el evento con **segundos exactos** (Ej: `2026-10-26 11:15:22`) y pasará la responsabilidad a `🟢 Ente Público`.

### D. Integración con Google Drive o Dropbox (Costo $0)
1. Sube los PDFs o planos a una carpeta en tu Google Drive o Dropbox.
2. Configura el archivo o carpeta como *"Cualquier persona con el enlace puede ver"*.
3. Pega ese enlace en el campo **"Enlace a la Documentación"**.
4. El cliente verá un botón directo: `[Ver Documentación Presentada (PDF / Drive)]`.

### E. Copias de Seguridad (Backup y Restauración)
- **Descargar copia:** Haz clic en **"Exportar Copia"** para guardar un archivo `.json` en tu PC.
- **Restaurar:** Haz clic en **"Restaurar Copia"** para subir un backup previo. Si Firebase está activo, también restaurará la nube.

### F. Impresión de Constancias Oficiales en PDF
En el portal de consulta de cualquier trámite, haz clic en **"Imprimir Constancia PDF"** para obtener un certificado oficial membretado con sello de emisión.

---

## 6. Manual del Cliente (Portal de Seguimiento 24/7)

1. El cliente ingresa a la página web y baja a la sección **"Portal de Seguimiento 24/7"**.
2. Escribe su código de trámite (ej: `GER-2026-01`) y presiona **"Consultar Estado"**.
3. En pantalla verá:
   - Barra de avance en tiempo real (0 a 100%).
   - Semáforo de responsabilidad:
     - 🟡 **Amarillo:** El trámite espera su firma y sello (con fecha exacta de entrega).
     - 🔵 **Azul:** Gómez & Hijos está procesando la documentación.
     - 🟢 **Verde:** Ingresado formalmente en el organismo público evaluador.
   - La línea de tiempo con cada presentación, fecha, hora y enlace a sus documentos.

---

## 7. Configuración de WhatsApp

El número oficial ya se encuentra **configurado y activo**:  
📱 **+54 9 261 467-3398** (formato enlace: `5492614673398`)

Todos los botones ("Consultar con un Especialista", el botón flotante, el enlace en el pie de página y el Test Diagnóstico) envían los mensajes directamente a este WhatsApp.

> **Si en el futuro cambias de número de atención:**
> 1. En `index.html`, busca `5492614673398` y reemplázalo por el nuevo.
> 2. En `app.js` (en la función `enviarQuiz`), cambia `5492614673398` por el nuevo.

---

## 8. Guía Paso a Paso para Publicar en GitHub Pages (Gratis)

1. Entra a [github.com](https://github.com) y crea un repositorio público (ej: `gomez-y-hijos`).
2. Sube los archivos de la carpeta:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `firebase-config.js`
3. Ve a **Settings** $\rightarrow$ **Pages**.
4. En **Branch**, selecciona **`main`** y presiona **Save**.
5. En 1 o 2 minutos tu sitio estará activo en:  
   👉 `https://TU-USUARIO.github.io/gomez-y-hijos/`

---

### 🛡️ Propiedad Intelectual
Todo el desarrollo cuenta con el pie de página de titularidad:
`© 2026 Luis Gómez — Propiedad Intelectual. Todos los derechos reservados.`
