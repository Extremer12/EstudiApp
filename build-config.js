// CONFIGURACIÓN DE BUILD PARA PRODUCCIÓN

// Configuración para minimizar CSS
const cssMinifyConfig = {
  removeComments: true,
  removeEmptyRules: true,
  mergeRules: true,
  minifySelectors: true,
  optimizeBackground: true,
  optimizeBorderRadius: true,
  optimizeDisplay: true,
  optimizeFilter: true,
  optimizeFontWeight: true,
  optimizeOutline: true,
  removeUnusedAtRules: true,
  removeRedundantAttributes: true,
  removeEmptyAtRules: true,
  mergeLonghand: true,
  mergeIntoShorthands: true,
  convertValues: true,
  removeUnusedLocalIdents: true
};

// Lista de archivos CSS para combinar
const cssFiles = [
  'css/variables.css',
  'css/base.css',
  'css/layout.css',
  'css/components.css',
  'css/timer.css',
  'css/subjects.css',
  'css/streaks.css',
  'css/events.css',
  'css/responsive.css'
];

// Lista de archivos JS para combinar (en orden de dependencia)
const jsFiles = [
  'core.js',
  'subjects.js',
  'pomodoro.js',
  'streaks.js'
];

// Archivos JS para carga diferida
const lazyJsFiles = [
  'reminders.js',
  'calendar.js'
];

// Configuración de compresión
const compressionConfig = {
  gzip: true,
  brotli: true,
  level: 9
};

// Configuración de optimización de imágenes
const imageOptimization = {
  quality: 85,
  progressive: true,
  optimizationLevel: 7
};

module.exports = {
  cssMinifyConfig,
  cssFiles,
  jsFiles,
  lazyJsFiles,
  compressionConfig,
  imageOptimization
};