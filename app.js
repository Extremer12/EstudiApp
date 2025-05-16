// Funcionalidad principal de EstudiApp

// Importar módulos
import config from './js/config.js';
import { showTab, showModal, hideModal, toggleTheme } from './js/ui.js';
import { addTask, deleteTask, completeTask, filterTasks, updateTasksCounter, loadTasks } from './js/tasks.js';
import { processMessage, summarizeText, generateIdeas } from './js/ai.js';
import { registerUser, loginUser, logoutUser, auth, currentUser, getSubjects, getExams, saveSubject, saveExam } from './js/firebase.js';

// Exponer funciones al ámbito global para los manejadores de eventos en línea
window.showTab = showTab;
window.showModal = showModal;
window.hideModal = hideModal;
window.toggleTheme = toggleTheme;
window.addTask = addTask;
window.deleteTask = deleteTask;
window.completeTask = completeTask;
window.filterTasks = filterTasks;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está autenticado antes de inicializar
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // Usuario autenticado, inicializar la aplicación
            initApp();
        } else {
            // Usuario no autenticado, mostrar modal de login
            showModal('login-modal');
        }
    });
    
    // Configurar los listeners de eventos
    setupEventListeners();
    setupAuthListeners();
});

function initApp() {
    // Cargar datos desde Firebase
    loadTasks();
    loadSubjects();
    loadExams();
    
    // Mostrar el panel de dashboard por defecto
    showTab('dashboard');
    
    // Actualizar contadores
    updateTasksCounter();
    updateExamsCounter();
}

async function loadSubjects() {
    const result = await getSubjects();
    if (result.success) {
        renderSubjects(result.subjects);
    } else {
        console.error("Error al cargar materias:", result.error);
    }
}

async function loadExams() {
    const result = await getExams();
    if (result.success) {
        renderExams(result.exams);
    } else {
        console.error("Error al cargar exámenes:", result.error);
    }
}

function renderSubjects(subjects) {
    const subjectsList = document.getElementById('subjects-list');
    if (!subjectsList) return;
    
    if (subjects.length === 0) {
        subjectsList.innerHTML = '<p class="text-gray-500 text-center py-4">No hay materias registradas</p>';
        return;
    }
    
    let subjectsHTML = '';
    
    subjects.forEach(subject => {
        subjectsHTML += `
            <div class="bg-white rounded-lg shadow p-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold text-lg">${subject.name}</h3>
                        <p class="text-gray-600 text-sm">Prof. ${subject.teacher}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-indigo-600 hover:text-indigo-800" aria-label="Editar ${subject.name}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-800" aria-label="Eliminar ${subject.name}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="mt-3">
                    <div class="flex items-center text-sm text-gray-500 mb-1">
                        <i class="fas fa-clock mr-2"></i>
                        <span>${subject.schedule}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-map-marker-alt mr-2"></i>
                        <span>${subject.classroom}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    subjectsList.innerHTML = subjectsHTML;
}

function renderExams(exams) {
    const examsList = document.getElementById('upcoming-exams-list');
    if (!examsList) return;
    
    if (exams.length === 0) {
        examsList.innerHTML = '<p class="text-gray-500 text-center py-4">No hay exámenes próximos</p>';
        return;
    }
    
    let examsHTML = '';
    
    exams.forEach(exam => {
        const examDate = new Date(exam.date);
        const formattedDate = examDate.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        });
        
        examsHTML += `
            <div class="border-l-4 border-indigo-500 pl-4 mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold">${exam.subject} - ${exam.title}</h4>
                        <p class="text-sm text-gray-600">${formattedDate} - ${exam.time}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-indigo-600 hover:text-indigo-800" aria-label="Editar examen de ${exam.subject}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-800" aria-label="Eliminar examen de ${exam.subject}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="text-sm mt-1 text-gray-500">${exam.classroom} - Duración: ${exam.duration}</p>
            </div>
        `;
    });
    
    examsList.innerHTML = examsHTML;
}

function setupAuthListeners() {
    // Botones de navegación entre modales
    const goToRegister = document.getElementById('go-to-register');
    const goToLogin = document.getElementById('go-to-login');
    const cancelLogin = document.getElementById('cancel-login');
    const cancelRegister = document.getElementById('cancel-register');
    const submitLogin = document.getElementById('submit-login');
    const submitRegister = document.getElementById('submit-register');
    const userMenu = document.getElementById('user-menu');
    
    if (goToRegister) {
        goToRegister.addEventListener('click', () => {
            hideModal('login-modal');
            showModal('register-modal');
        });
    }
    
    if (goToLogin) {
        goToLogin.addEventListener('click', () => {
            hideModal('register-modal');
            showModal('login-modal');
        });
    }
    
    if (cancelLogin) {
        cancelLogin.addEventListener('click', () => {
            hideModal('login-modal');
        });
    }
    
    if (cancelRegister) {
        cancelRegister.addEventListener('click', () => {
            hideModal('register-modal');
        });
    }
    
    if (submitLogin) {
        submitLogin.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorElement = document.getElementById('login-error');
            
            if (!email || !password) {
                errorElement.textContent = 'Por favor completa todos los campos';
                errorElement.classList.remove('hidden');
                return;
            }
            
            const result = await loginUser(email, password);
            if (result.success) {
                hideModal('login-modal');
                // Limpiar campos
                document.getElementById('login-email').value = '';
                document.getElementById('login-password').value = '';
                errorElement.classList.add('hidden');
                
                // Inicializar la aplicación
                initApp();
            } else {
                errorElement.textContent = result.error;
                errorElement.classList.remove('hidden');
            }
        });
    }
    
    if (submitRegister) {
        submitRegister.addEventListener('click', async () => {
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const errorElement = document.getElementById('register-error');
            
            if (!email || !password || !confirmPassword) {
                errorElement.textContent = 'Por favor completa todos los campos';
                errorElement.classList.remove('hidden');
                return;
            }
            
            if (password !== confirmPassword) {
                errorElement.textContent = 'Las contraseñas no coinciden';
                errorElement.classList.remove('hidden');
                return;
            }
            
            if (password.length < 6) {
                errorElement.textContent = 'La contraseña debe tener al menos 6 caracteres';
                errorElement.classList.remove('hidden');
                return;
            }
            
            const result = await registerUser(email, password);
            if (result.success) {
                hideModal('register-modal');
                // Limpiar campos
                document.getElementById('register-email').value = '';
                document.getElementById('register-password').value = '';
                document.getElementById('register-confirm-password').value = '';
                errorElement.classList.add('hidden');
                
                // Inicializar la aplicación
                initApp();
            } else {
                errorElement.textContent = result.error;
                errorElement.classList.remove('hidden');
            }
        });
    }
    
    if (userMenu) {
        userMenu.addEventListener('click', () => {
            if (currentUser) {
                // Si está autenticado, mostrar menú de usuario o cerrar sesión
                if (confirm('¿Deseas cerrar sesión?')) {
                    logoutUser();
                }
            } else {
                // Si no está autenticado, mostrar modal de login
                showModal('login-modal');
            }
        });
    }
}

function setupEventListeners() {
    // Elementos del DOM
    const tabButtons = document.querySelectorAll('.tab-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const addTaskBtn = document.getElementById('add-task-btn');
    const addSubjectBtn = document.getElementById('add-subject-btn');
    const addExamBtn = document.getElementById('add-exam-btn');
    const taskModal = document.getElementById('task-modal');
    const subjectModal = document.getElementById('subject-modal');
    const examModal = document.getElementById('exam-modal');
    const cancelTask = document.getElementById('cancel-task');
    const cancelSubject = document.getElementById('cancel-subject');
    const cancelExam = document.getElementById('cancel-exam');
    const saveTask = document.getElementById('save-task');
    const saveSubject = document.getElementById('save-subject');
    const saveExam = document.getElementById('save-exam');
    const taskFilters = document.querySelectorAll('.task-filter-btn');
    const aiChatSend = document.getElementById('ai-chat-send');
    const aiTools = document.querySelectorAll('.ai-tool-btn');
    
    // Navegación entre pestañas
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            showTab(tabId);
        });
    });
    
    // Botones para añadir elementos
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => showModal('task-modal'));
    }
    
    if (addSubjectBtn) {
        addSubjectBtn.addEventListener('click', () => showModal('subject-modal'));
    }
    
    if (addExamBtn) {
        addExamBtn.addEventListener('click', () => showModal('exam-modal'));
    }
    
    // Filtros de tareas
    taskFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            const filterType = filter.getAttribute('data-filter');
            filterTasks(filterType);
            
            // Actualizar UI de los botones de filtro
            taskFilters.forEach(f => {
                f.classList.remove('bg-indigo-600', 'text-white');
                f.classList.add('bg-gray-200');
            });
            filter.classList.remove('bg-gray-200');
            filter.classList.add('bg-indigo-600', 'text-white');
        });
    });
    
    // Cambio de tema
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Eventos de modales
    if (cancelTask) {
        cancelTask.addEventListener('click', () => hideModal('task-modal'));
    }
    
    if (cancelSubject) {
        cancelSubject.addEventListener('click', () => hideModal('subject-modal'));
    }
    
    if (cancelExam) {
        cancelExam.addEventListener('click', () => hideModal('exam-modal'));
    }
    
    // Guardar datos
    if (saveTask) {
        saveTask.addEventListener('click', () => {
            const title = document.getElementById('task-title').value;
            const description = document.getElementById('task-description').value;
            const subject = document.getElementById('task-subject').value;
            const dueDate = document.getElementById('task-due-date').value;
            
            if (title && dueDate) {
                addTask({
                    title,
                    description,
                    subject,
                    dueDate,
                    completed: false,
                    important: false
                });
                
                hideModal('task-modal');
                
                // Limpiar formulario
                document.getElementById('task-title').value = '';
                document.getElementById('task-description').value = '';
            } else {
                alert('Por favor completa los campos requeridos');
            }
        });
    }
    
    // Guardar materia
    if (saveSubject) {
        saveSubject.addEventListener('click', async () => {
            const name = document.getElementById('subject-name').value;
            const teacher = document.getElementById('subject-teacher').value;
            const schedule = document.getElementById('subject-schedule').value;
            const classroom = document.getElementById('subject-classroom').value;
            
            if (name) {
                const result = await saveSubject({
                    name,
                    teacher,
                    schedule,
                    classroom
                });
                
                if (result.success) {
                    hideModal('subject-modal');
                    loadSubjects();
                    
                    // Limpiar formulario
                    document.getElementById('subject-name').value = '';
                    document.getElementById('subject-teacher').value = '';
                    document.getElementById('subject-schedule').value = '';
                    document.getElementById('subject-classroom').value = '';
                } else {
                    alert('Error al guardar la materia: ' + result.error);
                }
            } else {
                alert('Por favor completa el nombre de la materia');
            }
        });
    }
    
    // Guardar examen
    if (saveExam) {
        saveExam.addEventListener('click', async () => {
            const title = document.getElementById('exam-title').value;
            const subject = document.getElementById('exam-subject').value;
            const date = document.getElementById('exam-date').value;
            const time = document.getElementById('exam-time').value;
            const classroom = document.getElementById('exam-classroom').value;
            const duration = document.getElementById('exam-duration').value;
            const notes = document.getElementById('exam-notes').value;
            
            if (title && subject && date) {
                const result = await saveExam({
                    title,
                    subject,
                    date,
                    time,
                    classroom,
                    duration,
                    notes
                });
                
                if (result.success) {
                    hideModal('exam-modal');
                    loadExams();
                    
                    // Limpiar formulario
                    document.getElementById('exam-title').value = '';
                    document.getElementById('exam-subject').value = '';
                    document.getElementById('exam-date').value = '';
                    document.getElementById('exam-time').value = '';
                    document.getElementById('exam-classroom').value = '';
                    document.getElementById('exam-duration').value = '';
                    document.getElementById('exam-notes').value = '';
                } else {
                    alert('Error al guardar el examen: ' + result.error);
                }
            } else {
                alert('Por favor completa los campos requeridos');
            }
        });
    }
    
    // Chat con IA
    if (aiChatSend) {
        aiChatSend.addEventListener('click', () => {
            const chatInput = document.getElementById('ai-chat-input');
            const chatMessages = document.getElementById('ai-chat-messages');
            
            if (chatInput.value.trim() !== '') {
                // Añadir mensaje del usuario
                chatMessages.innerHTML += `
                    <div class="flex justify-end mb-2">
                        <div class="bg-indigo-500 text-white rounded-lg p-2 max-w-xs ml-auto">
                            <p class="text-sm">${chatInput.value}</p>
                        </div>
                    </div>
                `;
                
                // Procesar mensaje y obtener respuesta
                const response = processMessage(chatInput.value);
                
                // Simular tiempo de respuesta
                setTimeout(() => {
                    chatMessages.innerHTML += `
                        <div class="flex mb-2">
                            <div class="bg-indigo-100 rounded-lg p-2 max-w-xs">
                                <p class="text-sm">${response}</p>
                            </div>
                        </div>
                    `;
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 1000);
                
                chatInput.value = '';
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        });
    }
    
    // Herramientas de IA
    if (aiTools) {
        aiTools.forEach(tool => {
            tool.addEventListener('click', function() {
                const toolId = this.getAttribute('data-tool');
                showAITool(toolId);
            });
        });
    }
    
    // Resumidor de textos
    const summarizeBtn = document.getElementById('summarize-btn');
    if (summarizeBtn) {
        summarizeBtn.addEventListener('click', () => {
            const inputText = document.getElementById('ai-input').value;
            const outputDiv = document.getElementById('ai-output');
            
            if (inputText.trim() !== '') {
                const summary = summarizeText(inputText);
                outputDiv.innerHTML = `<p>${summary}</p>`;
            } else {
                outputDiv.innerHTML = '<p class="text-red-500">Por favor, ingresa un texto para resumir.</p>';
            }
        });
    }
}

// Función para actualizar el contador de exámenes
function updateExamsCounter() {
    const upcomingExams = document.getElementById('upcoming-exams-count');
    if (upcomingExams) {
        // Obtener exámenes y filtrar los próximos
        getExams().then(result => {
            if (result.success) {
                const today = new Date();
                const nextExams = result.exams.filter(exam => {
                    const examDate = new Date(exam.date);
                    return examDate >= today;
                });
                
                upcomingExams.textContent = nextExams.length;
                
                // Actualizar contador en el dashboard
                const dashboardCounter = document.querySelector('#dashboard div:nth-child(2) p.text-3xl');
                if (dashboardCounter) {
                    dashboardCounter.textContent = nextExams.length;
                }
            }
        });
    }
}

// Función para mostrar herramientas de IA
function showAITool(toolId) {
    const aiToolsContainer = document.getElementById('ai-tools-container');
    if (!aiToolsContainer) return;
    
    let toolHTML = '';
    
    switch(toolId) {
        case 'summarizer':
            toolHTML = `
                <div class="bg-white rounded-lg shadow p-4">
                    <h3 class="font-semibold text-lg mb-3">Resumidor de Textos</h3>
                    <div class="mb-4">
                        <label for="ai-input" class="block text-sm font-medium text-gray-700 mb-1">Texto a resumir:</label>
                        <textarea id="ai-input" rows="6" class="w-full border rounded-lg p-2"></textarea>
                    </div>
                    <button id="summarize-btn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Resumir</button>
                    <div id="ai-output" class="mt-4 p-3 bg-gray-50 rounded-lg"></div>
                </div>
            `;
            break;
        case 'ideas':
            toolHTML = `
                <div class="bg-white rounded-lg shadow p-4">
                    <h3 class="font-semibold text-lg mb-3">Generador de Ideas</h3>
                    <div class="mb-4">
                        <label for="ai-topic" class="block text-sm font-medium text-gray-700 mb-1">Tema:</label>
                        <input type="text" id="ai-topic" class="w-full border rounded-lg p-2">
                    </div>
                    <button id="generate-ideas-btn" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Generar Ideas</button>
                    <div id="ai-output" class="mt-4 p-3 bg-gray-50 rounded-lg"></div>
                </div>
            `;
            break;
        case 'tutor':
            toolHTML = `
                <div class="bg-white rounded-lg shadow p-4">
                    <h3 class="font-semibold text-lg mb-3">Tutor de Preguntas</h3>
                    <div id="ai-chat-messages" class="h-64 overflow-y-auto mb-4 p-2 border rounded-lg custom-scroll"></div>
                    <div class="flex">
                        <input type="text" id="ai-chat-input" class="flex-1 border rounded-lg rounded-r-none p-2" placeholder="Escribe tu pregunta...">
                        <button id="ai-chat-send" class="bg-purple-600 text-white px-4 py-2 rounded-l-none rounded-r-lg hover:bg-purple-700">Enviar</button>
                    </div>
                </div>
            `;
            break;
        case 'exams':
            toolHTML = `
                <div class="bg-white rounded-lg shadow p-4">
                    <h3 class="font-semibold text-lg mb-3">Simulador de Exámenes</h3>
                    <div class="mb-4">
                        <label for="ai-exam-subject" class="block text-sm font-medium text-gray-700 mb-1">Materia:</label>
                        <select id="ai-exam-subject" class="w-full border rounded-lg p-2">
                            <option value="">Selecciona una materia</option>
                            <option value="matematicas">Matemáticas</option>
                            <option value="historia">Historia</option>
                            <option value="ciencias">Ciencias</option>
                            <option value="literatura">Literatura</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label for="ai-exam-difficulty" class="block text-sm font-medium text-gray-700 mb-1">Dificultad:</label>
                        <select id="ai-exam-difficulty" class="w-full border rounded-lg p-2">
                            <option value="facil">Fácil</option>
                            <option value="medio">Medio</option>
                            <option value="dificil">Difícil</option>
                        </select>
                    </div>
                    <button id="generate-exam-btn" class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Generar Examen</button>
                    <div id="ai-output" class="mt-4 p-3 bg-gray-50 rounded-lg"></div>
                </div>
            `;
            break;
        default:
            toolHTML = `
                <div class="bg-white rounded-lg shadow p-4">
                    <h3 class="font-semibold text-lg mb-3">Selecciona una herramienta</h3>
                    <p class="text-gray-500">Por favor, selecciona una de las herramientas de IA disponibles.</p>
                </div>
            `;
    }
    
    aiToolsContainer.innerHTML = toolHTML;
    
    // Configurar eventos específicos de cada herramienta
    if (toolId === 'summarizer') {
        const summarizeBtn = document.getElementById('summarize-btn');
        if (summarizeBtn) {
            summarizeBtn.addEventListener('click', () => {
                const inputText = document.getElementById('ai-input').value;
                const outputDiv = document.getElementById('ai-output');
                
                if (inputText.trim() !== '') {
                    const summary = summarizeText(inputText);
                    outputDiv.innerHTML = `<p>${summary}</p>`;
                } else {
                    outputDiv.innerHTML = '<p class="text-red-500">Por favor, ingresa un texto para resumir.</p>';
                }
            });
        }
    } else if (toolId === 'ideas') {
        const generateIdeasBtn = document.getElementById('generate-ideas-btn');
        if (generateIdeasBtn) {
            generateIdeasBtn.addEventListener('click', () => {
                const topic = document.getElementById('ai-topic').value;
                const outputDiv = document.getElementById('ai-output');
                
                if (topic.trim() !== '') {
                    const ideas = generateIdeas(topic);
                    let ideasHTML = '<ul class="list-disc pl-5">';
                    ideas.forEach(idea => {
                        ideasHTML += `<li class="mb-2">${idea}</li>`;
                    });
                    ideasHTML += '</ul>';
                    outputDiv.innerHTML = ideasHTML;
                } else {
                    outputDiv.innerHTML = '<p class="text-red-500">Por favor, ingresa un tema para generar ideas.</p>';
                }
            });
        }
    } else if (toolId === 'tutor') {
        const aiChatSend = document.getElementById('ai-chat-send');
        if (aiChatSend) {
            aiChatSend.addEventListener('click', () => {
                const chatInput = document.getElementById('ai-chat-input');
                const chatMessages = document.getElementById('ai-chat-messages');
                
                if (chatInput.value.trim() !== '') {
                    // Añadir mensaje del usuario
                    chatMessages.innerHTML += `
                        <div class="flex justify-end mb-2">
                            <div class="bg-indigo-500 text-white rounded-lg p-2 max-w-xs ml-auto">
                                <p class="text-sm">${chatInput.value}</p>
                            </div>
                        </div>
                    `;
                    
                    // Procesar mensaje y obtener respuesta
                    const response = processMessage(chatInput.value);
                    
                    // Simular tiempo de respuesta
                    setTimeout(() => {
                        chatMessages.innerHTML += `
                            <div class="flex mb-2">
                                <div class="bg-indigo-100 rounded-lg p-2 max-w-xs">
                                    <p class="text-sm">${response}</p>
                                </div>
                            </div>
                        `;
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 1000);
                    
                    chatInput.value = '';
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            });
        }
    }
}