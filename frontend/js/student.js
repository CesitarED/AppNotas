// ===== STUDENT.JS — Lógica del Portal de Estudiante =====

const API_URL = window.location.origin;

// Verificar sesión
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'student') {
    window.location.href = '/login.html';
}

// Global state
let studentData = null;
let currentSection = 'profile';

// Elementos DOM
const logoutBtn = document.getElementById('logoutBtn');
const loadingState = document.getElementById('loadingState');
const pageTitle = document.getElementById('pageTitle');

// Secciones
const profileSection = document.getElementById('profileSection');
const gradesSection = document.getElementById('gradesSection');

// Elementos de datos Perfil
const topName = document.getElementById('topName');
const topAvatar = document.getElementById('topAvatar');
const mainAvatar = document.getElementById('mainAvatar');
const profileName = document.getElementById('profileName');
const infoId = document.getElementById('infoId');
const infoEmail = document.getElementById('infoEmail');
const infoDate = document.getElementById('infoDate');
const infoTeacher = document.getElementById('infoTeacher');

// Elementos de datos Notas
const totalGradesCount = document.getElementById('totalGradesCount');
const gradesContainer = document.getElementById('gradesContainer');

const alertEl = document.getElementById('alert');
const alertMsg = document.getElementById('alert-message');

document.addEventListener('DOMContentLoaded', () => {
    initApp();

    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            switchSection(section);
        });
    });

    logoutBtn.addEventListener('click', logout);
});

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

async function initApp() {
    try {
        const payload = parseJwt(token);
        if (!payload || !payload.id) {
            throw new Error('Token inválido o expirado. Por favor, inicia sesión de nuevo.');
        }

        const studentId = payload.id;

        // Fetch Student Profile
        const response = await fetch(`${API_URL}/students/${studentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) logout();
            throw new Error('Error al obtener datos del perfil');
        }

        studentData = await response.json();

        // Formatear profesor asigando. Hay que leerlo de la bd o listado de profesores admin, pero el estudiante 
        // solo almacena teacherId en la bd, necesitariamos otro endpoint. Mostraremos el ID.
        renderProfile(studentData);

        // Fetch Student Grades
        await fetchStudentGrades(studentId);

        // Termina la carga
        loadingState.style.display = 'none';

        // Forzar vista de perfil
        switchSection('profile');

    } catch (error) {
        showGlobalAlert(error.message, 'error');
        loadingState.innerHTML = `<p style="color:var(--danger)">${error.message}</p>`;
        if (error.message.includes('Token')) {
            setTimeout(logout, 3000);
        }
    }
}

function switchSection(section) {
    currentSection = section;
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`.sidebar-nav a[data-section="${section}"]`).classList.add('active');

    if (section === 'profile') {
        profileSection.style.display = 'block';
        gradesSection.style.display = 'none';
        pageTitle.textContent = 'Mi Perfil Estudiantil';
    } else {
        profileSection.style.display = 'none';
        gradesSection.style.display = 'block';
        pageTitle.textContent = 'Mis Notas de Seguimiento';
    }
}

function renderProfile(student) {
    const initial = student.name ? student.name.charAt(0).toUpperCase() : 'E';

    topName.textContent = student.name;
    topAvatar.textContent = initial;

    mainAvatar.textContent = initial;
    profileName.textContent = student.name;
    infoId.textContent = `#${student.id}`;
    infoEmail.textContent = student.email;

    const date = new Date(student.createdAt);
    infoDate.textContent = date.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    if (student.teacherId) {
        infoTeacher.textContent = `Profesor ID: #${student.teacherId}`;
        infoTeacher.style.color = "var(--primary)";
    } else {
        infoTeacher.textContent = "Aún no tienes un profesor asignado";
        infoTeacher.style.color = "var(--text-secondary)";
        infoTeacher.style.fontWeight = "500";
    }
}

async function fetchStudentGrades(studentId) {
    try {
        const response = await fetch(`${API_URL}/teachers/grades/student/${studentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("No se pudieron cargar las notas");

        const grades = await response.json();
        renderGrades(grades);

    } catch (error) {
        gradesContainer.innerHTML = `<p style="color:var(--danger)">${error.message}</p>`;
    }
}

function renderGrades(grades) {
    totalGradesCount.textContent = grades.length;

    if (grades.length === 0) {
        gradesContainer.innerHTML = `
            <div style="background: var(--bg-card); padding: 60px 40px; text-align: center; border-radius: var(--radius-md); border: 1px dashed var(--border);">
                <span style="font-size: 50px; display: block; margin-bottom: 16px;">📚</span>
                <h3 style="color: var(--text-secondary); font-size: 20px;">No tienes notas registradas</h3>
                <p style="color: var(--text-muted); font-size: 14px; margin-top: 8px;">Aún no se te han asignado notas de seguimiento.</p>
            </div>
        `;
        return;
    }

    // Agrupar notas por asignatura para mostrarlas ordenadas
    const subjectsMap = {};
    grades.forEach(grade => {
        const subjectId = grade.subject.id;
        if (!subjectsMap[subjectId]) {
            subjectsMap[subjectId] = {
                name: grade.subject.name,
                teacher: grade.subject.teacher ? grade.subject.teacher.name : `ID #${grade.subject.teacherId}`,
                grades: []
            };
        }
        subjectsMap[subjectId].grades.push(grade);
    });

    const html = Object.keys(subjectsMap).map(subjectId => {
        const subject = subjectsMap[subjectId];

        // Calcular promedio de la asignatura
        const sum = subject.grades.reduce((acc, curr) => acc + curr.grade, 0);
        const avg = subject.grades.length > 0 ? (sum / subject.grades.length).toFixed(1) : "0.0";

        const gradesHtml = subject.grades.map(g => `
            <tr>
                <td style="padding: 12px 16px; font-size: 13px; color: var(--text-muted);">${g.date}</td>
                <td style="padding: 12px 16px; font-size: 14px;">${g.description}</td>
                <td style="padding: 12px 16px; text-align: right; font-weight: 700; font-size: 15px; color: ${g.grade >= 3.0 ? 'var(--success)' : 'var(--danger)'};">${g.grade.toFixed(1)}</td>
            </tr>
        `).join('');

        return `
            <div style="background: var(--bg-card); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid var(--border);">
                <div style="background: var(--primary-bg); padding: 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                    <div>
                        <h2 style="font-size: 18px; color: var(--primary-dark); margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                            <span>📘</span> ${subject.name}
                        </h2>
                        <div style="font-size: 13px; color: var(--text-secondary);">
                            👨‍🏫 Docente: ${subject.teacher}
                        </div>
                    </div>
                    
                    <div style="text-align: right; background: white; padding: 10px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; margin-bottom: 2px;">Promedio</div>
                        <div style="font-size: 20px; font-weight: 800; color: ${avg >= 3.0 ? 'var(--success)' : 'var(--danger)'};">${avg}</div>
                    </div>
                </div>
                
                <div style="padding: 0; overflow-x: auto;">
                    <table class="data-table" style="width: 100%; border: none;">
                        <thead>
                            <tr>
                                <th style="padding: 12px 16px; background: white; border-bottom: 2px solid var(--border);">Fecha</th>
                                <th style="padding: 12px 16px; background: white; border-bottom: 2px solid var(--border);">Descripción del Seguimiento</th>
                                <th style="padding: 12px 16px; background: white; border-bottom: 2px solid var(--border); text-align: right;">Nota</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${gradesHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }).join('');

    gradesContainer.innerHTML = html;
}

function showGlobalAlert(message, type = 'error') {
    alertMsg.textContent = message;
    alertEl.className = `alert alert-${type} show`;
    alertEl.querySelector('.icon').textContent = type === 'success' ? '✅' : '⚠️';

    setTimeout(() => {
        alertEl.classList.remove('show');
    }, 4000);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login.html';
}
