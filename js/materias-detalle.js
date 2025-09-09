// GESTIÓN DE MATERIAS - PÁGINA DE DETALLES
// Este archivo maneja la visualización de TODAS las materias

// Función específica para renderizar todas las materias en la página de detalles
function renderAllSubjects() {
  const container = document.getElementById('materiasContainer');
  const emptyState = document.getElementById('empty-state');
  
  if (!container) return;

  // Verificar que state.subjects esté definido
  if (
    !state.subjects ||
    !Array.isArray(state.subjects) ||
    state.subjects.length === 0
  ) {
    container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  // Ocultar empty state y mostrar container
  if (emptyState) emptyState.style.display = 'none';
  container.style.display = 'grid';

  // Usar DocumentFragment para mejor rendimiento
  const fragment = document.createDocumentFragment();

  // Mostrar TODAS las materias (sin límite)
  state.subjects.forEach((subject) => {
    const subjectCard = document.createElement("div");
    subjectCard.className = "subject-card";
    subjectCard.style.borderLeft = `4px solid ${subject.color}`;
    subjectCard.setAttribute('data-subject-id', subject.id);
    subjectCard.setAttribute('data-favorite', subject.isFavorite ? 'true' : 'false');

    subjectCard.innerHTML = `
      <div class="subject-header">
        <div class="subject-title-section">
          <h3>${subject.name}</h3>
          <button class="btn-favorite ${
            subject.isFavorite ? "favorite-active" : "favorite-inactive"
          }" 
                  onclick="toggleFavoriteSubject('${subject.id}')" 
                  title="${
                    subject.isFavorite
                      ? "Quitar de favoritos"
                      : "Agregar a favoritos"
                  }">
            ${subject.isFavorite ? "⭐" : "☆"}
          </button>
        </div>
        <div class="subject-actions">
          <button onclick="viewSubjectDetails('${
            subject.id
          }')" class="btn-view-details">
            👁️ Ver Detalles
          </button>
          <button onclick="editSubject('${
            subject.id
          }')" class="btn-edit">✏️</button>
          <button onclick="deleteSubject('${
            subject.id
          }')" class="btn-delete">🗑️</button>
        </div>
      </div>
      <div class="subject-info">
        <p><strong>Profesor:</strong> ${
          subject.professor || "No especificado"
        }</p>
        <p><strong>Horario:</strong> ${
          subject.schedule || "No especificado"
        }</p>
        <div class="subject-stats">
          <span class="stat-item">
            <span class="stat-label">Sesiones:</span>
            <span class="stat-value">${subject.sessions?.length || 0}</span>
          </span>
          <span class="stat-item">
            <span class="stat-label">Tiempo total:</span>
            <span class="stat-value">${formatTotalTime(subject.totalTime || 0)}</span>
          </span>
        </div>
      </div>
    `;

    fragment.appendChild(subjectCard);
  });

  // Una sola operación DOM
  container.innerHTML = "";
  container.appendChild(fragment);
}

// Función para formatear el tiempo total
function formatTotalTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

// Función de filtrado
function filterSubjects(filterType) {
  const cards = document.querySelectorAll('.subject-card');
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  // Actualizar botones activos
  filterButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');
  
  cards.forEach(card => {
    const isFavorite = card.getAttribute('data-favorite') === 'true';
    let shouldShow = true;
    
    switch(filterType) {
      case 'favorites':
        shouldShow = isFavorite;
        break;
      case 'active':
        // Aquí podrías agregar lógica para materias activas
        shouldShow = true;
        break;
      case 'all':
      default:
        shouldShow = true;
        break;
    }
    
    card.style.display = shouldShow ? 'block' : 'none';
  });
}

// Función de búsqueda
function searchSubjects(searchTerm) {
  const cards = document.querySelectorAll('.subject-card');
  const term = searchTerm.toLowerCase();
  
  cards.forEach(card => {
    const subjectName = card.querySelector('h3').textContent.toLowerCase();
    const professor = card.querySelector('.subject-info p').textContent.toLowerCase();
    
    const matches = subjectName.includes(term) || professor.includes(term);
    card.style.display = matches ? 'block' : 'none';
  });
}

// Función para cambiar vista (grid/list)
function changeView(viewType) {
  const container = document.getElementById('materiasContainer');
  const viewButtons = document.querySelectorAll('.view-btn');
  
  // Actualizar botones activos
  viewButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-view="${viewType}"]`).classList.add('active');
  
  // Cambiar clase del container
  container.className = viewType === 'list' ? 'subjects-list' : 'subjects-grid';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Renderizar todas las materias al cargar la página
  if (typeof state !== 'undefined' && state.subjects) {
    renderAllSubjects();
  }
  
  // Filtros
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterSubjects(e.target.getAttribute('data-filter'));
    });
  });
  
  // Búsqueda
  const searchInput = document.getElementById('searchSubjects');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchSubjects(e.target.value);
    });
  }
  
  // Vista
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      changeView(e.target.getAttribute('data-view'));
    });
  });
});

// Sobrescribir la función renderSubjects para esta página
if (typeof renderSubjects !== 'undefined') {
  // Guardar la función original
  window.originalRenderSubjects = renderSubjects;
  // Reemplazar con nuestra función
  window.renderSubjects = renderAllSubjects;
}