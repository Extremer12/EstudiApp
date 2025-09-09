/* ========================================
   MENÚ TOGGLE FUNCIONAL - VERSIÓN SIMPLIFICADA
======================================== */

class MenuManager {
  constructor() {
    this.isOpen = false;
    this.menuToggle = null;
    this.sidebarMenu = null;
    this.sidebarOverlay = null;
    this.sidebarClose = null;
    this.themeToggleBtn = null;
  }

  init() {
    this.findElements();
    this.attachEventListeners();
    this.ensureMenuIsClosed();
    this.updateThemeToggle();
    console.log("✅ Menu Manager initialized");
  }

  findElements() {
    this.menuToggle = document.getElementById("menuToggle");
    this.sidebarMenu = document.getElementById("sidebarMenu");
    this.sidebarOverlay = document.getElementById("sidebarOverlay");
    this.sidebarClose = document.getElementById("sidebarClose");
    this.themeToggleBtn = document.getElementById("darkModeToggle");

    if (!this.menuToggle || !this.sidebarMenu || !this.sidebarOverlay) {
      console.error("❌ Required menu elements not found");
      return false;
    }

    console.log("✅ All menu elements found");
    return true;
  }

  attachEventListeners() {
    // Toggle del menú
    this.menuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleMenu();
    });

    // Botón de cerrar
    if (this.sidebarClose) {
      this.sidebarClose.addEventListener("click", (e) => {
        e.preventDefault();
        this.closeMenu();
      });
    }

    // Overlay para cerrar
    this.sidebarOverlay.addEventListener("click", (e) => {
      if (e.target === this.sidebarOverlay) {
        this.closeMenu();
      }
    });

    // Cerrar con Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.closeMenu();
      }
    });

    // Toggle de tema
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleTheme();
      });
    }

    // Enlaces de navegación
    const navLinks = document.querySelectorAll(".sidebar-menu .nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const href = link.getAttribute("href");
        if (href && href !== "#") {
          this.closeMenu();
        }
      });
    });

    console.log("✅ Event listeners attached");
  }

  toggleMenu() {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.isOpen = true;
    this.sidebarMenu.classList.add("active");
    this.sidebarOverlay.classList.add("active");
    this.menuToggle.classList.add("active");
    document.body.classList.add("sidebar-open");

    console.log("📂 Menu opened");
  }

  closeMenu() {
    this.isOpen = false;
    this.sidebarMenu.classList.remove("active");
    this.sidebarOverlay.classList.remove("active");
    this.menuToggle.classList.remove("active");
    document.body.classList.remove("sidebar-open");

    console.log("📁 Menu closed");
  }

  ensureMenuIsClosed() {
    this.isOpen = false;
    this.sidebarMenu.classList.remove("active");
    this.sidebarOverlay.classList.remove("active");
    this.menuToggle.classList.remove("active");
    document.body.classList.remove("sidebar-open");
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    this.updateThemeToggle();
    console.log("🎨 Theme changed to:", newTheme);
  }

  updateThemeToggle() {
    if (!this.themeToggleBtn) return;

    const currentTheme = document.documentElement.getAttribute("data-theme");
    const themeText = this.themeToggleBtn.querySelector(".theme-text");
    const themeIcon = this.themeToggleBtn.querySelector(".theme-icon");

    if (themeText && themeIcon) {
      if (currentTheme === "dark") {
        themeText.textContent = "Modo Claro";
        themeIcon.textContent = "☀️";
      } else {
        themeText.textContent = "Modo Oscuro";
        themeIcon.textContent = "🌙";
      }
    }
  }
}

/* ========================================
   INICIALIZACIÓN
======================================== */

let menuManager = null;

// Función principal de inicialización
function initializeMenu() {
  // Esperar a que el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMenu);
  } else {
    initMenu();
  }
}

function initMenu() {
  try {
    menuManager = new MenuManager();

    // Verificar que los elementos existan antes de inicializar
    if (menuManager.findElements()) {
      menuManager.init();

      // Hacer disponible globalmente
      window.menuManager = menuManager;

      console.log("✅ Menu initialized successfully");
    } else {
      console.error("❌ Failed to find required menu elements");
    }
  } catch (error) {
    console.error("❌ Error initializing menu:", error);
  }
}

// Función para actualizar el toggle del tema
function updateDarkModeToggle() {
  if (menuManager) {
    menuManager.updateThemeToggle();
  }
}

// Inicializar cuando se carga el script
initializeMenu();

// Exportar para uso global
window.MenuManager = MenuManager;
window.initializeMenu = initializeMenu;
window.updateDarkModeToggle = updateDarkModeToggle;
