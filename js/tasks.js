// Gestión de tareas
import { saveTasks, getTasks, updateTask, removeTask } from './firebase.js';

let tasks = [];

export async function loadTasks() {
    const result = await getTasks();
    if (result.success) {
        tasks = result.tasks;
        updateTasksList();
        updateTasksCounter();
    } else {
        console.error("Error al cargar tareas:", result.error);
    }
}

export async function addTask(task) {
    const result = await saveTasks(task); // Asegúrate de que esta función coincida con la de firebase.js
    if (result.success) {
        task.id = result.id;
        tasks.push(task);
        updateTasksList();
        updateTasksCounter();
    } else {
        console.error("Error al guardar tarea:", result.error);
    }
    return task;
}

export async function deleteTask(taskId) {
    const result = await removeTask(taskId);
    if (result.success) {
        tasks = tasks.filter(task => task.id !== taskId);
        updateTasksList();
        updateTasksCounter();
    } else {
        console.error("Error al eliminar tarea:", result.error);
        alert("Error al eliminar la tarea: " + result.error);
    }
}

export async function completeTask(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.completed = !task.completed;
        const result = await updateTask(taskId, { completed: task.completed });
        if (result.success) {
            updateTasksList();
            updateTasksCounter();
        } else {
            console.error("Error al actualizar tarea:", result.error);
            // Revertir cambio local si falla
            task.completed = !task.completed;
            alert("Error al actualizar la tarea: " + result.error);
        }
    }
}

export function filterTasks(filter) {
    let filteredTasks;
    
    switch(filter) {
        case 'completed':
            filteredTasks = tasks.filter(task => task.completed);
            break;
        case 'pending':
            filteredTasks = tasks.filter(task => !task.completed);
            break;
        case 'important':
            filteredTasks = tasks.filter(task => task.important);
            break;
        default:
            filteredTasks = tasks;
    }
    
    renderTasks(filteredTasks);
}

function updateTasksList() {
    renderTasks(tasks);
}

function renderTasks(tasksToRender) {
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;
    
    if (tasksToRender.length === 0) {
        tasksList.innerHTML = `
            <div class="p-4 border-b border-gray-200">
                <h3 class="font-semibold text-gray-700">Mis tareas</h3>
            </div>
            <div class="p-4">
                <p class="text-gray-500 text-center py-4">No hay tareas registradas</p>
            </div>
        `;
        return;
    }
    
    let tasksHTML = `
        <div class="p-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-700">Mis tareas</h3>
        </div>
    `;
    
    tasksToRender.forEach(task => {
        tasksHTML += `
            <div class="flex items-center justify-between p-3 border-b border-gray-100">
                <div class="flex items-center">
                    <input type="checkbox" class="mr-3" ${task.completed ? 'checked' : ''} 
                           onchange="window.completeTask('${task.id}')">
                    <div>
                        <h4 class="font-medium ${task.completed ? 'line-through text-gray-400' : ''}">${task.title}</h4>
                        <p class="text-sm text-gray-500">Entregar: ${task.dueDate}</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button class="text-indigo-600 hover:text-indigo-800" aria-label="Editar tarea">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" aria-label="Eliminar tarea"
                            onclick="window.deleteTask('${task.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    tasksList.innerHTML = tasksHTML;
}

export function updateTasksCounter() {
    const pendingTasks = tasks.filter(task => !task.completed);
    
    // Actualizar contador en el dashboard
    const pendingTasksCount = document.getElementById('pending-tasks-count');
    if (pendingTasksCount) {
        pendingTasksCount.textContent = pendingTasks.length;
    }
    
    // Actualizar contador en el panel principal
    const dashboardCounter = document.querySelector('#dashboard p.text-3xl');
    if (dashboardCounter) {
        dashboardCounter.textContent = pendingTasks.length;
    }
}