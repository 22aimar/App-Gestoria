// ==========================================================================
// App Logic for GÓMEZ & HIJOS - Gestoría & Habilitaciones Sanitarias
// Conexión Cloud Firebase Firestore + Fallback LocalStorage + Autenticación PIN
// ==========================================================================

const STORAGE_KEY_TRAMITES = 'gestoria_tramites_db_v2';
const STORAGE_KEY_BRAND = 'gestoria_brand_name_v2';
const STORAGE_KEY_THEME = 'gestoria_theme_v1';
const STORAGE_KEY_FIREBASE = 'gestoria_firebase_config_v1';
const STORAGE_KEY_ADMIN_PIN = 'gestoria_admin_pin_v1';
const DEFAULT_ADMIN_PIN = '1234';

// Cloud Connection State
let db = null;
let isCloudConnected = false;

// Initial Demo Data (used locally or uploaded to Firestore on first connect)
const INITIAL_DEMO_DATA = [
    {
        codigo: 'GER-2026-01',
        cliente: 'Residencia Geriátrica San Antonio S.A.',
        tipo: 'Habilitación de Geriátricos y Residencias',
        entePublico: 'Ministerio de Salud - Mendoza',
        porcentaje: 65,
        estadoResponsabilidad: 'cliente', // 'cliente' | 'gestoria' | 'ente'
        fechaEntregaFirma: '2026-09-20T10:30:00',
        fechaRecepcionFirma: null,
        diasEnPoderCliente: 8,
        eventos: [
            {
                fechaHora: '2026-09-20 10:30:00',
                tipo: 'firma_enviada',
                titulo: 'Formularios Entregados al Cliente para Firma y Sello',
                detalle: 'Se remitieron las planillas oficiales de habilitación geriátrica al apoderado del establecimiento para su firma y sello original.',
                ente: 'Geriátrico San Antonio',
                linkDoc: null
            },
            {
                fechaHora: '2026-09-15 16:45:00',
                tipo: 'interna',
                titulo: 'Confección de Planos y Protocolos Sanitarios',
                detalle: 'Revisión final de planimetría de capacidad asistida y plan de contingencia edilicia por Gómez & Hijos.',
                ente: 'GÓMEZ & HIJOS',
                linkDoc: 'https://drive.google.com'
            },
            {
                fechaHora: '2026-09-10 11:15:00',
                tipo: 'presentacion',
                titulo: 'Presentación Previa de Estudio de Zonificación',
                detalle: 'Ingreso por mail de consulta previa de factibilidad de uso de suelo.',
                ente: 'Municipio de Mendoza',
                linkDoc: 'https://drive.google.com'
            }
        ]
    },
    {
        codigo: 'LAB-2026-02',
        cliente: 'Laboratorio Clínico BioSalud',
        tipo: 'Laboratorios Clínicos y Bioseguridad',
        entePublico: 'Dirección Provincial de Fiscalización Sanitaria',
        porcentaje: 85,
        estadoResponsabilidad: 'ente',
        fechaEntregaFirma: '2026-09-12T09:00:00',
        fechaRecepcionFirma: '2026-09-14T11:20:00',
        diasEnPoderCliente: 2,
        eventos: [
            {
                fechaHora: '2026-09-25 11:30:15',
                tipo: 'presentacion',
                titulo: 'Presentación Oficial de Expediente de Bioseguridad',
                detalle: 'Envío vía mail institucional del expediente completo en PDF con firmas de ley por Gómez & Hijos.',
                ente: 'Dirección Provincial de Fiscalización Sanitaria',
                linkDoc: 'https://drive.google.com'
            },
            {
                fechaHora: '2026-09-14 11:20:00',
                tipo: 'firma_recibida',
                titulo: 'Recepción de Formularios Firmados y Sellados',
                detalle: 'El cliente devolvió las planillas completas. Se procedió al digitalizado y foliado.',
                ente: 'BioSalud',
                linkDoc: null
            },
            {
                fechaHora: '2026-09-12 09:00:00',
                tipo: 'firma_enviada',
                titulo: 'Entrega de Formularios al Cliente para Firma',
                detalle: 'Entrega de formularios de responsabilidad técnica de residuos patogénicos.',
                ente: 'BioSalud',
                linkDoc: null
            }
        ]
    }
];

// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
    initLocalDatabase();
    loadBrandName();
    loadSavedTheme();
    renderAdminTramitesList();
    await initFirebaseConnection();
});

// Database Local Initialization
function initLocalDatabase() {
    if (!localStorage.getItem(STORAGE_KEY_TRAMITES)) {
        localStorage.setItem(STORAGE_KEY_TRAMITES, JSON.stringify(INITIAL_DEMO_DATA));
    }
}

function getTramitesLocal() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_TRAMITES)) || [];
    } catch (e) {
        return [];
    }
}

function saveTramitesLocal(tramites) {
    localStorage.setItem(STORAGE_KEY_TRAMITES, JSON.stringify(tramites));
    renderAdminTramitesList();
    populateTramitesSelect();
}

// ==========================================================================
// GOOGLE FIREBASE CLOUD CONNECTION & SYNC
// ==========================================================================

async function initFirebaseConnection() {
    let config = null;

    // Check window.FIREBASE_CONFIG from firebase-config.js
    if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey && window.FIREBASE_CONFIG.apiKey.trim() !== '') {
        config = window.FIREBASE_CONFIG;
    } else {
        // Check localStorage
        const stored = localStorage.getItem(STORAGE_KEY_FIREBASE);
        if (stored) {
            try {
                config = JSON.parse(stored);
            } catch (e) {
                console.error("Error parseando firebase config:", e);
            }
        }
    }

    if (config && config.apiKey && typeof firebase !== 'undefined') {
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(config);
            }
            db = firebase.firestore();
            isCloudConnected = true;
            updateCloudUI(true);
            console.log("Firebase conectado exitosamente.");

            // Sync with cloud collection
            await syncWithFirestore();
            return true;
        } catch (err) {
            console.error("Error inicializando Firebase:", err);
            updateCloudUI(false, "Error al conectar Firebase: " + (err.message || 'Verifica las claves.'));
            isCloudConnected = false;
            return false;
        }
    } else {
        updateCloudUI(false);
        isCloudConnected = false;
        return false;
    }
}

async function syncWithFirestore() {
    if (!db) return;
    try {
        const snapshot = await db.collection('tramites').get();
        if (snapshot.empty) {
            // First run on a fresh Firebase project: upload demo data
            const locals = getTramitesLocal();
            const listToUpload = locals.length > 0 ? locals : INITIAL_DEMO_DATA;
            for (const t of listToUpload) {
                await db.collection('tramites').doc(t.codigo).set(t);
            }
            saveTramitesLocal(listToUpload);
            console.log("Datos de prueba subidos a Firestore.");
        } else {
            // Cloud has data: pull to local cache
            const cloudData = [];
            snapshot.forEach(doc => cloudData.push(doc.data()));
            saveTramitesLocal(cloudData);
            console.log("Datos sincronizados desde Firestore a caché local.");
        }
    } catch (e) {
        console.warn("Aviso al sincronizar con Firestore:", e);
    }
}

function updateCloudUI(connected, customMsg) {
    const icon = document.getElementById('cloudStatusIcon');
    const badge = document.getElementById('cloudStatusBadge');
    const desc = document.getElementById('cloudStatusDescription');

    if (!icon || !badge || !desc) return;

    if (connected) {
        icon.className = "w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shrink-0 shadow-sm";
        badge.className = "bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300";
        badge.innerHTML = "🟢 Conectado a la Nube";
        desc.innerText = "Base de datos Google Firebase activa. Sincronización en tiempo real entre todos los dispositivos.";
    } else {
        icon.className = "w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl shrink-0 shadow-sm";
        badge.className = "bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300";
        badge.innerHTML = "🟡 Modo Local";
        desc.innerText = customMsg || "Tus trámites están guardados localmente. Conecta Firebase para sincronizar en vivo con los celulares de tus clientes.";
    }
}

function toggleConfiguracionFirebase() {
    const panel = document.getElementById('panelConfigFirebase');
    if (!panel) return;
    panel.classList.toggle('hidden');

    if (!panel.classList.contains('hidden')) {
        const current = localStorage.getItem(STORAGE_KEY_FIREBASE);
        if (current) {
            document.getElementById('firebaseConfigJsonInput').value = current;
        } else if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey) {
            document.getElementById('firebaseConfigJsonInput').value = JSON.stringify(window.FIREBASE_CONFIG, null, 2);
        }
    }
}

async function guardarConfiguracionFirebase() {
    const raw = document.getElementById('firebaseConfigJsonInput').value.trim();
    if (!raw) {
        alert("Por favor ingresa o pega la configuración de Firebase.");
        return;
    }

    let parsed = null;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        // Fallback: extract keys if pasted as `const firebaseConfig = { ... }`
        try {
            const extract = (key) => {
                const match = raw.match(new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`));
                return match ? match[1] : '';
            };
            parsed = {
                apiKey: extract('apiKey'),
                authDomain: extract('authDomain'),
                projectId: extract('projectId'),
                storageBucket: extract('storageBucket'),
                messagingSenderId: extract('messagingSenderId'),
                appId: extract('appId')
            };
        } catch (err2) {
            alert("No se pudo interpretar el formato de configuración. Asegúrate de copiar el objeto completo de Firebase.");
            return;
        }
    }

    if (!parsed || !parsed.apiKey) {
        alert("Falta el campo 'apiKey'. Asegúrate de copiar todo el bloque de Firebase.");
        return;
    }

    localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(parsed, null, 2));
    const ok = await initFirebaseConnection();
    if (ok) {
        const statusSpan = document.getElementById('firebaseSaveStatus');
        if (statusSpan) statusSpan.classList.remove('hidden');
        alert("¡Conexión con Google Firebase exitosa!\nTodos tus trámites ahora se sincronizan en vivo entre tu PC y los celulares de tus clientes.");
    }
}

// Helper to save a single trámite in local storage & Firestore
async function guardarTramiteSync(tramite) {
    // 1. Update local cache
    const tramites = getTramitesLocal();
    const index = tramites.findIndex(t => t.codigo === tramite.codigo);
    if (index >= 0) {
        tramites[index] = tramite;
    } else {
        tramites.push(tramite);
    }
    saveTramitesLocal(tramites);

    // 2. Sync to Firestore if cloud connected
    if (isCloudConnected && db) {
        try {
            await db.collection('tramites').doc(tramite.codigo).set(tramite);
            console.log("Trámite sincronizado en la nube:", tramite.codigo);
        } catch (e) {
            console.error("Error sincronizando trámite en Firestore:", e);
        }
    }
}

// ==========================================================================
// GESTOR AUTHENTICATION & SECURITY PIN
// ==========================================================================

function abrirAccesoGestor() {
    if (sessionStorage.getItem('gestor_logged_in') === 'true') {
        toggleAdminModal();
    } else {
        document.getElementById('adminPinModal').classList.remove('hidden');
        document.getElementById('adminPinError').classList.add('hidden');
        const input = document.getElementById('adminPinInput');
        input.value = '';
        setTimeout(() => input.focus(), 150);
    }
}

function cerrarPinModal() {
    document.getElementById('adminPinModal').classList.add('hidden');
}

function verificarPinGestor(e) {
    if (e) e.preventDefault();
    const pinIngresado = document.getElementById('adminPinInput').value.trim();
    const pinGuardado = localStorage.getItem(STORAGE_KEY_ADMIN_PIN) || DEFAULT_ADMIN_PIN;

    if (pinIngresado === pinGuardado) {
        sessionStorage.setItem('gestor_logged_in', 'true');
        cerrarPinModal();
        toggleAdminModal();
    } else {
        document.getElementById('adminPinError').classList.remove('hidden');
    }
}

function abrirCambiarPinModal() {
    document.getElementById('cambiarPinModal').classList.remove('hidden');
    document.getElementById('pinActualInput').value = '';
    document.getElementById('pinNuevoInput').value = '';
}

function cerrarCambiarPinModal() {
    document.getElementById('cambiarPinModal').classList.add('hidden');
}

function guardarNuevoPin(e) {
    if (e) e.preventDefault();
    const actual = document.getElementById('pinActualInput').value.trim();
    const nuevo = document.getElementById('pinNuevoInput').value.trim();
    const pinGuardado = localStorage.getItem(STORAGE_KEY_ADMIN_PIN) || DEFAULT_ADMIN_PIN;

    if (actual !== pinGuardado) {
        alert("El PIN actual ingresado no es correcto.");
        return;
    }
    if (!nuevo || nuevo.length < 4) {
        alert("El nuevo PIN debe tener al menos 4 caracteres o números.");
        return;
    }

    localStorage.setItem(STORAGE_KEY_ADMIN_PIN, nuevo);
    cerrarCambiarPinModal();
    alert("PIN de Gestor actualizado exitosamente. Guárdalo bien.");
}

function cerrarSesionGestor() {
    sessionStorage.removeItem('gestor_logged_in');
    toggleAdminModal();
    alert("Sesión de gestor cerrada de forma segura.");
}

function toggleAdminModal() {
    const modal = document.getElementById('adminModal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        renderAdminTramitesList();
        populateTramitesSelect();
    }
}

// ==========================================================================
// SEARCH LOGIC & TRACKING RENDERER (REAL-TIME CLOUD OR LOCAL)
// ==========================================================================

function fillDemoCode(code) {
    document.getElementById('trackingCodeInput').value = code;
    buscarTramite(new Event('submit'));
    document.getElementById('seguimiento-seccion').scrollIntoView({ behavior: 'smooth' });
}

async function buscarTramite(event) {
    if (event) event.preventDefault();
    const code = document.getElementById('trackingCodeInput').value.trim().toUpperCase();
    if (!code) return;

    const container = document.getElementById('trackingResultContainer');
    const content = document.getElementById('trackingContent');

    // Visual feedback while loading
    content.innerHTML = `
        <div class="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800">
            <i class="fa-solid fa-spinner fa-spin text-blue-500 text-3xl mb-3"></i>
            <h3 class="text-base font-bold text-white mb-1">Consultando Expediente Oficial...</h3>
            <p class="text-xs text-slate-400">Verificando estado actualizado en tiempo real.</p>
        </div>
    `;
    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth' });

    let tramite = null;

    // Check Cloud if connected
    if (isCloudConnected && db) {
        try {
            const doc = await db.collection('tramites').doc(code).get();
            if (doc.exists) {
                tramite = doc.data();
                // Update local cache
                const locals = getTramitesLocal();
                const idx = locals.findIndex(t => t.codigo === code);
                if (idx >= 0) locals[idx] = tramite; else locals.push(tramite);
                localStorage.setItem(STORAGE_KEY_TRAMITES, JSON.stringify(locals));
            }
        } catch (e) {
            console.warn("Fallo consulta en la nube, usando caché local:", e);
        }
    }

    // Fallback to local cache
    if (!tramite) {
        const tramites = getTramitesLocal();
        tramite = tramites.find(t => t.codigo.toUpperCase() === code);
    }

    if (!tramite) {
        content.innerHTML = `
            <div class="text-center py-10 bg-slate-800 rounded-2xl border border-slate-700">
                <i class="fa-solid fa-circle-xmark text-red-400 text-4xl mb-3"></i>
                <h3 class="text-xl font-bold text-white mb-1">Código de Trámite No Encontrado</h3>
                <p class="text-xs text-slate-400">Verifica el código ingresado (ej: GER-2026-01) o ponte en contacto con Gómez & Hijos.</p>
            </div>
        `;
        return;
    }

    renderTramiteContent(tramite);
}

function renderTramiteContent(tramite) {
    const container = document.getElementById('trackingResultContainer');
    const content = document.getElementById('trackingContent');

    // Calculate days if currently waiting for client signature
    let diasTranscurridosMsg = '';
    if (tramite.estadoResponsabilidad === 'cliente' && tramite.fechaEntregaFirma) {
        const fechaEntrega = new Date(tramite.fechaEntregaFirma);
        const hoy = new Date();
        const diffTime = Math.abs(hoy - fechaEntrega);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        diasTranscurridosMsg = `hace ${diffDays} día(s)`;
    }

    // Render Badge Status
    let badgeHTML = '';
    if (tramite.estadoResponsabilidad === 'cliente') {
        badgeHTML = `
            <div class="bg-amber-950/80 border-2 border-amber-500 rounded-2xl p-5 mb-8 badge-urgent flex items-center gap-4 print:bg-amber-50 print:border-amber-400">
                <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-2xl print:text-amber-700">
                    <i class="fa-solid fa-file-signature"></i>
                </div>
                <div>
                    <span class="inline-block bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider mb-1">
                        🟡 Responsabilidad Actual: En Poder del Cliente
                    </span>
                    <h4 class="text-base font-bold text-amber-200 print:text-slate-900">Pendiente de Firma y Sello del Establecimiento</h4>
                    <p class="text-xs text-amber-300/90 print:text-slate-700 mt-0.5">
                        Los formularios oficiales fueron entregados al cliente el 
                        <strong>${formatFecha(tramite.fechaEntregaFirma)}</strong> 
                        (${diasTranscurridosMsg}). El trámite avanzará inmediatamente al recibir la documentación firmada.
                    </p>
                </div>
            </div>
        `;
    } else if (tramite.estadoResponsabilidad === 'gestoria') {
        badgeHTML = `
            <div class="bg-blue-950/80 border-2 border-blue-500 rounded-2xl p-5 mb-8 flex items-center gap-4 print:bg-blue-50 print:border-blue-400">
                <div class="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-2xl print:text-blue-700">
                    <i class="fa-solid fa-microchip"></i>
                </div>
                <div>
                    <span class="inline-block bg-blue-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider mb-1">
                        🔵 Responsabilidad Actual: En Gestoría (Gómez & Hijos)
                    </span>
                    <h4 class="text-base font-bold text-blue-200 print:text-slate-900">Procesando y Digitalizando Expediente en PDF</h4>
                    <p class="text-xs text-blue-300/90 print:text-slate-700 mt-0.5">
                        Documentación firmada recibida. Estamos armando la presentación oficial para ingresar al ente público.
                    </p>
                </div>
            </div>
        `;
    } else {
        badgeHTML = `
            <div class="bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl p-5 mb-8 flex items-center gap-4 print:bg-emerald-50 print:border-emerald-400">
                <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-2xl print:text-emerald-700">
                    <i class="fa-solid fa-building-columns"></i>
                </div>
                <div>
                    <span class="inline-block bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider mb-1">
                        🟢 Responsabilidad Actual: Ingresado en Ente Público
                    </span>
                    <h4 class="text-base font-bold text-emerald-200 print:text-slate-900">Expediente Presentado Oficialmente</h4>
                    <p class="text-xs text-emerald-300/90 print:text-slate-700 mt-0.5">
                        El expediente se encuentra en evaluación por <strong>${tramite.entePublico}</strong>. Registrado con sello de fecha y hora.
                    </p>
                </div>
            </div>
        `;
    }

    // Render Events Timeline
    let timelineHTML = '';
    tramite.eventos.forEach(ev => {
        let iconClass = 'fa-paper-plane text-blue-400';
        let borderClass = 'border-slate-700 print:border-slate-300';

        if (ev.tipo === 'firma_enviada') {
            iconClass = 'fa-file-signature text-amber-400';
            borderClass = 'border-amber-800/60 print:border-amber-300';
        } else if (ev.tipo === 'firma_recibida') {
            iconClass = 'fa-signature text-blue-400';
            borderClass = 'border-blue-800/60 print:border-blue-300';
        }

        timelineHTML += `
            <div class="timeline-item mb-6">
                <div class="bg-slate-800/90 print:bg-slate-50 rounded-2xl p-4 border ${borderClass} shadow-md">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                        <span class="text-xs font-bold text-slate-400 print:text-slate-600 flex items-center gap-2">
                            <i class="fa-regular fa-clock text-blue-400"></i>
                            <span class="font-mono text-blue-300 print:text-blue-700">${ev.fechaHora}</span>
                        </span>
                        <span class="text-[11px] font-semibold text-slate-300 print:text-slate-700 bg-slate-900 print:bg-slate-200 px-2.5 py-0.5 rounded-full border border-slate-700 print:border-slate-300">
                            ${ev.ente || 'Gómez & Hijos'}
                        </span>
                    </div>
                    <h5 class="text-sm font-bold text-white print:text-slate-900 mb-1 flex items-center gap-2">
                        <i class="fa-solid ${iconClass}"></i>
                        <span>${ev.titulo}</span>
                    </h5>
                    <p class="text-xs text-slate-300 print:text-slate-700 leading-relaxed mb-3">${ev.detalle}</p>
                    ${ev.linkDoc ? `
                        <a href="${ev.linkDoc}" target="_blank" class="inline-flex items-center gap-2 text-xs font-bold text-blue-400 print:text-blue-700 hover:text-blue-300 underline">
                            <i class="fa-solid fa-folder-open"></i> Ver Documentación Presentada (PDF / Drive)
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    });

    content.innerHTML = `
        <div class="space-y-6">
            <!-- Header Info -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 print:border-slate-300 pb-6">
                <div>
                    <span class="text-xs font-mono font-bold text-blue-400 print:text-blue-700 uppercase tracking-widest bg-blue-950 print:bg-blue-50 px-3 py-1 rounded-md border border-blue-800 print:border-blue-200">
                        Código: ${tramite.codigo}
                    </span>
                    <h2 class="text-2xl font-extrabold text-white print:text-slate-900 mt-2">${tramite.cliente}</h2>
                    <p class="text-xs text-slate-400 print:text-slate-600">Trámite: ${tramite.tipo} | Ente: ${tramite.entePublico}</p>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="imprimirConstancia('${tramite.codigo}')" class="print:hidden bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2">
                        <i class="fa-solid fa-print"></i> Imprimir Constancia PDF
                    </button>
                    <div class="w-full md:w-56 bg-slate-800 print:bg-slate-100 p-4 rounded-2xl border border-slate-700 print:border-slate-300">
                        <div class="flex justify-between items-center text-xs font-bold mb-2">
                            <span class="text-slate-300 print:text-slate-700">Progreso Total</span>
                            <span class="text-emerald-400 print:text-emerald-700 font-mono text-base">${tramite.porcentaje}%</span>
                        </div>
                        <div class="w-full bg-slate-900 print:bg-slate-300 h-3 rounded-full overflow-hidden border border-slate-700">
                            <div class="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500" style="width: ${tramite.porcentaje}%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Active Status Badge -->
            ${badgeHTML}

            <!-- Events Timeline -->
            <div>
                <h4 class="text-sm font-bold text-slate-300 print:text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-list-check text-blue-400"></i>
                    <span>Historial Cronológico de Presentaciones e Interacciones</span>
                </h4>
                <div class="pl-2">
                    ${timelineHTML}
                </div>
            </div>
        </div>
    `;

    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================================================
// ADMIN ACTIONS (CREATE & UPDATE TRAMITES)
// ==========================================================================

function renderAdminTramitesList() {
    const container = document.getElementById('adminTramitesList');
    if (!container) return;

    const tramites = getTramitesLocal();
    if (tramites.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-500">No hay trámites registrados.</p>`;
        return;
    }

    let html = '';
    tramites.forEach(t => {
        let statusBadge = '';
        if (t.estadoResponsabilidad === 'cliente') {
            statusBadge = `<span class="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-300">🟡 Esperando Cliente</span>`;
        } else if (t.estadoResponsabilidad === 'gestoria') {
            statusBadge = `<span class="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-blue-300">🔵 En Gestoría</span>`;
        } else {
            statusBadge = `<span class="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-300">🟢 En Ente Público</span>`;
        }

        html += `
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="font-mono font-bold text-xs text-blue-700">${t.codigo}</span>
                        ${statusBadge}
                    </div>
                    <div class="font-bold text-slate-900 text-sm mt-0.5">${t.cliente}</div>
                    <div class="text-xs text-slate-500">${t.tipo} | Avance: ${t.porcentaje}%</div>
                </div>
                <button onclick="fillDemoCode('${t.codigo}')" class="text-xs font-bold text-blue-600 hover:text-blue-800 bg-white px-3 py-1.5 rounded-lg border border-slate-300">
                    <i class="fa-solid fa-eye"></i> Ver Portal
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
}

function populateTramitesSelect() {
    const select = document.getElementById('selectTramiteActualizar');
    if (!select) return;

    const tramites = getTramitesLocal();
    select.innerHTML = tramites.map(t => `
        <option value="${t.codigo}">${t.codigo} - ${t.cliente} (${t.porcentaje}%)</option>
    `).join('');
}

function mostrarFormNuevoTramite() {
    document.getElementById('formNuevoTramite').classList.remove('hidden');
}

function cancelarNuevoTramite() {
    document.getElementById('formNuevoTramite').classList.add('hidden');
}

async function crearTramite() {
    const cliente = document.getElementById('nuevoClienteNombre').value.trim();
    const tipo = document.getElementById('nuevoTipoTramite').value;
    const codigo = document.getElementById('nuevoCodigoTramite').value.trim().toUpperCase();
    const entePublico = document.getElementById('nuevoEntePublico').value.trim();

    if (!cliente || !codigo || !entePublico) {
        alert('Por favor completa todos los campos requeridos.');
        return;
    }

    const tramites = getTramitesLocal();
    if (tramites.some(t => t.codigo === codigo)) {
        alert('El código de trámite ya existe. Elige uno diferente.');
        return;
    }

    const newTramite = {
        codigo,
        cliente,
        tipo,
        entePublico,
        porcentaje: 15,
        estadoResponsabilidad: 'gestoria',
        fechaEntregaFirma: null,
        fechaRecepcionFirma: null,
        diasEnPoderCliente: 0,
        eventos: [
            {
                fechaHora: getCurrentTimestamp(),
                tipo: 'interna',
                titulo: 'Inicio de Expediente y Revisión Preliminar',
                detalle: 'Recepción de datos de cliente y apertura de expediente técnico por Gómez & Hijos.',
                ente: 'GÓMEZ & HIJOS',
                linkDoc: null
            }
        ]
    };

    await guardarTramiteSync(newTramite);
    cancelarNuevoTramite();
    alert(`Trámite ${codigo} creado exitosamente` + (isCloudConnected ? ' y sincronizado en la nube.' : '.'));
}

async function registrarAccionFirmaCliente() {
    const codigo = document.getElementById('selectTramiteActualizar').value;
    if (!codigo) return;

    const tramites = getTramitesLocal();
    const t = tramites.find(item => item.codigo === codigo);
    if (!t) return;

    const timestamp = getCurrentTimestamp();
    t.estadoResponsabilidad = 'cliente';
    t.fechaEntregaFirma = new Date().toISOString();
    t.porcentaje = Math.max(t.porcentaje, 35);

    t.eventos.unshift({
        fechaHora: timestamp,
        tipo: 'firma_enviada',
        titulo: 'Formularios Entregados al Cliente para Firma y Sello',
        detalle: 'Se entregaron/enviaron las planillas oficiales para firma y sello del apoderado.',
        ente: t.cliente,
        linkDoc: null
    });

    await guardarTramiteSync(t);
    alert(`[${timestamp}] Registrado: Formulario entregado al cliente para firma. La responsabilidad ha pasado al cliente.` + (isCloudConnected ? ' (Sincronizado en la nube)' : ''));
}

async function registrarAccionFirmaDevuelta() {
    const codigo = document.getElementById('selectTramiteActualizar').value;
    if (!codigo) return;

    const tramites = getTramitesLocal();
    const t = tramites.find(item => item.codigo === codigo);
    if (!t) return;

    const timestamp = getCurrentTimestamp();
    t.estadoResponsabilidad = 'gestoria';
    t.fechaRecepcionFirma = new Date().toISOString();
    t.porcentaje = Math.max(t.porcentaje, 45);

    t.eventos.unshift({
        fechaHora: timestamp,
        tipo: 'firma_recibida',
        titulo: 'Formularios Firmados Recibidos del Cliente',
        detalle: 'El cliente devolvió los formularios firmados. Se procede al escaneado en PDF y folio.',
        ente: 'GÓMEZ & HIJOS',
        linkDoc: null
    });

    await guardarTramiteSync(t);
    alert(`[${timestamp}] Registrado: Documentación firmada recibida del cliente. Responsabilidad devuelta a Gómez & Hijos.` + (isCloudConnected ? ' (Sincronizado en la nube)' : ''));
}

function registrarAccionPresentacionEnte() {
    const subform = document.getElementById('subformPresentacionEnte');
    subform.classList.toggle('hidden');
}

async function confirmarPresentacionEnte() {
    const codigo = document.getElementById('selectTramiteActualizar').value;
    const detalle = document.getElementById('envioDetalle').value.trim();
    const linkDoc = document.getElementById('envioLinkDrive').value.trim();
    const porcentaje = parseInt(document.getElementById('envioPorcentaje').value) || 65;

    if (!codigo || !detalle) {
        alert('Ingresa el detalle o asunto de la presentación.');
        return;
    }

    const tramites = getTramitesLocal();
    const t = tramites.find(item => item.codigo === codigo);
    if (!t) return;

    const timestamp = getCurrentTimestamp();
    t.estadoResponsabilidad = 'ente';
    t.porcentaje = Math.min(100, Math.max(0, porcentaje));

    t.eventos.unshift({
        fechaHora: timestamp,
        tipo: 'presentacion',
        titulo: 'Presentación Oficial por Mail ante Ente Público',
        detalle: detalle,
        ente: t.entePublico,
        linkDoc: linkDoc || null
    });

    await guardarTramiteSync(t);
    document.getElementById('subformPresentacionEnte').classList.add('hidden');
    alert(`[${timestamp}] Presentación registrada exitosamente con fecha y hora exactas ante ${t.entePublico}.` + (isCloudConnected ? ' (Sincronizado en la nube)' : ''));
}

// Print Constancia Document
function imprimirConstancia(code) {
    document.getElementById('printDateStamp').innerText = 'Emitido el ' + getCurrentTimestamp();
    window.print();
}

// Export Database Backup JSON
function exportarBaseDatos() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getTramitesLocal(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GOMEZ_Y_HIJOS_TRAMITES_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// Import Database Backup JSON
function importarBaseDatos(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                saveTramitesLocal(importedData);
                if (isCloudConnected && db) {
                    for (const t of importedData) {
                        await db.collection('tramites').doc(t.codigo).set(t);
                    }
                }
                alert('Base de datos de trámites restaurada exitosamente' + (isCloudConnected ? ' y sincronizada en la nube.' : '.'));
            } else {
                alert('El archivo no contiene un formato de trámites válido.');
            }
        } catch (err) {
            alert('Error al leer el archivo JSON.');
        }
    };
    reader.readAsText(file);
}

// Utilities: Dates & Timestamps
function formatFecha(isoString) {
    if (!isoString) return 'N/A';
    const d = new Date(isoString);
    return d.toLocaleDateString('es-AR') + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function getCurrentTimestamp() {
    const now = new Date();
    const pad = num => String(num).padStart(2, '0');
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    return `${date} ${time}`;
}

// Theme & Branding Utilities
function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem(STORAGE_KEY_THEME, themeName);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'azul';
    setTheme(savedTheme);
}

function loadBrandName() {
    const savedName = localStorage.getItem(STORAGE_KEY_BRAND) || 'GÓMEZ & HIJOS';
    const display = document.getElementById('brandNameDisplay');
    if (display) display.innerText = savedName;
}

// Interactive Quiz Logic
let quizAnswers = {};

function selectQuizOption(questionNum, optionText) {
    quizAnswers[questionNum] = optionText;
    
    document.querySelectorAll(`.quiz-btn-${questionNum}`).forEach(btn => {
        if (btn.innerText.includes(optionText)) {
            btn.classList.add('quiz-btn-selected');
        } else {
            btn.classList.remove('quiz-btn-selected');
        }
    });
}

function enviarQuiz() {
    const nombre = document.getElementById('quizNombre').value.trim();
    const telefono = document.getElementById('quizTelefono').value.trim();

    if (!quizAnswers[1] || !quizAnswers[2]) {
        alert('Por favor responde las preguntas 1 y 2 para generar tu diagnóstico.');
        return;
    }

    if (!nombre || !telefono) {
        alert('Ingresa tu nombre y teléfono para enviarte el diagnóstico.');
        return;
    }

    const msg = `Hola Gómez & Hijos! Solicito Diagnóstico Sin Cargo.
- Establecimiento: ${quizAnswers[1]}
- Etapa Actual: ${quizAnswers[2]}
- Nombre: ${nombre}
- Teléfono: ${telefono}`;

    const encodedMsg = encodeURIComponent(msg);
    window.open(`https://wa.me/5492614673398?text=${encodedMsg}`, '_blank');
}
