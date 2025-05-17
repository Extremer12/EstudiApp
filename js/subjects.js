// Gestión de materias
import { saveSubject, getSubjects, deleteSubject } from './firebase.js';

let subjects = [];

export async function loadSubjects() {
    const result = await getSubjects();
    if (result.success) {
        subjects = result.subjects;
        updateSubjectsList();
    } else {
        console.error("Error al cargar materias:", result.error);
    }
}

export async function addSubject(subject) {
    const result = await saveSubject(subject);
    if (result.success) {
        subject.id = result.id;
        subjects.push(subject);
        updateSubjectsList();
    } else {
        console.error("Error al guardar materia:", result.error);
    }
    return subject;
}

export async function removeSubject(subjectId) {
    const result = await deleteSubject(subjectId);
    if (result.success) {
        subjects = subjects.filter(subject => subject.id !== subjectId);
        updateSubjectsList();
    } else {
        console.error("Error al eliminar materia:", result.error);
        alert("Error al eliminar la materia: " + result.error);
    }
}

function updateSubjectsList() {
    const subjectsList = document.getElementById('subjects-list');
    if (!subjectsList) return;
    
    if (subjects.length === 0) {
        subjectsList.innerHTML = `
            <p class="text-gray-500 text-center py-4 col-span-2">No hay materias registradas</p>
        `;
        return;
    }
    
    let subjectsHTML = '';
    
    subjects.forEach(subject => {
        subjectsHTML += `
            <div class="bg-white rounded-lg shadow p-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold text-lg">${subject.name}</h3>
                        <p class="text-gray-600 text-sm">Prof. ${subject.professor || 'No asignado'}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="text-indigo-600 hover:text-indigo-800" aria-label="Editar ${subject.name}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-800" aria-label="Eliminar ${subject.name}"
                                onclick="window.removeSubject('${subject.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="mt-3">
                    <div class="flex items-center text-sm text-gray-500 mb-1">
                        <i class="fas fa-clock mr-2"></i>
                        <span>${subject.schedule || 'Horario no definido'}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-map-marker-alt mr-2"></i>
                        <span>${subject.classroom || 'Aula no definida'}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    subjectsList.innerHTML = subjectsHTML;
}