// ========================================
// SISTEMA DE RACHAS - STREAKS.JS
// ========================================

// Inicializar sistema de rachas
function initializeStreakSystem() {
  if (!state.streakData) {
    state.streakData = {
      currentStreak: 0,
      bestStreak: 0,
      dailyGoal: 60,
      lastStudyDate: null,
      todayStudyTime: 0,
      streakHistory: []
    };
    saveData(state);
  }
  updateStreakDisplay();
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
  }
  
  state.streakData.todayStudyTime += minutes;
  state.streakData.lastStudyDate = today;
  
  // Verificar si se cumplió el objetivo diario
  checkDailyGoalCompletion();
  
  updateStreakDisplay();
  saveData(state);
}

// Verificar cumplimiento del objetivo diario
function checkDailyGoalCompletion() {
  const today = new Date().toDateString();
  const todayStudyTime = state.streakData.todayStudyTime;
  const dailyGoal = state.streakData.dailyGoal;
  
  if (todayStudyTime >= dailyGoal) {
    // Verificar si ya se registró la racha de hoy
    const lastStreakDate = state.streakData.streakHistory.length > 0 
      ? state.streakData.streakHistory[state.streakData.streakHistory.length - 1].date
      : null;
    
    if (lastStreakDate !== today) {
      // Incrementar racha
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      
      if (lastStreakDate === yesterdayString || state.streakData.currentStreak === 0) {
        state.streakData.currentStreak++;
      } else {
        // Se rompió la racha
        state.streakData.currentStreak = 1;
      }
      
      // Actualizar mejor racha
      if (state.streakData.currentStreak > state.streakData.bestStreak) {
        state.streakData.bestStreak = state.streakData.currentStreak;
        showStreakAchievement();
      }
      
      // Registrar en historial
      state.streakData.streakHistory.push({
        date: today,
        studyTime: todayStudyTime,
        goalMet: true
      });
      
      showDailyGoalAchievement();
    }
  }
}

// Verificar continuidad de racha
function checkStreakContinuity() {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayString = today.toDateString();
  const yesterdayString = yesterday.toDateString();
  
  // Si no se estudió ayer y había una racha activa, se rompe
  if (state.streakData.lastStudyDate !== todayString && 
      state.streakData.lastStudyDate !== yesterdayString && 
      state.streakData.currentStreak > 0) {
    
    state.streakData.currentStreak = 0;
    showStreakLostNotification();
    updateStreakDisplay();
    saveData(state);
  }
}

// Actualizar visualización de rachas
function updateStreakDisplay() {
  const currentStreakEl = document.getElementById('currentStreak');
  const bestStreakEl = document.getElementById('bestStreak');
  const dailyGoalTimeEl = document.getElementById('dailyGoalTime');
  const todayStudyTimeEl = document.getElementById('todayStudyTime');
  const goalTimeEl = document.getElementById('goalTime');
  const dailyProgressFill = document.getElementById('dailyProgressFill');
  
  if (!state.streakData) {
    initializeStreakSystem();
    return;
  }
  
  // Actualizar números de racha
  if (currentStreakEl) currentStreakEl.textContent = state.streakData.currentStreak;
  if (bestStreakEl) bestStreakEl.textContent = state.streakData.bestStreak;
  if (dailyGoalTimeEl) dailyGoalTimeEl.textContent = state.streakData.dailyGoal;
  if (todayStudyTimeEl) todayStudyTimeEl.textContent = state.streakData.todayStudyTime;
  if (goalTimeEl) goalTimeEl.textContent = state.streakData.dailyGoal;
  
  // Actualizar barra de progreso
  if (dailyProgressFill) {
    const progress = Math.min((state.streakData.todayStudyTime / state.streakData.dailyGoal) * 100, 100);
    dailyProgressFill.style.width = `${progress}%`;
    
    // Cambiar color según progreso
    if (progress >= 100) {
      dailyProgressFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    } else if (progress >= 75) {
      dailyProgressFill.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
    } else {
      dailyProgressFill.style.background = 'linear-gradient(90deg, #6366f1, #4f46e5)';
    }
  }
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
  const suggestions = [15, 30, 45, 60, 90, 120];
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
  
  // Verificar continuidad de racha al cargar
  checkStreakContinuity();
  
  // Verificar cada hora si se mantiene la racha
  setInterval(checkStreakContinuity, 60 * 60 * 1000);
}

// Exportar funciones principales
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeStreakSystem,
    updateTodayStudyTime,
    updateStreakDisplay,
    setDailyGoal,
    shareStreak,
    getStreakStats,
    initializeStreaks
  };
}