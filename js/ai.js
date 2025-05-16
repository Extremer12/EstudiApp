// Funcionalidad de IA simplificada
import config from './config.js';

// Respuestas predefinidas para simulación
const predefinedResponses = {
    greeting: [
        "¡Hola! ¿En qué puedo ayudarte hoy con tus estudios?",
        "¡Bienvenido a EstudiApp! ¿Necesitas ayuda con alguna tarea?",
        "Hola, soy tu asistente de estudio. ¿Qué necesitas aprender hoy?"
    ],
    math: [
        "Las matemáticas pueden ser desafiantes. ¿Qué tema específico te está causando problemas?",
        "Para resolver problemas matemáticos, es importante entender los conceptos fundamentales. ¿Puedes compartir un ejemplo del problema?",
        "Hay muchos recursos online para matemáticas. Te recomiendo Khan Academy para tutoriales paso a paso."
    ],
    writing: [
        "Para mejorar tu escritura, intenta crear un esquema antes de empezar. Esto te ayudará a organizar tus ideas.",
        "Recuerda revisar tu ortografía y gramática. Las herramientas como Grammarly pueden ser útiles.",
        "Al escribir ensayos, asegúrate de tener una tesis clara y evidencia que la respalde."
    ],
    exams: [
        "Para prepararte para exámenes, crea un plan de estudio con tiempo suficiente de antelación.",
        "Los exámenes de práctica son una excelente manera de prepararte. Intenta simular las condiciones reales del examen.",
        "Técnicas como el estudio espaciado y la práctica de recuperación pueden mejorar significativamente tu retención."
    ],
    default: [
        "Interesante pregunta. Déjame pensar en eso...",
        "Estoy aquí para ayudarte con tus estudios. ¿Puedes darme más detalles?",
        "No estoy seguro de entender completamente. ¿Podrías reformular tu pregunta?"
    ]
};

// Función para detectar la intención del usuario basada en palabras clave
function detectIntent(message) {
    message = message.toLowerCase();
    
    if (message.includes('hola') || message.includes('saludos') || message.includes('buenos días') || message.includes('buenas tardes')) {
        return 'greeting';
    } else if (message.includes('matemática') || message.includes('cálculo') || message.includes('álgebra') || message.includes('ecuación')) {
        return 'math';
    } else if (message.includes('escribir') || message.includes('ensayo') || message.includes('redacción') || message.includes('ortografía')) {
        return 'writing';
    } else if (message.includes('examen') || message.includes('prueba') || message.includes('test') || message.includes('evaluación')) {
        return 'exams';
    } else {
        return 'default';
    }
}

// Obtener una respuesta aleatoria basada en la intención
function getRandomResponse(intent) {
    const responses = predefinedResponses[intent] || predefinedResponses.default;
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
}

// Función principal para procesar mensajes
export function processMessage(message) {
    const intent = detectIntent(message);
    return getRandomResponse(intent);
}

// Función para resumir texto (simulación)
export function summarizeText(text) {
    // En una implementación real, esto se conectaría a una API de IA
    // Por ahora, simplemente devolvemos un resumen genérico
    if (!text || text.trim() === '') {
        return 'Por favor, proporciona un texto para resumir.';
    }
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 2) {
        return text;
    }
    
    // Simulamos un resumen tomando la primera y última oración
    return `${sentences[0]}. ${sentences[sentences.length - 1]}.`;
}

// Función para generar ideas (simulación)
export function generateIdeas(topic) {
    // En una implementación real, esto se conectaría a una API de IA
    const ideas = [
        `Considera explorar la relación entre ${topic} y la tecnología moderna.`,
        `Un enfoque interesante sería analizar ${topic} desde una perspectiva histórica.`,
        `Podrías investigar cómo diferentes culturas abordan ${topic}.`,
        `¿Has pensado en las implicaciones éticas de ${topic}?`,
        `Un análisis comparativo de ${topic} en diferentes contextos podría ser valioso.`
    ];
    
    // Devolvemos 3 ideas aleatorias
    const randomIdeas = [];
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * ideas.length);
        randomIdeas.push(ideas[randomIndex]);
        ideas.splice(randomIndex, 1);
    }
    
    return randomIdeas;
}