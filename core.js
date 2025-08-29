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
      
      return data;
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
  return getInitialData();
}

function saveData(data = state) {
  try {
    if (!data) {
      console.warn('No data provided to save');
      return false;
    }
    localStorage.setItem('estudiapp', JSON.stringify(data));
    // No llamar renderAll aquí para evitar bucles infinitos
    return true;
  } catch (error) {
    console.error('Error guardando datos:', error);
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
}

// INICIALIZACIÓN - Remover estas líneas del final del archivo
// state = loadData();
// migrateSubjectsToExpandedFormat();
// initializeStreakSystem();
// loadPomodoroConfig();

// document.addEventListener('DOMContentLoaded', () => {
//   renderAll();
// });


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
    if (minutes >= 15 && minutes <= 480) {
      if (typeof setDailyGoal === 'function') {
        setDailyGoal(minutes);
      }
      closeModal('goalModal');
    } else {
      alert('Por favor, ingresa un objetivo entre 15 y 480 minutos.');
    }
  }
}