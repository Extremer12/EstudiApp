// ========================================
// SISTEMA DE RACHAS - STREAKS.JS
// ========================================

// Cache DOM para optimizar consultas frecuentes
const streakDOMCache = {
  elements: new Map(),
  
  get(id) {
    if (!this.elements.has(id)) {
      const element = document.getElementById(id);
      if (element) {
        this.elements.set(id, element);
      }
    }
    return this.elements.get(id) || null;
  },
  
  clear() {
    this.elements.clear();
  },
  
  // Precarga elementos críticos de la modal
  preloadModalElements() {
    const modalElements = [
      'modalCurrentStreak', 'modalRealTimeMinutes', 'modalBestStreak',
      'modalDailyGoalTime', 'modalTodayStudyTime', 'modalGoalTime',
      'modalDailyProgressFill', 'modalRealTimeIndicator', 'compactCurrentStreak',
      'streakFireIcon'
    ];
    
    modalElements.forEach(id => this.get(id));
  }
};

// Inicializar sistema de rachas
function initializeStreakSystem() {
  if (!state.streakData) {
    state.streakData = {
      currentStreak: 0,
      bestStreak: 0,
      dailyGoal: 60,
      lastStudyDate: null,
      todayStudyTime: 0,
      streakHistory: [],
      realTimeMinutes: 0,
      sessionStartTime: null,
      isSessionActive: false,
      minimumDailyTime: 30 // Mínimo 30 minutos para validar racha
    };
    saveData(state);
  }
  updateStreakDisplay();
  startRealTimeTracking();
}

// Actualizar tiempo de estudio del día
function updateTodayStudyTime(minutes) {
  const today = new Date().toDateString();
  
  if (!state.streakData) {
    initializeStreakSystem();
  }
  
  // Resetear si es un nuevo día
  if (state.streakData.lastStudyDate !== today) {
    state.streakData.todayStudyTime = 0;
    state.streakData.realTimeMinutes = 0;
  }
  
  state.streakData.todayStudyTime += minutes;
  state.streakData.lastStudyDate = today;
  
  // Verificar si se cumplió el objetivo diario
  checkDailyGoalCompletion();
  
  updateStreakDisplay();
  saveData(state);
}

// Iniciar sesión de estudio (conectado con Pomodoro)
function startStudySession() {
  if (!state.streakData) {
    initializeStreakSystem();
  }
  
  state.streakData.sessionStartTime = new Date();
  state.streakData.isSessionActive = true;
  
  // Resetear tiempo real si es un nuevo día
  const today = new Date().toDateString();
  if (state.streakData.lastStudyDate !== today) {
    state.streakData.realTimeMinutes = 0;
    state.streakData.todayStudyTime = 0;
  }
  
  updateStreakDisplay();
  saveData(state);
}

// Finalizar sesión de estudio
function endStudySession() {
  if (!state.streakData || !state.streakData.isSessionActive) {
    return;
  }
  
  const sessionEnd = new Date();
  const sessionDuration = Math.floor((sessionEnd - state.streakData.sessionStartTime) / (1000 * 60));
  
  // Solo contar si la sesión duró al menos 1 minuto
  if (sessionDuration >= 1) {
    updateTodayStudyTime(sessionDuration);
  }
  
  state.streakData.isSessionActive = false;
  state.streakData.sessionStartTime = null;
  
  updateStreakDisplay();
  saveData(state);
}

// Actualizar tiempo en tiempo real
function updateRealTimeTracking() {
  if (!state.streakData || !state.streakData.isSessionActive) {
    return;
  }
  
  const now = new Date();
  const sessionDuration = Math.floor((now - state.streakData.sessionStartTime) / (1000 * 60));
  
  const today = new Date().toDateString();
  if (state.streakData.lastStudyDate !== today) {
    state.streakData.realTimeMinutes = sessionDuration;
  } else {
    state.streakData.realTimeMinutes = state.streakData.todayStudyTime + sessionDuration;
  }
  
  updateStreakDisplay();
}

// Actualizar progreso basado en el pomodoro activo
function updateStreakProgressFromPomodoro(timeLeft, totalTime) {
  if (!state.streakData) {
    initializeStreakSystem();
  }
  
  // Calcular tiempo transcurrido en la sesión actual
  const elapsedTime = totalTime - timeLeft;
  const elapsedMinutes = Math.floor(elapsedTime / 60);
  
  const today = new Date().toDateString();
  
  // Actualizar tiempo real basado en el pomodoro
  if (state.streakData.lastStudyDate !== today) {
    state.streakData.realTimeMinutes = elapsedMinutes;
  } else {
    state.streakData.realTimeMinutes = state.streakData.todayStudyTime + elapsedMinutes;
  }
  
  state.streakData.lastStudyDate = today;
  
  // Actualizar display en tiempo real
  updateStreakDisplay();
}

// Iniciar seguimiento en tiempo real
let realTimeTrackingInterval;
function startRealTimeTracking() {
  // Limpiar intervalo anterior si existe
  if (realTimeTrackingInterval) {
    clearInterval(realTimeTrackingInterval);
  }
  // Actualizar cada 60 segundos para mejor rendimiento
  realTimeTrackingInterval = setInterval(updateRealTimeTracking, 60000);
}

// Verificar cumplimiento del objetivo diario
function checkDailyGoalCompletion() {
  if (!state.streakData) return;
  
  const today = new Date().toDateString();
  const currentTime = state.streakData.realTimeMinutes || state.streakData.todayStudyTime;
  
  // Solo verificar si es el día actual
  if (state.streakData.lastStudyDate === today || state.streakData.isSessionActive) {
    // Verificar tanto el objetivo diario como el mínimo para racha
    const goalCompleted = currentTime >= state.streakData.dailyGoal;
    const minimumMet = currentTime >= state.streakData.minimumDailyTime;
    
    if (goalCompleted) {
      // Incrementar racha solo si no se había cumplido antes hoy
      const streakHistory = state.streakData.streakHistory || [];
      const todayEntry = streakHistory.find(entry => entry.date === today);
      
      if (!todayEntry || !todayEntry.goalCompleted) {
        state.streakData.currentStreak++;
        
        // Actualizar mejor racha
        if (state.streakData.currentStreak > state.streakData.bestStreak) {
          state.streakData.bestStreak = state.streakData.currentStreak;
          showStreakAchievement();
        }
        
        // Registrar en historial
        if (todayEntry) {
          todayEntry.goalCompleted = true;
          todayEntry.minimumMet = minimumMet;
        } else {
          streakHistory.push({
            date: today,
            studyTime: currentTime,
            goalCompleted: true,
            minimumMet: minimumMet
          });
        }
        
        state.streakData.streakHistory = streakHistory;
        showDailyGoalAchievement();
      }
    } else if (minimumMet) {
      // Si se cumplió el mínimo pero no el objetivo, mantener racha
      const streakHistory = state.streakData.streakHistory || [];
      const todayEntry = streakHistory.find(entry => entry.date === today);
      
      if (!todayEntry || !todayEntry.minimumMet) {
        if (!todayEntry) {
          streakHistory.push({
            date: today,
            studyTime: currentTime,
            goalCompleted: false,
            minimumMet: true
          });
          state.streakData.streakHistory = streakHistory;
        } else {
          todayEntry.minimumMet = true;
        }
      }
    }
  }
}

// Verificar continuidad de racha
function checkStreakContinuity() {
  if (!state.streakData) return;
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastStudyDate = state.streakData.lastStudyDate ? new Date(state.streakData.lastStudyDate) : null;
  
  // Si no hay fecha de último estudio, resetear racha
  if (!lastStudyDate) {
    state.streakData.currentStreak = 0;
    return;
  }
  
  // Verificar si ayer se cumplió el mínimo de tiempo
  const yesterdayString = yesterday.toDateString();
  const todayString = today.toDateString();
  
  // Si el último estudio fue ayer, verificar si cumplió el mínimo
  if (lastStudyDate.toDateString() === yesterdayString) {
    // Si ayer no se cumplió el mínimo de 15 minutos, se pierde la racha
    if (state.streakData.todayStudyTime < state.streakData.minimumDailyTime) {
      if (state.streakData.currentStreak > 0) {
        showStreakLostNotification();
      }
      state.streakData.currentStreak = 0;
    }
  }
  // Si el último estudio no fue ayer ni hoy, se perdió la racha
  else if (lastStudyDate.toDateString() !== todayString) {
    if (state.streakData.currentStreak > 0) {
      showStreakLostNotification();
    }
    state.streakData.currentStreak = 0;
  }
  
  saveData(state);
  updateStreakDisplay();
}

// Actualizar visualización de rachas - OPTIMIZADA
function updateStreakDisplay() {
  if (!state.streakData) {
    initializeStreakSystem();
    return;
  }
  
  const currentTime = state.streakData.realTimeMinutes || state.streakData.todayStudyTime || 0;
  const minimumTime = state.streakData.minimumDailyTime || 30;
  const isSessionActive = state.streakData.isSessionActive;
  
  // Usar requestAnimationFrame para optimizar actualizaciones visuales
  requestAnimationFrame(() => {
    updateCompactDisplay();
    updateExpandedDisplay();
    updateHistoryDisplay();
    
    // Actualizar modal solo si está visible (lazy loading)
    const streakModal = document.getElementById('streakStatsModal');
    if (streakModal && streakModal.classList.contains('show')) {
      updateStreakModalData();
    }
  });
}

// Función optimizada para actualizar barra de progreso
function updateProgressBar(currentTime) {
  const progressBar = document.querySelector('.streak-compact-progress .progress-fill');
  if (!progressBar) return;
  
  const progress = Math.min((currentTime / state.streakData.dailyGoal) * 100, 100);
  
  // Solo actualizar si hay cambio significativo (>1%)
  const currentWidth = parseFloat(progressBar.style.width) || 0;
  if (Math.abs(progress - currentWidth) > 1) {
    progressBar.style.width = progress + '%';
    
    // Cambiar color según progreso
    let gradient;
    if (progress >= 100) {
      gradient = 'linear-gradient(90deg, #10b981, #059669)';
    } else if (progress >= 50) {
      gradient = 'linear-gradient(90deg, #f59e0b, #d97706)';
    } else {
      gradient = 'linear-gradient(90deg, #ef4444, #dc2626)';
    }
    
    if (progressBar.style.background !== gradient) {
      progressBar.style.background = gradient;
    }
  }
}

// Actualizar vista compacta
function updateCompactDisplay() {
  const compactCurrentStreak = document.getElementById('compactCurrentStreak');
  const compactTimeDisplay = document.getElementById('compactTimeDisplay');
  const compactProgressFill = document.getElementById('compactProgressFill');
  const streakFireIcon = document.getElementById('streakFireIcon');
  
  if (compactCurrentStreak) {
    compactCurrentStreak.textContent = state.streakData.currentStreak;
  }
  
  const currentTime = state.streakData.realTimeMinutes || state.streakData.todayStudyTime || 0;
  const minimumTime = state.streakData.minimumDailyTime || '--';
  
  if (compactTimeDisplay) {
    compactTimeDisplay.textContent = `${currentTime} / ${minimumTime} min`;
  }
  
  if (compactProgressFill) {
    const progress = Math.min((currentTime / minimumTime) * 100, 100);
    compactProgressFill.style.width = `${progress}%`;
    
    // Cambiar color según progreso del mínimo
    if (progress >= 100) {
      compactProgressFill.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
    } else if (progress >= 75) {
      compactProgressFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
    } else {
      compactProgressFill.style.background = 'linear-gradient(90deg, #4ecdc4, #44a08d)';
    }
  }
  
  // Animar ícono de fuego cuando se alcanza el mínimo
  if (streakFireIcon) {
    const streakSection = document.querySelector('.streak-section');
    if (currentTime >= minimumTime) {
      streakSection.classList.add('minimum-achieved');
    } else {
      streakSection.classList.remove('minimum-achieved');
    }
    
    // Indicar actividad en tiempo real
    if (state.streakData.isSessionActive) {
      streakSection.classList.add('real-time-active');
    } else {
      streakSection.classList.remove('real-time-active');
    }
  }
}

// Actualizar vista expandida
function updateExpandedDisplay() {
  const currentStreakEl = document.getElementById('currentStreak');
  const bestStreakEl = document.getElementById('bestStreak');
  const realTimeMinutesEl = document.getElementById('realTimeMinutes');
  const dailyGoalTimeEl = document.getElementById('dailyGoalTime');
  const todayStudyTimeEl = document.getElementById('todayStudyTime');
  const goalTimeEl = document.getElementById('goalTime');
  const dailyProgressFill = document.getElementById('dailyProgressFill');
  const realTimeIndicator = document.getElementById('realTimeIndicator');
  
  if (currentStreakEl) currentStreakEl.textContent = state.streakData.currentStreak;
  if (bestStreakEl) bestStreakEl.textContent = state.streakData.bestStreak;
  if (dailyGoalTimeEl) dailyGoalTimeEl.textContent = state.streakData.dailyGoal;
  if (goalTimeEl) goalTimeEl.textContent = state.streakData.dailyGoal;
  
  const currentTime = state.streakData.realTimeMinutes || state.streakData.todayStudyTime;
  
  if (realTimeMinutesEl) realTimeMinutesEl.textContent = currentTime;
  if (todayStudyTimeEl) todayStudyTimeEl.textContent = state.streakData.todayStudyTime;
  
  // Indicador de tiempo real
  if (realTimeIndicator) {
    if (state.streakData.isSessionActive) {
      realTimeIndicator.textContent = '🔴 En vivo';
      realTimeIndicator.style.display = 'inline';
    } else {
      realTimeIndicator.style.display = 'none';
    }
  }
  
  // Actualizar barra de progreso principal
  if (dailyProgressFill) {
    const progress = Math.min((currentTime / state.streakData.dailyGoal) * 100, 100);
    dailyProgressFill.style.width = `${progress}%`;
    
    // Cambiar color según progreso
    if (progress >= 100) {
      dailyProgressFill.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
    } else if (progress >= 50) {
      dailyProgressFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
    } else {
      dailyProgressFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
    }
  }
}

// Actualizar historial
function updateHistoryDisplay() {
  const historyList = document.getElementById('streakHistoryList');
  if (!historyList || !state.streakData.streakHistory) return;
  
  const recentHistory = state.streakData.streakHistory.slice(-7).reverse();
  
  historyList.innerHTML = '';
  
  if (recentHistory.length === 0) {
    historyList.innerHTML = '<div class="history-item"><span>No hay historial disponible</span></div>';
    return;
  }
  
  recentHistory.forEach(entry => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const date = new Date(entry.date).toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    const status = entry.goalCompleted ? '✅ Objetivo' : 
                  entry.minimumMet ? '⭐ Mínimo' : '❌ Incompleto';
    
    historyItem.innerHTML = `
      <span class="history-date">${date}</span>
      <span class="history-time">${entry.studyTime} min</span>
      <span class="history-status">${status}</span>
    `;
    
    historyList.appendChild(historyItem);
  });
}

// Función para expandir/contraer la sección de rachas - OPTIMIZADA
function toggleStreakExpansion() {
  // Precargar elementos de la modal para mejor rendimiento
  streakDOMCache.preloadModalElements();
  
  // Usar requestAnimationFrame para suavizar la apertura
  requestAnimationFrame(() => {
    updateStreakModalData();
    openModal('streakStatsModal');
  });
}

// Nueva función para actualizar los datos del modal - OPTIMIZADA
function updateStreakModalData() {
  // Usar cache para obtener datos una sola vez
  const currentStreakData = getCurrentStreakData();
  const todayData = getTodayData();
  const bestStreakData = getBestStreakData();
  const goalData = getGoalData();
  const isTimerActive = checkIfTimerActive();
  
  // Usar requestAnimationFrame para optimizar actualizaciones
  requestAnimationFrame(() => {
    // Actualizar elementos del modal usando cache DOM
    const modalCurrentStreak = streakDOMCache.get('modalCurrentStreak');
    const modalRealTimeMinutes = streakDOMCache.get('modalRealTimeMinutes');
    const modalBestStreak = streakDOMCache.get('modalBestStreak');
    const modalDailyGoalTime = streakDOMCache.get('modalDailyGoalTime');
    const modalTodayStudyTime = streakDOMCache.get('modalTodayStudyTime');
    const modalGoalTime = streakDOMCache.get('modalGoalTime');
    const modalDailyProgressFill = streakDOMCache.get('modalDailyProgressFill');
    const modalRealTimeIndicator = streakDOMCache.get('modalRealTimeIndicator');
    
    // Batch DOM updates para mejor rendimiento
    const updates = [
      [modalCurrentStreak, currentStreakData.current || 0],
      [modalRealTimeMinutes, todayData.minutes || 0],
      [modalBestStreak, bestStreakData.best || 0],
      [modalDailyGoalTime, goalData.daily || 60],
      [modalTodayStudyTime, todayData.minutes || 0],
      [modalGoalTime, goalData.daily || 60]
    ];
    
    updates.forEach(([element, value]) => {
      if (element && element.textContent !== String(value)) {
        element.textContent = value;
      }
    });
    
    // Actualizar barra de progreso del modal con throttling
    if (modalDailyProgressFill && goalData.daily) {
      const progressPercentage = Math.min((todayData.minutes / goalData.daily) * 100, 100);
      const currentWidth = parseFloat(modalDailyProgressFill.style.width) || 0;
      
      // Solo actualizar si hay cambio significativo
      if (Math.abs(progressPercentage - currentWidth) > 0.5) {
        modalDailyProgressFill.style.width = progressPercentage + '%';
        
        // Cambiar color según progreso
        let gradient;
        if (progressPercentage >= 100) {
          gradient = 'linear-gradient(90deg, #10b981, #059669)';
        } else if (progressPercentage >= 50) {
          gradient = 'linear-gradient(90deg, #f59e0b, #d97706)';
        } else {
          gradient = 'linear-gradient(90deg, #ef4444, #dc2626)';
        }
        
        if (modalDailyProgressFill.style.background !== gradient) {
          modalDailyProgressFill.style.background = gradient;
        }
      }
    }
    
    // Actualizar indicador de tiempo real
    if (modalRealTimeIndicator) {
      const shouldShow = isTimerActive ? 'inline' : 'none';
      if (modalRealTimeIndicator.style.display !== shouldShow) {
        modalRealTimeIndicator.style.display = shouldShow;
        if (isTimerActive) {
          modalRealTimeIndicator.textContent = '🔴 En vivo';
        }
      }
    }
  });
}

// Funciones auxiliares para obtener datos
function getCurrentStreakData() {
  return { current: state.streakData?.currentStreak || 0 };
}

function getTodayData() {
  if (!state.streakData) return { minutes: 0 };
  return { minutes: state.streakData.realTimeMinutes || state.streakData.todayStudyTime || 0 };
}

function getBestStreakData() {
  return { best: state.streakData?.bestStreak || 0 };
}

function getGoalData() {
  return { daily: state.streakData?.dailyGoal || 60 };
}

function checkIfTimerActive() {
  return state.streakData?.isSessionActive || (typeof pomodoroState !== 'undefined' && pomodoroState.isRunning) || false;
}

// Configurar objetivo diario
function setDailyGoal(minutes) {
  if (minutes < CONSTANTS.STREAK.MIN_DAILY_GOAL || minutes > CONSTANTS.STREAK.MAX_DAILY_GOAL) {
    alert(`El objetivo debe estar entre ${CONSTANTS.STREAK.MIN_DAILY_GOAL} y ${CONSTANTS.STREAK.MAX_DAILY_GOAL} minutos`);
    return;
  }
  
  state.streakData.dailyGoal = minutes;
  updateStreakDisplay();
  saveData(state);
  closeModal('goalModal');
}

// Mostrar logro de objetivo diario
function showDailyGoalAchievement() {
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-content">
      <div class="achievement-icon">🎯</div>
      <div class="achievement-text">
        <h3>¡Objetivo Cumplido!</h3>
        <p>Has alcanzado tu meta diaria de ${state.streakData.dailyGoal} minutos</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Mostrar logro de nueva mejor racha
function showStreakAchievement() {
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-content">
      <div class="achievement-icon">🔥</div>
      <div class="achievement-text">
        <h3>¡Nueva Mejor Racha!</h3>
        <p>${state.streakData.bestStreak} días consecutivos</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 4000);
}

// Mostrar notificación de racha perdida
function showStreakLostNotification() {
  const notification = document.createElement('div');
  notification.className = 'achievement-notification streak-lost';
  notification.innerHTML = `
    <div class="achievement-content">
      <div class="achievement-icon">💔</div>
      <div class="achievement-text">
        <h3>Racha Perdida</h3>
        <p>¡No te desanimes! Comienza una nueva racha hoy</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Compartir logro de racha
function shareStreak() {
  const streakText = `🔥 ¡${state.streakData.currentStreak} días consecutivos estudiando! Mi mejor racha es de ${state.streakData.bestStreak} días. #EstudiApp #Constancia`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Mi Racha de Estudio',
      text: streakText,
      url: window.location.href
    }).catch(console.error);
  } else {
    // Fallback: copiar al portapapeles
    navigator.clipboard.writeText(streakText).then(() => {
      alert('¡Texto copiado al portapapeles!');
    }).catch(() => {
      // Fallback del fallback: mostrar texto para copiar manualmente
      prompt('Copia este texto:', streakText);
    });
  }
}

// Obtener estadísticas de racha
function getStreakStats() {
  if (!state.streakData) {
    initializeStreakSystem();
  }
  
  const today = new Date().toDateString();
  const thisWeek = [];
  const thisMonth = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toDateString();
    
    const dayData = state.streakData.streakHistory.find(h => h.date === dateString);
    thisWeek.push({
      date: dateString,
      studyTime: dayData ? dayData.studyTime : 0,
      goalMet: dayData ? dayData.goalMet : false
    });
  }
  
  return {
    currentStreak: state.streakData.currentStreak,
    bestStreak: state.streakData.bestStreak,
    todayStudyTime: state.streakData.todayStudyTime,
    dailyGoal: state.streakData.dailyGoal,
    weeklyData: thisWeek,
    totalDaysStudied: state.streakData.streakHistory.length
  };
}

// Configurar sugerencias de objetivos
function setupGoalSuggestions() {
  const suggestions = [30, 45, 60, 90, 120];
  const container = document.querySelector('.goal-suggestions');
  
  if (container) {
    container.innerHTML = suggestions.map(minutes => 
      `<button class="btn-suggestion" onclick="setDailyGoal(${minutes})">${minutes} min</button>`
    ).join('');
  }
}

// Inicializar sistema al cargar
function initializeStreaks() {
  initializeStreakSystem();
  setupGoalSuggestions();
  
  // Precargar elementos críticos en el cache DOM
  setTimeout(() => {
    streakDOMCache.preloadModalElements();
  }, 100);
  
  // Verificar continuidad de racha al cargar
  checkStreakContinuity();
  
  // Verificar continuidad de rachas cada 2 horas para mejor rendimiento
  setInterval(checkStreakContinuity, 2 * 60 * 60 * 1000);
}

// Exportar funciones principales
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeStreakSystem,
    updateTodayStudyTime,
    checkDailyGoalCompletion,
    checkStreakContinuity,
    updateStreakDisplay,
    setDailyGoal,
    shareStreak,
    getStreakStats,
    startStudySession,
    endStudySession,
    updateRealTimeTracking,
    toggleStreakExpansion,
    updateCompactDisplay,
    updateExpandedDisplay,
    updateHistoryDisplay
  };
} else {
  // Exponer funciones globalmente para el navegador
  window.initializeStreakSystem = initializeStreakSystem;
  window.updateTodayStudyTime = updateTodayStudyTime;
  window.checkDailyGoalCompletion = checkDailyGoalCompletion;
  window.checkStreakContinuity = checkStreakContinuity;
  window.updateStreakDisplay = updateStreakDisplay;
  window.setDailyGoal = setDailyGoal;
  window.shareStreak = shareStreak;
  window.getStreakStats = getStreakStats;
  window.startStudySession = startStudySession;
  window.endStudySession = endStudySession;
  window.updateRealTimeTracking = updateRealTimeTracking;
  window.toggleStreakExpansion = toggleStreakExpansion;
  window.updateCompactDisplay = updateCompactDisplay;
  window.updateExpandedDisplay = updateExpandedDisplay;
  window.updateHistoryDisplay = updateHistoryDisplay;
  window.initializeStreaks = initializeStreaks;
}