// ===== TEACHER.JS — Lógica del Dashboard Profesor =====

const API_URL = window.location.origin;

// Verificar sesión
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'teacher') {
    window.location.href = '/login.html';
}

// Variables Globales
let teacherId = null;
let subjects = [];
let teacherStudents = [];
let currentSubjectId = null;
let currentStudentId = null;

// DOM Header
const topName = document.getElementById('topName');
const topAvatar = document.getElementById('topAvatar');
const logoutBtn = document.getElementById('logoutBtn');

// DOM Main
const alertEl = document.getElementById('alert');
const alertMsg = document.getElementById('alert-message');
const loadingState = document.getElementById('loadingState');
const dashboardContent = document.getElementById('dashboardContent');
const subjectsGrid = document.getElementById('subjectsGrid');
const totalSubjectsEl = document.getElementById('totalSubjects');

// DOM Modals
const gradesModal = document.getElementById('gradesModal');
const closeGradesModalBtn = document.getElementById('closeGradesModalBtn');
const gradesModalTitle = document.getElementById('gradesModalTitle');

const studentsList = document.getElementById('studentsList');
const selectedStudentInfo = document.getElementById('selectedStudentInfo');
const noStudentSelected = document.getElementById('noStudentSelected');
const selectedStudentName = document.getElementById('selectedStudentName');
const selectedStudentEmail = document.getElementById('selectedStudentEmail');
const studentGradesList = document.getElementById('studentGradesList');
const addGradeBtn = document.getElementById('addGradeBtn');

// Form Nota
const gradeFormModal = document.getElementById('gradeFormModal');
const gradeForm = document.getElementById('gradeForm');
const gradeFormTitle = document.getElementById('gradeFormTitle');
const closeGradeFormBtn = document.getElementById('closeGradeFormBtn');
const saveGradeBtnText = document.getElementById('saveGradeBtnText');
const saveGradeSpinner = document.getElementById('saveGradeSpinner');

// Eliminar Nota
const deleteGradeModal = document.getElementById('deleteGradeModal');
const closeDeleteGradeBtn = document.getElementById('closeDeleteGradeBtn');
const confirmDeleteGradeBtn = document.getElementById('confirmDeleteGradeBtn');
const deleteGradeTargetId = document.getElementById('deleteGradeTargetId');


document.addEventListener('DOMContentLoaded', () => {
    initTeacherDashboard();

    logoutBtn.addEventListener('click', logout);
    closeGradesModalBtn.addEventListener('click', closeGradesModal);

    addGradeBtn.addEventListener('click', () => openGradeForm());
    closeGradeFormBtn.addEventListener('click', closeGradeForm);
    gradeForm.addEventListener('submit', handleGradeSave);

    closeDeleteGradeBtn.addEventListener('click', closeDeleteGradeModal);
    confirmDeleteGradeBtn.addEventListener('click', handleDeleteGradeConfirm);

    // Set today's date in grade form as default
    document.getElementById('gradeDate').valueAsDate = new Date();
});

// Decodificar JWT
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

async function initTeacherDashboard() {
    const payload = parseJwt(token);
    if (!payload || !payload.id) {
        showGlobalAlert('Sesión inválida', 'error');
        setTimeout(logout, 2000);
        return;
    }

    teacherId = payload.id;

    try {
        // Cargar datos propios
        const resTeacher = await fetch(`${API_URL}/teachers/${teacherId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resTeacher.ok) throw new Error("No se pudo cargar la información del profesor");
        const teacherData = await resTeacher.ok ? await resTeacher.json() : null;

        if (teacherData) {
            const initial = teacherData.name.charAt(0).toUpperCase();
            topName.textContent = teacherData.name;
            topAvatar.textContent = initial;
        }

        // Cargar estudiantes asignados a este profesor (para tener la lista)
        // Ya que la API de obtener todos los estudiantes requiere rol admin,
        // Y el rol profesor solo necesita tener la tabla `Student` que matchean `teacherId`
        const resAllStudents = await fetch(`${API_URL}/students`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Si el profesor no puede ver TODOS los estudiantes (403), no hay problema, los obtenemos a través de las notas de la asignatura.

        await fetchSubjects();

    } catch (error) {
        showGlobalAlert(error.message, 'error');
    } finally {
        loadingState.style.display = 'none';
        dashboardContent.style.display = 'block';
    }
}

async function fetchSubjects() {
    try {
        const response = await fetch(`${API_URL}/teachers/${teacherId}/subjects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al obtener asignaturas');

        subjects = await response.json();
        totalSubjectsEl.textContent = subjects.length;
        renderSubjectsGrid();
    } catch (error) {
        showGlobalAlert(error.message, 'error');
        subjectsGrid.innerHTML = `<p style="color:var(--danger)">${error.message}</p>`;
    }
}

function renderSubjectsGrid() {
    if (subjects.length === 0) {
        subjectsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; background: var(--bg-card); padding: 40px; text-align: center; border-radius: var(--radius-md); border: 1px dashed var(--border);">
                <span style="font-size: 40px; color: var(--text-muted); display: block; margin-bottom: 16px;">📚</span>
                <h3 style="color: var(--text-secondary);">No tienes asignaturas</h3>
                <p style="color: var(--text-muted); font-size: 14px; margin-top: 8px;">Contacta al administrador para que se te asigne una asignatura.</p>
            </div>
        `;
        return;
    }

    subjectsGrid.innerHTML = subjects.map(subject => {
        // Calcular estadisticas de estudiantes unicos en esta asignatura basado en las notas
        // Como el modelo actual asocia a los estudiantes indirectamente, o asume que los estudiantes los asigna el ADMIN al profesor (mediante teacherId)
        return `
        <div style="background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border); box-shadow: var(--shadow-sm); transition: var(--transition); display: flex; flex-direction: column;">
            <div style="padding: 24px; border-bottom: 1px solid var(--border); background: var(--primary-bg); border-radius: var(--radius-md) var(--radius-md) 0 0;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3 style="font-size: 20px; font-weight: 700; color: var(--primary-dark); margin-bottom: 8px;">${subject.name}</h3>
                    <span style="background: rgba(2, 132, 199, 0.1); color: var(--accent); padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">ID #${subject.id}</span>
                </div>
                <p style="color: var(--text-secondary); font-size: 14px;">Total registros de notas en sistema: <strong>${subject.grades ? subject.grades.length : 0}</strong></p>
            </div>
            <div style="padding: 20px; text-align: right; background: white; border-radius: 0 0 var(--radius-md) var(--radius-md);">
                <button class="btn btn-primary" onclick="openGradesModal(${subject.id}, '${subject.name}')" style="width: 100%;">👨‍🎓 Gestionar Estudiantes & Notas</button>
            </div>
        </div>
        `;
    }).join("");
}

// ===== GESTIÓN DE NOTAS MODAL =====

async function openGradesModal(subjectId, subjectName) {
    currentSubjectId = subjectId;
    currentStudentId = null;
    gradesModalTitle.textContent = `Gestión: ${subjectName}`;

    // Ocultar info de estudiante seleccionado al abrir
    noStudentSelected.style.display = 'block';
    selectedStudentInfo.style.display = 'none';
    studentsList.innerHTML = `<div style="text-align:center; padding: 20px;"><div class="spinner"></div></div>`;

    gradesModal.classList.add('show');

    await loadStudentsList();
}

// Cargar la lista de estudiantes para este profesor
async function loadStudentsList() {
    try {
        const currentSubject = subjects.find(s => s.id === currentSubjectId);

        if (currentSubject && currentSubject.students) {
            teacherStudents = currentSubject.students;
        } else {
            teacherStudents = [];
        }

        if (teacherStudents.length === 0) {
            studentsList.innerHTML = `<p style="padding: 16px; background: var(--bg-body); border-radius: var(--radius-sm); font-size: 14px; text-align: center; color: var(--text-muted);">No tienes estudiantes asignados a esta asignatura.</p>`;
            return;
        }

        renderStudentsList();

    } catch (error) {
        studentsList.innerHTML = `<p style="color:red">Error al cargar estudiantes.</p>`;
    }
}

function renderStudentsList() {
    studentsList.innerHTML = teacherStudents.map(student => `
        <div onclick="selectStudent(${student.id}, '${student.name}', '${student.email}')" 
             class="student-item" 
             id="student-item-${student.id}"
             style="padding: 12px 16px; margin-bottom: 8px; background: var(--bg-card); border-radius: var(--radius-sm); cursor: pointer; border: 1px solid var(--border); transition: var(--transition);">
            <div style="font-weight: 600; font-size: 14px; color: var(--text-primary); margin-bottom: 2px;">${student.name}</div>
            <div style="font-size: 12px; color: var(--text-muted);">ID: #${student.id} | ${student.email}</div>
        </div>
    `).join('');
}

function selectStudent(studentId, name, email) {
    currentStudentId = studentId;

    // UI selections highlight
    document.querySelectorAll('.student-item').forEach(el => {
        el.style.borderColor = 'var(--border)';
        el.style.background = 'var(--bg-card)';
        el.style.boxShadow = 'none';
    });

    const selectedEl = document.getElementById(`student-item-${studentId}`);
    if (selectedEl) {
        selectedEl.style.borderColor = 'var(--accent)';
        selectedEl.style.background = 'var(--primary-bg)';
        selectedEl.style.boxShadow = '0 2px 8px rgba(2, 132, 199, 0.1)';
    }

    // Update right panel
    noStudentSelected.style.display = 'none';
    selectedStudentInfo.style.display = 'block';
    selectedStudentName.textContent = name;
    selectedStudentEmail.textContent = email;

    loadStudentGrades(currentSubjectId, studentId);
}

function closeGradesModal() {
    gradesModal.classList.remove('show');
}

// ==== GESTION CRUD NOTAS ====

// Cargar las notas específicas del estudiante en la asignatura actual
async function loadStudentGrades(subjectId, studentId) {
    studentGradesList.innerHTML = `<div style="text-align:center; padding: 30px;"><div class="spinner"></div></div>`;

    try {
        // En una API real podríamos filtrar, pero acá traemos todas de la asignatura
        const response = await fetch(`${API_URL}/teachers/subjects/${subjectId}/grades`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Error obteniendo notas");

        const allGrades = await response.json();
        const studentGrades = allGrades.filter(g => g.studentId === studentId);

        if (studentGrades.length === 0) {
            studentGradesList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; background: #fff; border-radius: var(--radius-sm); border: 1px dashed var(--border);">
                    <div style="font-size: 24px; margin-bottom: 8px;">📝</div>
                    <p style="color: var(--text-secondary); font-size: 14px;">El estudiante no tiene notas de seguimiento en esta asignatura.</p>
                </div>
            `;
            return;
        }

        studentGradesList.innerHTML = `
            <table class="data-table" style="width: 100%; background: #fff; border-radius: var(--radius-sm); overflow: hidden; box-shadow: var(--shadow-sm);">
                <thead>
                    <tr style="background: var(--primary-bg);">
                        <th style="padding: 10px 14px;">Fecha</th>
                        <th style="padding: 10px 14px;">Descripción</th>
                        <th style="padding: 10px 14px;">Nota</th>
                        <th style="padding: 10px 14px; text-align:right;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${studentGrades.map(g => `
                        <tr>
                            <td style="padding: 10px 14px; font-size: 13px; color: var(--text-muted); white-space:nowrap;">${g.date}</td>
                            <td style="padding: 10px 14px; font-size: 14px;">${g.description}</td>
                            <td style="padding: 10px 14px; font-size: 15px; font-weight:700; color: ${g.grade >= 3.0 ? 'var(--success)' : 'var(--danger)'};">${g.grade.toFixed(1)}</td>
                            <td style="padding: 10px 14px; text-align:right;">
                                <button class="btn btn-sm btn-secondary" style="padding: 4px 8px;" onclick="openGradeForm(${g.id}, '${g.description}', ${g.grade}, '${g.date}')">✏️</button>
                                <button class="btn btn-sm btn-danger" style="padding: 4px 8px;" onclick="openDeleteGradeModal(${g.id})">🗑️</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        studentGradesList.innerHTML = `<p style="color:var(--danger)">${error.message}</p>`;
    }
}

function openGradeForm(id = null, desc = '', grade = '', date = '') {
    gradeForm.reset();
    document.getElementById('gradeSubjectId').value = currentSubjectId;
    document.getElementById('gradeStudentId').value = currentStudentId;

    if (id) {
        gradeFormTitle.textContent = "Editar Nota";
        document.getElementById('gradeIdField').value = id;
        document.getElementById('gradeDescription').value = desc;
        document.getElementById('gradeValue').value = grade;
        document.getElementById('gradeDate').value = date;
    } else {
        gradeFormTitle.textContent = "Añadir Nota de Seguimiento";
        document.getElementById('gradeIdField').value = "";
        document.getElementById('gradeDate').valueAsDate = new Date();
    }

    gradeFormModal.classList.add('show');
}

function closeGradeForm() {
    gradeFormModal.classList.remove('show');
}

async function handleGradeSave(e) {
    e.preventDefault();

    const id = document.getElementById('gradeIdField').value;
    const subjectId = parseInt(document.getElementById('gradeSubjectId').value);
    const studentId = parseInt(document.getElementById('gradeStudentId').value);
    const grade = parseFloat(document.getElementById('gradeValue').value);
    const description = document.getElementById('gradeDescription').value;
    const date = document.getElementById('gradeDate').value;

    saveGradeBtnText.style.display = 'none';
    saveGradeSpinner.style.display = 'inline-block';

    const isEdit = !!id;
    const payload = { subjectId, studentId, grade, description, date };

    try {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${API_URL}/teachers/grades/${id}` : `${API_URL}/teachers/grades`;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(await response.text());

        closeGradeForm();
        showGlobalAlert(`Nota de seguimiento ${isEdit ? 'actualizada' : 'registrada'} con éxito`, 'success');

        // Refresh local data by fetching subjects again in background to keep stats updated
        fetchSubjects();
        // Real-time render current student grades
        loadStudentGrades(currentSubjectId, currentStudentId);

    } catch (error) {
        showGlobalAlert(error.message, 'error');
    } finally {
        saveGradeBtnText.style.display = 'inline';
        saveGradeSpinner.style.display = 'none';
    }
}

function openDeleteGradeModal(id) {
    deleteGradeTargetId.value = id;
    deleteGradeModal.classList.add('show');
}

function closeDeleteGradeModal() {
    deleteGradeModal.classList.remove('show');
}

async function handleDeleteGradeConfirm() {
    const id = deleteGradeTargetId.value;

    try {
        const response = await fetch(`${API_URL}/teachers/grades/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Error al eliminar");

        showGlobalAlert("Nota eliminada con éxito", "success");
        closeDeleteGradeModal();

        fetchSubjects();
        loadStudentGrades(currentSubjectId, currentStudentId);

    } catch (error) {
        showGlobalAlert(error.message, 'error');
        closeDeleteGradeModal();
    }
}

// Global functions
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
