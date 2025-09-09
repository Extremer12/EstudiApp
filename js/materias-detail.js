/* ========================================
   PÁGINA DE MATERIAS DETALLADA
======================================== */

// Estado de la página
let currentFilter = 'all';
let currentView = 'grid';
let searchTerm = '';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeMateriasPage();
});

function initializeMateriasPage() {
    // Asegurar que el estado esté cargado
    if (!window.state) {
        window.state = window.loadData ? window.loadData() : { subjects: [] };
    }
    
    // Verificar que state.subjects esté definido
    if (!window.state.subjects || !Array.isArray(window.state.subjects)) {
        window.state.subjects = [];
    }
    
    setupEventListeners();
    
    // Usar setTimeout para evitar problemas de timing
    setTimeout(() => {
        renderAllSubjects();
        updateSubjectCount();
    }, 50);
}

function setupEventListeners() {
    // Búsqueda
    const searchInput = document.getElementById('searchSubjects');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Filtros
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });
    
    // Vista
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', handleViewChange);
    });
}

function handleSearch(event) {
    searchTerm = event.target.value.toLowerCase().trim();
    
    // Debounce para mejorar rendimiento
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        renderFilteredSubjects();
        updateSubjectCount();
    }, 300);
}

function handleFilterChange(event) {
    // Remover clase active de todos los botones
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Agregar clase active al botón clickeado
    event.target.classList.add('active');
    
    currentFilter = event.target.dataset.filter;
    renderFilteredSubjects();
}

function handleViewChange(event) {
    // Remover clase active de todos los botones
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Agregar clase active al botón clickeado
    event.target.classList.add('active');
    
    currentView = event.target.dataset.view;
    updateViewLayout();
}

function updateViewLayout() {
    const container = document.getElementById('materiasContainer');
    if (!container) return;
    
    if (currentView === 'grid') {
        container.className = 'subjects-grid';
    } else {
        container.className = 'subjects-list';
    }
    
    renderFilteredSubjects();
}

function renderAllSubjects() {
    renderFilteredSubjects();
}

function getSafeSubjects() {
    if (!window.state) return [];
    if (!window.state.subjects) return [];
    if (!Array.isArray(window.state.subjects)) return [];
    return window.state.subjects;
}

function renderFilteredSubjects() {
    const subjects = getSafeSubjects();
    
    // Verificar que subjects sea un array válido
    if (!Array.isArray(subjects) || subjects.length === 0) {
        console.warn('subjects no es un array válido o está vacío:', subjects);
        renderSubjects([]);
        updateFilteredCount(0);
        return;
    }
    
    // Verificación adicional antes de usar filter
    if (!subjects || typeof subjects.filter !== 'function') {
        console.error('subjects no tiene método filter:', subjects);
        renderSubjects([]);
        updateFilteredCount(0);
        return;
    }
    
    let filteredSubjects = subjects.filter(subject => {
        if (!subject) return false;
        
        // Filtro por búsqueda mejorado - busca en múltiples campos
        const matchesSearch = !searchTerm || 
            (subject.name && subject.name.toLowerCase().includes(searchTerm)) ||
            (subject.professor && subject.professor.toLowerCase().includes(searchTerm)) ||
            (subject.schedule && subject.schedule.toLowerCase().includes(searchTerm)) ||
            (subject.description && subject.description.toLowerCase().includes(searchTerm));
        
        // Filtro por categoría
        let matchesFilter = true;
        switch (currentFilter) {
            case 'favorites':
                matchesFilter = subject.isFavorite === true;
                break;
            case 'active':
                matchesFilter = (subject.progress || 0) < 100;
                break;
            case 'completed':
                matchesFilter = (subject.progress || 0) >= 100;
                break;
            case 'recent':
                // Materias modificadas en los últimos 7 días
                const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                matchesFilter = (subject.lastModified || subject.createdAt || 0) > weekAgo;
                break;
            case 'all':
            default:
                matchesFilter = true;
                break;
        }
        
        return matchesSearch && matchesFilter;
    });
    
    // Ordenar resultados por relevancia
    if (searchTerm) {
        filteredSubjects.sort((a, b) => {
            const aNameMatch = a.name && a.name.toLowerCase().includes(searchTerm);
            const bNameMatch = b.name && b.name.toLowerCase().includes(searchTerm);
            
            // Priorizar coincidencias en el nombre
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            
            // Luego por favoritos
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            
            return 0;
        });
    }
    
    renderSubjects(filteredSubjects);
    updateFilteredCount(Array.isArray(filteredSubjects) ? filteredSubjects.length : 0);
}

function renderSubjects(subjects) {
    const container = document.getElementById('materiasContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (!container) return;
    
    // Verificar que subjects sea un array válido
    const safeSubjects = Array.isArray(subjects) ? subjects : [];
    const subjectsCount = safeSubjects.length;
    
    if (subjectsCount === 0) {
        container.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = currentView === 'grid' ? 'grid' : 'flex';
    if (emptyState) emptyState.style.display = 'none';
    
    const fragment = document.createDocumentFragment();
    
    safeSubjects.forEach(subject => {
        if (!subject) return;
        const subjectElement = currentView === 'grid' 
            ? createSubjectCardDetailed(subject)
            : createSubjectCardList(subject);
        if (subjectElement) {
            fragment.appendChild(subjectElement);
        }
    });
    
    container.innerHTML = '';
    container.appendChild(fragment);
}

function createSubjectCardDetailed(subject) {
    if (!subject) return null;
    
    const card = document.createElement('div');
    card.className = 'subject-card-detailed';
    card.style.setProperty('--subject-color', subject.color || '#FF6B6B');
    
    const examsCount = getArrayLength(subject && subject.exams ? subject.exams : []);
    const materialsCount = getArrayLength(subject && subject.materials ? subject.materials : []);
    const notesCount = getArrayLength(subject && subject.notes ? subject.notes : []);
    const progress = subject.progress || 0;
    
    card.innerHTML = `
        <div class="subject-header">
            <div class="subject-title-section">
                <h3 class="subject-name">${escapeHtml(subject.name || 'Sin nombre')}</h3>
                <p class="subject-professor">${escapeHtml(subject.professor || 'Sin profesor')}</p>
            </div>
            <div class="subject-actions">
                <button class="btn-view-details" onclick="viewSubjectDetails('${subject.id}')" title="Ver detalles">
                    👁️
                </button>
                <button class="btn-favorite ${subject.isFavorite ? 'favorite-active' : 'favorite-inactive'}" 
                        onclick="toggleFavoriteSubject('${subject.id}')" 
                        title="${subject.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                    ${subject.isFavorite ? '⭐' : '☆'}
                </button>
                <button class="btn-edit" onclick="editSubject('${subject.id}')" title="Editar materia">
                    ✏️
                </button>
                <button class="btn-delete" onclick="deleteSubject('${subject.id}')" title="Eliminar materia">
                    🗑️
                </button>
            </div>
        </div>
        
        <div class="subject-info-grid">
            <div class="info-item">
                <span class="info-icon">📅</span>
                <span>${escapeHtml(subject.schedule || 'Sin horario')}</span>
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
            <button class="btn-view-details" onclick="viewSubjectDetails('${subject.id}')">
                Ver Detalles
            </button>
        </div>
    `;
    
    return card;
}

function createSubjectCardList(subject) {
    if (!subject) return null;
    
    const card = document.createElement('div');
    card.className = 'subject-card-list';
    card.style.setProperty('--subject-color', subject.color || '#FF6B6B');
    
    const examsCount = getArrayLength(subject && subject.exams ? subject.exams : []);
    const materialsCount = getArrayLength(subject && subject.materials ? subject.materials : []);
    const progress = subject.progress || 0;
    
    card.innerHTML = `
        <div class="subject-list-content">
            <div class="subject-main-info">
                <div class="subject-title-section">
                    <h3 class="subject-name">${escapeHtml(subject.name || 'Sin nombre')}</h3>
                    <p class="subject-professor">${escapeHtml(subject.professor || 'Sin profesor')}</p>
                </div>
            </div>
            
            <div class="subject-schedule">
                <span class="info-icon">📅</span>
                <span>${escapeHtml(subject.schedule || 'Sin horario')}</span>
            </div>
            
            <div class="subject-progress">
                <span class="info-icon">📊</span>
                <span>${progress}% completado</span>
            </div>
            
            <div class="subject-actions">
                <button class="btn-favorite ${subject.isFavorite ? 'favorite-active' : 'favorite-inactive'}" 
                        onclick="toggleFavoriteSubject('${subject.id}')" 
                        title="${subject.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                    ${subject.isFavorite ? '⭐' : '☆'}
                </button>
                <button class="btn-edit" onclick="editSubject('${subject.id}')" title="Editar materia">
                    ✏️
                </button>
                <button class="btn-delete" onclick="deleteSubject('${subject.id}')" title="Eliminar materia">
                    🗑️
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function getArrayLength(arr) {
    if (!arr) return 0;
    if (!Array.isArray(arr)) return 0;
    return arr.length;
}

function updateSubjectCount() {
    const subjects = getSafeSubjects();
    const subjectsCount = getArrayLength(subjects);
    const favoriteCount = subjects.filter(s => s && s.isFavorite).length;
    
    // Actualizar título si es necesario
    const header = document.querySelector('.materias-header h1');
    if (header) {
        header.textContent = `Mis Materias (${subjectsCount})`;
    }
    
    // Actualizar contadores en filtros
    updateFilterCounters(subjects);
}

function updateFilteredCount(count) {
    const totalSubjects = getSafeSubjects().length;
    const header = document.querySelector('.materias-header h1');
    if (header) {
        if (count === totalSubjects) {
            header.textContent = `Mis Materias (${totalSubjects})`;
        } else {
            header.textContent = `Mis Materias (${count} de ${totalSubjects})`;
        }
    }
}

function updateFilterCounters(subjects) {
    // Asegurar que subjects sea un array válido
    const safeSubjects = Array.isArray(subjects) ? subjects : [];
    
    const favoriteCount = safeSubjects.filter(s => s && s.isFavorite).length;
    const activeCount = safeSubjects.filter(s => s && (s.progress || 0) < 100).length;
    const completedCount = safeSubjects.filter(s => s && (s.progress || 0) >= 100).length;
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentCount = safeSubjects.filter(s => s && (s.lastModified || s.createdAt || 0) > weekAgo).length;
    
    // Actualizar badges en botones de filtro
    const filterButtons = {
        'all': safeSubjects.length,
        'favorites': favoriteCount,
        'active': activeCount,
        'completed': completedCount,
        'recent': recentCount
    };
    
    Object.entries(filterButtons).forEach(([filter, count]) => {
        const button = document.querySelector(`[data-filter="${filter}"]`);
        if (button) {
            const existingBadge = button.querySelector('.filter-badge');
            if (existingBadge) {
                existingBadge.remove();
            }
            
            if (count > 0) {
                const badge = document.createElement('span');
                badge.className = 'filter-badge';
                badge.textContent = count;
                button.appendChild(badge);
            }
        }
    });
}

// Función para escapar HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Funciones globales para interactuar con subjects.js
function refreshMateriasPage() {
    renderFilteredSubjects();
    updateSubjectCount();
}

// Función para navegar a los detalles de una materia
function viewSubjectDetails(subjectId) {
    window.location.href = `materia-detalle.html?id=${subjectId}`;
}

// Exportar funciones globales
window.viewSubjectDetails = viewSubjectDetails;

// Escuchar cambios en el estado
if (typeof window !== 'undefined') {
    // Sobrescribir saveData para actualizar la página cuando cambie el estado
    const originalSaveData = window.saveData;
    window.saveData = function() {
        if (originalSaveData) {
            originalSaveData();
        }
        // Actualizar la página si estamos en materias.html
        if (window.location.pathname.includes('materias.html')) {
            setTimeout(refreshMateriasPage, 100);
        }
    };
}

// FUNCIONES DE MODAL
function closeSubjectModal() {
    closeModal('subjectModal');
    resetSubjectForm();
}

function resetSubjectForm() {
    const form = document.getElementById('subjectForm');
    if (form) {
        form.reset();
        // Resetear color seleccionado
        document.getElementById('selectedColor').value = '#FF6B6B';
        // Resetear selección visual de color
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector('.color-option[data-color="#FF6B6B"]').classList.add('selected');
    }
}

function addSubjectFromModal() {
    const name = document.getElementById('subjectName').value.trim();
    const professor = document.getElementById('professorName').value.trim();
    const schedule = document.getElementById('subjectSchedule').value.trim();
    const color = document.getElementById('selectedColor').value;
    
    if (!name) {
        alert('El nombre de la materia es obligatorio');
        return;
    }
    
    const newSubject = {
        id: Date.now().toString(),
        name: name,
        professor: professor || 'Sin profesor',
        schedule: schedule || 'Sin horario',
        color: color,
        sessions: [],
        totalTime: 0,
        streak: 0,
        lastStudied: null,
        notes: '',
        goals: [],
        reminders: [],
        favorite: false
    };
    
    // Agregar al estado global
    if (!window.state) {
        window.state = { subjects: [] };
    }
    window.state.subjects.push(newSubject);
    
    // Guardar datos
    if (window.saveData) {
        window.saveData();
    }
    
    // Cerrar modal y resetear formulario
    closeSubjectModal();
    
    // Actualizar la vista
    renderAllSubjects();
    updateSubjectCount();
    
    // Mostrar mensaje de éxito
    showSuccessMessage('Materia agregada exitosamente');
}

function showSuccessMessage(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color, #4CAF50);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Inicializar eventos de la modal
function initializeModalEvents() {
    // Evento para el formulario
    const subjectForm = document.getElementById('subjectForm');
    if (subjectForm) {
        subjectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addSubjectFromModal();
        });
    }
    
    // Eventos para selección de color
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remover selección anterior
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Agregar selección actual
            this.classList.add('selected');
            document.getElementById('selectedColor').value = this.dataset.color;
        });
    });
    
    // Seleccionar primer color por defecto
    const firstColor = document.querySelector('.color-option');
    if (firstColor) {
        firstColor.classList.add('selected');
    }
}

// Llamar inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeModalEvents, 100);
});

// Exportar funciones para uso global
window.refreshMateriasPage = refreshMateriasPage;
window.handleSearch = handleSearch;
window.handleFilterChange = handleFilterChange;
window.handleViewChange = handleViewChange;
window.closeSubjectModal = closeSubjectModal;
window.addSubjectFromModal = addSubjectFromModal;