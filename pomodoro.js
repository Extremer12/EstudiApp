// SISTEMA POMODORO

let pomodoroState = {
  isRunning: false,
  timeLeft: CONSTANTS.POMODORO.DEFAULT_WORK * 60,
  currentSubject: null,
  isBreak: false,
  config: {
    workDuration: CONSTANTS.POMODORO.DEFAULT_WORK,
    breakDuration: CONSTANTS.POMODORO.DEFAULT_BREAK,
    autoStartBreak: false,
    autoStartWork: false,
    mode: 'simple'
  }
};

function loadPomodoroConfig() {
  const saved = localStorage.getItem('pomodoroConfig');
  if (saved) {
    try {
      const config = JSON.parse(saved);
      pomodoroState.config = { ...pomodoroState.config, ...config };
      
      // Actualizar tiempo inicial según configuración
      if (!pomodoroState.isRunning) {
        const duration = pomodoroState.isBreak 
          ? pomodoroState.config.breakDuration 
          : pomodoroState.config.workDuration;
        pomodoroState.timeLeft = duration * 60;
      }
      
      updatePomodoroDisplay();
    } catch (error) {
      console.error('Error cargando configuración Pomodoro:', error);
    }
  }
}

function populatePomodoroSubjects() {
  const select = document.getElementById('pomodoroSubject');
  if (!select) return;
  
  select.innerHTML = '<option value="">Seleccionar materia (opcional)</option>';
  state.subjects.forEach(subject => {
    select.innerHTML += `<option value="${subject.id}">${subject.name}</option>`;
  });
}

function startPomodoro() {
  if (!pomodoroState.isRunning) {
    pomodoroState.isRunning = true;
    pomodoroInterval = setInterval(updateTimer, 1000);
    
    document.getElementById('startTimer').classList.add('hidden');
    document.getElementById('pauseTimer').classList.remove('hidden');
  }
}

function pausePomodoro() {
  if (pomodoroState.isRunning) {
    pomodoroState.isRunning = false;
    clearInterval(pomodoroInterval);
    
    document.getElementById('startTimer').classList.remove('hidden');
    document.getElementById('pauseTimer').classList.add('hidden');
  }
}

function updateTimer() {
  if (pomodoroState.timeLeft > 0) {
    pomodoroState.timeLeft--;
    displayTime(pomodoroState.timeLeft);
  } else {
    if (pomodoroState.config.mode === 'advanced') {
      completeAdvancedPomodoro();
    } else {
      completePomodoro();
    }
  }
}

function completePomodoro() {
  clearInterval(pomodoroInterval);
  pomodoroState.isRunning = false;
  
  if (!pomodoroState.isBreak) {
    // Completó sesión de trabajo
    const sessionMinutes = pomodoroState.config.workDuration;
    
    // Registrar sesión
    state.pomodoro.sessions.push({
      date: new Date().toISOString(),
      duration: sessionMinutes,
      subject: pomodoroState.currentSubject
    });
    
    // Agregar tiempo al sistema de rachas
    addStudyTime(sessionMinutes);
    
    // Cambiar a modo pausa
    pomodoroState.isBreak = true;
    pomodoroState.timeLeft = pomodoroState.config.breakDuration * 60;
    
    alert(`¡Sesión completada! Tiempo para un descanso de ${pomodoroState.config.breakDuration} minutos.`);
    
    // Auto-iniciar pausa si está configurado
    if (pomodoroState.config.autoStartBreak) {
      setTimeout(() => {
        startPomodoro();
      }, 2000);
    }
  } else {
    // Completó pausa
    pomodoroState.isBreak = false;
    pomodoroState.timeLeft = pomodoroState.config.workDuration * 60;
    
    alert(`¡Pausa terminada! Tiempo para estudiar ${pomodoroState.config.workDuration} minutos.`);
    
    // Auto-iniciar trabajo si está configurado
    if (pomodoroState.config.autoStartWork) {
      setTimeout(() => {
        startPomodoro();
      }, 2000);
    }
  }
  
  updatePomodoroDisplay();
  saveData();
  
  document.getElementById('startTimer').classList.remove('hidden');
  document.getElementById('pauseTimer').classList.add('hidden');
}

function resetTimer() {
  clearInterval(pomodoroInterval);
  pomodoroState.isRunning = false;
  
  if (pomodoroState.config.mode === 'advanced') {
    resetAdvancedTimer();
    return;
  }
  
  const duration = pomodoroState.isBreak 
    ? pomodoroState.config.breakDuration 
    : pomodoroState.config.workDuration;
  
  pomodoroState.timeLeft = duration * 60;
  displayTime(pomodoroState.timeLeft);
  
  document.getElementById('startTimer').classList.remove('hidden');
  document.getElementById('pauseTimer').classList.add('hidden');
  
  updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
  if (pomodoroState.config.mode === 'advanced') {
    updateAdvancedPomodoroDisplay();
    return;
  }
  
  const statusElement = document.getElementById('pomodoroStatus');
  const descriptionElement = document.getElementById('timerDescription');
  
  if (statusElement) {
    statusElement.textContent = pomodoroState.isBreak ? 'Descanso' : 'Tiempo de estudio';
  }
  
  if (descriptionElement) {
    const duration = pomodoroState.isBreak 
      ? pomodoroState.config.breakDuration 
      : pomodoroState.config.workDuration;
    descriptionElement.textContent = `Sesión de ${duration} minutos`;
  }
  
  displayTime(pomodoroState.timeLeft);
}

// Agregar al final del archivo, antes de las exportaciones
function setBreakTime(minutes) {
  const breakInput = document.getElementById('breakDuration');
  if (breakInput) {
    breakInput.value = minutes;
  }
}

function setTotalTime(minutes) {
  const totalTimeInput = document.getElementById('totalTime');
  if (totalTimeInput) {
    totalTimeInput.value = minutes;
  }
  updateSessionPreview();
}

function setBreakLength(minutes) {
  const breakLengthInput = document.getElementById('breakLength');
  if (breakLengthInput) {
    breakLengthInput.value = minutes;
  }
  updateSessionPreview();
}

function switchTab(tabName) {
  // Remover clase active de todos los botones
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  
  // Agregar clase active al botón clickeado
  const activeButton = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
  if (activeButton) {
    activeButton.classList.add('active');
  }
  
  // Mostrar/ocultar secciones según la pestaña
  const simpleConfig = document.getElementById('simpleConfig');
  const advancedConfig = document.getElementById('advancedConfig');
  
  if (tabName === 'simple') {
    if (simpleConfig) simpleConfig.style.display = 'block';
    if (advancedConfig) advancedConfig.style.display = 'none';
  } else if (tabName === 'advanced') {
    if (simpleConfig) simpleConfig.style.display = 'none';
    if (advancedConfig) advancedConfig.style.display = 'block';
  }
}

function updateSessionPreview() {
  const totalTime = document.getElementById('totalTime')?.value || 120;
  const breakLength = document.getElementById('breakLength')?.value || 15;
  const numberOfBreaks = document.getElementById('numberOfBreaks')?.value || 2;
  
  const preview = document.getElementById('sessionPreview');
  if (preview) {
    const workSegments = parseInt(numberOfBreaks) + 1;
    const workTime = Math.floor((totalTime - (breakLength * numberOfBreaks)) / workSegments);
    
    let previewHTML = '<div class="session-timeline">';
    
    for (let i = 0; i < workSegments; i++) {
      previewHTML += `<span class="work-segment">${workTime}min trabajo</span>`;
      if (i < numberOfBreaks) {
        previewHTML += `<span class="break-segment">${breakLength}min descanso</span>`;
      }
    }
    
    previewHTML += '</div>';
    preview.innerHTML = previewHTML;
  }
}

// Actualizar las exportaciones
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ...module.exports,
    setBreakTime,
    setTotalTime,
    setBreakLength,
    switchTab,
    updateSessionPreview
  };
}

function setupPomodoroEventListeners() {
  const startBtn = document.getElementById('startTimer');
  const pauseBtn = document.getElementById('pauseTimer');
  const resetBtn = document.getElementById('resetTimer');
  
  if (startBtn) {
    startBtn.addEventListener('click', startPomodoro);
  }
  
  if (pauseBtn) {
    pauseBtn.addEventListener('click', pausePomodoro);
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', resetTimer);
  }
}

// Funciones para configuración de tiempo de trabajo
function setWorkTime(minutes) {
  const workInput = document.getElementById('workDuration');
  if (workInput) {
    workInput.value = minutes;
    pomodoroState.config.workDuration = minutes;
  }
}

// Función para configurar tiempo total (configuración avanzada)
function setTotalTime(minutes) {
  const totalTimeInput = document.getElementById('totalTime');
  if (totalTimeInput) {
    totalTimeInput.value = minutes;
  }
  updateSessionPreview();
}

// Función para configurar duración de pausas
function setBreakLength(minutes) {
  const breakLengthInput = document.getElementById('breakLength');
  if (breakLengthInput) {
    breakLengthInput.value = minutes;
  }
  updateSessionPreview();
}

// Función para guardar configuración del Pomodoro
function savePomodoroConfig() {
  try {
    const workDuration = document.getElementById('workDuration')?.value || 25;
    const breakDuration = document.getElementById('breakDuration')?.value || 5;
    const autoStartBreak = document.getElementById('autoStartBreak')?.checked || false;
    const autoStartWork = document.getElementById('autoStartWork')?.checked || false;
    
    pomodoroState.config = {
      workDuration: parseInt(workDuration),
      breakDuration: parseInt(breakDuration),
      autoStartBreak,
      autoStartWork
    };
    
    localStorage.setItem('pomodoroConfig', JSON.stringify(pomodoroState.config));
    closeModal('pomodoroConfigModal');
    updatePomodoroDisplay();
  } catch (error) {
    console.error('Error al guardar configuración Pomodoro:', error);
    alert('Error al guardar la configuración. Inténtalo de nuevo.');
  }
}

// Exportar la función si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ...module.exports,
    setupPomodoroEventListeners
  };
}