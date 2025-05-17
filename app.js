// Funcionalidad principal de EstudiApp

// Importar módulos
import { showTab, hideModal, showModal, toggleTheme } from './js/ui.js';
import { loadTasks, addTask, deleteTask, completeTask, filterTasks } from './js/tasks.js';
import { loadExams, addExam, removeExam } from './js/exams.js';
import { loadSubjects, addSubject, removeSubject } from './js/subjects.js';
import { processMessage, summarizeText, generateIdeas } from './js/ai.js';
import { registerUser, loginUser, logoutUser, getCurrentUser } from './js/firebase.js';
import { initCalendar } from './js/calendar.js';

// Exponer funciones al ámbito global para poder usarlas desde HTML
window.showTab = showTab;
window.hideModal = hideModal;
window.showModal = showModal;
window.toggleTheme = toggleTheme;
window.addTask = addTask;
window.deleteTask = deleteTask;
window.completeTask = completeTask;
window.filterTasks = filterTasks;
window.addExam = addExam;
window.removeExam = removeExam;
window.addSubject = addSubject;
window.removeSubject = removeSubject;

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Configurar navegación entre pestañas
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            showTab(tabId);
        });
    });

    // Configurar botón de tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        
        // Verificar si hay una preferencia guardada
        if (typeof config !== 'undefined' && config.darkMode) {
            // Aplicar modo oscuro si estaba activado
            toggleTheme();
        }
    }
    
    // Configurar botón de usuario
    const userMenuBtn = document.getElementById('user-menu');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', () => {
            showModal('login-modal');
        });
    }

    // Configurar botones para añadir elementos
    setupAddButtons();
    
    // Configurar filtros de tareas
    setupTaskFilters();
    
    // Configurar herramientas de IA
    setupAITools();
    
    // Cargar datos iniciales
    loadInitialData();
});

// Configurar botones para añadir tareas, exámenes y materias
function setupAddButtons() {
    // Botón para añadir tarea
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            showModal('task-modal');
        });
    }
    
    // Botón para añadir examen
    const addExamBtn = document.getElementById('add-exam-btn');
    if (addExamBtn) {
        addExamBtn.addEventListener('click', () => {
            showModal('add-exam-modal');
        });
    }
    
    // Botón para añadir materia
    const addSubjectBtn = document.getElementById('add-subject-btn');
    if (addSubjectBtn) {
        addSubjectBtn.addEventListener('click', () => {
            showModal('add-subject-modal');
        });
    }
    
    // Configurar botones de cancelar
    const cancelTaskBtn = document.getElementById('cancel-task');
    if (cancelTaskBtn) {
        cancelTaskBtn.addEventListener('click', () => {
            hideModal('task-modal');
        });
    }
    
    const cancelExamBtn = document.getElementById('cancel-exam');
    if (cancelExamBtn) {
        cancelExamBtn.addEventListener('click', () => {
            hideModal('add-exam-modal');
        });
    }
    
    const cancelSubjectBtn = document.getElementById('cancel-subject');
    if (cancelSubjectBtn) {
        cancelSubjectBtn.addEventListener('click', () => {
            hideModal('add-subject-modal');
        });
    }
}

// Configurar filtros de tareas
function setupTaskFilters() {
    const filterButtons = document.querySelectorAll('.task-filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Quitar clase activa de todos los botones
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            });
            
            // Añadir clase activa al botón seleccionado
            button.classList.remove('bg-gray-200', 'text-gray-700');
            button.classList.add('bg-indigo-600', 'text-white');
            
            // Aplicar filtro
            const filter = button.getAttribute('data-filter');
            filterTasks(filter);
        });
    });
}

// Configurar herramientas de IA
function setupAITools() {
    // Botón para resumir texto
    const summarizeButton = document.getElementById('summarize-button');
    if (summarizeButton) {
        summarizeButton.addEventListener('click', () => {
            const text = document.getElementById('summarize-input').value;
            const result = summarizeText(text);
            document.getElementById('summarize-result').textContent = result;
        });
    }
    
    // Botón para generar ideas
    const generateIdeasButton = document.getElementById('generate-ideas-button');
    if (generateIdeasButton) {
        generateIdeasButton.addEventListener('click', () => {
            const topic = document.getElementById('ideas-topic').value;
            const ideas = generateIdeas(topic);
            
            let ideasHTML = '<ul class="list-disc pl-5 space-y-2">';
            ideas.forEach(idea => {
                ideasHTML += `<li>${idea}</li>`;
            });
            ideasHTML += '</ul>';
            
            document.getElementById('ideas-result').innerHTML = ideasHTML;
        });
    }
}

// Cargar datos iniciales
async function loadInitialData() {
    // Verificar si el usuario está autenticado
    const user = getCurrentUser();
    
    if (user) {
        // Cargar datos del usuario
        await Promise.all([
            loadTasks(),
            loadExams(),
            loadSubjects()
        ]);
    } else {
        // Mostrar modal de login si no hay usuario autenticado
        // showModal('login-modal');
    }
    
    // Inicializar el calendario
    initCalendar();
    
    // Mostrar pestaña inicial (dashboard)
    showTab('dashboard');
}

// Manejar envío de formularios
document.addEventListener('submit', (e) => {
    // Prevenir comportamiento por defecto
    e.preventDefault();
    
    const form = e.target;
    
    // Manejar formulario de tarea
    if (form.id === 'add-task-form') {
        const task = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            dueDate: document.getElementById('task-due-date').value,
            subject: document.getElementById('task-subject').value,
            important: document.getElementById('task-important').checked,
            completed: false
        };
        
        addTask(task);
        hideModal('add-task-modal');
        form.reset();
    }
    
    // Manejar formulario de examen
    if (form.id === 'add-exam-form') {
        const exam = {
            title: document.getElementById('exam-title').value,
            subject: document.getElementById('exam-subject').value,
            date: document.getElementById('exam-date').value,
            time: document.getElementById('exam-time').value,
            location: document.getElementById('exam-location').value,
            notes: document.getElementById('exam-notes').value
        };
        
        addExam(exam);
        hideModal('add-exam-modal');
        form.reset();
    }
    
    // Manejar formulario de materia
    if (form.id === 'add-subject-form') {
        const subject = {
            name: document.getElementById('subject-name').value,
            teacher: document.getElementById('subject-teacher').value,
            color: document.getElementById('subject-color').value,
            schedule: document.getElementById('subject-schedule').value,
            notes: document.getElementById('subject-notes').value
        };
        
        addSubject(subject);
        hideModal('add-subject-modal');
        form.reset();
    }
});

// Configurar formularios de autenticación
function setupAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');
    const closeLoginModal = document.getElementById('close-login-modal');
    
    // Cambiar entre paneles de login y registro
    if (loginTab) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('border-b-2', 'border-indigo-500');
            loginTab.classList.remove('text-gray-500');
            registerTab.classList.remove('border-b-2', 'border-indigo-500');
            registerTab.classList.add('text-gray-500');
            loginPanel.classList.remove('hidden');
            registerPanel.classList.add('hidden');
        });
    }
    
    if (registerTab) {
        registerTab.addEventListener('click', () => {
            registerTab.classList.add('border-b-2', 'border-indigo-500');
            registerTab.classList.remove('text-gray-500');
            loginTab.classList.remove('border-b-2', 'border-indigo-500');
            loginTab.classList.add('text-gray-500');
            registerPanel.classList.remove('hidden');
            loginPanel.classList.add('hidden');
        });
    }
    
    // Cerrar modal de login
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', () => {
            hideModal('login-modal');
        });
    }
    
    // Manejar envío de formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (email && password) {
                const result = await loginUser(email, password);
                
                if (result.success) {
                    hideModal('login-modal');
                    // Recargar datos del usuario
                    loadInitialData();
                } else {
                    alert(result.error || 'Error al iniciar sesión');
                }
            } else {
                alert('Por favor completa todos los campos');
            }
        });
    }
    
    // Manejar envío de formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            if (name && email && password && confirmPassword) {
                if (password !== confirmPassword) {
                    alert('Las contraseñas no coinciden');
                    return;
                }
                
                const result = await registerUser(email, password);
                
                if (result.success) {
                    hideModal('login-modal');
                    // Recargar datos del usuario
                    loadInitialData();
                } else {
                    alert(result.error || 'Error al registrar usuario');
                }
            } else {
                alert('Por favor completa todos los campos');
            }
        });
    }
}