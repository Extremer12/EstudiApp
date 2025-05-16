// Configuración global de la aplicación
const config = {
    darkMode: false,
    apiEndpoints: {
        // Aquí puedes agregar endpoints de API cuando implementes Firebase
    },
    aiTools: [
        { id: 'summarizer', name: 'Resumidor de Textos', icon: 'fas fa-file-alt' },
        { id: 'ideas', name: 'Generador de Ideas', icon: 'fas fa-brain' },
        { id: 'tutor', name: 'Tutor de Preguntas', icon: 'fas fa-question' },
        { id: 'exams', name: 'Simulador de Exámenes', icon: 'fas fa-flask' }
    ]
};

export default config;