# 🏛️ GÓMEZ & HIJOS — Plataforma Web de Gestoría & Habilitaciones Sanitarias

> Sistema web integral para la gestión, seguimiento en tiempo real y blindaje operativo de habilitaciones sanitarias y trámites administrativos ante organismos públicos (Ministerio de Salud, Fiscalización Sanitaria, Municipios).

---

## 📋 Descripción General

**GÓMEZ & HIJOS** es una solución web ligera, moderna y de alto rendimiento diseñada específicamente para estudios de gestoría y consultoría sanitaria. Permite digitalizar y transparentar el ciclo completo de cada trámite, brindando acceso en tiempo real a los clientes y protegiendo al gestor con sellos digitales y trazabilidad de responsabilidades.

---

## ✨ Características Principales

### 📱 Portal de Seguimiento 24/7 para Clientes
- **Búsqueda por Código Único:** Cada cliente puede consultar el estado de su expediente con su identificador (ej: `GER-2026-01`, `LAB-2026-02`).
- **Semáforo de Responsabilidad en Tiempo Real:**
  - 🟡 **En poder del cliente:** Alerta visual con cronómetro de días transcurridos desde la entrega de formularios para firma y sello.
  - 🔵 **En gestión interna:** Procesamiento, confección de planos y armado de memorias técnicas.
  - 🟢 **En evaluación del Ente Público:** Ingreso formal con fecha y hora exacta ante el organismo fiscalizador.
- **Barra de Avance Porcentual:** Visualización gráfica del progreso (0% a 100%).
- **Línea de Tiempo con Sello Digital:** Historial detallado de presentaciones con hora, minuto y segundo exacto.
- **Acceso a Expedientes Digitales:** Integración directa con enlaces a documentos en Google Drive o Dropbox (almacenamiento costo $0).
- **Emisión de Constancias Oficiales:** Generación e impresión instantánea de constancias de estado membretadas en PDF.

### 🔐 Panel de Control del Gestor (Administrador)
- **Acceso Protegido por PIN:** Sistema de clave numérica configurable directamente desde la interfaz.
- **Alta y Edición de Trámites:** Registro ágil de nuevos establecimientos (geriátricos, clínicas, laboratorios, etc.).
- **Flujo Guiado de Responsabilidad:** Botones de un solo clic para registrar entregas de firmas, recepciones y presentaciones ante entes.
- **Sincronización en la Nube con Google Firebase Firestore:** Permite actualizar expedientes desde cualquier dispositivo y reflejar los cambios instantáneamente en los teléfonos de los clientes.
- **Modo Local (Offline First):** Funciona al 100% incluso sin internet o sin configurar Firebase, gracias al almacenamiento persistente local (`LocalStorage`).
- **Respaldo y Seguridad de Datos:** Herramientas integradas para exportar e importar copias de seguridad en formato JSON.

### 💬 Integración Comercial & Diagnóstico
- **Test Diagnóstico Interactivo:** Cuestionario de 3 pasos que calcula automáticamente el nivel de complejidad y envía los resultados preformateados por WhatsApp.
- **Botón Flotante y Enlaces Directos a WhatsApp:** Configurado para atención inmediata con mensajes contextualizados.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5 semántico + CSS3 moderno.
- **Diseño & UI:** [Tailwind CSS](https://tailwindcss.com/) (vía CDN) + [FontAwesome 6](https://fontawesome.com/).
- **Tipografía:** [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts).
- **Lógica & Estado:** JavaScript Vanilla (ES6+ modular, sin dependencias pesadas).
- **Base de Datos & Sincronización:** [Google Firebase Firestore](https://firebase.google.com/) (SDK compat v9) con fallback en LocalStorage.
- **Despliegue:** Optimizado para [GitHub Pages](https://pages.github.com/) o cualquier hosting estático (Vercel, Netlify, etc.).

---

## 🚀 Inicio Rápido (Local)

1. **Clonar o descargar el repositorio:**
   ```bash
   git clone https://github.com/TU-USUARIO/app-gestoria.git
   ```
2. **Abrir la aplicación:**
   - Simplemente haz doble clic en `index.html` en tu navegador favorito (Chrome, Edge, Firefox, Safari).
   - O en Windows, ejecuta el script `iniciar_web.ps1`.

> **Códigos de prueba precargados:**
> - `GER-2026-01` (Residencia Geriátrica San Antonio — demostración de demora en poder del cliente).
> - `LAB-2026-02` (Laboratorio Clínico BioSalud — demostración de trámite avanzado presentado ante organismo).

---

## 🌐 Publicación en GitHub Pages

Para publicar este proyecto de forma **gratuita** y con dirección web pública en GitHub Pages:

1. Crea un nuevo repositorio en [GitHub](https://github.com/new).
2. Sube los archivos del proyecto a la rama principal (`main`).
3. En el repositorio de GitHub, dirígete a:
   **Settings** ➔ **Pages**
4. En la sección **Build and deployment**:
   - **Source:** *Deploy from a branch*
   - **Branch:** Selecciona `main` y la carpeta `/ (root)`
5. Haz clic en **Save**.
6. En pocos minutos, tu sitio web estará disponible en:
   `https://<TU-USUARIO>.github.io/<NOMBRE-DEL-REPOSITORIO>/`

---

## ☁️ Conexión con Firebase Firestore (Opcional)

Si deseas sincronización en vivo entre múltiples dispositivos:
1. Crea un proyecto gratuito en [Firebase Console](https://console.firebase.google.com/).
2. Crea una base de datos en **Firestore Database** en *Modo de prueba*.
3. Registra una aplicación web (`</>`) y copia las credenciales `firebaseConfig`.
4. Pega tus credenciales en el archivo `firebase-config.js` o cárgalas directamente desde la web en **Acceso Gestor ➔ Configurar Nube**.

Para más detalles paso a paso, consulta el archivo [`INSTRUCTIVO.md`](./INSTRUCTIVO.md).

---

## 📁 Estructura del Proyecto

```text
├── index.html          # Interfaz principal, portal de trámites y panel gestor
├── styles.css          # Estilos personalizados, línea de tiempo y reglas de impresión
├── app.js              # Lógica de la aplicación, sincronización y almacenamiento
├── firebase-config.js  # Plantilla de configuración de Firebase
├── iniciar_web.ps1     # Acceso directo para Windows
├── INSTRUCTIVO.md      # Manual completo de uso y administración
├── .gitignore          # Exclusiones de archivos del control de versiones
└── README.md           # Presentación y documentación del repositorio
```

---

## 📄 Licencia y Derechos

© 2026 Gómez & Hijos — Todos los derechos reservados.
