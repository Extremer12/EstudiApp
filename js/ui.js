// Funciones relacionadas con la interfaz de usuario
import config from './config.js';

// Mostrar/ocultar pestañas
export function showTab(tabId) {
    // Ocultar todos los paneles
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.add('hidden');
        tab.classList.remove('fade-in');
    });
    
    // Mostrar el panel seleccionado
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
        selectedTab.classList.add('fade-in');
    }
    
    // Actualizar botones de navegación
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        const buttonTabId = button.getAttribute('data-tab');
        if (buttonTabId === tabId) {
            button.classList.add('active');
            button.classList.add('text-indigo-600');
            button.classList.remove('text-gray-500');
        } else {
            button.classList.remove('active');
            button.classList.remove('text-indigo-600');
            button.classList.add('text-gray-500');
        }
    });
}

// Funciones para mostrar modales
export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.querySelector('div').classList.remove('scale-95');
            modal.querySelector('div').classList.add('scale-100');
        }, 10);
    }
}

export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.querySelector('div').classList.remove('scale-100');
        modal.querySelector('div').classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

// Cambiar tema claro/oscuro
export function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    // Verificar si config está definido antes de usarlo
    if (typeof config !== 'undefined') {
        config.darkMode = !config.darkMode;
    }
    
    // Cambiar el icono del botón
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.classList.toggle('fa-moon');
        themeIcon.classList.toggle('fa-sun');
    }
    
    // Aplicar estilos de modo oscuro
    if (document.body.classList.contains('dark-mode')) {
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = '#f1f1f1';
        
        // Aplicar estilos a elementos específicos
        applyDarkModeStyles();
    } else {
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
        
        // Restaurar estilos originales
        removeDarkModeStyles();
    }
}

// Función para aplicar estilos de modo oscuro a elementos específicos
function applyDarkModeStyles() {
    // Tarjetas y contenedores
    const whiteElements = document.querySelectorAll('.bg-white');
    whiteElements.forEach(el => {
        el.classList.remove('bg-white');
        el.classList.add('bg-gray-800');
    });
    
    // Textos en gris
    const grayTextElements = document.querySelectorAll('.text-gray-700, .text-gray-800, .text-gray-600, .text-gray-500');
    grayTextElements.forEach(el => {
        if (el.classList.contains('text-gray-700')) {
            el.classList.remove('text-gray-700');
            el.classList.add('text-gray-300');
        }
        if (el.classList.contains('text-gray-800')) {
            el.classList.remove('text-gray-800');
            el.classList.add('text-gray-200');
        }
        if (el.classList.contains('text-gray-600')) {
            el.classList.remove('text-gray-600');
            el.classList.add('text-gray-400');
        }
        if (el.classList.contains('text-gray-500')) {
            el.classList.remove('text-gray-500');
            el.classList.add('text-gray-400');
        }
    });
    
    // Bordes
    const borderElements = document.querySelectorAll('[class*="border-gray-"]');
    borderElements.forEach(el => {
        el.classList.forEach(cls => {
            if (cls.startsWith('border-gray-')) {
                el.classList.remove(cls);
                el.classList.add('border-gray-700');
            }
        });
    });
    
    // Inputs y selects
    const formElements = document.querySelectorAll('input, select, textarea');
    formElements.forEach(el => {
        el.classList.add('bg-gray-700', 'text-white', 'border-gray-600');
    });
    
    // Modales
    const modals = document.querySelectorAll('.modal-transition');
    modals.forEach(modal => {
        if (modal.classList.contains('bg-white')) {
            modal.classList.remove('bg-white');
            modal.classList.add('bg-gray-800');
        }
    });
    
    // Menú inferior
    const bottomNav = document.querySelector('.fixed.bottom-0.left-0.right-0.bg-white');
    if (bottomNav) {
        bottomNav.classList.remove('bg-white');
        bottomNav.classList.add('bg-gray-800');
    }
}

// Función para restaurar los estilos originales
function removeDarkModeStyles() {
    // Restaurar tarjetas y contenedores
    const darkElements = document.querySelectorAll('.bg-gray-800');
    darkElements.forEach(el => {
        el.classList.remove('bg-gray-800');
        el.classList.add('bg-white');
    });
    
    // Restaurar textos
    const lightTextElements = document.querySelectorAll('.text-gray-300, .text-gray-200, .text-gray-400');
    lightTextElements.forEach(el => {
        if (el.classList.contains('text-gray-300')) {
            el.classList.remove('text-gray-300');
            el.classList.add('text-gray-700');
        }
        if (el.classList.contains('text-gray-200')) {
            el.classList.remove('text-gray-200');
            el.classList.add('text-gray-800');
        }
        if (el.classList.contains('text-gray-400')) {
            el.classList.remove('text-gray-400');
            el.classList.add('text-gray-600');
        }
    });
    
    // Restaurar bordes
    const borderElements = document.querySelectorAll('.border-gray-700');
    borderElements.forEach(el => {
        el.classList.remove('border-gray-700');
        el.classList.add('border-gray-200');
    });
    
    // Restaurar inputs y selects
    const formElements = document.querySelectorAll('input, select, textarea');
    formElements.forEach(el => {
        el.classList.remove('bg-gray-700', 'text-white', 'border-gray-600');
    });
    
    // Restaurar menú inferior
    const bottomNav = document.querySelector('.fixed.bottom-0.left-0.right-0.bg-gray-800');
    if (bottomNav) {
        bottomNav.classList.remove('bg-gray-800');
        bottomNav.classList.add('bg-white');
    }
}