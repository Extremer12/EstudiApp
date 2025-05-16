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
    config.darkMode = !config.darkMode;
    
    // Cambiar el icono del botón
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.classList.toggle('fa-moon');
        themeIcon.classList.toggle('fa-sun');
    }
}