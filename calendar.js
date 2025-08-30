// SISTEMA DE CALENDARIO

// Variables globales
let currentDate = new Date();
let selectedDate = null;

function initializeCalendar() {
  // Establecer currentDate al día 1 del mes actual para consistencia
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  renderCalendar();
  setupCalendarEventListeners();
  createDayEventsModal();
}

function renderCalendar() {
  const calendarContainer = document.getElementById('calendar');
  if (!calendarContainer) return;
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Crear estructura del calendario
  calendarContainer.innerHTML = `
    <div class="calendar-container">
      <div class="calendar-header-row">
        <button id="prevMonth" class="calendar-nav-btn" aria-label="Mes anterior">
          <span class="nav-arrow">‹</span>
        </button>
        <h3 id="monthYear" class="calendar-title">
          ${new Date(year, month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h3>
        <button id="nextMonth" class="calendar-nav-btn" aria-label="Mes siguiente">
          <span class="nav-arrow">›</span>
        </button>
      </div>
      <div class="calendar-grid-wrapper">
        <div id="calendarGrid" class="calendar-grid"></div>
      </div>
    </div>
  `;
  
  // Crear la grilla del calendario
  createCalendarGrid(year, month);
  
  // Re-configurar event listeners después de recrear el HTML
  setupCalendarEventListeners();
}

function setupCalendarEventListeners() {
  // Remover listeners anteriores para evitar duplicados
  document.removeEventListener('click', handleCalendarClick);
  
  // Agregar nuevo listener
  document.addEventListener('click', handleCalendarClick);
}

function handleCalendarClick(e) {
  if (e.target.id === 'prevMonth' || e.target.closest('#prevMonth')) {
    navigateMonth(-1);
  } else if (e.target.id === 'nextMonth' || e.target.closest('#nextMonth')) {
    navigateMonth(1);
  } else if (e.target.classList.contains('calendar-day') && !e.target.classList.contains('empty')) {
    selectDate(e.target.dataset.date);
  }
}

// Función segura para navegación de meses
function navigateMonth(direction) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Crear nueva fecha siempre con día 1 para evitar problemas de desbordamiento
  currentDate = new Date(year, month + direction, 1);
  
  renderCalendar();
}

function createCalendarGrid(year, month) {
  const calendarGrid = document.getElementById('calendarGrid');
  if (!calendarGrid) return;
  
  const fragment = document.createDocumentFragment();
  
  // Headers de días
  const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  dayHeaders.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-day-header';
    header.textContent = day;
    fragment.appendChild(header);
  });
  
  // Días del mes
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Días vacíos al inicio
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    fragment.appendChild(emptyDay);
  }
  
  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = createDayElement(year, month, day);
    fragment.appendChild(dayElement);
  }
  
  calendarGrid.appendChild(fragment);
}

function createDayElement(year, month, day) {
  const dayElement = document.createElement('div');
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const today = new Date().toISOString().split('T')[0];
  
  dayElement.className = 'calendar-day';
  dayElement.textContent = day;
  dayElement.dataset.date = dateStr;
  
  // Marcar día actual
  if (dateStr === today) {
    dayElement.classList.add('today');
  }
  
  // Marcar día seleccionado
  if (dateStr === selectedDate) {
    dayElement.classList.add('selected');
  }
  
  // Verificar si hay eventos
  const events = getEventsForDate(dateStr);
  if (events.length > 0) {
    dayElement.classList.add('has-events');
    
    // Agregar indicador de eventos
    const eventIndicator = document.createElement('div');
    eventIndicator.className = 'event-indicator';
    eventIndicator.textContent = events.length;
    dayElement.appendChild(eventIndicator);
  }
  
  return dayElement;
}

function getEventsForDate(dateStr) {
  const events = [];
  
  // Obtener recordatorios del estado global
  if (state && state.reminders) {
    const dateReminders = state.reminders.filter(reminder => reminder.date === dateStr && !reminder.completed);
    events.push(...dateReminders.map(reminder => ({...reminder, type: 'reminder'})));
  }
  
  // Obtener eventos sincronizados (incluyendo exámenes)
  if (state && state.events) {
    const dateEvents = state.events.filter(event => event.date === dateStr);
    events.push(...dateEvents);
  }
  
  // Obtener exámenes directamente de subjects (solo si no están ya en events)
  if (state && state.subjects) {
    state.subjects.forEach(subject => {
      if (subject.exams) {
        const subjectExams = subject.exams.filter(exam => {
          const examEventId = `exam_${exam.id}`;
          const alreadyInEvents = state.events && state.events.some(e => e.id === examEventId);
          return exam.date === dateStr && !alreadyInEvents;
        });
        events.push(...subjectExams.map(exam => ({...exam, subject: subject.name, type: 'exam'})));
      }
    });
  }
  
  // Ordenar eventos por hora
  return events.sort((a, b) => {
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';
    return timeA.localeCompare(timeB);
  });
}

function selectDate(dateStr) {
  // Remover selección anterior
  const previousSelected = document.querySelector('.calendar-day.selected');
  if (previousSelected) {
    previousSelected.classList.remove('selected');
  }
  
  // Agregar nueva selección
  const newSelected = document.querySelector(`[data-date="${dateStr}"]`);
  if (newSelected) {
    newSelected.classList.add('selected');
  }
  
  selectedDate = dateStr;
  showDayEvents(dateStr);
}

function createDayEventsModal() {
  const modal = document.createElement('div');
  modal.id = 'dayEventsModal';
  modal.className = 'modal';
  
  modal.innerHTML = `
    <div class="modal-content day-events-modal">
      <div class="modal-header day-events-header">
        <div class="day-events-title-section">
          <h2 class="day-events-date"></h2>
          <p class="day-events-subtitle">Eventos del día</p>
        </div>
        <button class="modal-close-btn" onclick="closeModal('dayEventsModal')" aria-label="Cerrar">
          <span class="close-icon">×</span>
        </button>
      </div>
      <div class="modal-body day-events-body">
        <div class="day-events-list"></div>
        <div class="day-events-actions">
          <button class="btn-add-event-large" onclick="addEventToSelectedDay()">
            <span class="btn-plus-icon">+</span>
            <span class="btn-text">Agregar Evento</span>
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function showDayEvents(dateStr) {
  const events = getEventsForDate(dateStr);
  const modal = document.getElementById('dayEventsModal');
  
  if (!modal) {
    createDayEventsModal();
    return showDayEvents(dateStr);
  }
  
  const eventsList = modal.querySelector('.day-events-list');
  const dateTitle = modal.querySelector('.day-events-date');
  
  // Formatear fecha correctamente evitando problemas de zona horaria
  const dateParts = dateStr.split('-');
  const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
  const formattedDate = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  dateTitle.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  
  if (events.length === 0) {
    eventsList.innerHTML = `
      <div class="no-events-container">
        <p class="no-events-text">No hay eventos programados</p>
        <p class="no-events-subtitle">¡Agrega tu primer evento!</p>
      </div>
    `;
  } else {
    const eventsToShow = events.slice(0, 3);
    const hasMoreEvents = events.length > 3;
    
    eventsList.innerHTML = `
      <div class="events-count">
        <span class="count-badge">${events.length}</span>
        <span class="count-text">${events.length === 1 ? 'evento programado' : 'eventos programados'}</span>
      </div>
      <div class="events-container">
        ${eventsToShow.map(event => {
          const time = event.time || 'Todo el día';
          const icon = event.type === 'exam' ? '📝' : event.type === 'reminder' ? '⏰' : '📅';
          const subject = event.subject ? ` • ${event.subject}` : '';
          const priority = event.priority ? `priority-${event.priority}` : '';
          
          return `
            <div class="day-event-item ${event.type} ${priority}">
              <div class="event-icon-container">
                <span class="event-icon">${icon}</span>
              </div>
              <div class="event-details">
                <div class="event-header">
                  <h4 class="event-title">${event.name || event.title}${subject}</h4>
                  <span class="event-time">${time}</span>
                </div>
                ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                ${event.priority ? `<span class="event-priority ${event.priority}">${event.priority.toUpperCase()}</span>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ${hasMoreEvents ? `
        <div class="view-more-container">
          <button class="btn-view-more" onclick="viewAllEvents(); closeModal('dayEventsModal');">
            <span class="view-more-icon">👁️</span>
            <span class="view-more-text">Ver todos los eventos (${events.length})</span>
          </button>
        </div>
      ` : ''}
    `;
  }
  
  openModal('dayEventsModal');
}

function viewAllEvents() {
  // Scroll hacia la sección de todos los eventos
  const eventsSection = document.querySelector('.events-list-section');
  if (eventsSection) {
    eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Agregar un efecto visual temporal para destacar la sección
    eventsSection.style.transition = 'all 0.3s ease';
    eventsSection.style.transform = 'scale(1.02)';
    eventsSection.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
    
    setTimeout(() => {
      eventsSection.style.transform = 'scale(1)';
      eventsSection.style.boxShadow = '';
    }, 300);
  }
}

function goToToday() {
  const today = new Date();
  currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  selectedDate = today.toISOString().split('T')[0];
  renderCalendar();
}

function goToDate(dateStr) {
  const date = new Date(dateStr);
  currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
  selectedDate = dateStr;
  renderCalendar();
}

function updateCalendar() {
  renderCalendar();
}

function cleanupCalendar() {
  document.removeEventListener('click', handleCalendarClick);
}

// Limpiar al cerrar la página
window.addEventListener('beforeunload', cleanupCalendar);

// Funciones para sincronización de eventos
function addEventToCalendar(event) {
  // Esta función se llama cuando se agrega un examen desde subjects.js
  // El evento ya se guarda en state.events, solo necesitamos actualizar la vista
  updateCalendar();
}

function removeEventFromCalendar(eventId) {
  // Esta función se llama cuando se elimina un examen desde subjects.js
  // El evento ya se elimina de state.events, solo necesitamos actualizar la vista
  updateCalendar();
}


function addEventToSelectedDay() {
  if (!selectedDate) {
    alert('Por favor selecciona un día primero');
    return;
  }
  
  // Cerrar la modal de eventos del día
  closeModal('dayEventsModal');
  
  // Abrir la modal de recordatorios con la fecha preseleccionada
  openModal('reminderModal');
  
  // Preseleccionar la fecha y hora en los campos separados
  const dateInput = document.querySelector('#reminderModal #reminderDate');
  const timeInput = document.querySelector('#reminderModal #reminderTime');
  
  if (dateInput) {
    dateInput.value = selectedDate;
  }
  
  if (timeInput) {
    timeInput.value = '09:00';
  }
}