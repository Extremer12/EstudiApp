// GESTIÓN DE MATERIAS

function createExpandedSubject(basicSubject) {
  return {
    id: basicSubject.id || Date.now().toString(),
    name: basicSubject.name,
    professor: basicSubject.professor || '',
    schedule: basicSubject.schedule || '',
    color: basicSubject.color || '#3498db',
    exams: basicSubject.exams || [],
    consultationHours: basicSubject.consultationHours || [],
    notes: basicSubject.notes || '',
    materials: basicSubject.materials || [],
    createdAt: basicSubject.createdAt || new Date().toISOString()
  };
}

function migrateSubjectsToExpandedFormat() {
  if (state.subjects && state.subjects.length > 0) {
    state.subjects = state.subjects.map(subject => {
      if (!subject.exams) {
        return createExpandedSubject(subject);
      }
      return subject;
    });
  }
}

function renderSubjects() {
  const container = document.getElementById('subjectsList');
  if (!container) return;
  
  if (state.subjects.length === 0) {
    container.innerHTML = '<p class="empty-state">No hay materias registradas</p>';
    return;
  }
  
  container.innerHTML = state.subjects.map(subject => `
    <div class="subject-card" style="border-left: 4px solid ${subject.color}">
      <div class="subject-header">
        <h3>${subject.name}</h3>
        <div class="subject-actions">
          <button onclick="openSubjectModal('${subject.id}')" class="btn-subject-details">
            📋 Detalles
          </button>
          <button onclick="editSubject('${subject.id}')" class="btn-edit">✏️</button>
          <button onclick="deleteSubject('${subject.id}')" class="btn-delete">🗑️</button>
        </div>
      </div>
      <div class="subject-info">
        <p><strong>Profesor:</strong> ${subject.professor || 'No especificado'}</p>
        <p><strong>Horario:</strong> ${subject.schedule || 'No especificado'}</p>
      </div>
    </div>
  `).join('');
}

function addSubject() {
  const name = document.getElementById('subjectName').value.trim();
  const professor = document.getElementById('subjectProfessor').value.trim();
  const schedule = document.getElementById('subjectSchedule').value.trim();
  const color = document.getElementById('subjectColor').value;
  
  if (!name) {
    alert('El nombre de la materia es obligatorio');
    return;
  }
  
  const newSubject = createExpandedSubject({
    name,
    professor,
    schedule,
    color
  });
  
  state.subjects.push(newSubject);
  saveData();
  closeModal('subjectModal');
  resetForm('subjectModal');
  renderAll(); 
}

function deleteSubject(subjectId) {
  if (confirm('¿Estás seguro de que quieres eliminar esta materia?')) {
    state.subjects = state.subjects.filter(s => s.id !== subjectId);
    
    // Cerrar modal si está abierto para esta materia
    if (currentSubjectModalId === subjectId) {
      closeModal('subjectDetailsModal');
      currentSubjectModalId = null;
    }
    
    saveData();
    renderAll(); // Agregar esta línea
  }
}

function editSubject(subjectId) {
  const subject = state.subjects.find(s => s.id === subjectId);
  if (!subject) return;
  
  // Llenar el formulario con los datos actuales
  document.getElementById('subjectName').value = subject.name;
  document.getElementById('subjectProfessor').value = subject.professor || '';
  document.getElementById('subjectSchedule').value = subject.schedule || '';
  document.getElementById('subjectColor').value = subject.color;
  
  // Cambiar el comportamiento del botón de guardar
  const saveBtn = document.querySelector('#subjectModal .btn-confirm');
  saveBtn.onclick = () => {
    const name = document.getElementById('subjectName').value.trim();
    const professor = document.getElementById('subjectProfessor').value.trim();
    const schedule = document.getElementById('subjectSchedule').value.trim();
    const color = document.getElementById('subjectColor').value;
    
    if (!name) {
      alert('El nombre de la materia es obligatorio');
      return;
    }
    
    // Actualizar la materia
    const subjectIndex = state.subjects.findIndex(s => s.id === subjectId);
    if (subjectIndex !== -1) {
      state.subjects[subjectIndex] = {
        ...state.subjects[subjectIndex],
        name,
        professor,
        schedule,
        color
      };
      
      saveData();
      closeModal('subjectModal');
      renderAll(); // Agregar esta línea
      
      // Restaurar el comportamiento original del botón
      saveBtn.onclick = addSubject;
    }
  };
  
  openModal('subjectModal');
}

// MODAL DE DETALLES DE MATERIA
function openSubjectModal(subjectId) {
  const subject = state.subjects.find(s => s.id === subjectId);
  if (!subject) return;
  
  currentSubjectModalId = subjectId;
  
  const titleElement = document.getElementById('subjectModalTitle');
  if (titleElement) {
    titleElement.textContent = `${subject.name} - Detalles`;
  }
  
  loadSubjectModalContent(subject);
  setupSubjectModalEventListeners(subjectId);
  openModal('subjectDetailsModal');
}

function loadSubjectModalContent(subject) {
  // Cargar lista de exámenes
  const examsList = document.getElementById('modal-exams-list');
  if (examsList) {
    if (subject.exams && subject.exams.length > 0) {
      examsList.innerHTML = subject.exams.map(exam => `
        <div class="exam-item">
          <div class="exam-info">
            <strong>${exam.name}</strong>
            <span class="exam-date">${new Date(exam.date).toLocaleDateString()}</span>
          </div>
          <div class="exam-details">
            <p><strong>Tipo:</strong> ${exam.type}</p>
            <p><strong>Temas:</strong> ${exam.topics}</p>
          </div>
        </div>
      `).join('');
    } else {
      examsList.innerHTML = '<p class="empty-state">No hay exámenes registrados</p>';
    }
  }
  
  // Cargar horarios de consulta
  const consultationHours = document.getElementById('modal-consultation-hours');
  if (consultationHours) {
    if (subject.consultationHours && subject.consultationHours.length > 0) {
      consultationHours.innerHTML = subject.consultationHours.map(hour => `
        <div class="consultation-item">
          <strong>${hour.day}</strong> - ${hour.time}
          <span class="consultation-location">${hour.location}</span>
        </div>
      `).join('');
    } else {
      consultationHours.innerHTML = '<p class="empty-state">No hay horarios de consulta</p>';
    }
  }
  
  // Cargar notas
  const notesTextarea = document.getElementById('modal-subject-notes');
  if (notesTextarea) {
    notesTextarea.value = subject.notes || '';
  }
  
  // Cargar materiales de estudio
  const materialsList = document.getElementById('modal-materials-list');
  if (materialsList) {
    if (subject.materials && subject.materials.length > 0) {
      materialsList.innerHTML = subject.materials.map(material => `
        <div class="material-item">
          <div class="material-info">
            <strong>${material.name}</strong>
            <span class="material-type">${material.type}</span>
          </div>
          ${material.url ? `<a href="${material.url}" target="_blank" class="material-link">🔗 Abrir</a>` : ''}
        </div>
      `).join('');
    } else {
      materialsList.innerHTML = '<p class="empty-state">No hay materiales registrados</p>';
    }
  }
  
  // Mostrar información de progreso
  const progressInfo = document.getElementById('modal-progress-info');
  if (progressInfo) {
    const progress = calculateProgress(subject);
    progressInfo.innerHTML = `
      <div class="progress-stats">
        <div class="stat-item">
          <span class="stat-label">Exámenes:</span>
          <span class="stat-value">${subject.exams ? subject.exams.length : 0}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Materiales:</span>
          <span class="stat-value">${subject.materials ? subject.materials.length : 0}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Progreso:</span>
          <span class="stat-value">${progress}%</span>
        </div>
      </div>
    `;
  }
}

function calculateProgress(subject) {
  // Lógica simple de progreso basada en contenido
  let progress = 0;
  
  if (subject.exams && subject.exams.length > 0) progress += 25;
  if (subject.materials && subject.materials.length > 0) progress += 25;
  if (subject.notes && subject.notes.trim().length > 0) progress += 25;
  if (subject.consultationHours && subject.consultationHours.length > 0) progress += 25;
  
  return progress;
}

// Función faltante para configurar los event listeners del modal
function setupSubjectModalEventListeners(subjectId) {
  const subject = state.subjects.find(s => s.id === subjectId);
  if (!subject) return;
  
  // Event listener para guardar notas
  const saveNotesBtn = document.getElementById('modal-save-notes-btn');
  if (saveNotesBtn) {
    saveNotesBtn.onclick = () => {
      const notesTextarea = document.getElementById('modal-subject-notes');
      if (notesTextarea) {
        const subjectIndex = state.subjects.findIndex(s => s.id === subjectId);
        if (subjectIndex !== -1) {
          state.subjects[subjectIndex].notes = notesTextarea.value;
          saveData();
          alert('Notas guardadas correctamente');
        }
      }
    };
  }
  
  // Event listener para agregar examen
  const addExamBtn = document.getElementById('modal-add-exam-btn');
  if (addExamBtn) {
    addExamBtn.onclick = () => {
      const examName = prompt('Nombre del examen:');
      const examDate = prompt('Fecha del examen (YYYY-MM-DD):');
      const examType = prompt('Tipo de examen (Parcial, Final, Quiz, etc.):');
      const examTopics = prompt('Temas del examen:');
      
      if (examName && examDate && examType) {
        const subjectIndex = state.subjects.findIndex(s => s.id === subjectId);
        if (subjectIndex !== -1) {
          if (!state.subjects[subjectIndex].exams) {
            state.subjects[subjectIndex].exams = [];
          }
          
          state.subjects[subjectIndex].exams.push({
            id: Date.now().toString(),
            name: examName,
            date: examDate,
            type: examType,
            topics: examTopics || 'No especificado'
          });
          
          saveData();
          loadSubjectModalContent(state.subjects[subjectIndex]);
        }
      }
    };
  }
  
  // Event listener para agregar horario de consulta
  const addConsultationBtn = document.getElementById('modal-add-consultation-btn');
  if (addConsultationBtn) {
    addConsultationBtn.onclick = () => {
      const day = prompt('Día de la semana:');
      const time = prompt('Horario (ej: 14:00 - 16:00):');
      const location = prompt('Ubicación:');
      
      if (day && time) {
        const subjectIndex = state.subjects.findIndex(s => s.id === subjectId);
        if (subjectIndex !== -1) {
          if (!state.subjects[subjectIndex].consultationHours) {
            state.subjects[subjectIndex].consultationHours = [];
          }
          
          state.subjects[subjectIndex].consultationHours.push({
            id: Date.now().toString(),
            day: day,
            time: time,
            location: location || 'No especificado'
          });
          
          saveData();
          loadSubjectModalContent(state.subjects[subjectIndex]);
        }
      }
    };
  }
  
  // Event listener para agregar material
  const addMaterialBtn = document.getElementById('modal-add-material-btn');
  if (addMaterialBtn) {
    addMaterialBtn.onclick = () => {
      const materialName = prompt('Nombre del material:');
      const materialType = prompt('Tipo (Libro, PDF, Video, etc.):');
      const materialUrl = prompt('URL (opcional):');
      
      if (materialName && materialType) {
        const subjectIndex = state.subjects.findIndex(s => s.id === subjectId);
        if (subjectIndex !== -1) {
          if (!state.subjects[subjectIndex].materials) {
            state.subjects[subjectIndex].materials = [];
          }
          
          state.subjects[subjectIndex].materials.push({
            id: Date.now().toString(),
            name: materialName,
            type: materialType,
            url: materialUrl || ''
          });
          
          saveData();
          loadSubjectModalContent(state.subjects[subjectIndex]);
        }
      }
    };
  }
  
  // Mostrar información de progreso
  const progressInfo = document.getElementById('modal-progress-info');
  if (progressInfo) {
    const progress = calculateProgress(subject);
    progressInfo.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <p>Progreso: ${progress}% completado</p>
    `;
  }
}