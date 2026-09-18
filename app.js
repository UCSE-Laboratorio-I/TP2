/**
 * ==========================================================================
 * APLICACIÓN INTERACTIVA TP N° 2 - LABORATORIO I (2026)
 * Tema: Resolución de Problemas Mediante Búsqueda No Informada (Búsqueda a Ciegas)
 * Cátedra: Laboratorio I - UCSE DASS
 * JTP: Ing. Fabio D. Argañaraz
 * ==========================================================================
 */

const STORAGE_KEY = 'LAB1_2026_TP2_RESPUESTAS';
const TP_NUM = '2';

// Estado global de respuestas del estudiante
let state = {
  student: {
    name: '',
    dni: '',
    email: '',
    comision: '',
    github_user: ''
  },
  answers: {
    ej1_formulacion_problema: {},
    ej2_nodos_vs_estados: {},
    ej3_espacios_estados_juguete: {},
    ej4_busqueda_primero_anchura: {},
    ej5_busqueda_costo_uniforme: {},
    ej6_busqueda_primero_profundidad: {},
    ej7_profundidad_limitada_iterativa: {},
    ej8_busqueda_bidireccional: {},
    ej9_matriz_comparativa_estrategias: {},
    ej10_prevencion_estados_repetidos: {}
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadStateFromStorage();
  syncStateToDOM();
  bindEvents();
  updateProgress();
});

// ==================== TEMA OSCURO / CLARO ====================

function initTheme() {
  const saved = localStorage.getItem('LAB1_THEME') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  document.documentElement.classList.toggle('dark', saved === 'dark');
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('LAB1_THEME', next);
    });
  }
}

// ==================== EVENTOS Y ENLACES ====================

function bindEvents() {
  // 1. Datos del estudiante
  const studentFields = [
    { id: 'student-name', prop: 'name' },
    { id: 'student-dni', prop: 'dni' },
    { id: 'student-email', prop: 'email' },
    { id: 'student-comision', prop: 'comision' },
    { id: 'student-github', prop: 'github_user' }
  ];

  studentFields.forEach(({ id, prop }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', (e) => {
      state.student[prop] = e.target.value.trim();
      saveStateToStorage();
      updateProgress();
    });
  });

  // 2. Selectores de ejercicios con data-ex y data-key
  document.querySelectorAll('select[data-ex]').forEach(select => {
    select.addEventListener('change', (e) => {
      const ex = e.target.getAttribute('data-ex');
      const key = e.target.getAttribute('data-key');
      const val = e.target.value;

      if (!state.answers[ex]) state.answers[ex] = {};
      state.answers[ex][key] = val;

      saveStateToStorage();
      updateProgress();
    });
  });

  // 3. Tarjetas interactivas de Radio (si existen)
  document.querySelectorAll('.radio-card').forEach(card => {
    card.addEventListener('click', () => {
      const ex = card.getAttribute('data-ex');
      const key = card.getAttribute('data-key');
      const val = card.getAttribute('data-val');

      const siblingGroup = card.parentElement.querySelectorAll('.radio-card');
      siblingGroup.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      if (!state.answers[ex]) state.answers[ex] = {};
      state.answers[ex][key] = val;

      saveStateToStorage();
      updateProgress();
    });
  });

  // 4. Botones de Exportación (Top y Bottom)
  const btnExportTop = document.getElementById('btn-export-json');
  if (btnExportTop) btnExportTop.addEventListener('click', exportAnswersJson);
  const btnExportBottom = document.getElementById('btn-export-bottom');
  if (btnExportBottom) btnExportBottom.addEventListener('click', exportAnswersJson);

  // 5. Previsualización y Copiado al Portapapeles
  const btnTogglePreview = document.getElementById('btn-toggle-preview');
  if (btnTogglePreview) {
    btnTogglePreview.addEventListener('click', () => {
      const container = document.getElementById('json-preview-container');
      if (container) {
        const isHidden = container.style.display === 'none' || !container.style.display;
        container.style.display = isHidden ? 'block' : 'none';
        if (isHidden) renderJsonPreview();
      }
    });
  }

  const btnCopyJson = document.getElementById('btn-copy-json');
  if (btnCopyJson) {
    btnCopyJson.addEventListener('click', () => {
      const payload = generatePayload();
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
        .then(() => {
          const orig = btnCopyJson.innerHTML;
          btnCopyJson.innerHTML = '✅ ¡Copiado!';
          setTimeout(() => { btnCopyJson.innerHTML = orig; }, 2000);
        })
        .catch(err => {
          alert('No se pudo copiar automáticamente. Puedes seleccionar el texto de la previsualización.');
        });
    });
  }

  // 6. Importador de respuestas previas
  const fileInput = document.getElementById('import-json-file');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.student) state.student = { ...state.student, ...imported.student };
          if (imported.answers) {
            for (const [ex, items] of Object.entries(imported.answers)) {
              if (typeof items === 'object') {
                state.answers[ex] = { ...state.answers[ex], ...items };
              } else {
                state.answers[ex] = items;
              }
            }
          }
          saveStateToStorage();
          syncStateToDOM();
          updateProgress();
          alert('¡Respuestas importadas exitosamente!');
        } catch (err) {
          alert('Error al leer el archivo JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  // 7. Modales de Asistencia
  setupModal('btn-open-biblio-all', 'modal-biblio');
  setupModal('btn-git-guide', 'modal-git');
}

function setupModal(btnId, modalId) {
  const btn = document.getElementById(btnId);
  const modal = document.getElementById(modalId);
  if (!btn || !modal) return;
  btn.addEventListener('click', () => modal.classList.add('open'));
  modal.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-close')) {
        modal.classList.remove('open');
      }
    });
  });
}

// ==================== GENERACIÓN DE PAYLOAD Y EXPORTACIÓN ====================

function generatePayload() {
  return {
    tp_id: 'LAB1-2026-TP2',
    title: 'TP N° 2: Resolución de Problemas Mediante Búsqueda No Informada (Búsqueda a Ciegas)',
    timestamp: new Date().toISOString(),
    student: state.student,
    answers: state.answers
  };
}

function renderJsonPreview() {
  const codeEl = document.getElementById('json-preview-code');
  if (codeEl) {
    codeEl.textContent = JSON.stringify(generatePayload(), null, 2);
  }
}

function exportAnswersJson() {
  // Validación básica
  if (!state.student.name || !state.student.dni) {
    const proceed = confirm('⚠️ Advertencia: No has completado tu Nombre y DNI en la cabecera. ¿Deseas exportar el archivo de todos modos?');
    if (!proceed) {
      const nameInput = document.getElementById('student-name');
      if (nameInput) nameInput.focus();
      return;
    }
  }

  const payload = generatePayload();
  const jsonStr = JSON.stringify(payload, null, 2);

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `respuestas_tp${TP_NUM}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  renderJsonPreview();
}

// ==================== PERSISTENCIA LOCAL ====================

function saveStateToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderJsonPreview();
}

function loadStateFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    if (saved.student) state.student = { ...state.student, ...saved.student };
    if (saved.answers) {
      for (const [ex, items] of Object.entries(saved.answers)) {
        if (typeof items === 'object') {
          state.answers[ex] = { ...state.answers[ex], ...items };
        } else {
          state.answers[ex] = items;
        }
      }
    }
  } catch (e) {
    console.error('Error cargando estado previo:', e);
  }
}

function syncStateToDOM() {
  // 1. Sincronizar datos de estudiante
  if (state.student.name) setVal('student-name', state.student.name);
  if (state.student.dni) setVal('student-dni', state.student.dni);
  if (state.student.email) setVal('student-email', state.student.email);
  if (state.student.comision) setVal('student-comision', state.student.comision);
  if (state.student.github_user) setVal('student-github', state.student.github_user);

  // 2. Sincronizar selectores de ejercicios
  document.querySelectorAll('select[data-ex]').forEach(select => {
    const ex = select.getAttribute('data-ex');
    const key = select.getAttribute('data-key');
    if (state.answers[ex] && state.answers[ex][key]) {
      select.value = state.answers[ex][key];
    }
  });

  // 3. Sincronizar radio cards
  document.querySelectorAll('.radio-card').forEach(card => {
    const ex = card.getAttribute('data-ex');
    const key = card.getAttribute('data-key');
    const val = card.getAttribute('data-val');
    if (state.answers[ex] && state.answers[ex][key] === val) {
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    }
  });
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

// ==================== CÁLCULO DE PROGRESO ====================

function updateProgress() {
  const totalItems = 43; // Cantidad total de consignas/preguntas en los ejercicios
  let completed = 0;

  // Ejercicios
  for (const ex in state.answers) {
    const obj = state.answers[ex];
    if (typeof obj === 'object') {
      for (const k in obj) {
        if (obj[k] && obj[k] !== '') completed++;
      }
    } else if (obj && obj !== '') {
      completed++;
    }
  }

  const pct = Math.min(100, Math.round((completed / totalItems) * 100));

  const fillEl = document.getElementById('progress-bar-fill');
  const textEl = document.getElementById('progress-percentage');
  const countEl = document.getElementById('progress-count');

  if (fillEl) fillEl.style.width = `${pct}%`;
  if (textEl) textEl.textContent = `${pct}%`;
  if (countEl) countEl.textContent = `${completed} de ${totalItems} completados`;
}
