// GESTIÓN DE MATERIAS

/* createExpandedSubject eliminada - ya existe en core.js */

/* migrateSubjectsToExpandedFormat eliminada - ya existe en core.js */

// CACHÉ DE ELEMENTOS DOM PARA OPTIMIZACIÓN
const domCache = {
  subjectsList: null,
  subjectName: null,
  subjectProfessor: null,
  subjectSchedule: null,
  subjectColor: null,

  // Función para obtener elementos con caché
  get(id) {
    if (!this[id]) {
      this[id] = document.getElementById(id);
    }
    return this[id];
  },

  // Limpiar caché si es necesario
  clear() {
    Object.keys(this).forEach((key) => {
      if (typeof this[key] !== "function") {
        this[key] = null;
      }
    });
  },
};

function renderSubjects() {
  const container = domCache.get("subjectsList");
  if (!container) return;

  // Verificar que state.subjects esté definido
  if (
    !state.subjects ||
    !Array.isArray(state.subjects) ||
    state.subjects.length === 0
  ) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No hay materias registradas</h3>
        <p>Ve a la sección de Materias para agregar tu primera materia</p>
      </div>
    `;
    return;
  }

  // Filtrar solo las 3 materias favoritas
  const favoriteSubjects = state.subjects
    .filter((subject) => subject.isFavorite)
    .slice(0, 3);

  // Si no hay materias favoritas, mostrar las primeras 3
  const subjectsToShow =
    favoriteSubjects.length > 0 ? favoriteSubjects : state.subjects.slice(0, 3);

  // Usar DocumentFragment para mejor rendimiento
  const fragment = document.createDocumentFragment();

  subjectsToShow.forEach((subject) => {
    const subjectCard = document.createElement("div");
    subjectCard.className = "subject-card";
    subjectCard.style.setProperty(
      "--subject-color",
      subject.color || "#667eea"
    );

    subjectCard.innerHTML = `
      <div class="subject-header">
        <div class="subject-title-section">
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
          <h3>${subject.name}</h3>
        </div>
        <div class="subject-actions">
          <button onclick="viewSubjectDetails('${
            subject.id
          }')" class="btn-view-details">
            👁️ Ver Detalles
          </button>
        </div>
      </div>
      <div class="subject-info">
        <p><strong>Profesor:</strong> ${
          subject.professor || "No especificado"
        }</p>
        <p><strong>Horario:</strong> ${
          subject.schedule || "No especificado"
        }</p>
      </div>
    `;

    fragment.appendChild(subjectCard);
  });

  // Agregar botón "Ver más" si hay más materias
  if (state.subjects.length > 3) {
    const viewMoreCard = document.createElement("div");
    viewMoreCard.className = "view-more-card";
    viewMoreCard.innerHTML = `
      <button onclick="window.location.href='materias.html'" class="btn-view-more">
        <span class="view-more-icon">📚</span>
        <span class="view-more-text">Ver todas las materias</span>
        <span class="view-more-count">(${state.subjects.length})</span>
      </button>
    `;
    fragment.appendChild(viewMoreCard);
  }

  // Una sola operación DOM
  container.innerHTML = "";
  container.appendChild(fragment);
}

function addSubject() {
  const name = domCache.get("subjectName").value.trim();
  const professor = domCache.get("subjectProfessor").value.trim();
  const schedule = domCache.get("subjectSchedule").value.trim();
  const color = domCache.get("subjectColor").value;

  if (!name) {
    showNotification("El nombre de la materia es obligatorio", "error");
    return;
  }

  const newSubject = createExpandedSubject({
    name,
    professor,
    schedule,
    color,
  });

  state.subjects.push(newSubject);
  saveData();
  closeModal("subjectModal");
  resetSubjectForm();
  renderAll();

  // Mostrar notificación de éxito
  showNotification(`Materia "${name}" agregada exitosamente`, "success");
}

function resetSubjectForm() {
  const form = document.getElementById("subjectForm");
  if (form) {
    form.reset();
    // Resetear color seleccionado
    document.getElementById("subjectColor").value = "#667eea";
    // Resetear selección visual de color
    document.querySelectorAll(".color-option").forEach((option) => {
      option.classList.remove("selected");
    });
    const firstColor = document.querySelector(
      '.color-option[data-color="#667eea"]'
    );
    if (firstColor) {
      firstColor.classList.add("selected");
    }
  }
}

function showNotification(message, type = "info") {
  // Crear elemento de notificación
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${
        type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"
      }</span>
      <span class="notification-message">${message}</span>
    </div>
  `;

  // Estilos inline para la notificación
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${
      type === "success"
        ? "var(--subject-gradient-4)"
        : type === "error"
        ? "var(--subject-gradient-2)"
        : "var(--subject-gradient-1)"
    };
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 16px;
    box-shadow: var(--subject-shadow-lg);
    z-index: 10001;
    font-weight: 600;
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    max-width: 400px;
  `;

  notification.querySelector(".notification-content").style.cssText = `
    display: flex;
    align-items: center;
    gap: 0.75rem;
  `;

  notification.querySelector(".notification-icon").style.cssText = `
    font-size: 1.2rem;
  `;

  document.body.appendChild(notification);

  // Animar entrada
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Remover después de 4 segundos
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 400);
  }, 4000);
}

function deleteSubject(subjectId) {
  const subject = state.subjects.find((s) => s.id === subjectId);
  if (!subject) return;

  // Crear modal de confirmación personalizada
  const confirmModal = document.createElement("div");
  confirmModal.className = "modal show";
  confirmModal.style.zIndex = "10002";
  confirmModal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <div class="modal-header" style="background: var(--subject-gradient-2); color: white;">
        <h2>⚠️ Confirmar Eliminación</h2>
      </div>
      <div style="padding: 1.5rem;">
        <p style="margin-bottom: 1rem; color: var(--text-primary); font-size: 1rem;">
          ¿Estás seguro de que quieres eliminar la materia <strong>"${subject.name}"</strong>?
        </p>
        <p style="margin-bottom: 1.5rem; color: var(--text-secondary); font-size: 0.9rem;">
          Esta acción no se puede deshacer. Se eliminarán todos los datos asociados.
        </p>
        <div class="form-actions">
          <button type="button" class="btn-cancel" onclick="closeDeleteConfirmation()">
            Cancelar
          </button>
          <button type="button" class="btn-danger" onclick="confirmDeleteSubject('${subjectId}')" 
                  style="background: var(--subject-gradient-2); color: white; border: none;">
            Eliminar Materia
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(confirmModal);
  document.body.style.overflow = "hidden";

  // Funciones globales para el modal de confirmación
  window.closeDeleteConfirmation = function () {
    document.body.removeChild(confirmModal);
    document.body.style.overflow = "";
  };

  window.confirmDeleteSubject = function (id) {
    // Realizar la eliminación
    const subjectToDelete = state.subjects.find((s) => s.id === id);
    state.subjects = state.subjects.filter((s) => s.id !== id);

    // Cerrar modal si está abierto para esta materia
    if (
      typeof currentSubjectModalId !== "undefined" &&
      currentSubjectModalId === id
    ) {
      closeModal("subjectDetailsModal");
      currentSubjectModalId = null;
    }

    saveData();
    renderAll();

    // Mostrar notificación de éxito
    showNotification(
      `Materia "${subjectToDelete.name}" eliminada exitosamente`,
      "success"
    );

    // Cerrar modal de confirmación
    closeDeleteConfirmation();
  };
}

function editSubject(subjectId) {
  const subject = state.subjects.find((s) => s.id === subjectId);
  if (!subject) return;

  // Llenar el formulario con los datos actuales
  document.getElementById("subjectName").value = subject.name;
  document.getElementById("subjectProfessor").value = subject.professor || "";
  document.getElementById("subjectSchedule").value = subject.schedule || "";
  document.getElementById("subjectColor").value = subject.color;

  // Cambiar el comportamiento del botón de guardar
  const saveBtn = document.querySelector("#subjectModal .btn-confirm");
  saveBtn.onclick = () => {
    const name = document.getElementById("subjectName").value.trim();
    const professor = document.getElementById("subjectProfessor").value.trim();
    const schedule = document.getElementById("subjectSchedule").value.trim();
    const color = document.getElementById("subjectColor").value;

    if (!name) {
      alert("El nombre de la materia es obligatorio");
      return;
    }

    // Actualizar la materia
    const subjectIndex = state.subjects.findIndex((s) => s.id === subjectId);
    if (subjectIndex !== -1) {
      state.subjects[subjectIndex] = {
        ...state.subjects[subjectIndex],
        name,
        professor,
        schedule,
        color,
      };

      saveData();
      closeModal("subjectModal");
      renderAll(); // Agregar esta línea

      // Restaurar el comportamiento original del botón
      saveBtn.onclick = addSubject;
    }
  };

  openModal("subjectModal");
}

// Modal function removed - now using direct navigation to materia-detalle.html

// Modal content loading function removed - now using materia-detalle.html

// Progress calculation function removed - now handled in materia-detalle.html

// Modal event listeners function removed - now handled in materia-detalle.html

// Exam editing function removed - now handled in materia-detalle.html

// Exam deletion function removed - now handled in materia-detalle.html

// Función para sincronizar examen con eventos y calendario
function syncExamToEvents(subject, exam) {
  // Crear evento para la sección "Todos los eventos"
  const eventId = `exam_${exam.id}`;

  // Eliminar evento existente si existe
  if (state.events) {
    state.events = state.events.filter((e) => e.id !== eventId);
  } else {
    state.events = [];
  }

  // Agregar nuevo evento
  state.events.push({
    id: eventId,
    title: `${exam.type}: ${exam.name}`,
    date: exam.date,
    type: "exam",
    subject: subject.name,
    details: exam.topics,
    color: subject.color || "#3498db",
  });

  // Sincronizar con calendario
  if (typeof addEventToCalendar === "function") {
    addEventToCalendar({
      id: eventId,
      title: `${exam.type}: ${exam.name}`,
      date: exam.date,
      type: "exam",
      subject: subject.name,
    });
  }

  saveData();
}

// Función para eliminar examen de eventos y calendario
function removeExamFromEvents(examId) {
  const eventId = `exam_${examId}`;

  // Eliminar de eventos
  if (state.events) {
    state.events = state.events.filter((e) => e.id !== eventId);
  }

  // Eliminar del calendario
  if (typeof removeEventFromCalendar === "function") {
    removeEventFromCalendar(eventId);
  }

  saveData();
}

// ========================================
// SISTEMA DE FAVORITOS
// ========================================

function toggleFavoriteSubject(subjectId) {
  const subjectIndex = state.subjects.findIndex((s) => s.id === subjectId);
  if (subjectIndex !== -1) {
    state.subjects[subjectIndex].isFavorite =
      !state.subjects[subjectIndex].isFavorite;
    saveData();
    renderAll();
  }
}

function getFavoriteSubjects() {
  return state.subjects.filter((subject) => subject.isFavorite);
}

function renderFavoriteSubjects() {
  const container = domCache.get("subjectsList");
  if (!container) return;

  const favoriteSubjects = getFavoriteSubjects();
  let subjectsToShow = favoriteSubjects;

  // Si hay menos de 3 favoritas, completar con las más recientes
  if (favoriteSubjects.length < 3) {
    const nonFavorites = state.subjects.filter((s) => !s.isFavorite);
    const additionalSubjects = nonFavorites.slice(
      0,
      3 - favoriteSubjects.length
    );
    subjectsToShow = [...favoriteSubjects, ...additionalSubjects];
  } else {
    // Mostrar solo las primeras 3 favoritas
    subjectsToShow = favoriteSubjects.slice(0, 3);
  }

  if (subjectsToShow.length === 0) {
    container.innerHTML =
      '<p class="empty-state">No hay materias registradas</p>';
    return;
  }

  // Usar DocumentFragment para mejor rendimiento
  const fragment = document.createDocumentFragment();

  subjectsToShow.forEach((subject) => {
    const subjectCard = document.createElement("div");
    subjectCard.className = "subject-card";
    subjectCard.style.borderLeft = `4px solid ${subject.color}`;

    const favoriteIcon = subject.isFavorite ? "⭐" : "☆";
    const favoriteClass = subject.isFavorite
      ? "favorite-active"
      : "favorite-inactive";

    subjectCard.innerHTML = `
      <div class="subject-header">
        <div class="subject-title-section">
          <button onclick="toggleFavoriteSubject('${
            subject.id
          }')" class="btn-favorite ${favoriteClass}" title="${
      subject.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
    }">
            ${favoriteIcon}
          </button>
          <h3>${subject.name}</h3>
        </div>
        <div class="subject-actions">
          <button onclick="viewSubjectDetails('${
            subject.id
          }')" class="btn-subject-details">
          📋 Ver Detalles
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
      </div>
    `;

    fragment.appendChild(subjectCard);
  });

  // Agregar botón "Ver más" si hay más de 3 materias
  if (state.subjects.length > 3) {
    const viewMoreCard = document.createElement("div");
    viewMoreCard.className = "view-more-card";
    viewMoreCard.innerHTML = `
      <button onclick="window.location.href='materias.html'" class="btn-view-more">
        <span class="view-more-icon">📚</span>
        <span class="view-more-text">Ver todas las materias</span>
        <span class="view-more-count">(${state.subjects.length})</span>
      </button>
    `;
    fragment.appendChild(viewMoreCard);
  }

  // Una sola operación DOM
  container.innerHTML = "";
  container.appendChild(fragment);
}

// Función para navegar a los detalles de una materia
function viewSubjectDetails(subjectId) {
  window.location.href = `materia-detalle.html?id=${subjectId}`;
}

// Exportar funciones al objeto window
window.toggleFavoriteSubject = toggleFavoriteSubject;
window.getFavoriteSubjects = getFavoriteSubjects;
window.renderFavoriteSubjects = renderFavoriteSubjects;
window.viewSubjectDetails = viewSubjectDetails;

// ========================================
// FUNCIONALIDAD DE SELECCIÓN DE COLORES
// ========================================

function initializeColorPicker() {
  const colorOptions = document.querySelectorAll(".color-option");
  const colorInput = document.getElementById("subjectColor");

  colorOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remover selección anterior
      colorOptions.forEach((opt) => opt.classList.remove("selected"));

      // Agregar selección actual
      this.classList.add("selected");

      // Actualizar valor del input hidden
      if (colorInput) {
        colorInput.value = this.dataset.color;
      }
    });
  });
}

// ========================================
// INICIALIZACIÓN DE EVENTOS
// ========================================

function initializeSubjectModalEvents() {
  // Inicializar selector de colores
  initializeColorPicker();

  // Evento para el formulario
  const subjectForm = document.getElementById("subjectForm");
  if (subjectForm) {
    subjectForm.addEventListener("submit", function (e) {
      e.preventDefault();
      addSubject();
    });
  }

  // Manejar tecla Escape para cerrar modal
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const modal = document.getElementById("subjectModal");
      if (modal && modal.classList.contains("show")) {
        closeModal("subjectModal");
      }
    }
  });
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(initializeSubjectModalEvents, 100);
});

// ========================================
// MEJORAS EN LA RENDERIZACIÓN DE MATERIAS
// ========================================

function renderSubjectsWithProfessionalStyles() {
  const container = domCache.get("subjectsList");
  if (!container) return;

  // Verificar que state.subjects esté definido
  if (
    !state.subjects ||
    !Array.isArray(state.subjects) ||
    state.subjects.length === 0
  ) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>No hay materias registradas</h3>
        <p>Comienza agregando tu primera materia para organizar tus estudios</p>
        <button onclick="openModal('subjectModal')" class="btn-primary">Agregar Primera Materia</button>
      </div>
    `;
    return;
  }

  // Usar DocumentFragment para mejor rendimiento
  const fragment = document.createDocumentFragment();

  state.subjects.forEach((subject, index) => {
    const subjectCard = document.createElement("div");
    subjectCard.className = "subject-card-detailed";
    subjectCard.style.setProperty(
      "--subject-color",
      subject.color || "#667eea"
    );
    subjectCard.style.animationDelay = `${index * 0.1}s`;

    const examsCount =
      subject.exams && Array.isArray(subject.exams) ? subject.exams.length : 0;
    const materialsCount =
      subject.materials && Array.isArray(subject.materials)
        ? subject.materials.length
        : 0;
    const notesCount =
      subject.notes && Array.isArray(subject.notes) ? subject.notes.length : 0;
    const progress = subject.progress || 0;

    subjectCard.innerHTML = `
      <div class="subject-header">
        <div class="subject-title-section">
          <h3 class="subject-name">${escapeHtml(
            subject.name || "Sin nombre"
          )}</h3>
          <p class="subject-professor">${escapeHtml(
            subject.professor || "Sin profesor"
          )}</p>
        </div>
        <div class="subject-actions">
          <button class="btn-view-details" onclick="viewSubjectDetails('${
            subject.id
          }')" title="Ver detalles">
            👁️
          </button>
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
          <button class="btn-edit" onclick="editSubject('${
            subject.id
          }')" title="Editar materia">
            ✏️
          </button>
          <button class="btn-delete" onclick="deleteSubject('${
            subject.id
          }')" title="Eliminar materia">
            🗑️
          </button>
        </div>
      </div>
      
      <div class="subject-info-grid">
        <div class="info-item">
          <span class="info-icon">📅</span>
          <span>${escapeHtml(subject.schedule || "Sin horario")}</span>
        </div>
        <div class="info-item">
          <span class="info-icon">📊</span>
          <span>Progreso: ${progress}%</span>
        </div>
      </div>
      
      <div class="subject-stats">
        <div class="stat-item">
          <span class="stat-number">${examsCount}</span>
          <span class="stat-label">Exámenes</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${materialsCount}</span>
          <span class="stat-label">Materiales</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${notesCount}</span>
          <span class="stat-label">Notas</span>
        </div>
      </div>
      
      <div class="subject-footer">
        <button class="btn-view-details" onclick="viewSubjectDetails('${
          subject.id
        }')">
          Ver Detalles Completos
        </button>
      </div>
    `;

    fragment.appendChild(subjectCard);
  });

  // Una sola operación DOM
  container.innerHTML = "";
  container.appendChild(fragment);
}

// Función auxiliar para escapar HTML
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Sobrescribir la función de renderizado original
window.renderSubjects = renderSubjectsWithProfessionalStyles;

// ========================================
// EXPORTAR FUNCIONES GLOBALES
// ========================================

window.initializeColorPicker = initializeColorPicker;
window.initializeSubjectModalEvents = initializeSubjectModalEvents;
window.showNotification = showNotification;
window.resetSubjectForm = resetSubjectForm;
// ========================================
// FUNCIONALIDAD DE BÚSQUEDA MEJORADA
// ========================================

function initializeSearch() {
  const searchInput = document.getElementById("searchSubjects");
  if (!searchInput) return;

  let searchTimeout;

  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    // Debounce para mejorar rendimiento
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filterSubjectsBySearch(searchTerm);
    }, 300);
  });

  // Limpiar búsqueda con Escape
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      e.target.value = "";
      filterSubjectsBySearch("");
    }
  });
}

function filterSubjectsBySearch(searchTerm) {
  const container =
    document.getElementById("subjectsList") || domCache.get("subjectsList");
  if (!container) return;

  if (!searchTerm) {
    // Si no hay término de búsqueda, mostrar todas las materias
    renderSubjectsWithProfessionalStyles();
    return;
  }

  // Filtrar materias por término de búsqueda
  const filteredSubjects = state.subjects.filter((subject) => {
    if (!subject) return false;

    const searchFields = [
      subject.name || "",
      subject.professor || "",
      subject.schedule || "",
      subject.description || "",
    ]
      .join(" ")
      .toLowerCase();

    return searchFields.includes(searchTerm);
  });

  // Renderizar materias filtradas
  renderFilteredSubjects(filteredSubjects, searchTerm);
}

function renderFilteredSubjects(subjects, searchTerm = "") {
  const container =
    document.getElementById("subjectsList") || domCache.get("subjectsList");
  if (!container) return;

  if (subjects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No se encontraron materias</h3>
        <p>No hay materias que coincidan con "${searchTerm}"</p>
        <button onclick="clearSearch()" class="btn-primary">Limpiar Búsqueda</button>
      </div>
    `;
    return;
  }

  // Usar DocumentFragment para mejor rendimiento
  const fragment = document.createDocumentFragment();

  subjects.forEach((subject, index) => {
    const subjectCard = document.createElement("div");
    subjectCard.className = "subject-card-detailed";
    subjectCard.style.setProperty(
      "--subject-color",
      subject.color || "#667eea"
    );
    subjectCard.style.animationDelay = `${index * 0.1}s`;

    const examsCount =
      subject.exams && Array.isArray(subject.exams) ? subject.exams.length : 0;
    const materialsCount =
      subject.materials && Array.isArray(subject.materials)
        ? subject.materials.length
        : 0;
    const notesCount =
      subject.notes && Array.isArray(subject.notes) ? subject.notes.length : 0;
    const progress = subject.progress || 0;

    // Resaltar términos de búsqueda
    const highlightedName = highlightSearchTerm(
      subject.name || "Sin nombre",
      searchTerm
    );
    const highlightedProfessor = highlightSearchTerm(
      subject.professor || "Sin profesor",
      searchTerm
    );
    const highlightedSchedule = highlightSearchTerm(
      subject.schedule || "Sin horario",
      searchTerm
    );

    subjectCard.innerHTML = `
      <div class="subject-header">
        <div class="subject-title-section">
          <h3 class="subject-name">${highlightedName}</h3>
          <p class="subject-professor">${highlightedProfessor}</p>
        </div>
        <div class="subject-actions">
          <button class="btn-view-details" onclick="viewSubjectDetails('${
            subject.id
          }')" title="Ver detalles">
            👁️
          </button>
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
          <button class="btn-edit" onclick="editSubject('${
            subject.id
          }')" title="Editar materia">
            ✏️
          </button>
          <button class="btn-delete" onclick="deleteSubject('${
            subject.id
          }')" title="Eliminar materia">
            🗑️
          </button>
        </div>
      </div>
      
      <div class="subject-info-grid">
        <div class="info-item">
          <span class="info-icon">📅</span>
          <span>${highlightedSchedule}</span>
        </div>
        <div class="info-item">
          <span class="info-icon">📊</span>
          <span>Progreso: ${progress}%</span>
        </div>
      </div>
      
      <div class="subject-stats">
        <div class="stat-item">
          <span class="stat-number">${examsCount}</span>
          <span class="stat-label">Exámenes</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${materialsCount}</span>
          <span class="stat-label">Materiales</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${notesCount}</span>
          <span class="stat-label">Notas</span>
        </div>
      </div>
      
      <div class="subject-footer">
        <button class="btn-view-details" onclick="viewSubjectDetails('${
          subject.id
        }')">
          Ver Detalles Completos
        </button>
      </div>
    `;

    fragment.appendChild(subjectCard);
  });

  // Una sola operación DOM
  container.innerHTML = "";
  container.appendChild(fragment);
}

function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, "gi");
  return text.replace(
    regex,
    '<mark style="background: var(--subject-gradient-4); color: white; padding: 2px 4px; border-radius: 4px; font-weight: 600;">$1</mark>'
  );
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clearSearch() {
  const searchInput = document.getElementById("searchSubjects");
  if (searchInput) {
    searchInput.value = "";
    filterSubjectsBySearch("");
  }
}

// ========================================
// INICIALIZACIÓN MEJORADA
// ========================================

// Actualizar la inicialización existente
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    initializeSubjectModalEvents();
    initializeSearch(); // Agregar inicialización de búsqueda
  }, 100);
});

// Exportar funciones globales
window.initializeSearch = initializeSearch;
window.filterSubjectsBySearch = filterSubjectsBySearch;
window.clearSearch = clearSearch;
