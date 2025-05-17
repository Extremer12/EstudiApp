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
window.logoutUser = handleLogout; // Agregar función de cierre de sesión al ámbito global

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
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que el clic se propague
            const dropdown = document.getElementById('user-dropdown');
            dropdown.classList.toggle('hidden');
            
            // Agregar animación
            setTimeout(() => {
                if (!dropdown.classList.contains('hidden')) {
                    dropdown.classList.add('show');
                } else {
                    dropdown.classList.remove('show');
                }
            }, 10);
        });
        
        // Cerrar el menú al hacer clic fuera de él
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('user-dropdown');
            if (!dropdown.contains(e.target) && e.target !== userMenuBtn) {
                dropdown.classList.remove('show');
                setTimeout(() => {
                    dropdown.classList.add('hidden');
                }, 200);
            }
        });
        
        // Añadir evento al botón de cerrar
        const closeMenuBtn = document.getElementById('close-menu');
        if (closeMenuBtn) {
            closeMenuBtn.addEventListener('click', () => {
                const dropdown = document.getElementById('user-dropdown');
                dropdown.classList.remove('show');
                setTimeout(() => {
                    dropdown.classList.add('hidden');
                }, 200);
            });
        }
    }

    // Configurar botones para añadir elementos
    setupAddButtons();
    
    // Configurar filtros de tareas
    setupTaskFilters();
    
    // Configurar herramientas de IA
    setupAITools();
    
    // Configurar formularios de autenticación
    setupAuthForms();
    
    // Verificar estado de autenticación
    checkAuthState();
    
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
            const modal = document.getElementById('add-subject-modal');
            if (!modal) {
                console.error('No se encontró el modal de añadir materia');
                return;
            }
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
    
    // Configurar botones de guardar
    const saveTaskBtn = document.getElementById('save-task');
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', () => {
            const task = {
                title: document.getElementById('task-title').value,
                description: document.getElementById('task-description').value,
                dueDate: document.getElementById('task-due-date').value,
                subject: document.getElementById('task-subject').value,
                important: document.getElementById('task-important').checked,
                completed: false
            };
            
            addTask(task);
            hideModal('task-modal');
            document.getElementById('add-task-form').reset();
        });
    }
    
    const saveExamBtn = document.getElementById('save-exam');
    if (saveExamBtn) {
        saveExamBtn.addEventListener('click', () => {
            const exam = {
                title: document.getElementById('exam-title').value,
                date: document.getElementById('exam-date').value,
                subject: document.getElementById('exam-subject-select').value
            };
            
            addExam(exam);
            hideModal('add-exam-modal');
        });
    }
    
    const saveSubjectBtn = document.getElementById('save-subject');
    if (saveSubjectBtn) {
        saveSubjectBtn.addEventListener('click', () => {
            const subjectNameElement = document.getElementById('subject-name');
            const subjectTeacherElement = document.getElementById('subject-teacher');
            const subjectClassroomElement = document.getElementById('subject-classroom');
            const subjectScheduleElement = document.getElementById('subject-schedule');
            
            // Verificar que todos los elementos existen antes de acceder a sus propiedades
            if (!subjectNameElement || !subjectTeacherElement) {
                console.error('No se encontraron los elementos del formulario de materia');
                return;
            }
            
            const subject = {
                name: subjectNameElement.value,
                professor: subjectTeacherElement.value,
                classroom: subjectClassroomElement ? subjectClassroomElement.value : '',
                schedule: subjectScheduleElement ? subjectScheduleElement.value : ''
            };
            
            addSubject(subject);
            hideModal('add-subject-modal');
            const formElement = document.getElementById('add-subject-form');
            if (formElement) formElement.reset();
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
    const cancelLoginBtn = document.getElementById('cancel-login');
    const cancelRegisterBtn = document.getElementById('cancel-register');
    
    // Cambiar entre paneles de login y registro
    if (loginTab) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('bg-white/20', 'font-semibold');
            registerTab.classList.remove('bg-white/20', 'font-semibold');
            loginPanel.classList.remove('hidden');
            registerPanel.classList.add('hidden');
        });
    }
    
    if (registerTab) {
        registerTab.addEventListener('click', () => {
            registerTab.classList.add('bg-white/20', 'font-semibold');
            loginTab.classList.remove('bg-white/20', 'font-semibold');
            registerPanel.classList.remove('hidden');
            loginPanel.classList.add('hidden');
        });
    }
    
    // Configurar botones de cancelar
    if (cancelLoginBtn) {
        cancelLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal('login-modal');
        });
    }
    
    if (cancelRegisterBtn) {
        cancelRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal('login-modal');
        });
    }
    
    // Manejar envío de formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const loginError = document.getElementById('login-error');
            
            if (email && password) {
                try {
                    const result = await loginUser(email, password);
                    
                    if (result.success) {
                        hideModal('login-modal');
                        // Recargar datos del usuario
                        loadInitialData();
                        showNotification('Has iniciado sesión correctamente', 'success');
                    } else {
                        if (loginError) {
                            loginError.textContent = result.error || 'Error al iniciar sesión';
                            loginError.classList.remove('hidden');
                            loginError.classList.add('login-error-message');
                            // Quitar la clase de animación después de que termine
                            setTimeout(() => {
                                loginError.classList.remove('login-error-message');
                            }, 500);
                        } else {
                            alert(result.error || 'Error al iniciar sesión');
                        }
                    }
                } catch (error) {
                    console.error('Error al iniciar sesión:', error);
                    if (loginError) {
                        loginError.textContent = 'Error al procesar la solicitud';
                        loginError.classList.remove('hidden');
                    } else {
                        alert('Error al procesar la solicitud');
                    }
                }
            } else {
                if (loginError) {
                    loginError.textContent = 'Por favor completa todos los campos';
                    loginError.classList.remove('hidden');
                } else {
                    alert('Por favor completa todos los campos');
                }
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
            const registerError = document.getElementById('register-error');
            
            if (name && email && password && confirmPassword) {
                if (password !== confirmPassword) {
                    if (registerError) {
                        registerError.textContent = 'Las contraseñas no coinciden';
                        registerError.classList.remove('hidden');
                        registerError.classList.add('login-error-message');
                        // Quitar la clase de animación después de que termine
                        setTimeout(() => {
                            registerError.classList.remove('login-error-message');
                        }, 500);
                    } else {
                        alert('Las contraseñas no coinciden');
                    }
                    return;
                }
                
                try {
                    const result = await registerUser(email, password);
                    
                    if (result.success) {
                        hideModal('login-modal');
                        // Recargar datos del usuario
                        loadInitialData();
                        showNotification('Cuenta creada correctamente', 'success');
                    } else {
                        if (registerError) {
                            registerError.textContent = result.error || 'Error al registrar usuario';
                            registerError.classList.remove('hidden');
                        } else {
                            alert(result.error || 'Error al registrar usuario');
                        }
                    }
                } catch (error) {
                    console.error('Error al registrar usuario:', error);
                    if (registerError) {
                        registerError.textContent = 'Error al procesar la solicitud';
                        registerError.classList.remove('hidden');
                    } else {
                        alert('Error al procesar la solicitud');
                    }
                }
            } else {
                if (registerError) {
                    registerError.textContent = 'Por favor completa todos los campos';
                    registerError.classList.remove('hidden');
                } else {
                    alert('Por favor completa todos los campos');
                }
            }
        });
    }
}

// Verificar estado de autenticación
function checkAuthState() {
    // Obtener el usuario actual desde la función importada
    const user = getCurrentUser();
    console.log('Estado de autenticación:', user ? 'Autenticado' : 'No autenticado');
    
    // Actualizar la interfaz según el estado de autenticación
    updateUIForAuthState(user);
    
    // Simular un usuario autenticado para pruebas (quitar en producción)
    if (!user) {
        const testUser = { email: 'usuario@ejemplo.com' };
        console.log('Simulando usuario para pruebas');
        updateUIForAuthState(testUser);
    }
}

// Actualizar la interfaz según el estado de autenticación
function updateUIForAuthState(user) {
    const userStatus = document.getElementById('user-status');
    const userEmail = document.getElementById('user-email');
    const logoutButton = document.getElementById('logout-button');
    const userMenuBtn = document.getElementById('user-menu');
    
    if (user) {
        // Usuario autenticado
        if (userStatus) userStatus.classList.remove('hidden');
        if (userEmail) userEmail.textContent = user.email || 'Usuario';
        if (logoutButton) {
            logoutButton.classList.remove('hidden');
            console.log('Botón de logout visible:', logoutButton);
        }
    } else {
        // Usuario no autenticado
        if (userStatus) userStatus.classList.add('hidden');
        if (logoutButton) {
            logoutButton.classList.add('hidden');
            console.log('Botón de logout oculto');
        }
    }
}

// Manejar cierre de sesión
async function handleLogout() {
    try {
        const result = await logoutUser();
        if (result.success) {
            // Actualizar la interfaz
            updateUIForAuthState(null);
            
            // Cerrar el menú desplegable
            const dropdown = document.getElementById('user-dropdown');
            dropdown.classList.remove('show');
            setTimeout(() => {
                dropdown.classList.add('hidden');
            }, 200);
            
            // Redirigir a la página de login
            window.location.href = 'auth.html';
        } else {
            console.error("Error al cerrar sesión:", result.error);
            alert("Error al cerrar sesión: " + result.error);
        }
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Error inesperado al cerrar sesión");
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Limpiar datos del usuario
function clearUserData() {
    // Limpiar listas
    document.getElementById('tasks-list').innerHTML = '';
    const upcomingExamsList = document.getElementById('upcoming-exams-list');
    if (upcomingExamsList) {
        upcomingExamsList.innerHTML = '<p class="text-gray-500 text-center py-4">No hay exámenes próximos</p>';
    }
    
    // Resetear contadores
    const pendingTasksCount = document.getElementById('pending-tasks-count');
    if (pendingTasksCount) pendingTasksCount.textContent = '0';
    
    const upcomingExamsCount = document.getElementById('upcoming-exams-count');
    if (upcomingExamsCount) upcomingExamsCount.textContent = '0';
    
    // Resetear contadores en dashboard
    const dashboardTaskCounter = document.querySelector('#dashboard p.text-3xl');
    if (dashboardTaskCounter) dashboardTaskCounter.textContent = '0';
    
    const dashboardExamCounter = document.querySelector('#dashboard .grid.grid-cols-2.gap-4.mb-6 > div:nth-child(2) p.text-3xl');
    if (dashboardExamCounter) dashboardExamCounter.textContent = '0';
}

// Funcionalidad para el menú de usuario
document.addEventListener('DOMContentLoaded', function() {
    const userMenu = document.getElementById('user-menu');
    const userDropdown = document.getElementById('user-dropdown');
    const closeMenu = document.getElementById('close-menu');
    const logoutButton = document.getElementById('logout-button');
    
    // Mostrar/ocultar menú de usuario
    userMenu.addEventListener('click', function() {
        userDropdown.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    });
    
    // Cerrar menú al hacer clic en el botón de cerrar
    closeMenu.addEventListener('click', function() {
        userDropdown.classList.remove('show');
        document.body.style.overflow = ''; // Restaurar scroll
    });
    
    // Cerrar menú al hacer clic fuera del menú
    userDropdown.addEventListener('click', function(e) {
        if (e.target === userDropdown) {
            userDropdown.classList.remove('show');
            document.body.style.overflow = ''; // Restaurar scroll
        }
    });
    
    // Mostrar botón de cerrar sesión si el usuario está autenticado
    function updateLogoutButton(user) {
        if (user) {
            logoutButton.classList.remove('hidden');
        } else {
            logoutButton.classList.add('hidden');
        }
    }
    
    // Asignar evento al botón de cerrar sesión
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // Actualizar estado de autenticación al cargar la página
    document.addEventListener('authStateChanged', function(e) {
        updateLogoutButton(e.detail.user);
    });
});