// Estado Global del Panel Admin
let estado = {
  evento: {
    titulo_seccion: "Proximo evento",
    descripcion: "",
    imagen: "",
    alt_imagen: "",
    mostrar_botones: false,
    link_itinerario: "",
    link_inscripcion: "",
    whatsapp: ""
  },
  salidas: [],
  auspiciantes: []
};

// Clave por defecto local
const CLAVE_CORRECTA = "siambretta2025";

document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initTabs();
  cargarDatos();
  initGitHubConfig();
});

// --- AUTENTICACIÓN FLEXIBLE Y SEGURA ---
function initLogin() {
  const loginOverlay = document.getElementById('loginOverlay');
  const loginForm = document.getElementById('loginForm');
  const passInput = document.getElementById('passInput');
  const loginError = document.getElementById('loginError');

  if (sessionStorage.getItem('admin_autenticado') === 'true') {
    loginOverlay.style.display = 'none';
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputVal = passInput.value.trim();
    loginError.style.display = 'none';

    // 1. Si ingresa la contraseña local predeterminada
    if (inputVal === CLAVE_CORRECTA) {
      sessionStorage.setItem('admin_autenticado', 'true');
      loginOverlay.style.display = 'none';
      mostrarToast('¡Bienvenido al Panel de Administración!');
      return;
    }

    // 2. Si ingresa un Token de GitHub directo (ghp_... o github_pat_...)
    if (inputVal.startsWith('ghp_') || inputVal.startsWith('github_pat_')) {
      try {
        const res = await fetch('https://api.github.com/user', {
          headers: { 'Authorization': `token ${inputVal}` }
        });
        if (res.ok) {
          const user = await res.json();
          localStorage.setItem('gh_token', inputVal);
          if (user.login) localStorage.setItem('gh_owner', user.login);
          sessionStorage.setItem('admin_autenticado', 'true');
          loginOverlay.style.display = 'none';
          document.getElementById('gh_token').value = inputVal;
          mostrarToast(`¡Autenticado como ${user.login} en GitHub!`);
          return;
        }
      } catch (err) {}
    }

    // Si fallan ambos
    loginError.style.display = 'block';
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('admin_autenticado');
    loginOverlay.style.display = 'flex';
    passInput.value = '';
  });
}


// --- PESTAÑAS ---
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

// --- CARGA DE DATOS ---
async function cargarDatos() {
  try {
    const resEv = await fetch('../data/eventos.json');
    if (resEv.ok) estado.evento = await resEv.json();
  } catch (e) {
    console.log('Cargando evento por defecto');
  }

  try {
    const resSal = await fetch('../data/salidas.json');
    if (resSal.ok) {
      const data = await resSal.json();
      estado.salidas = data.salidas || data;
    }
  } catch (e) {
    console.log('Cargando salidas por defecto');
  }

  try {
    const resAus = await fetch('../data/auspiciantes.json');
    if (resAus.ok) {
      const data = await resAus.json();
      estado.auspiciantes = data.auspiciantes || data;
    }
  } catch (e) {
    console.log('Cargando auspiciantes por defecto');
  }

  poblarFormularioEvento();
  poblarListaSalidas();
  poblarListaAuspiciantes();
}

// --- GESTIÓN DE EVENTO ---
function poblarFormularioEvento() {
  const ev = estado.evento;
  document.getElementById('ev_titulo').value = ev.titulo_seccion || '';
  document.getElementById('ev_descripcion').value = ev.descripcion || '';
  document.getElementById('ev_imagen').value = ev.imagen || '';
  document.getElementById('ev_alt').value = ev.alt_imagen || '';
  document.getElementById('ev_mostrar_botones').checked = !!ev.mostrar_botones;
  document.getElementById('ev_itinerario').value = ev.link_itinerario || '';
  document.getElementById('ev_inscripcion').value = ev.link_inscripcion || '';
  document.getElementById('ev_whatsapp').value = ev.whatsapp || '';

  actualizarPreviewImagenEvento(ev.imagen);

  // Escuchar cambios en tiempo real
  document.getElementById('formEvento').addEventListener('input', guardarEstadoEvento);
  document.getElementById('ev_mostrar_botones').addEventListener('change', guardarEstadoEvento);

  // Carga de archivo de imagen
  document.getElementById('ev_file_input').addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('ev_imagen').value = e.target.result;
        actualizarPreviewImagenEvento(e.target.result);
        guardarEstadoEvento();
      };
      reader.readAsDataURL(file);
    }
  });
}

function actualizarPreviewImagenEvento(src) {
  const preview = document.getElementById('ev_img_preview');
  if (src) {
    preview.src = src.startsWith('data:') ? src : `../${src}`;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }
}

function guardarEstadoEvento() {
  estado.evento = {
    titulo_seccion: document.getElementById('ev_titulo').value,
    descripcion: document.getElementById('ev_descripcion').value,
    imagen: document.getElementById('ev_imagen').value,
    alt_imagen: document.getElementById('ev_alt').value,
    mostrar_botones: document.getElementById('ev_mostrar_botones').checked,
    link_itinerario: document.getElementById('ev_itinerario').value,
    link_inscripcion: document.getElementById('ev_inscripcion').value,
    whatsapp: document.getElementById('ev_whatsapp').value
  };
}

// --- GESTIÓN DE SALIDAS ---
function poblarListaSalidas() {
  const container = document.getElementById('salidasList');
  container.innerHTML = '';

  estado.salidas.forEach((salida, sIdx) => {
    const card = document.createElement('div');
    card.className = 'salida-card';
    card.innerHTML = `
      <div class="salida-header">
        <strong>Salida #${sIdx + 1}</strong>
        <button type="button" class="btn btn-danger btn-sm" onclick="eliminarSalida(${sIdx})">🗑️ Eliminar</button>
      </div>
      <div class="form-group">
        <label>Título y Fecha de la Salida</label>
        <input type="text" class="form-control" value="${escapeHtml(salida.titulo || '')}" oninput="actualizarTituloSalida(${sIdx}, this.value)">
      </div>
      <div class="form-group">
        <label>Fotos de la Salida (${salida.imagenes ? salida.imagenes.length : 0})</label>
        <div class="images-preview-grid" id="grid_salida_${sIdx}"></div>
        <label class="file-picker-btn">
          ➕ Agregar Foto
          <input type="file" accept="image/*" onchange="agregarFotoSalida(${sIdx}, this)">
        </label>
      </div>
    `;
    container.appendChild(card);

    // Renderizar fotos de esta salida
    const grid = card.querySelector(`#grid_salida_${sIdx}`);
    if (salida.imagenes) {
      salida.imagenes.forEach((imgSrc, imgIdx) => {
        const thumb = document.createElement('div');
        thumb.className = 'image-thumb-box';
        const displaySrc = typeof imgSrc === 'string' ? (imgSrc.startsWith('data:') ? imgSrc : `../${imgSrc}`) : '';
        thumb.innerHTML = `
          <img src="${displaySrc}" alt="Foto ${imgIdx + 1}">
          <button class="remove-img-btn" onclick="eliminarFotoSalida(${sIdx}, ${imgIdx})">✕</button>
        `;
        grid.appendChild(thumb);
      });
    }
  });
}

function actualizarTituloSalida(sIdx, val) {
  if (estado.salidas[sIdx]) {
    estado.salidas[sIdx].titulo = val;
  }
}

function agregarSalidaNueva() {
  estado.salidas.unshift({
    titulo: "Nueva Salida - " + new Date().toLocaleDateString('es-AR'),
    imagenes: []
  });
  poblarListaSalidas();
  mostrarToast('Nueva salida agregada');
}

function eliminarSalida(sIdx) {
  if (confirm('¿Estás seguro de eliminar esta salida?')) {
    estado.salidas.splice(sIdx, 1);
    poblarListaSalidas();
    mostrarToast('Salida eliminada');
  }
}

function agregarFotoSalida(sIdx, input) {
  const file = input.files[0];
  if (file && estado.salidas[sIdx]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      if (!estado.salidas[sIdx].imagenes) estado.salidas[sIdx].imagenes = [];
      estado.salidas[sIdx].imagenes.push(e.target.result);
      poblarListaSalidas();
    };
    reader.readAsDataURL(file);
  }
}

function eliminarFotoSalida(sIdx, imgIdx) {
  if (estado.salidas[sIdx] && estado.salidas[sIdx].imagenes) {
    estado.salidas[sIdx].imagenes.splice(imgIdx, 1);
    poblarListaSalidas();
  }
}

// --- GESTIÓN DE AUSPICIANTES ---
function poblarListaAuspiciantes() {
  const container = document.getElementById('auspiciantesList');
  if (!container) return;
  container.innerHTML = '';

  if (!Array.isArray(estado.auspiciantes)) estado.auspiciantes = [];

  estado.auspiciantes.forEach((ausp, aIdx) => {
    const card = document.createElement('div');
    card.className = 'salida-card';
    const displaySrc = ausp.imagen ? (ausp.imagen.startsWith('data:') ? ausp.imagen : `../${ausp.imagen}`) : '';

    card.innerHTML = `
      <div class="salida-header">
        <strong>Auspiciante #${aIdx + 1}</strong>
        <button type="button" class="btn btn-danger btn-sm" onclick="eliminarAuspiciante(${aIdx})">🗑️ Eliminar</button>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
        <div class="form-group">
          <label>Nombre del Auspiciante / Comercio</label>
          <input type="text" class="form-control" value="${escapeHtml(ausp.nombre || '')}" oninput="actualizarNombreAuspiciante(${aIdx}, this.value)" placeholder="Ej. YPF / Garbarino / Taller Don José">
        </div>
        <div class="form-group">
          <label>Enlace Web o Redes (Opcional)</label>
          <input type="url" class="form-control" value="${escapeHtml(ausp.link || '')}" oninput="actualizarLinkAuspiciante(${aIdx}, this.value)" placeholder="https://instagram.com/...">
        </div>
      </div>
      <div class="form-group">
        <label>Logo del Auspiciante</label>
        <input type="text" class="form-control" value="${escapeHtml(ausp.imagen || '')}" oninput="actualizarRutaImagenAuspiciante(${aIdx}, this.value)" placeholder="Ruta o URL (ej. imgs/auspiciantes/logo.png)">
        <label class="file-picker-btn" style="margin-top: 0.5rem;">
          📁 Cargar Logo desde tu Computadora
          <input type="file" accept="image/*" onchange="cambiarImagenAuspiciante(${aIdx}, this)">
        </label>
        ${displaySrc ? `<div style="margin-top:0.75rem;"><img src="${displaySrc}" alt="Logo" style="max-height:80px; border-radius:6px; border:1px solid var(--card-border); background:#fff; padding:4px;"></div>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

function actualizarNombreAuspiciante(aIdx, val) {
  if (estado.auspiciantes[aIdx]) estado.auspiciantes[aIdx].nombre = val;
}

function actualizarLinkAuspiciante(aIdx, val) {
  if (estado.auspiciantes[aIdx]) estado.auspiciantes[aIdx].link = val;
}

function actualizarRutaImagenAuspiciante(aIdx, val) {
  if (estado.auspiciantes[aIdx]) {
    estado.auspiciantes[aIdx].imagen = val;
    poblarListaAuspiciantes();
  }
}

function cambiarImagenAuspiciante(aIdx, input) {
  const file = input.files[0];
  if (file && estado.auspiciantes[aIdx]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      estado.auspiciantes[aIdx].imagen = e.target.result;
      poblarListaAuspiciantes();
    };
    reader.readAsDataURL(file);
  }
}

function agregarAuspicianteNuevo() {
  if (!Array.isArray(estado.auspiciantes)) estado.auspiciantes = [];
  estado.auspiciantes.push({
    nombre: "Nuevo Auspiciante",
    imagen: "imgs/auspiciantes/logo.png",
    link: ""
  });
  poblarListaAuspiciantes();
  mostrarToast('Nuevo auspiciante agregado');
}

function eliminarAuspiciante(aIdx) {
  if (confirm('¿Estás seguro de eliminar este auspiciante?')) {
    estado.auspiciantes.splice(aIdx, 1);
    poblarListaAuspiciantes();
    mostrarToast('Auspiciante eliminado');
  }
}

// --- PUBLICACIÓN DIRECTA A GITHUB ---
function initGitHubConfig() {
  document.getElementById('gh_owner').value = localStorage.getItem('gh_owner') || 'clubsiambrettachivilcoy';
  document.getElementById('gh_repo').value = localStorage.getItem('gh_repo') || 'home';
  document.getElementById('gh_branch').value = localStorage.getItem('gh_branch') || 'main';
  document.getElementById('gh_token').value = localStorage.getItem('gh_token') || '';

  document.getElementById('btnGuardarGitHub').addEventListener('click', publicarEnGitHub);
  document.getElementById('btnDescargarJSON').addEventListener('click', descargarJSONs);
}

async function publicarEnGitHub() {
  const owner = document.getElementById('gh_owner').value.trim();
  const repo = document.getElementById('gh_repo').value.trim();
  const branch = document.getElementById('gh_branch').value.trim() || 'main';
  const token = document.getElementById('gh_token').value.trim();

  if (!token) {
    alert('Por favor ingresa un Personal Access Token de GitHub para guardar directamente.');
    return;
  }

  // Guardar credenciales en localStorage
  localStorage.setItem('gh_owner', owner);
  localStorage.setItem('gh_repo', repo);
  localStorage.setItem('gh_branch', branch);
  localStorage.setItem('gh_token', token);

  const statusEl = document.getElementById('githubStatus');
  statusEl.innerHTML = '<span style="color: var(--warning-color)">⏳ Publicando en GitHub...</span>';

  try {
    // 1. Guardar data/eventos.json
    await actualizarArchivoGitHub(owner, repo, branch, token, 'data/eventos.json', JSON.stringify(estado.evento, null, 2));

    // 2. Guardar data/salidas.json
    const salidasFormatted = { salidas: estado.salidas };
    await actualizarArchivoGitHub(owner, repo, branch, token, 'data/salidas.json', JSON.stringify(salidasFormatted, null, 2));

    // 3. Guardar data/auspiciantes.json
    await actualizarArchivoGitHub(owner, repo, branch, token, 'data/auspiciantes.json', JSON.stringify(estado.auspiciantes, null, 2));

    statusEl.innerHTML = '<span style="color: var(--success-color)">✅ ¡Publicado en GitHub con éxito! La página se actualizará en unos segundos.</span>';
    mostrarToast('¡Cambios guardados y publicados en GitHub!');
  } catch (err) {
    console.error(err);
    statusEl.innerHTML = `<span style="color: var(--danger-color)">❌ Error al guardar en GitHub: ${err.message}</span>`;
  }
}

async function actualizarArchivoGitHub(owner, repo, branch, token, path, content) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  // Obtener sha del archivo existente
  let sha = '';
  try {
    const resGet = await fetch(`${url}?ref=${branch}`, {
      headers: { 'Authorization': `token ${token}` }
    });
    if (resGet.ok) {
      const fileData = await resGet.json();
      sha = fileData.sha;
    }
  } catch (e) {}

  // Convertir contenido a Base64 con UTF-8
  const bytes = new TextEncoder().encode(content);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  const contentBase64 = btoa(binary);

  const body = {
    message: `Actualización de ${path} desde el Panel Admin`,
    content: contentBase64,
    branch: branch
  };
  if (sha) body.sha = sha;

  const resPut = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!resPut.ok) {
    const errorJson = await resPut.json();
    throw new Error(errorJson.message || 'Error en la petición a GitHub API');
  }
}

function descargarJSONs() {
  descargarArchivo('eventos.json', JSON.stringify(estado.evento, null, 2));
  setTimeout(() => {
    descargarArchivo('salidas.json', JSON.stringify({ salidas: estado.salidas }, null, 2));
  }, 300);
  setTimeout(() => {
    descargarArchivo('auspiciantes.json', JSON.stringify(estado.auspiciantes, null, 2));
  }, 600);
  mostrarToast('Archivos JSON descargados');
}

function descargarArchivo(nombre, contenido) {
  const blob = new Blob([contenido], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

function mostrarToast(msg) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
