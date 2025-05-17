// Gestión de exámenes
import { saveExam, getExams, deleteExam } from './firebase.js';
import { updateCalendarWithExams } from './calendar.js';

let exams = [];

export async function loadExams() {
    const result = await getExams();
    if (result.success) {
        exams = result.exams;
        updateExamsList();
        updateUpcomingExams();
        updateCalendarWithExams(exams);
    } else {
        console.error("Error al cargar exámenes:", result.error);
    }
}

export async function addExam(exam) {
    const result = await saveExam(exam);
    if (result.success) {
        exam.id = result.id;
        exams.push(exam);
        updateExamsList();
        updateUpcomingExams();
        updateCalendarWithExams(exams);
    } else {
        console.error("Error al guardar examen:", result.error);
    }
    return exam;
}

export async function removeExam(examId) {
    const result = await deleteExam(examId);
    if (result.success) {
        exams = exams.filter(exam => exam.id !== examId);
        updateExamsList();
        updateUpcomingExams();
        updateCalendarWithExams(exams);
    } else {
        console.error("Error al eliminar examen:", result.error);
        alert("Error al eliminar el examen: " + result.error);
    }
}

function updateExamsList() {
    const examsList = document.querySelector('#calendar .bg-white.rounded-lg.shadow:last-child .p-4:last-child');
    if (!examsList) return;
    
    if (exams.length === 0) {
        examsList.innerHTML = `
            <p class="text-gray-500 text-center py-4">No hay exámenes registrados</p>
        `;
        return;
    }
    
    let examsHTML = '';
    
    exams.forEach(exam => {
        const examDate = new Date(exam.date);
        const formattedDate = examDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        examsHTML += `
            <div class="border-l-4 border-indigo-500 pl-4 mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold">${exam.title}</h4>
                        <p class="text-sm text-gray-600">${formattedDate}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-indigo-600 hover:text-indigo-800" aria-label="Editar examen">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-800" aria-label="Eliminar examen"
                                onclick="window.removeExam('${exam.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="text-sm mt-1 text-gray-500">${exam.subject || 'Sin materia asignada'}</p>
            </div>
        `;
    });
    
    examsList.innerHTML = examsHTML;
}

function updateUpcomingExams() {
    const upcomingExamsList = document.getElementById('upcoming-exams-list');
    if (!upcomingExamsList) return;
    
    if (exams.length === 0) {
        upcomingExamsList.innerHTML = `
            <p class="text-gray-500 text-center py-4">No hay exámenes próximos</p>
        `;
        return;
    }
    
    // Ordenar exámenes por fecha
    const sortedExams = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Tomar solo los próximos 3 exámenes
    const upcomingExams = sortedExams.slice(0, 3);
    
    let examsHTML = '';
    
    upcomingExams.forEach(exam => {
        const examDate = new Date(exam.date);
        const formattedDate = examDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        examsHTML += `
            <div class="border-l-4 border-indigo-500 pl-4 mb-3">
                <h4 class="font-medium">${exam.title}</h4>
                <p class="text-sm text-gray-600">${formattedDate} - ${exam.subject || 'Sin materia'}</p>
            </div>
        `;
    });
    
    upcomingExamsList.innerHTML = examsHTML;
    
    // Actualizar contador en el dashboard
    const upcomingExamsCount = document.getElementById('upcoming-exams-count');
    if (upcomingExamsCount) {
        upcomingExamsCount.textContent = exams.length;
    }
    
    // Actualizar contador en el panel principal
    const dashboardCounter = document.querySelector('#dashboard .grid.grid-cols-2.gap-4.mb-6 > div:nth-child(2) p.text-3xl');
    if (dashboardCounter) {
        dashboardCounter.textContent = exams.length;
    }
}