const API_URL = window.location.origin;

// Verificar sesión
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'admin') {
    window.location.href = '/login.html';
}

// Elementos DOM
const logoutBtn = document.getElementById('logoutBtn');
const subjectsTableBody = document.getElementById('subjectsTableBody');
const totalSubjectsCount = document.getElementById('totalSubjectsCount');
const totalEnrolledCount = document.getElementById('totalEnrolledCount');
const alertEl = document.getElementById('alert');
const alertMsg = document.getElementById('alert-message');

document.addEventListener('DOMContentLoaded', () => {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login.html';
    });

    loadRegistryData();
});

async function loadRegistryData() {
    try {
        // Pedir todos los profesores (que incluyen sus materias)
        const teachersResponse = await fetch(`${API_URL}/teachers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Pedir todos los estudiantes (que incluyen sus materias)
        const studentsResponse = await fetch(`${API_URL}/students`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!teachersResponse.ok || !studentsResponse.ok) {
            throw new Error('No se pudo cargar la información del servidor.');
        }

        const teachers = await teachersResponse.json();
        const students = await studentsResponse.json();

        // Extraer todas las materias y asociarles un conteo base de 0
        const subjectsMap = new Map();
        teachers.forEach(teacher => {
            if (teacher.subjects) {
                teacher.subjects.forEach(subject => {
                    subjectsMap.set(subject.id, {
                        id: subject.id,
                        name: subject.name,
                        teacherName: teacher.name,
                        studentsCount: 0
                    });
                });
            }
        });

        // Contar la cantidad de estudiantes por materia
        let totalEnrolled = 0;
        students.forEach(student => {
            if (student.subjects) {
                student.subjects.forEach(subject => {
                    if (subjectsMap.has(subject.id)) {
                        subjectsMap.get(subject.id).studentsCount += 1;
                        totalEnrolled++;
                    }
                });
            }
        });

        const allSubjects = Array.from(subjectsMap.values());

        // Actualizar estadísticas
        totalSubjectsCount.textContent = allSubjects.length;
        totalEnrolledCount.textContent = totalEnrolled;

        renderSubjectsTable(allSubjects);

    } catch (error) {
        showGlobalAlert(error.message, 'error');
        subjectsTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--danger)">${error.message}</td></tr>`;
    }
}

function renderSubjectsTable(subjects) {
    if (subjects.length === 0) {
        subjectsTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding: 40px; color:var(--text-muted)">
                    No hay materias registradas en el sistema.
                </td>
            </tr>`;
        return;
    }

    // Ordenar materias por ID
    subjects.sort((a, b) => a.id - b.id);

    subjectsTableBody.innerHTML = subjects.map(subject => `
        <tr>
            <td><strong>#${subject.id}</strong></td>
            <td><span style="font-weight: 500; color: var(--primary-dark);">${subject.name}</span></td>
            <td>${subject.teacherName}</td>
            <td>
                <span style="display: inline-block; padding: 4px 12px; background: ${subject.studentsCount > 0 ? 'var(--primary-bg)' : '#f3f4f6'}; color: ${subject.studentsCount > 0 ? 'var(--primary)' : 'var(--text-muted)'}; border-radius: 12px; font-weight: 700;">
                    ${subject.studentsCount} estudiante(s)
                </span>
            </td>
        </tr>
    `).join('');
}

function showGlobalAlert(message, type = 'error') {
    alertMsg.textContent = message;
    alertEl.className = `alert alert-${type} show`;
    alertEl.querySelector('.icon').textContent = type === 'success' ? '✅' : '⚠️';

    setTimeout(() => {
        alertEl.classList.remove('show');
    }, 4000);
}
