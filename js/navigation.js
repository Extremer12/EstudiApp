/* ===== NAVIGATION FUNCTIONALITY ===== */

class NavigationManager {
  constructor() {
    this.navToggle = null;
    this.navList = null;
    this.navOverlay = null;
    this.isMenuOpen = false;
    
    this.init();
  }
  
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupNavigation());
    } else {
      this.setupNavigation();
    }
  }
  
  setupNavigation() {
    this.navToggle = document.getElementById('navToggle');
    this.navList = document.getElementById('navList');
    
    if (!this.navToggle || !this.navList) {
      console.warn('Navigation elements not found');
      return;
    }
    
    this.createOverlay();
    this.bindEvents();
    this.setActiveLink();
  }
  
  createOverlay() {
    // Create overlay for mobile menu
    this.navOverlay = document.createElement('div');
    this.navOverlay.className = 'nav-overlay';
    this.navOverlay.id = 'navOverlay';
    document.body.appendChild(this.navOverlay);
  }
  
  bindEvents() {
    // Toggle menu on hamburger click
    this.navToggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMenu();
    });
    
    // Close menu on overlay click
    this.navOverlay.addEventListener('click', () => {
      this.closeMenu();
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
      }
    });
    
    // Close menu on nav link click (mobile)
    const navLinks = this.navList.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          this.closeMenu();
        }
      });
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isMenuOpen) {
        this.closeMenu();
      }
    });
    
    // Prevent body scroll when menu is open
    this.navList.addEventListener('transitionend', () => {
      if (!this.isMenuOpen) {
        document.body.style.overflow = '';
      }
    });
  }
  
  toggleMenu() {
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }
  
  openMenu() {
    this.isMenuOpen = true;
    this.navToggle.classList.add('active');
    this.navList.classList.add('active');
    this.navOverlay.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Set focus to first nav link for accessibility
    const firstLink = this.navList.querySelector('.nav-link');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 300);
    }
    
    // Update aria attributes
    this.navToggle.setAttribute('aria-expanded', 'true');
    this.navList.setAttribute('aria-hidden', 'false');
  }
  
  closeMenu() {
    this.isMenuOpen = false;
    this.navToggle.classList.remove('active');
    this.navList.classList.remove('active');
    this.navOverlay.classList.remove('active');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Update aria attributes
    this.navToggle.setAttribute('aria-expanded', 'false');
    this.navList.setAttribute('aria-hidden', 'true');
  }
  
  setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = this.navList.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      
      if (href === currentPage || 
          (currentPage === '' && href === 'index.html') ||
          (currentPage === 'index.html' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
  
  // Public method to update active link programmatically
  updateActiveLink(pageName) {
    const navLinks = this.navList.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === pageName) {
        link.classList.add('active');
      }
    });
  }
  
  // Public method to add navigation to other pages
  static addToPage(containerId = 'app') {
    const container = document.getElementById(containerId) || document.body;
    const existingHeader = container.querySelector('.header');
    
    if (existingHeader) {
      console.warn('Header already exists on this page');
      return;
    }
    
    const headerHTML = `
      <header class="header">
        <div class="header-left">
          <h1>EstudiApp</h1>
        </div>
        <nav class="header-nav">
          <div class="nav-menu" id="navMenu">
            <button class="nav-toggle" id="navToggle" aria-label="Abrir menú de navegación">
              <span class="hamburger"></span>
              <span class="hamburger"></span>
              <span class="hamburger"></span>
            </button>
            <ul class="nav-list" id="navList">
              <li class="nav-item">
                <a href="index.html" class="nav-link">
                  <span class="nav-icon">🏠</span>
                  <span class="nav-text">Inicio</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="materias.html" class="nav-link">
                  <span class="nav-icon">📚</span>
                  <span class="nav-text">Materias</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="calendar.html" class="nav-link">
                  <span class="nav-icon">📅</span>
                  <span class="nav-text">Calendario</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="pomodoro.html" class="nav-link">
                  <span class="nav-icon">⏱️</span>
                  <span class="nav-text">Pomodoro</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="reminders.html" class="nav-link">
                  <span class="nav-icon">🔔</span>
                  <span class="nav-text">Recordatorios</span>
                </a>
              </li>
              <li class="nav-item">
                <a href="streaks.html" class="nav-link">
                  <span class="nav-icon">🔥</span>
                  <span class="nav-text">Rachas</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
        <div class="header-right">
          <button id="darkModeToggle" class="btn-icon">🌙</button>
        </div>
      </header>
    `;
    
    container.insertAdjacentHTML('afterbegin', headerHTML);
    
    // Initialize navigation after adding to DOM
    new NavigationManager();
  }
}

// Initialize navigation manager
const navigationManager = new NavigationManager();

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.NavigationManager = NavigationManager;
  window.navigationManager = navigationManager;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavigationManager;
}