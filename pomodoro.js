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
      
      // Adaptar animaciones a la configuración cargada
      adaptAnimationsToConfig();
      
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
    
    // Iniciar sesión de estudio si es modo trabajo
    if (!pomodoroState.isBreak && typeof startStudySession === 'function') {
      startStudySession();
    }
    
    document.getElementById('startTimer').classList.add('hidden');
    document.getElementById('pauseTimer').classList.remove('hidden');
    updateTimerAnimations();
    
    // Activar efectos de enfoque según el modo
    adaptEffectsToMode(pomodoroState.isBreak);
  }
}

function pausePomodoro() {
  if (pomodoroState.isRunning) {
    pomodoroState.isRunning = false;
    
    // Finalizar sesión de estudio si es modo trabajo
    if (!pomodoroState.isBreak && typeof endStudySession === 'function') {
      endStudySession();
    }
    
    clearInterval(pomodoroInterval);
    
    document.getElementById('startTimer').classList.remove('hidden');
    document.getElementById('pauseTimer').classList.add('hidden');
    updateTimerAnimations();
    
    // Desactivar efectos de enfoque al pausar
    deactivateFocusEffects();
  }
}

function updateTimer() {
  if (pomodoroState.timeLeft > 0) {
    pomodoroState.timeLeft--;
    displayTime(pomodoroState.timeLeft);
    updateTimerAnimations();
    
    // Aplicar adaptación dinámica y efectos de progreso
    const sessionType = pomodoroState.isBreak ? 'break' : 'work';
    applyDynamicAnimationConfig(sessionType, pomodoroState.timeLeft);
    updateDynamicProgressText(pomodoroState.timeLeft);
    
    // Actualizar efectos visuales de enfoque
    if (pomodoroState.isRunning && !pomodoroState.isBreak) {
      const totalTime = pomodoroState.config.workDuration * 60;
      updateFocusEffectsByProgress(pomodoroState.timeLeft, totalTime);
      updateVisualProgress(pomodoroState.timeLeft, totalTime);
      
      // Sincronizar con sistema de rachas
      if (typeof updateStreakProgressFromPomodoro === 'function') {
        updateStreakProgressFromPomodoro(pomodoroState.timeLeft, totalTime);
      }
    }
  } else {
    if (pomodoroState.config.mode === 'advanced') {
      completeAdvancedPomodoro();
    } else {
      completePomodoro();
    }
  }
}

function completePomodoro() {
  // Finalizar sesión de estudio si era modo trabajo
  if (!pomodoroState.isBreak && typeof endStudySession === 'function') {
    endStudySession();
  }
  
  clearInterval(pomodoroInterval);
  pomodoroState.isRunning = false;
  
  // Limpiar efectos actuales
  cleanupAllVisualEffects();
  
  // Activar efectos de transición
  const sessionTitle = document.getElementById('sessionTitle');
  const sessionProgress = document.getElementById('sessionProgressText');
  if (sessionTitle) triggerTransitionEffect(sessionTitle);
  if (sessionProgress) triggerTransitionEffect(sessionProgress);
  
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
    
    // Mostrar notificación interactiva para descanso
    showBreakNotification(pomodoroState.config.breakDuration);
    
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
    
    // Mostrar notificación interactiva para volver al estudio
    showWorkNotification(pomodoroState.config.workDuration);
    
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
  // Finalizar sesión de estudio si estaba activa
  if (pomodoroState.isRunning && !pomodoroState.isBreak && typeof endStudySession === 'function') {
    endStudySession();
  }
  
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
  updateTimerAnimations();
  
  // Limpiar todos los efectos visuales
  cleanupAllVisualEffects();
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

/* Exportaciones consolidadas al final del archivo */

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

/* Funciones setTotalTime y setBreakLength eliminadas - ya existen arriba */

// Función para guardar configuración del Pomodoro
function savePomodoroConfig() {
  try {
    const workDuration = document.getElementById('workDuration')?.value || 30;
    const breakDuration = document.getElementById('breakDuration')?.value || 5;
    const autoStartBreak = document.getElementById('autoStartBreak')?.checked || false;
    const autoStartWork = document.getElementById('autoStartWork')?.checked || false;
    
    // Validar tiempo mínimo de trabajo
    const workTime = parseInt(workDuration);
    if (workTime < 30) {
      if (typeof showError === 'function') {
        showError('El tiempo mínimo de trabajo es 30 minutos para validar la racha diaria.');
      } else {
        alert('El tiempo mínimo de trabajo es 30 minutos para validar la racha diaria.');
      }
      return;
    }
    
    pomodoroState.config = {
      workDuration: workTime,
      breakDuration: parseInt(breakDuration),
      autoStartBreak,
      autoStartWork
    };
    
    localStorage.setItem('pomodoroConfig', JSON.stringify(pomodoroState.config));
    
    // Adaptar animaciones a la nueva configuración
    adaptAnimationsToConfig();
    
    closeModal('pomodoroConfigModal');
    updatePomodoroDisplay();
  } catch (error) {
    console.error('Error al guardar configuración Pomodoro:', error);
    if (typeof showError === 'function') {
      showError('Error al guardar la configuración. Inténtalo de nuevo.');
    } else {
      alert('Error al guardar la configuración. Inténtalo de nuevo.');
    }
  }
}

/* ========================================
   SISTEMA DE NOTIFICACIONES INTERACTIVAS
======================================== */

// Configuración de animaciones personalizable
let animationConfig = {
  enableAnimations: true,
  notificationDuration: 5000,
  focusEffects: true,
  soundEnabled: false,
  vibrationEnabled: false
};

// Cargar configuración de animaciones
function loadAnimationConfig() {
  const saved = localStorage.getItem('animationConfig');
  if (saved) {
    try {
      animationConfig = { ...animationConfig, ...JSON.parse(saved) };
    } catch (error) {
      console.error('Error cargando configuración de animaciones:', error);
    }
  }
}

// Guardar configuración de animaciones
function saveAnimationConfig() {
  localStorage.setItem('animationConfig', JSON.stringify(animationConfig));
}

// Función para mostrar notificación de descanso
function showBreakNotification(duration) {
  if (!animationConfig.enableAnimations) {
    alert(`¡Sesión completada! Tiempo para un descanso de ${duration} minutos.`);
    return;
  }

  const sessionTitle = document.getElementById('sessionTitle');
  const sessionProgress = document.getElementById('sessionProgressText');
  
  // Aplicar animaciones de notificación de descanso
  if (sessionTitle) {
    sessionTitle.classList.remove('active', 'focus-mode', 'paused');
    sessionTitle.classList.add('break-notification');
    sessionTitle.textContent = '¡Tiempo de Descanso!';
  }
  
  if (sessionProgress) {
    sessionProgress.classList.remove('active', 'focus-mode', 'paused');
    sessionProgress.classList.add('break-notification');
    sessionProgress.textContent = `Relájate por ${duration} minutos`;
  }
  
  // Crear notificación visual personalizada
  createCustomNotification({
    title: '🎉 ¡Sesión Completada!',
    message: `Tiempo para un descanso de ${duration} minutos`,
    type: 'success',
    duration: animationConfig.notificationDuration
  });
  
  // Efectos adicionales
  if (animationConfig.soundEnabled) {
    playNotificationSound('break');
  }
  
  if (animationConfig.vibrationEnabled && navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
  
  // Limpiar animaciones después de un tiempo
  setTimeout(() => {
    if (sessionTitle) sessionTitle.classList.remove('break-notification');
    if (sessionProgress) sessionProgress.classList.remove('break-notification');
  }, 3000);
}

// Función para mostrar notificación de trabajo
function showWorkNotification(duration) {
  if (!animationConfig.enableAnimations) {
    alert(`¡Pausa terminada! Tiempo para estudiar ${duration} minutos.`);
    return;
  }

  const sessionTitle = document.getElementById('sessionTitle');
  const sessionProgress = document.getElementById('sessionProgressText');
  
  // Aplicar animaciones de notificación de trabajo
  if (sessionTitle) {
    sessionTitle.classList.remove('break-notification', 'paused');
    sessionTitle.classList.add('active');
    sessionTitle.textContent = 'Tiempo de Estudio';
  }
  
  if (sessionProgress) {
    sessionProgress.classList.remove('break-notification', 'paused');
    sessionProgress.classList.add('active');
    sessionProgress.textContent = `Estudia por ${duration} minutos`;
  }
  
  // Crear notificación visual personalizada
  createCustomNotification({
    title: '📚 ¡Hora de Estudiar!',
    message: `Sesión de estudio de ${duration} minutos`,
    type: 'info',
    duration: animationConfig.notificationDuration
  });
  
  // Efectos adicionales
  if (animationConfig.soundEnabled) {
    playNotificationSound('work');
  }
  
  if (animationConfig.vibrationEnabled && navigator.vibrate) {
    navigator.vibrate([100, 50, 100, 50, 100]);
  }
}

// Función para crear notificaciones visuales personalizadas
function createCustomNotification({ title, message, type = 'info', duration = 5000 }) {
  const notification = document.createElement('div');
  notification.className = `custom-notification ${type}`;
  
  const typeIcons = {
    success: '🎉',
    info: '📚',
    warning: '⚠️',
    error: '❌'
  };
  
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">${typeIcons[type] || '📢'}</div>
      <div class="notification-text">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
    </div>
    <div class="notification-progress"></div>
  `;
  
  // Estilos inline para la notificación
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--surface-card);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    min-width: 300px;
    max-width: 400px;
    animation: slideInRight 0.5s ease-out;
    overflow: hidden;
  `;
  
  const content = notification.querySelector('.notification-content');
  content.style.cssText = `
    display: flex;
    align-items: center;
    padding: var(--space-lg);
    gap: var(--space-md);
  `;
  
  const icon = notification.querySelector('.notification-icon');
  icon.style.cssText = `
    font-size: 24px;
    flex-shrink: 0;
  `;
  
  const text = notification.querySelector('.notification-text');
  text.style.cssText = `
    flex: 1;
  `;
  
  const titleEl = notification.querySelector('.notification-title');
  titleEl.style.cssText = `
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--space-xs);
  `;
  
  const messageEl = notification.querySelector('.notification-message');
  messageEl.style.cssText = `
    color: var(--text-secondary);
    font-size: var(--text-sm);
  `;
  
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--text-secondary);
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    flex-shrink: 0;
  `;
  
  const progress = notification.querySelector('.notification-progress');
  progress.style.cssText = `
    height: 3px;
    background: var(--primary-500);
    width: 100%;
    animation: progressBar ${duration}ms linear;
  `;
  
  // Agregar estilos de animación
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes progressBar {
      from { width: 100%; }
      to { width: 0%; }
    }
    
    .notification-close:hover {
      background: var(--surface-elevated) !important;
      color: var(--text-primary) !important;
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  // Auto-remover después del tiempo especificado
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideInRight 0.3s ease-in reverse';
      setTimeout(() => {
        notification.remove();
        style.remove();
      }, 300);
    }
  }, duration);
}

// Control de estados de animación durante el temporizador
function updateTimerAnimations() {
  if (!animationConfig.enableAnimations) return;
  
  const sessionTitle = document.getElementById('sessionTitle');
  const sessionProgress = document.getElementById('sessionProgressText');
  
  if (pomodoroState.isRunning) {
    // Aplicar efectos de enfoque durante sesión activa
    if (animationConfig.focusEffects) {
      if (sessionTitle) {
        sessionTitle.classList.remove('paused', 'break-notification');
        sessionTitle.classList.add(pomodoroState.isBreak ? 'active' : 'focus-mode');
      }
      if (sessionProgress) {
        sessionProgress.classList.remove('paused', 'break-notification');
        sessionProgress.classList.add(pomodoroState.isBreak ? 'active' : 'focus-mode');
      }
    }
  } else {
    // Estado pausado
    if (sessionTitle) {
      sessionTitle.classList.remove('active', 'focus-mode', 'break-notification');
      sessionTitle.classList.add('paused');
    }
    if (sessionProgress) {
      sessionProgress.classList.remove('active', 'focus-mode', 'break-notification');
      sessionProgress.classList.add('paused');
    }
  }
}

// Función para reproducir sonidos de notificación (placeholder)
function playNotificationSound(type) {
  // Implementación futura para sonidos
  // Sonido reproducido
}

// Función para actualizar preferencias de animación
function updateAnimationPreferences() {
    const preferences = {
        enableAnimations: document.getElementById('enableAnimations')?.checked ?? true,
        focusEffects: document.getElementById('focusEffects')?.checked ?? true,
        soundNotifications: document.getElementById('soundNotifications')?.checked ?? false,
        vibrationAlerts: document.getElementById('vibrationAlerts')?.checked ?? false,
        animationIntensity: document.getElementById('animationIntensity')?.value ?? 'medium',
        notificationDuration: parseInt(document.getElementById('notificationDuration')?.value ?? '5000'),
        particleEffects: document.getElementById('particleEffects')?.checked ?? true,
        progressRing: document.getElementById('progressRing')?.checked ?? true,
        flowIndicator: document.getElementById('flowIndicator')?.checked ?? true
    };
    
    // Actualizar configuración global
    Object.assign(animationConfig, preferences);
    saveAnimationConfig();
    
    // Aplicar cambios inmediatamente si hay una sesión activa
    if (pomodoroState.isRunning) {
        updateTimerAnimations();
        if (!pomodoroState.isBreak && animationConfig.focusEffects) {
            deactivateFocusEffects();
            setTimeout(() => {
                activateFocusEffects(animationConfig.animationIntensity);
            }, 200);
        }
    }
    
    // Preferencias de animación actualizadas
}

// Función para crear interfaz de configuración de animaciones
function createAnimationConfigInterface() {
    const configHTML = `
        <div class="animation-config-section">
            <h4>Configuración de Animaciones</h4>
            
            <div class="config-group">
                <label class="config-item">
                    <input type="checkbox" id="enableAnimations" ${animationConfig.enableAnimations ? 'checked' : ''}>
                    <span>Habilitar animaciones</span>
                </label>
                
                <label class="config-item">
                    <input type="checkbox" id="focusEffects" ${animationConfig.focusEffects ? 'checked' : ''}>
                    <span>Efectos de enfoque</span>
                </label>
                
                <label class="config-item">
                    <input type="checkbox" id="particleEffects" ${animationConfig.particleEffects ? 'checked' : ''}>
                    <span>Efectos de partículas</span>
                </label>
                
                <label class="config-item">
                    <input type="checkbox" id="progressRing" ${animationConfig.progressRing ? 'checked' : ''}>
                    <span>Anillo de progreso</span>
                </label>
                
                <label class="config-item">
                    <input type="checkbox" id="flowIndicator" ${animationConfig.flowIndicator ? 'checked' : ''}>
                    <span>Indicador de flujo</span>
                </label>
            </div>
            
            <div class="config-group">
                <label class="config-item">
                    <span>Intensidad de animación:</span>
                    <select id="animationIntensity">
                        <option value="low" ${animationConfig.animationIntensity === 'low' ? 'selected' : ''}>Baja</option>
                        <option value="medium" ${animationConfig.animationIntensity === 'medium' ? 'selected' : ''}>Media</option>
                        <option value="high" ${animationConfig.animationIntensity === 'high' ? 'selected' : ''}>Alta</option>
                        <option value="maximum" ${animationConfig.animationIntensity === 'maximum' ? 'selected' : ''}>Máxima</option>
                    </select>
                </label>
                
                <label class="config-item">
                    <span>Duración de notificaciones (ms):</span>
                    <input type="range" id="notificationDuration" min="2000" max="10000" step="500" value="${animationConfig.notificationDuration}">
                    <span class="range-value">${animationConfig.notificationDuration}ms</span>
                </label>
            </div>
            
            <div class="config-group">
                <label class="config-item">
                    <input type="checkbox" id="soundNotifications" ${animationConfig.soundNotifications ? 'checked' : ''}>
                    <span>Notificaciones de sonido</span>
                </label>
                
                <label class="config-item">
                    <input type="checkbox" id="vibrationAlerts" ${animationConfig.vibrationAlerts ? 'checked' : ''}>
                    <span>Alertas de vibración</span>
                </label>
            </div>
            
            <div class="config-actions">
                <button type="button" class="btn-small" onclick="updateAnimationPreferences()">Aplicar Cambios</button>
                <button type="button" class="btn-small" onclick="resetAnimationConfig()">Restaurar Predeterminados</button>
                <button type="button" class="btn-small" onclick="previewAnimations()">Vista Previa</button>
            </div>
        </div>
    `;
    
    return configHTML;
}

// Función para resetear configuración de animaciones
function resetAnimationConfig() {
    animationConfig = {
        enableAnimations: true,
        focusEffects: true,
        soundNotifications: false,
        vibrationAlerts: false,
        animationIntensity: 'medium',
        notificationDuration: 5000,
        particleEffects: true,
        progressRing: true,
        flowIndicator: true
    };
    
    saveAnimationConfig();
    
    // Actualizar interfaz si existe
    const configSection = document.querySelector('.animation-config-section');
    if (configSection) {
        configSection.outerHTML = createAnimationConfigInterface();
    }
    
    // Configuración de animaciones restablecida
}

// Función para vista previa de animaciones
function previewAnimations() {
    if (pomodoroState.isRunning) {
        alert('No se puede mostrar vista previa durante una sesión activa');
        return;
    }
    
    // Simular efectos por 3 segundos
    const sessionTitle = document.getElementById('sessionTitle');
    const sessionProgress = document.getElementById('sessionProgressText');
    
    if (sessionTitle) {
        sessionTitle.textContent = 'Vista Previa de Animaciones';
        triggerTransitionEffect(sessionTitle);
    }
    
    if (sessionProgress) {
        sessionProgress.textContent = 'Probando efectos visuales...';
    }
    
    // Activar efectos temporalmente
    activateFocusEffects(animationConfig.animationIntensity);
    
    setTimeout(() => {
        deactivateFocusEffects();
        if (sessionTitle) sessionTitle.textContent = 'Sesión de Estudio';
        if (sessionProgress) sessionProgress.textContent = 'Listo para comenzar';
    }, 3000);
}

// Función para integrar configuración en el modal de configuración
function integrateAnimationConfigToModal() {
    const configModal = document.querySelector('#configModal .modal-body');
    if (configModal && !configModal.querySelector('.animation-config-section')) {
        const animationConfigHTML = createAnimationConfigInterface();
        configModal.insertAdjacentHTML('beforeend', animationConfigHTML);
        
        // Agregar event listeners para actualización en tiempo real
        const rangeInput = document.getElementById('notificationDuration');
        if (rangeInput) {
            rangeInput.addEventListener('input', function() {
                const valueDisplay = this.parentNode.querySelector('.range-value');
                if (valueDisplay) {
                    valueDisplay.textContent = this.value + 'ms';
                }
            });
        }
    }
}

// Inicializar configuración de animaciones al cargar
loadAnimationConfig();

/* ========================================
   EFECTOS VISUALES DE ENFOQUE
======================================== */

// Sistema de efectos de enfoque
let focusEffectsActive = false;
let particleSystem = null;
let flowIndicator = null;

// Función para activar efectos de enfoque
function activateFocusEffects(intensity = 'medium') {
  if (!animationConfig.focusEffects || focusEffectsActive) return;
  
  focusEffectsActive = true;
  const timerContainer = document.querySelector('.timer-container') || document.querySelector('#pomodoroTimer');
  
  if (timerContainer) {
    // Aplicar efectos según intensidad
    switch (intensity) {
      case 'low':
        timerContainer.classList.add('focus-breathing');
        break;
      case 'medium':
        timerContainer.classList.add('focus-breathing', 'focus-waves');
        createFlowIndicator('🎯');
        break;
      case 'high':
        timerContainer.classList.add('focus-breathing', 'focus-waves', 'force-field');
        createFlowIndicator('🔥');
        createParticleSystem();
        break;
      case 'maximum':
        timerContainer.classList.add('focus-breathing', 'focus-waves', 'force-field');
        createFlowIndicator('⚡', 'deep-focus');
        createParticleSystem(true);
        addEnergyPulseToElements();
        break;
    }
  }
}

// Función para desactivar efectos de enfoque
function deactivateFocusEffects() {
  if (!focusEffectsActive) return;
  
  focusEffectsActive = false;
  const timerContainer = document.querySelector('.timer-container') || document.querySelector('#pomodoroTimer');
  
  if (timerContainer) {
    timerContainer.classList.remove('focus-breathing', 'focus-waves', 'force-field');
  }
  
  removeEnergyPulseFromElements();
  removeParticleSystem();
  removeFlowIndicator();
}

// Función para crear indicador de flujo
function createFlowIndicator(icon = '🎯', mode = 'normal') {
  removeFlowIndicator(); // Remover indicador anterior si existe
  
  flowIndicator = document.createElement('div');
  flowIndicator.className = `flow-indicator ${mode}`;
  flowIndicator.textContent = icon;
  flowIndicator.id = 'flowIndicator';
  
  document.body.appendChild(flowIndicator);
  
  // Animar entrada
  setTimeout(() => {
    flowIndicator.style.transform = 'scale(1)';
    flowIndicator.style.opacity = '1';
  }, 100);
}

// Función para remover indicador de flujo
function removeFlowIndicator() {
  if (flowIndicator) {
    flowIndicator.style.transform = 'scale(0)';
    flowIndicator.style.opacity = '0';
    setTimeout(() => {
      if (flowIndicator && flowIndicator.parentNode) {
        flowIndicator.parentNode.removeChild(flowIndicator);
      }
      flowIndicator = null;
    }, 300);
  }
}

// Función para crear sistema de partículas
function createParticleSystem(intense = false) {
  removeParticleSystem(); // Remover sistema anterior si existe
  
  particleSystem = document.createElement('div');
  particleSystem.className = 'focus-particles';
  particleSystem.id = 'focusParticles';
  
  const particleCount = intense ? 15 : 8;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'focus-particle';
    
    // Posición inicial aleatoria
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    
    // Variaciones de tamaño para partículas intensas
    if (intense) {
      const size = 3 + Math.random() * 3;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
    }
    
    particleSystem.appendChild(particle);
  }
  
  document.body.appendChild(particleSystem);
}

// Función para remover sistema de partículas
function removeParticleSystem() {
  if (particleSystem) {
    particleSystem.style.opacity = '0';
    setTimeout(() => {
      if (particleSystem && particleSystem.parentNode) {
        particleSystem.parentNode.removeChild(particleSystem);
      }
      particleSystem = null;
    }, 1000);
  }
}

// Función para agregar pulso de energía a elementos
function addEnergyPulseToElements() {
  const sessionTitle = document.getElementById('sessionTitle');
  const sessionProgress = document.getElementById('sessionProgressText');
  
  if (sessionTitle) sessionTitle.classList.add('energy-pulse');
  if (sessionProgress) sessionProgress.classList.add('energy-pulse');
}

// Función para remover pulso de energía de elementos
function removeEnergyPulseFromElements() {
  const sessionTitle = document.getElementById('sessionTitle');
  const sessionProgress = document.getElementById('sessionProgressText');
  
  if (sessionTitle) sessionTitle.classList.remove('energy-pulse');
  if (sessionProgress) sessionProgress.classList.remove('energy-progress');
}

// Función para actualizar efectos según progreso de sesión
function updateFocusEffectsByProgress(timeRemaining, totalTime) {
  if (!animationConfig.focusEffects || !focusEffectsActive) return;
  
  const progress = (totalTime - timeRemaining) / totalTime;
  let intensity = 'low';
  
  if (progress < 0.25) {
    intensity = 'low';
  } else if (progress < 0.5) {
    intensity = 'medium';
  } else if (progress < 0.75) {
    intensity = 'high';
  } else {
    intensity = 'maximum';
  }
  
  // Reactivar efectos con nueva intensidad si cambió
  const currentIntensity = getCurrentFocusIntensity();
  if (currentIntensity !== intensity) {
    deactivateFocusEffects();
    setTimeout(() => activateFocusEffects(intensity), 200);
  }
}

// Función para obtener intensidad actual de enfoque
function getCurrentFocusIntensity() {
  const timerContainer = document.querySelector('.timer-container') || document.querySelector('#pomodoroTimer');
  if (!timerContainer) return 'none';
  
  if (timerContainer.classList.contains('force-field')) {
    return flowIndicator && flowIndicator.classList.contains('deep-focus') ? 'maximum' : 'high';
  } else if (timerContainer.classList.contains('focus-waves')) {
    return 'medium';
  } else if (timerContainer.classList.contains('focus-breathing')) {
    return 'low';
  }
  
  return 'none';
}

// Función para crear progreso circular visual
function updateVisualProgress(timeRemaining, totalTime) {
  if (!animationConfig.enableAnimations) return;
  
  const progress = ((totalTime - timeRemaining) / totalTime) * 360;
  const timerContainer = document.querySelector('.timer-container') || document.querySelector('#pomodoroTimer');
  
  if (timerContainer) {
    // Crear o actualizar anillo de progreso
    let progressRing = document.getElementById('timerProgressRing');
    if (!progressRing) {
      progressRing = document.createElement('div');
      progressRing.className = 'timer-progress-ring';
      progressRing.id = 'timerProgressRing';
      timerContainer.style.position = 'relative';
      timerContainer.appendChild(progressRing);
    }
    
    progressRing.style.setProperty('--progress-angle', progress + 'deg');
  }
}

// Función para activar efectos de transición
function triggerTransitionEffect(element) {
  if (!element || !animationConfig.enableAnimations) return;
  
  element.classList.add('timer-transition');
  setTimeout(() => {
    element.classList.remove('timer-transition');
  }, 800);
}

// Función para adaptar efectos según modo (trabajo/descanso)
function adaptEffectsToMode(isBreak) {
  if (isBreak) {
    // Modo descanso: efectos más suaves
    deactivateFocusEffects();
    createFlowIndicator('😌', 'break-mode');
  } else {
    // Modo trabajo: activar efectos de enfoque
    if (animationConfig.focusEffects) {
      activateFocusEffects('medium');
    }
  }
}

// Función para limpiar todos los efectos visuales
function cleanupAllVisualEffects() {
  deactivateFocusEffects();
  removeParticleSystem();
  removeFlowIndicator();
  
  // Remover anillo de progreso
  const progressRing = document.getElementById('timerProgressRing');
  if (progressRing) {
    progressRing.remove();
  }
  
  // Remover contenedor de alertas urgentes
  const alertContainer = document.getElementById('urgentAlertContainer');
  if (alertContainer) {
    alertContainer.style.display = 'none';
  }
}

/* ========================================
   ADAPTACIÓN DINÁMICA SEGÚN CONFIGURACIÓN
======================================== */

// Función para adaptar animaciones según configuración del usuario
function adaptAnimationsToConfig() {
  const config = pomodoroState.config;
  
  // Adaptar duración de notificaciones según duración de sesiones
  if (config.workDuration <= 15) {
    animationConfig.notificationDuration = 3000; // Sesiones cortas = notificaciones más breves
  } else if (config.workDuration <= 30) {
    animationConfig.notificationDuration = 5000; // Duración estándar
  } else {
    animationConfig.notificationDuration = 7000; // Sesiones largas = notificaciones más largas
  }
  
  // Adaptar intensidad de efectos según preferencias
  const sessionRatio = config.workDuration / config.breakDuration;
  if (sessionRatio > 5) {
    // Sesiones muy largas comparadas con descansos = efectos más intensos
    animationConfig.focusEffects = true;
    animationConfig.vibrationEnabled = true;
  }
  
  // Adaptar comportamiento según modo automático
  if (config.autoStartBreak && config.autoStartWork) {
    // Modo completamente automático = notificaciones más sutiles
    animationConfig.notificationDuration = Math.max(animationConfig.notificationDuration - 1000, 2000);
  }
  
  saveAnimationConfig();
}

// Función para obtener configuración de animación personalizada
function getCustomAnimationSettings(sessionType, timeRemaining) {
  const totalTime = pomodoroState.isBreak ? 
    pomodoroState.config.breakDuration * 60 : 
    pomodoroState.config.workDuration * 60;
  
  const progress = (totalTime - timeRemaining) / totalTime;
  
  // Configuración dinámica basada en progreso
  const settings = {
    intensity: 'normal',
    focusLevel: 'medium',
    urgency: 'low'
  };
  
  // Ajustar intensidad según progreso de la sesión
  if (progress < 0.25) {
    settings.intensity = 'gentle';
    settings.focusLevel = 'low';
  } else if (progress < 0.75) {
    settings.intensity = 'normal';
    settings.focusLevel = 'medium';
  } else {
    settings.intensity = 'strong';
    settings.focusLevel = 'high';
    settings.urgency = 'medium';
  }
  
  // Últimos 5 minutos = máxima intensidad
  if (timeRemaining <= 300) {
    settings.intensity = 'maximum';
    settings.urgency = 'high';
  }
  
  // Últimos 60 segundos = alerta crítica
  if (timeRemaining <= 60) {
    settings.urgency = 'critical';
  }
  
  return settings;
}

// Función para aplicar configuración dinámica a elementos
function applyDynamicAnimationConfig(sessionType, timeRemaining) {
  if (!animationConfig.enableAnimations) return;
  
  const settings = getCustomAnimationSettings(sessionType, timeRemaining);
  const sessionTitle = document.getElementById('sessionTitle');
  const sessionProgress = document.getElementById('sessionProgressText');
  
  // Remover clases anteriores
  const intensityClasses = ['gentle', 'normal', 'strong', 'maximum'];
  const urgencyClasses = ['low-urgency', 'medium-urgency', 'high-urgency', 'critical-urgency'];
  const focusClasses = ['low-focus', 'medium-focus', 'high-focus'];
  
  [sessionTitle, sessionProgress].forEach(element => {
    if (element) {
      intensityClasses.forEach(cls => element.classList.remove(cls));
      urgencyClasses.forEach(cls => element.classList.remove(cls));
      focusClasses.forEach(cls => element.classList.remove(cls));
      
      // Aplicar nuevas clases
      element.classList.add(settings.intensity);
      element.classList.add(`${settings.urgency}-urgency`);
      element.classList.add(`${settings.focusLevel}-focus`);
    }
  });
  
  // Efectos especiales para momentos críticos
  if (settings.urgency === 'critical') {
    createUrgentAlert(timeRemaining);
  }
}

// Función para crear alertas urgentes en momentos críticos
function createUrgentAlert(timeRemaining) {
  const alertContainer = document.getElementById('urgentAlertContainer') || createUrgentAlertContainer();
  
  if (timeRemaining <= 60 && timeRemaining > 50) {
    alertContainer.innerHTML = `
      <div class="urgent-alert critical-countdown">
        <div class="alert-icon">⏰</div>
        <div class="alert-text">¡Último minuto!</div>
        <div class="countdown-circle">
          <div class="countdown-number">${timeRemaining}</div>
        </div>
      </div>
    `;
    alertContainer.style.display = 'block';
  } else if (timeRemaining <= 10 && timeRemaining > 0) {
    alertContainer.innerHTML = `
      <div class="urgent-alert final-countdown">
        <div class="alert-icon">🚨</div>
        <div class="alert-text">¡Finalizando!</div>
        <div class="countdown-circle pulsing">
          <div class="countdown-number">${timeRemaining}</div>
        </div>
      </div>
    `;
  } else if (timeRemaining <= 0) {
    alertContainer.style.display = 'none';
  }
}

// Función para crear contenedor de alertas urgentes
function createUrgentAlertContainer() {
  const container = document.createElement('div');
  container.id = 'urgentAlertContainer';
  container.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    display: none;
    pointer-events: none;
  `;
  
  // Estilos para alertas urgentes
  const style = document.createElement('style');
  style.textContent = `
    .urgent-alert {
      background: rgba(255, 59, 48, 0.95);
      color: white;
      padding: var(--space-xl);
      border-radius: var(--radius-xl);
      text-align: center;
      box-shadow: 0 20px 40px rgba(255, 59, 48, 0.3);
      animation: urgentPulse 1s ease-in-out infinite;
    }
    
    .urgent-alert.final-countdown {
      background: rgba(255, 45, 85, 0.98);
      animation: finalCountdown 0.5s ease-in-out infinite;
    }
    
    .alert-icon {
      font-size: 48px;
      margin-bottom: var(--space-md);
    }
    
    .alert-text {
      font-size: var(--text-xl);
      font-weight: 700;
      margin-bottom: var(--space-lg);
    }
    
    .countdown-circle {
      width: 80px;
      height: 80px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      position: relative;
    }
    
    .countdown-circle.pulsing {
      animation: circlePulse 0.3s ease-in-out infinite;
    }
    
    .countdown-number {
      font-size: var(--text-2xl);
      font-weight: 900;
    }
    
    @keyframes urgentPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @keyframes finalCountdown {
      0%, 100% { transform: scale(1) rotate(0deg); }
      25% { transform: scale(1.1) rotate(-2deg); }
      75% { transform: scale(1.1) rotate(2deg); }
    }
    
    @keyframes circlePulse {
      0%, 100% { border-color: rgba(255, 255, 255, 0.3); }
      50% { border-color: rgba(255, 255, 255, 0.8); }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(container);
  
  return container;
}

// Función para adaptar texto de progreso dinámicamente
function updateDynamicProgressText(timeRemaining) {
  const sessionProgress = document.getElementById('sessionProgressText');
  if (!sessionProgress || !animationConfig.enableAnimations) return;
  
  const totalTime = pomodoroState.isBreak ? 
    pomodoroState.config.breakDuration * 60 : 
    pomodoroState.config.workDuration * 60;
  
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  let progressText = '';
  let motivationalText = '';
  
  if (pomodoroState.isBreak) {
    if (progress < 50) {
      motivationalText = '😌 Relájate y descansa';
    } else {
      motivationalText = '🔄 Prepárate para continuar';
    }
    progressText = `${motivationalText} - ${minutes}:${seconds.toString().padStart(2, '0')}`;
  } else {
    if (progress < 25) {
      motivationalText = '🚀 ¡Empezando fuerte!';
    } else if (progress < 50) {
      motivationalText = '💪 Mantén el ritmo';
    } else if (progress < 75) {
      motivationalText = '🎯 ¡Ya casi llegas!';
    } else if (progress < 90) {
      motivationalText = '🔥 ¡Último esfuerzo!';
    } else {
      motivationalText = '⭐ ¡Finalizando!';
    }
    progressText = `${motivationalText} - ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  sessionProgress.textContent = progressText;
}

// Exportaciones consolidadas
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    startPomodoro,
    pausePomodoro,
    resetTimer,
    updatePomodoroDisplay,
    loadPomodoroConfig,
    savePomodoroConfig,
    populatePomodoroSubjects,
    setupPomodoroEventListeners,
    setBreakTime,
    setTotalTime,
    setBreakLength,
    switchTab,
    updateSessionPreview
  };
}