// ========================================
// PRUEBAS BÁSICAS PARA ESTUDIAPP
// ========================================

// Función principal para ejecutar todas las pruebas
function runBasicTests() {
  console.log('🧪 Iniciando pruebas básicas de EstudiApp...');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  // Ejecutar todas las pruebas
  testLocalStorageOperations(results);
  testDataStructures(results);
  testValidationFunctions(results);
  testUIElements(results);
  testServiceWorker(results);
  
  // Mostrar resultados finales
  console.log(`\n📊 Resultados de las pruebas:`);
  console.log(`✅ Pasaron: ${results.passed}`);
  console.log(`❌ Fallaron: ${results.failed}`);
  console.log(`📈 Total: ${results.total}`);
  console.log(`🎯 Porcentaje de éxito: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  return results;
}

// Función auxiliar para ejecutar una prueba
function runTest(testName, testFunction, results) {
  results.total++;
  try {
    const result = testFunction();
    if (result) {
      console.log(`✅ ${testName}`);
      results.passed++;
    } else {
      console.log(`❌ ${testName}`);
      results.failed++;
    }
  } catch (error) {
    console.log(`❌ ${testName} - Error: ${error.message}`);
    results.failed++;
  }
}

// Pruebas de operaciones de localStorage
function testLocalStorageOperations(results) {
  console.log('\n🗄️ Probando operaciones de localStorage...');
  
  runTest('localStorage disponible', () => {
    return typeof Storage !== 'undefined' && localStorage;
  }, results);
  
  runTest('Función safeLocalStorageOperation existe', () => {
    return typeof safeLocalStorageOperation === 'function';
  }, results);
  
  runTest('Guardar y recuperar datos de prueba', () => {
    const testData = JSON.stringify({ test: 'data', timestamp: Date.now() });
    const saved = safeLocalStorageOperation('set', 'test_key', testData);
    const retrieved = safeLocalStorageOperation('get', 'test_key');
    safeLocalStorageOperation('remove', 'test_key');
    return saved && retrieved === testData;
  }, results);
}

// Pruebas de estructuras de datos
function testDataStructures(results) {
  console.log('\n📊 Probando estructuras de datos...');
  
  runTest('Función getInitialData existe', () => {
    return typeof getInitialData === 'function';
  }, results);
  
  runTest('Estructura de datos inicial válida', () => {
    const initialData = getInitialData();
    return initialData && 
           typeof initialData.subjects === 'object' &&
           typeof initialData.reminders === 'object' &&
           typeof initialData.streaks === 'object';
  }, results);
  
  runTest('Función loadData existe', () => {
    return typeof loadData === 'function';
  }, results);
  
  runTest('Función saveData existe', () => {
    return typeof saveData === 'function';
  }, results);
}

// Pruebas de funciones de validación
function testValidationFunctions(results) {
  console.log('\n✅ Probando funciones de validación...');
  
  runTest('Función validateInput existe', () => {
    return typeof validateInput === 'function';
  }, results);
  
  runTest('Validación de campo vacío', () => {
    const result = validateInput('', 'text');
    return !result.valid && result.message;
  }, results);
  
  runTest('Validación de número válido', () => {
    const result = validateInput('25', 'number', 1, 100);
    return result.valid;
  }, results);
  
  runTest('Validación de número fuera de rango', () => {
    const result = validateInput('150', 'number', 1, 100);
    return !result.valid;
  }, results);
  
  runTest('Función showError existe', () => {
    return typeof showError === 'function';
  }, results);
  
  runTest('Función showSuccess existe', () => {
    return typeof showSuccess === 'function';
  }, results);
}

// Pruebas de elementos de UI
function testUIElements(results) {
  console.log('\n🎨 Probando elementos de UI...');
  
  runTest('Elemento principal existe', () => {
    return document.querySelector('.main') !== null;
  }, results);
  
  runTest('Sección de temporizador existe', () => {
    return document.querySelector('.timer-section') !== null;
  }, results);
  
  runTest('Sección de rachas existe', () => {
    return document.querySelector('.streak-section') !== null;
  }, results);
  
  runTest('Sección de materias existe', () => {
    return document.querySelector('.subjects-section') !== null;
  }, results);
  
  runTest('Botón de modo oscuro existe', () => {
    return document.querySelector('.dark-mode-toggle') !== null;
  }, results);
  
  runTest('Variables CSS cargadas', () => {
    const testElement = document.createElement('div');
    document.body.appendChild(testElement);
    const styles = getComputedStyle(testElement);
    const primaryColor = styles.getPropertyValue('--primary-500');
    document.body.removeChild(testElement);
    return primaryColor && primaryColor.trim() !== '';
  }, results);
}

// Pruebas del Service Worker
function testServiceWorker(results) {
  console.log('\n⚙️ Probando Service Worker...');
  
  runTest('Service Worker soportado', () => {
    return 'serviceWorker' in navigator;
  }, results);
  
  runTest('Manifest.json accesible', () => {
    return fetch('/manifest.json')
      .then(response => response.ok)
      .catch(() => false);
  }, results);
}

// Función para ejecutar pruebas automáticamente al cargar
function initializeTests() {
  // Esperar a que el DOM esté completamente cargado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runBasicTests, 1000); // Esperar 1 segundo para que todo se inicialice
    });
  } else {
    setTimeout(runBasicTests, 1000);
  }
}

// Función para ejecutar pruebas manualmente desde la consola
function testApp() {
  return runBasicTests();
}

// Exportar funciones para uso externo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runBasicTests,
    testApp,
    initializeTests
  };
}

// Inicializar pruebas automáticamente en desarrollo
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('🔧 Modo desarrollo detectado - Las pruebas se ejecutarán automáticamente');
  initializeTests();
}