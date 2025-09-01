// CONSTANTES GLOBALES
const CONSTANTS = {
  POMODORO: {
    MIN_WORK_TIME: 5,
    MAX_WORK_TIME: 90,
    MIN_BREAK_TIME: 1,
    MAX_BREAK_TIME: 30,
    DEFAULT_WORK: 25,
    DEFAULT_BREAK: 5
  },
  STREAK: {
    MIN_DAILY_GOAL: 15,
    MAX_DAILY_GOAL: 480
  },
  ADVANCED_POMODORO: {
    MIN_TOTAL_TIME: 30,
    MAX_TOTAL_TIME: 180,
    MIN_BREAK_LENGTH: 5,
    MAX_BREAK_LENGTH: 20
  }
};

// VARIABLES GLOBALES
let state;
let pomodoroInterval;
let currentSubjectModalId = null;

// SISTEMA DE CACHÉ OPTIMIZADO
let dataCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5 segundos
let pendingSave = false;
let saveTimeout = null;

// GESTIÓN DE DATOS
function getInitialData() {
  return {
    subjects: [],
    reminders: [],
    streakData: {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      dailyGoal: 60,
      todayStudyTime: 0,
      weeklyStats: [],
      achievements: []
    },
    stats: {
      streak: {
        current: 0,
        longest: 0,
        lastDate: null
      }
    }
  };
}

function migrateSubjectsToExpandedFormat() {
  if (!state.subjects) return;
  
  state.subjects = state.subjects.map(subject => {
    if (!subject.exams) {
      return createExpandedSubject(subject);
    }
    return subject;
  });
  
  saveData();
}

function loadData() {
  // Usar caché si está disponible y es reciente
  const now = Date.now();
  if (dataCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return dataCache;
  }
  
  try {
    const saved = localStorage.getItem('estudiapp');
    if (saved) {
      const data = JSON.parse(saved);
      
      // Migración de datos si es necesario
      if (!data.stats) {
        data.stats = getInitialData().stats;
      }
      if (!data.stats.streak) {
        data.stats.streak = getInitialData().stats.streak;
      }
      if (!data.streakData) {
        data.streakData = getInitialData().streakData;
      }
      
      // Actualizar caché
      dataCache = data;
      cacheTimestamp = now;
      
      return data;
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
  
  const initialData = getInitialData();
  dataCache = initialData;
  cacheTimestamp = now;
  return initialData;
}

function saveData(data = state, immediate = false) {
  try {
    if (!data) {
      console.warn('No data provided to save');
      return false;
    }
    
    // Actualizar caché inmediatamente
    dataCache = data;
    cacheTimestamp = Date.now();
    
    if (immediate) {
      // Guardar inmediatamente
      localStorage.setItem('estudiapp', JSON.stringify(data));
      pendingSave = false;
      if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
      }
      return true;
    }
    
    // Guardar diferido para reducir operaciones de escritura
    if (!pendingSave) {
      pendingSave = true;
      saveTimeout = setTimeout(() => {
        localStorage.setItem('estudiapp', JSON.stringify(data));
        pendingSave = false;
        saveTimeout = null;
      }, 500); // Esperar 500ms antes de guardar
    }
    
    return true;
  } catch (error) {
    console.error('Error guardando datos:', error);


// Función para forzar guardado inmediato
function forceSave() {
  if (pendingSave && saveTimeout) {
    clearTimeout(saveTimeout);
    localStorage.setItem('estudiapp', JSON.stringify(state));
    pendingSave = false;
    saveTimeout = null;
  }
}

// Guardar datos antes de cerrar la página
window.addEventListener('beforeunload', forceSave);
window.addEventListener('pagehide', forceSave);
    // Mostrar notificación al usuario
    showErrorNotification('Error al guardar datos. Verifica el espacio de almacenamiento.');
    return false;
  }
}

// Función para mostrar notificaciones de error
function showErrorNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'error-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f44336;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

// FUNCIONES DE UTILIDAD
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function displayTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  
  const timerDisplay = document.getElementById('timerDisplay');
  if (timerDisplay) {
    timerDisplay.textContent = display;
  }
  
  document.title = `${display} - EstudiApp`;
}

// GESTIÓN DE MODALES
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
}

function resetForm(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    const form = modal.querySelector('form');
    if (form) {
      form.reset();
    }
    
    // Resetear campos específicos
    const inputs = modal.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });
  }
}

// RENDERIZADO PRINCIPAL
function renderAll() {
  // Verificar que las funciones existan antes de llamarlas
  if (typeof renderSubjects === 'function') {
    renderSubjects();
  }
  if (typeof renderUpcomingEvents === 'function') {
    renderUpcomingEvents();
  }
  if (typeof updateCalendar === 'function') {
    updateCalendar();
  }
  if (typeof updateStreakDisplay === 'function') {
    updateStreakDisplay();
  }
  if (typeof populateSubjectSelect === 'function') {
    populateSubjectSelect();
  }
  if (typeof populatePomodoroSubjects === 'function') {
    populatePomodoroSubjects();
  }
  if (typeof renderAllEvents === 'function') {
    renderAllEvents();
  }
}

// Inicializar aplicación
function initializeApp() {
  state = loadData();
  migrateSubjectsToExpandedFormat();
  
  // Inicializar sistema de rachas
  if (typeof initializeStreakSystem === 'function') {
    initializeStreakSystem();
  }
  
  // Cargar configuración del pomodoro
  if (typeof loadPomodoroConfig === 'function') {
    loadPomodoroConfig();
  }
  
  renderAll();
  
  // Verificar continuidad de rachas al iniciar
  if (typeof checkStreakContinuity === 'function') {
    checkStreakContinuity();
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});


function createExpandedSubject(basicSubject) {
  return {
    id: basicSubject.id || Date.now().toString(),
    name: basicSubject.name,
    professor: basicSubject.professor || '',
    schedule: basicSubject.schedule || '',
    color: basicSubject.color || '#4CAF50',
    exams: basicSubject.exams || [],
    consultationHours: basicSubject.consultationHours || [],
    materials: basicSubject.materials || [],
    notes: basicSubject.notes || '',
    progress: basicSubject.progress || {
      completedTasks: 0,
      totalTasks: 0,
      studyHours: 0
    }
  };
}

// Funciones para manejo de objetivos diarios
function setQuickGoal(minutes) {
  const goalInput = document.getElementById('goalMinutes');
  if (goalInput) {
    goalInput.value = minutes;
  }
}

function saveGoal() {
  const goalInput = document.getElementById('goalMinutes');
  if (goalInput) {
    const minutes = parseInt(goalInput.value);
    if (minutes >= 30 && minutes <= 480) {
      if (typeof setDailyGoal === 'function') {
        setDailyGoal(minutes);
      }
      closeModal('goalModal');
    } else {
      showError('Por favor, ingresa un objetivo entre 30 y 480 minutos. Mínimo requerido: 30 minutos.');
    }
  }
}

// Funciones de validación y manejo de errores
function validateInput(value, type, min = null, max = null) {
  if (!value || value.trim() === '') {
    return { valid: false, message: 'Este campo es obligatorio.' };
  }
  
  if (type === 'number') {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return { valid: false, message: 'Debe ser un número válido.' };
    }
    if (min !== null && num < min) {
      return { valid: false, message: `El valor mínimo es ${min}.` };
    }
    if (max !== null && num > max) {
      return { valid: false, message: `El valor máximo es ${max}.` };
    }
  }
  
  if (type === 'text' && min !== null && value.length < min) {
    return { valid: false, message: `Mínimo ${min} caracteres.` };
  }
  
  if (type === 'text' && max !== null && value.length > max) {
    return { valid: false, message: `Máximo ${max} caracteres.` };
  }
  
  return { valid: true };
}

function showError(message, duration = 3000) {
  // Remover errores anteriores
  const existingError = document.querySelector('.error-toast');
  if (existingError) {
    existingError.remove();
  }
  
  // Crear toast de error
  const errorToast = document.createElement('div');
  errorToast.className = 'error-toast';
  errorToast.textContent = message;
  errorToast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--error-color, #ff4444);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
  `;
  
  document.body.appendChild(errorToast);
  
  // Auto-remover después del tiempo especificado
  setTimeout(() => {
    if (errorToast.parentNode) {
      errorToast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => errorToast.remove(), 300);
    }
  }, duration);
}

function showSuccess(message, duration = 2000) {
  // Remover mensajes anteriores
  const existingSuccess = document.querySelector('.success-toast');
  if (existingSuccess) {
    existingSuccess.remove();
  }
  
  // Crear toast de éxito
  const successToast = document.createElement('div');
  successToast.className = 'success-toast';
  successToast.textContent = message;
  successToast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--success-color, #4CAF50);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
  `;
  
  document.body.appendChild(successToast);
  
  // Auto-remover después del tiempo especificado
  setTimeout(() => {
    if (successToast.parentNode) {
      successToast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => successToast.remove(), 300);
    }
  }, duration);
}

// Función mejorada para manejo de errores en localStorage
function safeLocalStorageOperation(operation, key, data = null) {
  try {
    switch (operation) {
      case 'get':
        return localStorage.getItem(key);
      case 'set':
        localStorage.setItem(key, data);
        return true;
      case 'remove':
        localStorage.removeItem(key);
        return true;
      default:
        throw new Error('Operación no válida');
    }
  } catch (error) {
    console.error(`Error en localStorage (${operation}):`, error);
    showError('Error al acceder al almacenamiento local. Algunos datos pueden no guardarse.');
    return operation === 'get' ? null : false;
  }
}