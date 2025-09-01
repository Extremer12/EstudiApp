// SCRIPT DE BUILD PARA OPTIMIZACIÓN DE PRODUCCIÓN
// Ejecutar con: node build.js

const fs = require('fs');
const path = require('path');
const config = require('./build-config.js');

// Función para minificar CSS básico
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios
    .replace(/\s+/g, ' ') // Reducir espacios múltiples
    .replace(/;\s*}/g, '}') // Remover punto y coma antes de }
    .replace(/\s*{\s*/g, '{') // Limpiar espacios alrededor de {
    .replace(/;\s*/g, ';') // Limpiar espacios después de ;
    .replace(/,\s*/g, ',') // Limpiar espacios después de ,
    .replace(/:\s*/g, ':') // Limpiar espacios después de :
    .trim();
}

// Función para minificar JS básico
function minifyJS(js) {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remover comentarios de bloque
    .replace(/\/\/.*$/gm, '') // Remover comentarios de línea
    .replace(/\s+/g, ' ') // Reducir espacios múltiples
    .replace(/;\s*}/g, '}') // Limpiar antes de }
    .replace(/\s*{\s*/g, '{') // Limpiar alrededor de {
    .trim();
}

// Función para combinar archivos CSS
function buildCSS() {
  console.log('🎨 Combinando y minificando archivos CSS...');
  
  let combinedCSS = '';
  
  config.cssFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      combinedCSS += `/* ${file} */\n${content}\n\n`;
    } else {
      console.warn(`⚠️  Archivo CSS no encontrado: ${file}`);
    }
  });
  
  const minifiedCSS = minifyCSS(combinedCSS);
  
  // Crear directorio dist si no existe
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
  
  fs.writeFileSync('dist/app.min.css', minifiedCSS);
  console.log(`✅ CSS minificado guardado: dist/app.min.css (${minifiedCSS.length} bytes)`);
}

// Función para combinar archivos JS
function buildJS() {
  console.log('⚡ Combinando y minificando archivos JS...');
  
  let combinedJS = '';
  
  config.jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      combinedJS += `/* ${file} */\n${content}\n\n`;
    } else {
      console.warn(`⚠️  Archivo JS no encontrado: ${file}`);
    }
  });
  
  const minifiedJS = minifyJS(combinedJS);
  
  fs.writeFileSync('dist/app.min.js', minifiedJS);
  console.log(`✅ JS minificado guardado: dist/app.min.js (${minifiedJS.length} bytes)`);
}

// Función para crear HTML de producción
function buildHTML() {
  console.log('📄 Creando HTML de producción...');
  
  let html = fs.readFileSync('index.html', 'utf8');
  
  // Reemplazar múltiples CSS con uno solo
  const cssRegex = /<link[^>]*href=["']css\/[^"']*["'][^>]*>/g;
  html = html.replace(cssRegex, '');
  
  // Añadir CSS minificado
  html = html.replace(
    '</head>',
    '  <link rel="stylesheet" href="dist/app.min.css">\n</head>'
  );
  
  // Reemplazar múltiples JS con uno solo
  const jsRegex = /<script[^>]*src=["'](core|subjects|pomodoro|streaks)\.js["'][^>]*><\/script>/g;
  html = html.replace(jsRegex, '');
  
  // Añadir JS minificado antes del script de inicialización
  html = html.replace(
    '<script>',
    '<script src="dist/app.min.js" defer></script>\n  <script>'
  );
  
  fs.writeFileSync('dist/index.html', html);
  console.log('✅ HTML de producción creado: dist/index.html');
}

// Función para copiar archivos necesarios
function copyAssets() {
  console.log('📁 Copiando assets necesarios...');
  
  const assetsToCopy = [
    'manifest.json',
    'icon-192.png',
    'icon-512.png',
    'reminders.js',
    'calendar.js',
    'tests/'
  ];
  
  assetsToCopy.forEach(asset => {
    if (fs.existsSync(asset)) {
      if (fs.statSync(asset).isDirectory()) {
        // Copiar directorio
        if (!fs.existsSync(`dist/${asset}`)) {
          fs.mkdirSync(`dist/${asset}`, { recursive: true });
        }
        const files = fs.readdirSync(asset);
        files.forEach(file => {
          fs.copyFileSync(`${asset}/${file}`, `dist/${asset}/${file}`);
        });
      } else {
        // Copiar archivo
        fs.copyFileSync(asset, `dist/${asset}`);
      }
      console.log(`✅ Copiado: ${asset}`);
    }
  });
}

// Función principal de build
function build() {
  console.log('🚀 Iniciando build de producción...\n');
  
  try {
    buildCSS();
    buildJS();
    buildHTML();
    copyAssets();
    
    console.log('\n🎉 Build completado exitosamente!');
    console.log('📦 Archivos de producción en la carpeta "dist"');
    
    // Mostrar estadísticas
    const stats = fs.statSync('dist/app.min.css');
    const jsStats = fs.statSync('dist/app.min.js');
    console.log(`📊 CSS minificado: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`📊 JS minificado: ${(jsStats.size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Error durante el build:', error.message);
    process.exit(1);
  }
}

// Ejecutar build
if (require.main === module) {
  build();
}

module.exports = { build, buildCSS, buildJS, buildHTML, copyAssets };