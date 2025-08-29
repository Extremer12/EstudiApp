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
  
  // Obtener recordatorios
  const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
  const dateReminders = reminders.filter(reminder => reminder.date === dateStr);
  events.push(...dateReminders);
  
  // Obtener exámenes
  const subjects = JSON.parse(localStorage.getItem('subjects') || '[]');
  subjects.forEach(subject => {
    if (subject.exams) {
      const subjectExams = subject.exams.filter(exam => exam.date === dateStr);
      events.push(...subjectExams.map(exam => ({...exam, subject: subject.name, type: 'exam'})));
    }
  });
  
  return events;
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
    eventsList.innerHTML = `
      <div class="events-count">
        <span class="count-badge">${events.length}</span>
        <span class="count-text">${events.length === 1 ? 'evento programado' : 'eventos programados'}</span>
      </div>
      <div class="events-container">
        ${events.map(event => {
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
    `;
  }
  
  openModal('dayEventsModal');
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


function addEventToSelectedDay() {
  if (!selectedDate) {
    alert('Por favor selecciona un día primero');
    return;
  }
  
  // Cerrar la modal de eventos del día
  closeModal('dayEventsModal');
  
  // Abrir la modal de recordatorios con la fecha preseleccionada
  openModal('reminderModal');
  
  // Preseleccionar solo la fecha, manteniendo el campo de hora vacío
  const datetimeInput = document.querySelector('#reminderModal #reminderDatetime');
  if (datetimeInput) {
    // Establecer solo la fecha, sin hora específica
    datetimeInput.value = selectedDate + 'T09:00';
  }
}