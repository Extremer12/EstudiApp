// Gestión del calendario
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Nombres de los meses en español
const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Días de la semana en español (empezando por lunes)
const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function initCalendar() {
    // Configurar botones de navegación del calendario
    const prevMonthBtn = document.querySelector('#calendar .bg-white.rounded-lg.shadow.mb-6 button:first-child');
    const nextMonthBtn = document.querySelector('#calendar .bg-white.rounded-lg.shadow.mb-6 button:last-child');
    
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            navigateMonth(-1);
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            navigateMonth(1);
        });
    }
    
    // Renderizar el calendario inicial
    renderCalendar();
}

function navigateMonth(direction) {
    currentMonth += direction;
    
    // Ajustar el año si es necesario
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    renderCalendar();
}

function renderCalendar() {
    // Actualizar el título del mes
    const monthTitle = document.querySelector('#calendar .bg-white.rounded-lg.shadow.mb-6 h3');
    if (monthTitle) {
        monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
    
    // Obtener el primer día del mes (0 = Domingo, 1 = Lunes, etc.)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Ajustar para que la semana comience en lunes (0 = Lunes, 6 = Domingo)
    const firstDayAdjusted = firstDay === 0 ? 6 : firstDay - 1;
    
    // Obtener el número de días en el mes actual
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Obtener el contenedor de días
    const daysContainer = document.querySelector('#calendar .grid.grid-cols-7.gap-1.text-center');
    if (!daysContainer) return;
    
    // Limpiar el contenedor (mantener los encabezados de los días)
    while (daysContainer.children.length > 7) {
        daysContainer.removeChild(daysContainer.lastChild);
    }
    
    // Añadir los días del mes
    for (let i = 0; i < firstDayAdjusted; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'py-1 text-sm text-gray-300';
        daysContainer.appendChild(emptyDay);
    }
    
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'py-1 text-sm';
        dayElement.textContent = day;
        
        // Resaltar el día actual si estamos en el mes actual
        if (isCurrentMonth && day === today.getDate()) {
            dayElement.classList.add('bg-indigo-100', 'rounded-full', 'font-medium');
        }
        
        // Añadir clase para días con exámenes (esto se implementará más adelante)
        
        daysContainer.appendChild(dayElement);
    }
    
    // Rellenar los días restantes de la última semana si es necesario
    const totalCells = firstDayAdjusted + daysInMonth;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
        for (let i = 0; i < remainingCells; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'py-1 text-sm text-gray-300';
            daysContainer.appendChild(emptyDay);
        }
    }
}

export function updateCalendarWithExams(exams) {
    // Esta función se llamará desde exams.js para marcar los días con exámenes
    // Por ahora, solo renderizamos el calendario
    renderCalendar();
}