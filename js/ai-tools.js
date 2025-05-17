// Gestión de herramientas de IA
// Utilizamos la API gratuita de Hugging Face

// Función para resumir texto
export async function summarizeText(text, length = 'medium') {
    if (!text || text.trim() === '') {
        return { success: false, error: 'El texto no puede estar vacío' };
    }
    
    try {
        // Simulamos la respuesta de la API para no depender de claves externas
        // En una implementación real, aquí se haría la llamada a la API
        const result = simulateAIResponse(text, 'summarize', length);
        return { success: true, result };
    } catch (error) {
        console.error('Error al resumir texto:', error);
        return { success: false, error: 'Error al procesar el texto. Intenta de nuevo.' };
    }
}

// Función para generar ideas
export async function generateIdeas(topic, count = 3) {
    if (!topic || topic.trim() === '') {
        return { success: false, error: 'El tema no puede estar vacío' };
    }
    
    try {
        // Simulamos la respuesta de la API
        const result = simulateAIResponse(topic, 'ideas', count);
        return { success: true, result };
    } catch (error) {
        console.error('Error al generar ideas:', error);
        return { success: false, error: 'Error al generar ideas. Intenta de nuevo.' };
    }
}

// Función para responder preguntas
export async function answerQuestion(question) {
    if (!question || question.trim() === '') {
        return { success: false, error: 'La pregunta no puede estar vacía' };
    }
    
    try {
        // Simulamos la respuesta de la API
        const result = simulateAIResponse(question, 'question');
        return { success: true, result };
    } catch (error) {
        console.error('Error al responder pregunta:', error);
        return { success: false, error: 'Error al procesar la pregunta. Intenta de nuevo.' };
    }
}

// Función para generar exámenes simulados
export async function generateExam(subject, difficulty = 'medium', questionCount = 5) {
    if (!subject || subject.trim() === '') {
        return { success: false, error: 'La materia no puede estar vacía' };
    }
    
    try {
        // Simulamos la respuesta de la API
        const result = simulateAIResponse(subject, 'exam', { difficulty, questionCount });
        return { success: true, result };
    } catch (error) {
        console.error('Error al generar examen:', error);
        return { success: false, error: 'Error al generar el examen. Intenta de nuevo.' };
    }
}

// Función para simular respuestas de IA
function simulateAIResponse(input, type, options = {}) {
    // Esta función simula respuestas de IA para no depender de APIs externas
    // En una implementación real, esto se reemplazaría con llamadas a APIs como Hugging Face
    
    switch (type) {
        case 'summarize':
            return generateSummary(input, options);
        case 'ideas':
            return generateIdeaList(input, options);
        case 'question':
            return generateAnswer(input);
        case 'exam':
            return generateExamQuestions(input, options);
        default:
            return 'No se pudo procesar la solicitud.';
    }
}

// Funciones auxiliares para generar respuestas simuladas

function generateSummary(text, length) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let summaryLength;
    
    switch (length) {
        case 'short':
            summaryLength = Math.max(1, Math.floor(sentences.length * 0.2));
            break;
        case 'medium':
            summaryLength = Math.max(2, Math.floor(sentences.length * 0.4));
            break;
        case 'long':
            summaryLength = Math.max(3, Math.floor(sentences.length * 0.6));
            break;
        default:
            summaryLength = Math.max(2, Math.floor(sentences.length * 0.4));
    }
    
    const summary = sentences.slice(0, summaryLength).join('. ') + '.';
    return summary;
}

function generateIdeaList(topic, count) {
    const ideas = [
        `Investigar sobre la historia de ${topic} y su evolución a lo largo del tiempo.`,
        `Analizar el impacto de ${topic} en la sociedad contemporánea.`,
        `Comparar diferentes enfoques o teorías relacionadas con ${topic}.`,
        `Explorar la relación entre ${topic} y otras disciplinas o áreas de conocimiento.`,
        `Desarrollar un proyecto práctico que aplique los conceptos de ${topic} en un contexto real.`,
        `Crear una presentación visual que explique los conceptos clave de ${topic}.`,
        `Diseñar un experimento o estudio de caso para probar hipótesis relacionadas con ${topic}.`,
        `Elaborar una guía práctica sobre cómo aplicar ${topic} en situaciones cotidianas.`
    ];
    
    // Seleccionar aleatoriamente el número de ideas solicitado
    const selectedIdeas = [];
    const numIdeas = Math.min(count, ideas.length);
    
    while (selectedIdeas.length < numIdeas) {
        const randomIndex = Math.floor(Math.random() * ideas.length);
        const idea = ideas[randomIndex];
        
        if (!selectedIdeas.includes(idea)) {
            selectedIdeas.push(idea);
        }
    }
    
    return selectedIdeas;
}

function generateAnswer(question) {
    // Respuestas genéricas basadas en palabras clave
    if (question.toLowerCase().includes('definición') || question.toLowerCase().includes('qué es')) {
        return `La definición exacta puede variar según el contexto, pero generalmente se refiere a un concepto fundamental en este campo de estudio. Es importante considerar diferentes perspectivas teóricas para una comprensión completa.`;
    } else if (question.toLowerCase().includes('cómo')) {
        return `El proceso implica varios pasos: 1) Identificar el objetivo específico, 2) Recopilar la información necesaria, 3) Analizar los datos disponibles, 4) Implementar una estrategia adecuada, y 5) Evaluar los resultados para posibles ajustes.`;
    } else if (question.toLowerCase().includes('por qué')) {
        return `Existen múltiples factores que contribuyen a este fenómeno. Los principales incluyen aspectos históricos, sociales, económicos y culturales que han evolucionado con el tiempo. La interacción entre estos factores crea un sistema complejo que explica la situación actual.`;
    } else if (question.toLowerCase().includes('diferencia')) {
        return `Las principales diferencias radican en sus fundamentos teóricos, metodologías aplicadas, y resultados esperados. Mientras que uno se enfoca más en aspectos cualitativos, el otro prioriza elementos cuantitativos. Ambos enfoques tienen ventajas y limitaciones que deben considerarse según el contexto específico.`;
    } else {
        return `Esta es una pregunta interesante que requiere un análisis desde múltiples perspectivas. Considerando los principios fundamentales de la materia y la evidencia disponible, podemos concluir que se trata de un tema complejo con diversas interpretaciones válidas según el marco teórico que se aplique.`;
    }
}

function generateExamQuestions(subject, options) {
    const { difficulty = 'medium', questionCount = 5 } = options;
    
    // Preguntas genéricas basadas en la materia
    const questions = {
        matematicas: [
            { question: "Resuelve la ecuación: 2x + 5 = 15", answer: "x = 5" },
            { question: "Calcula la derivada de f(x) = x² + 3x + 2", answer: "f'(x) = 2x + 3" },
            { question: "Si A = {1, 2, 3} y B = {3, 4, 5}, ¿cuál es A ∪ B?", answer: "A ∪ B = {1, 2, 3, 4, 5}" },
            { question: "Calcula el límite: lim(x→0) (sin x)/x", answer: "El límite es 1" },
            { question: "Resuelve el sistema: { x + y = 5, 2x - y = 4 }", answer: "x = 3, y = 2" },
            { question: "Calcula la integral de f(x) = 2x + 1", answer: "∫(2x + 1)dx = x² + x + C" },
            { question: "Si P(A) = 0.3 y P(B) = 0.4, y los eventos son independientes, ¿cuál es P(A ∩ B)?", answer: "P(A ∩ B) = 0.12" }
        ],
        historia: [
            { question: "¿En qué año comenzó la Primera Guerra Mundial?", answer: "1914" },
            { question: "¿Quién fue el primer presidente de Estados Unidos?", answer: "George Washington" },
            { question: "¿Cuál fue la causa principal de la Revolución Francesa?", answer: "Desigualdad social, Crisis económica y el absolutismo monárquico" },
            { question: "¿En qué año cayó el Muro de Berlín?", answer: "1989" },
            { question: "¿Quién escribió 'El Príncipe'?", answer: "Nicolás Maquiavelo" },
            { question: "¿Cuál fue el periodo de la Ilustración?", answer: "Siglo XVIII, conocido como el Siglo de las Luces" },
            { question: "¿Qué civilización construyó las pirámides de Giza?", answer: "La civilización egipcia" }
        ],
        fisica: [
            { question: "Enuncia la primera ley de Newton", answer: "Todo cuerpo persevera en su estado de reposo o movimiento uniforme y rectilíneo a no ser que sea obligado a cambiar su estado por fuerzas impresas sobre él" },
            { question: "¿Cuál es la fórmula de la energía cinética?", answer: "Ec = (1/2)mv²" },
            { question: "¿Qué establece la ley de Ohm?", answer: "V = I·R" },
            { question: "¿Cuál es la unidad de medida de la fuerza en el Sistema Internacional?", answer: "Newton (N)" },
            { question: "Enuncia el principio de Arquímedes", answer: "Todo cuerpo sumergido en un fluido experimenta un empuje vertical y hacia arriba igual al peso del fluido desalojado" },
            { question: "¿Qué es la aceleración?", answer: "La tasa de cambio de la velocidad con respecto al tiempo" },
            { question: "¿Qué establece la ley de conservación de la energía?", answer: "La energía no se crea ni se destruye, solo se transforma" }
        ]
    };
    
    // Si la materia no está en nuestra base, usamos preguntas genéricas
    const subjectQuestions = questions[subject.toLowerCase()] || [
        { question: "Pregunta 1 sobre " + subject, answer: "Respuesta a la pregunta 1" },
        { question: "Pregunta 2 sobre " + subject, answer: "Respuesta a la pregunta 2" },
        { question: "Pregunta 3 sobre " + subject, answer: "Respuesta a la pregunta 3" },
        { question: "Pregunta 4 sobre " + subject, answer: "Respuesta a la pregunta 4" },
        { question: "Pregunta 5 sobre " + subject, answer: "Respuesta a la pregunta 5" },
        { question: "Pregunta 6 sobre " + subject, answer: "Respuesta a la pregunta 6" },
        { question: "Pregunta 7 sobre " + subject, answer: "Respuesta a la pregunta 7" }
    ];
    
    // Seleccionar aleatoriamente el número de preguntas solicitado
    const selectedQuestions = [];
    const numQuestions = Math.min(questionCount, subjectQuestions.length);
    
    while (selectedQuestions.length < numQuestions) {
        const randomIndex = Math.floor(Math.random() * subjectQuestions.length);
        const question = subjectQuestions[randomIndex];
        
        if (!selectedQuestions.some(q => q.question === question.question)) {
            selectedQuestions.push(question);
        }
    }
    
    return {
        subject,
        difficulty,
        questions: selectedQuestions
    };
}