// ===== REPORTS.JS — Lógica del Dashboard de Reportes =====

const API_URL = window.location.origin;

// Verificar sesión
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

// Solo administradores o profesores
if (!token || (role !== 'admin' && role !== 'teacher')) {
    window.location.href = '/login.html';
}

// Variables Globales de Datos
let students = [];
let teachers = [];
let allGrades = [];
let subjectsMap = new Map(); // id -> { name, grades }

// Elementos DOM
const logoutBtn = document.getElementById('logoutBtn');
const loadingEl = document.getElementById('loading');
const contentEl = document.getElementById('reportsContent');

const statStudents = document.getElementById('statTotalStudents');
const statTeachers = document.getElementById('statTotalTeachers');
const statSubjects = document.getElementById('statTotalSubjects');
const statGlobalAverage = document.getElementById('statGlobalAverage');

const subjectSelect = document.getElementById('subjectSelect');
const refreshBtn = document.getElementById('refreshBtn');
const barChart = document.getElementById('barChart');
const topStudentsList = document.getElementById('topStudentsList');
const insightsList = document.getElementById('insightsList');

document.addEventListener('DOMContentLoaded', () => {
    initReports();

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login.html';
    });

    refreshBtn.addEventListener('click', drawChart);
    subjectSelect.addEventListener('change', drawChart);

    // Ajustar sidebar navbar return link según rol
    if (role === 'teacher') {
        const link = document.querySelector('.sidebar-nav a[href="/admin.html"]');
        if (link) {
            link.href = '/teacher.html';
            link.innerHTML = '<span class="nav-icon">⬅</span> Volver al Dashboard';
        }
    }
});

async function initReports() {
    try {
        // Fetch global data
        await Promise.all([
            fetchStudents(),
            fetchTeachersAndSubjects()
        ]);

        calculateGlobalStats();
        populateSubjectSelect();

        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';

        drawChart();
        renderTopStudents();
        generateInsights();

    } catch (error) {
        loadingEl.innerHTML = `<p style="color:var(--danger)">Error al cargar reportes: ${error.message}</p>`;
    }
}

async function fetchStudents() {
    // Si es admin, traemos todos. Si es teacher y no puede, esto fallará o traerá error,
    // en un caso real se ajustaría el endpoint. 
    // Para simplificar, asumimos que este dashboard funciona con el endpoint de GET /students (admin)
    const response = await fetch(`${API_URL}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("No tienes permisos para ver a todos los estudiantes");
    students = await response.json();
}

async function fetchTeachersAndSubjects() {
    const response = await fetch(`${API_URL}/teachers`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("No tienes permisos para acceder");
    teachers = await response.json();

    // Configurar mapa de asignaturas
    teachers.forEach(teacher => {
        if (teacher.subjects) {
            teacher.subjects.forEach(subject => {
                subjectsMap.set(subject.id, {
                    name: subject.name,
                    teacher: teacher.name,
                    grades: subject.grades || []
                });

                if (subject.grades) {
                    allGrades = allGrades.concat(subject.grades);
                }
            });
        }
    });
}

function calculateGlobalStats() {
    statStudents.textContent = students.length;
    statTeachers.textContent = teachers.length;
    statSubjects.textContent = subjectsMap.size;

    let sum = 0;
    allGrades.forEach(g => sum += g.grade);
    const avg = allGrades.length > 0 ? (sum / allGrades.length) : 0;

    statGlobalAverage.textContent = avg.toFixed(1);

    if (avg >= 4.0) {
        statGlobalAverage.style.color = "var(--success)";
    } else if (avg < 3.0) {
        statGlobalAverage.style.color = "var(--danger)";
    }
}

function populateSubjectSelect() {
    subjectsMap.forEach((data, id) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `${data.name} (${data.teacher})`;
        subjectSelect.appendChild(option);
    });
}

// Genera un gráfico de barras CSS
function drawChart() {
    const selectedSub = subjectSelect.value;
    barChart.innerHTML = '';

    let chartData = [];

    if (selectedSub === 'all') {
        // Graficar promedio por asignatura
        subjectsMap.forEach((data, id) => {
            const sum = data.grades.reduce((acc, curr) => acc + curr.grade, 0);
            const avg = data.grades.length > 0 ? (sum / data.grades.length) : 0;

            // Solo graficar si hay notas
            if (data.grades.length > 0) {
                chartData.push({
                    label: data.name.substring(0, 10) + (data.name.length > 10 ? '...' : ''),
                    value: avg,
                    color: avg >= 3.0 ? 'var(--primary)' : 'var(--danger)'
                });
            }
        });
    } else {
        // Graficar notas específicas de la asignatura (ej. ultimas 5 o todas)
        const data = subjectsMap.get(parseInt(selectedSub));
        if (data && data.grades) {
            // Agrupar calificaciones por rangos para simplificar
            let ranges = { "0-1": 0, "1-2": 0, "2-3": 0, "3-4": 0, "4-5": 0 };

            data.grades.forEach(g => {
                const gr = g.grade;
                if (gr < 1) ranges["0-1"]++;
                else if (gr < 2) ranges["1-2"]++;
                else if (gr < 3) ranges["2-3"]++;
                else if (gr < 4) ranges["3-4"]++;
                else ranges["4-5"]++;
            });

            Object.keys(ranges).forEach(r => {
                chartData.push({
                    label: r,
                    value: ranges[r],
                    countLabel: true,
                    color: r.includes("2-3") || r.includes("1-2") || r.includes("0-1") ? 'var(--danger)' : 'var(--primary)'
                });
            });
        }
    }

    if (chartData.length === 0) {
        barChart.innerHTML = '<span style="color:var(--text-muted); padding-bottom: 50px;">No hay suficientes datos para graficar.</span>';
        return;
    }

    // Determinar valor maximo para escalar visualmente
    const maxValue = selectedSub === 'all' ? 5.0 : Math.max(...chartData.map(d => d.value));

    chartData.forEach(item => {
        // Altura porcentual basada en el máximo (para dar espacio, max 250px)
        const maxPxHeight = 250;
        const heightPx = maxValue === 0 ? 0 : (item.value / maxValue) * maxPxHeight;

        const displayValue = item.countLabel ? item.value.toString() : item.value.toFixed(1);

        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${Math.max(heightPx, 5)}px`; // minimo 5px
        bar.style.backgroundColor = item.color;
        bar.innerHTML = `
            ${displayValue}
            <div class="bar-label">${item.label}</div>
        `;

        barChart.appendChild(bar);
    });
}

function renderTopStudents() {
    // Calculamos el promedio ponderado de cada estudiante
    let studentAverages = [];

    students.forEach(student => {
        // Encontrar todas sus notas
        const sGrades = allGrades.filter(g => g.studentId === student.id);
        if (sGrades.length > 0) {
            const sum = sGrades.reduce((acc, curr) => acc + curr.grade, 0);
            const avg = sum / sGrades.length;
            studentAverages.push({
                student,
                average: avg,
                count: sGrades.length
            });
        }
    });

    // Ordenar descendente y agarrar 5
    studentAverages.sort((a, b) => b.average - a.average);
    const top5 = studentAverages.slice(0, 5);

    if (top5.length === 0) {
        topStudentsList.innerHTML = '<div class="top-student-item"><span style="color:var(--text-muted)">No hay registros suficientes.</span></div>';
        return;
    }

    const medals = ['🥇', '🥈', '🥉', '🎖️', '🎖️'];

    const html = top5.map((entry, index) => {
        return `
        <div class="top-student-item">
            <div style="display:flex; align-items:center;">
                <div class="medal">${medals[index] || '⭐'}</div>
                <div>
                    <div style="font-weight:700; color:var(--text-primary); font-size: 15px;">${entry.student.name}</div>
                    <div style="color:var(--text-muted); font-size: 12px;">ID #${entry.student.id} • ${entry.count} notas</div>
                </div>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: ${entry.average >= 4.0 ? 'var(--success)' : 'var(--primary)'}; background: white; padding: 4px 10px; border-radius: 20px;">
                ${entry.average.toFixed(1)}
            </div>
        </div>
        `;
    }).join("");

    topStudentsList.innerHTML = html;
}

function generateInsights() {
    let html = '';

    // Insight 1: Riesgo académico (notas menores a 3)
    const fails = allGrades.filter(g => g.grade < 3.0).length;
    const total = allGrades.length;
    const failPercent = total > 0 ? ((fails / total) * 100).toFixed(1) : 0;

    if (failPercent > 30) {
        html += `<li style="margin-bottom: 8px;"><strong style="color:var(--danger)">Atención:</strong> El ${failPercent}% de las notas registradas son inferiores a 3.0.</li>`;
    } else {
        html += `<li style="margin-bottom: 8px;"><strong>Rendimiento Saludable:</strong> Solo el ${failPercent}% de notas históricas son reprobatorias.</li>`;
    }

    // Insight 2: Asignatura con mayor dificultad
    let lowestAvgSubject = { name: '-', avg: 5.0 };
    subjectsMap.forEach(data => {
        if (data.grades.length > 0) {
            const avg = data.grades.reduce((acc, curr) => acc + curr.grade, 0) / data.grades.length;
            if (avg < lowestAvgSubject.avg) {
                lowestAvgSubject = { name: data.name, avg: avg };
            }
        }
    });

    if (lowestAvgSubject.name !== '-') {
        html += `<li style="margin-bottom: 8px;"><strong>Área a reforzar:</strong> "<i>${lowestAvgSubject.name}</i>" tiene el promedio más bajo de la institución (${lowestAvgSubject.avg.toFixed(1)}).</li>`;
    }

    // Insight 3: Participación docente
    let teachersWithoutGrades = 0;
    teachers.forEach(t => {
        let hasGrades = false;
        if (t.subjects) {
            t.subjects.forEach(s => { if (s.grades && s.grades.length > 0) hasGrades = true; });
        }
        if (!hasGrades) teachersWithoutGrades++;
    });

    if (teachersWithoutGrades > 0) {
        html += `<li style="margin-bottom: 8px; color:var(--text-muted)">Hay ${teachersWithoutGrades} profesores que aún no han registrado notas en el sistema.</li>`;
    }

    insightsList.innerHTML = html || '<li>No hay suficientes datos para generar insights.</li>';
}
