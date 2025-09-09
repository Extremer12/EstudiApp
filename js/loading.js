/* ========================================
   LOADING SCREEN MANAGER
======================================== */

class LoadingManager {
  constructor() {
    this.loadingScreen = document.getElementById('loadingScreen');
    this.minLoadingTime = 1500; // Tiempo mínimo de carga en ms
    this.startTime = Date.now();
    this.resourcesLoaded = false;
    this.domReady = false;
    
    this.init();
  }

  init() {
    // Verificar si el DOM está listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.domReady = true;
        this.checkIfReady();
      });
    } else {
      this.domReady = true;
    }

    // Verificar si todos los recursos están cargados
    if (document.readyState === 'complete') {
      this.resourcesLoaded = true;
      this.checkIfReady();
    } else {
      window.addEventListener('load', () => {
        this.resourcesLoaded = true;
        this.checkIfReady();
      });
    }

    // Fallback: ocultar después de un tiempo máximo
    setTimeout(() => {
      this.hideLoading();
    }, 5000);
  }

  checkIfReady() {
    if (this.domReady && this.resourcesLoaded) {
      const elapsedTime = Date.now() - this.startTime;
      const remainingTime = Math.max(0, this.minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        this.hideLoading();
      }, remainingTime);
    }
  }

  hideLoading() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('fade-out');
      
      // Remover el elemento después de la animación
      setTimeout(() => {
        if (this.loadingScreen && this.loadingScreen.parentNode) {
          this.loadingScreen.parentNode.removeChild(this.loadingScreen);
        }
        
        // Permitir scroll del body
        document.body.style.overflow = 'auto';
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('appLoaded'));
      }, 500);
    }
  }

  // Método para mostrar la pantalla de carga manualmente
  showLoading() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.remove('fade-out');
      document.body.style.overflow = 'hidden';
    }
  }
}

// Prevenir scroll mientras se carga
document.body.style.overflow = 'hidden';

// Inicializar el manager de carga
const loadingManager = new LoadingManager();

// Exportar para uso global si es necesario
window.LoadingManager = LoadingManager;
window.loadingManager = loadingManager;