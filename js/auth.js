// Funcionalidad para la página de autenticación
import { registerUser, loginUser } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const loginTabBtn = document.getElementById('login-tab-btn');
    const registerTabBtn = document.getElementById('register-tab-btn');
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');
    const goToRegister = document.getElementById('go-to-register');
    const goToLogin = document.getElementById('go-to-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    // Función para cambiar entre paneles
    function showPanel(panel) {
        if (panel === 'login') {
            // Ocultar panel de registro primero
            registerPanel.classList.add('hidden');
            // Mostrar panel de login con animación
            loginPanel.classList.remove('hidden');
            loginPanel.classList.add('panel-animation');
            loginTabBtn.classList.add('login-tab-active');
            registerTabBtn.classList.remove('login-tab-active');
        } else {
            // Ocultar panel de login primero
            loginPanel.classList.add('hidden');
            // Mostrar panel de registro con animación
            registerPanel.classList.remove('hidden');
            registerPanel.classList.add('panel-animation');
            loginTabBtn.classList.remove('login-tab-active');
            registerTabBtn.classList.add('login-tab-active');
        }
    }

    // Event listeners para cambiar entre paneles
    loginTabBtn.addEventListener('click', () => showPanel('login'));
    registerTabBtn.addEventListener('click', () => showPanel('register'));
    goToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        showPanel('register');
    });
    goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showPanel('login');
    });

    // Manejar envío del formulario de login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Ocultar mensaje de error previo
        loginError.classList.add('hidden');
        
        // Obtener valores del formulario
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Validación básica
        if (!email || !password) {
            showError(loginError, 'Por favor, completa todos los campos');
            return;
        }
        
        try {
            // Mostrar indicador de carga
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            submitBtn.disabled = true;
            
            // Añadir clase de deshabilitado
            submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
            
            // Intentar iniciar sesión
            const result = await loginUser(email, password);
            
            if (result.success) {
                // Mostrar animación de éxito
                submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Éxito!';
                submitBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
                submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
                
                // Esperar un momento antes de redirigir
                setTimeout(() => {
                    // Redirigir al dashboard
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showError(loginError, result.error || 'Error al iniciar sesión');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            }
        } catch (error) {
            showError(loginError, 'Error inesperado. Por favor, intenta de nuevo.');
            console.error('Error de login:', error);
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
    });
    
    // Manejar envío del formulario de registro
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Ocultar mensaje de error previo
        registerError.classList.add('hidden');
        
        // Obtener valores del formulario
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const termsAccepted = document.getElementById('terms').checked;
        
        // Validación básica
        if (!name || !email || !password || !confirmPassword) {
            showError(registerError, 'Por favor, completa todos los campos');
            return;
        }
        
        if (password !== confirmPassword) {
            showError(registerError, 'Las contraseñas no coinciden');
            return;
        }
        
        if (password.length < 6) {
            showError(registerError, 'La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        if (!termsAccepted) {
            showError(registerError, 'Debes aceptar los términos y condiciones');
            return;
        }
        
        try {
            // Mostrar indicador de carga
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            submitBtn.disabled = true;
            
            // Intentar registrar usuario
            const result = await registerUser(email, password);
            
            if (result.success) {
                // Actualizar nombre de usuario si es necesario
                // Aquí podrías añadir código para guardar el nombre del usuario
                
                // Redirigir al dashboard
                window.location.href = 'index.html';
            } else {
                showError(registerError, result.error || 'Error al crear la cuenta');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            showError(registerError, 'Error inesperado. Por favor, intenta de nuevo.');
            console.error('Error de registro:', error);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Función para mostrar mensajes de error
    function showError(element, message) {
        element.textContent = message;
        element.classList.remove('hidden');
        
        // Hacer que el mensaje de error sea visible
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Verificar si hay un parámetro en la URL para mostrar un panel específico
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'register') {
        showPanel('register');
    } else {
        showPanel('login');
    }
});