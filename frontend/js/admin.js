// ===== ADMIN.JS — Lógica del Dashboard Administrador =====

const API_URL = window.location.origin;

// Verificar sesión
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'admin') {
    window.location.href = '/login.html';
}

// Variables Globales
let students = [];
let teachers = [];
let currentSection = 'students';

// Elementos DOM comunes
const alertEl = document.getElementById('alert');
const alertMsg = document.getElementById('alert-message');
const logoutBtn = document.getElementById('logoutBtn');
const pageTitle = document.getElementById('pageTitle');

// Secciones
const studentsSection = document.getElementById('studentsSection');
const teachersSection = document.getElementById('teachersSection');

// Stats
const totalStudentsEl = document.getElementById('totalStudents');
const totalTeachersEl = document.getElementById('totalTeachers');

// --- Estudiantes DOM ---
const studentsTableBody = document.getElementById('studentsTableBody');
const studentModal = document.getElementById('studentModal');
const studentForm = document.getElementById('studentForm');
const studentModalTitle = document.getElementById('modalTitle');
const addStudentBtn = document.getElementById('addStudentBtn');
const closeStudentModalBtn = document.getElementById('closeStudentModalBtn');
const saveStudentBtnText = document.getElementById('saveStudentBtnText');
const saveStudentSpinner = document.getElementById('saveStudentSpinner');

const deleteStudentModal = document.getElementById('deleteStudentModal');
const closeDeleteStudentModalBtn = document.getElementById('closeDeleteStudentModalBtn');
const confirmDeleteStudentBtn = document.getElementById('confirmDeleteStudentBtn');
const deleteStudentTargetId = document.getElementById('deleteStudentTargetId');

// --- Profesores DOM ---
const teachersTableBody = document.getElementById('teachersTableBody');
const teacherModal = document.getElementById('teacherModal');
const teacherForm = document.getElementById('teacherForm');
const teacherModalTitle = document.getElementById('teacherModalTitle');
const addTeacherBtn = document.getElementById('addTeacherBtn');
const closeTeacherModalBtn = document.getElementById('closeTeacherModalBtn');
const saveTeacherBtnText = document.getElementById('saveTeacherBtnText');
const saveTeacherSpinner = document.getElementById('saveTeacherSpinner');

const deleteTeacherModal = document.getElementById('deleteTeacherModal');
const closeDeleteTeacherModalBtn = document.getElementById('closeDeleteTeacherModalBtn');
const confirmDeleteTeacherBtn = document.getElementById('confirmDeleteTeacherBtn');
const deleteTeacherTargetId = document.getElementById('deleteTeacherTargetId');

// --- Asignaturas DOM ---
const subjectsModal = document.getElementById('subjectsModal');
const subjectsModalTitle = document.getElementById('subjectsModalTitle');
const subjectsList = document.getElementById('subjectsList');
const addSubjectForm = document.getElementById('addSubjectForm');
const closeSubjectsModalBtn = document.getElementById('closeSubjectsModalBtn');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    fetchStudents();
    fetchTeachers();

    // Logout
    logoutBtn.addEventListener('click', logout);

    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Modal Estudiante
    addStudentBtn.addEventListener('click', () => openStudentModal());
    closeStudentModalBtn.addEventListener('click', closeStudentModal);
    studentForm.addEventListener('submit', handleStudentSave);
    closeDeleteStudentModalBtn.addEventListener('click', closeDeleteStudentModal);
    confirmDeleteStudentBtn.addEventListener('click', handleDeleteStudentConfirm);

    // Modal Profesor
    addTeacherBtn.addEventListener('click', () => openTeacherModal());
    closeTeacherModalBtn.addEventListener('click', closeTeacherModal);
    teacherForm.addEventListener('submit', handleTeacherSave);
    closeDeleteTeacherModalBtn.addEventListener('click', closeDeleteTeacherModal);
    confirmDeleteTeacherBtn.addEventListener('click', handleDeleteTeacherConfirm);

    // Modal Asignaturas
    closeSubjectsModalBtn.addEventListener('click', closeSubjectsModal);
    addSubjectForm.addEventListener('submit', handleAddSubject);
});

// ===== NAVEGACIÓN SIDEBAR =====
function switchSection(section) {
    currentSection = section;
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`.sidebar-nav a[data-section="${section}"]`).classList.add('active');

    if (section === 'students') {
        studentsSection.style.display = 'block';
        teachersSection.style.display = 'none';
        pageTitle.textContent = 'Gestión de Estudiantes';
    } else {
        studentsSection.style.display = 'none';
        teachersSection.style.display = 'block';
        pageTitle.textContent = 'Gestión de Profesores';
    }
}

// ===== API ESTUDIANTES =====

async function fetchStudents() {
    try {
        const response = await fetch(`${API_URL}/students`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) logout();
            throw new Error('Error al obtener estudiantes');
        }
        students = await response.json();
        totalStudentsEl.textContent = students.length;
        renderStudentsTable();
    } catch (error) {
        showGlobalAlert(error.message, 'error');
        studentsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--danger)">${error.message}</td></tr>`;
    }
}

async function handleStudentSave(e) {
    e.preventDefault();

    const id = document.getElementById('studentId').value;
    const name = document.getElementById('studentName').value;
    const email = document.getElementById('studentEmail').value;
    const password = document.getElementById('studentPassword').value;
    const teacherId = document.getElementById('studentTeacherId').value;

    const isEdit = !!id;

    if (!isEdit && !password) {
        alert("La contraseña es requerida para un nuevo estudiante");
        return;
    }

    const payload = { name, email };
    if (password) payload.password = password;
    if (teacherId) payload.teacherId = parseInt(teacherId);

    saveStudentBtnText.style.display = 'none';
    saveStudentSpinner.style.display = 'inline-block';

    try {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${API_URL}/students/${id}` : `${API_URL}/students`;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al guardar');
        }

        showGlobalAlert(`Estudiante ${isEdit ? 'actualizado' : 'creado'} con éxito`, 'success');
        closeStudentModal();
        fetchStudents();
    } catch (error) {
        showGlobalAlert(error.message, 'error');
    } finally {
        saveStudentBtnText.style.display = 'inline';
        saveStudentSpinner.style.display = 'none';
    }
}

async function handleDeleteStudentConfirm() {
    const id = deleteStudentTargetId.value;
    try {
        const response = await fetch(`${API_URL}/students/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al eliminar');
        showGlobalAlert('Estudiante eliminado', 'success');
        closeDeleteStudentModal();
        fetchStudents();
    } catch (error) {
        showGlobalAlert(error.message, 'error');
        closeDeleteStudentModal();
    }
}

// ===== API PROFESORES =====

async function fetchTeachers() {
    try {
        const response = await fetch(`${API_URL}/teachers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) logout();
            throw new Error('Error al obtener profesores');
        }
        teachers = await response.json();
        totalTeachersEl.textContent = teachers.length;
        renderTeachersTable();
    } catch (error) {
        showGlobalAlert(error.message, 'error');
        teachersTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--danger)">${error.message}</td></tr>`;
    }
}

async function handleTeacherSave(e) {
    e.preventDefault();

    const id = document.getElementById('teacherIdField').value;
    const name = document.getElementById('teacherName').value;
    const email = document.getElementById('teacherEmail').value;
    const password = document.getElementById('teacherPassword').value;

    const isEdit = !!id;

    if (!isEdit && !password) {
        alert("La contraseña es requerida para un nuevo profesor");
        return;
    }

    const payload = { name, email };
    if (password) payload.password = password;

    saveTeacherBtnText.style.display = 'none';
    saveTeacherSpinner.style.display = 'inline-block';

    try {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${API_URL}/teachers/${id}` : `${API_URL}/teachers`;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al guardar');
        }

        showGlobalAlert(`Profesor ${isEdit ? 'actualizado' : 'creado'} con éxito`, 'success');
        closeTeacherModal();
        fetchTeachers();
    } catch (error) {
        showGlobalAlert(error.message, 'error');
    } finally {
        saveTeacherBtnText.style.display = 'inline';
        saveTeacherSpinner.style.display = 'none';
    }
}

async function handleDeleteTeacherConfirm() {
    const id = deleteTeacherTargetId.value;
    try {
        const response = await fetch(`${API_URL}/teachers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al eliminar');
        showGlobalAlert('Profesor eliminado', 'success');
        closeDeleteTeacherModal();
        fetchTeachers();
    } catch (error) {
        showGlobalAlert(error.message, 'error');
        closeDeleteTeacherModal();
    }
}

// ===== API ASIGNATURAS =====

async function fetchSubjects(teacherId) {
    try {
        const response = await fetch(`${API_URL}/teachers/${teacherId}/subjects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al obtener asignaturas');
        return await response.json();
    } catch (error) {
        showGlobalAlert(error.message, 'error');
        return [];
    }
}

async function handleAddSubject(e) {
    e.preventDefault();
    const teacherId = document.getElementById('subjectTeacherId').value;
    const name = document.getElementById('newSubjectName').value;

    try {
        const response = await fetch(`${API_URL}/teachers/subjects`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, teacherId: parseInt(teacherId) })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error al crear asignatura');
        }

        showGlobalAlert('Asignatura creada con éxito', 'success');
        document.getElementById('newSubjectName').value = '';
        openSubjectsModal(teacherId);
        fetchTeachers(); // Refresh teachers list to update subject count
    } catch (error) {
        showGlobalAlert(error.message, 'error');
    }
}

async function deleteSubject(subjectId, teacherId) {
    try {
        const response = await fetch(`${API_URL}/teachers/subjects/${subjectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al eliminar asignatura');
        showGlobalAlert('Asignatura eliminada', 'success');
        openSubjectsModal(teacherId);
        fetchTeachers();
    } catch (error) {
        showGlobalAlert(error.message, 'error');
    }
}

// ===== RENDERIZADO UI =====

function renderStudentsTable() {
    if (students.length === 0) {
        studentsTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 40px; color:var(--text-muted)">
                    No hay estudiantes registrados
                </td>
            </tr>`;
        return;
    }

    studentsTableBody.innerHTML = students.map(student => `
        <tr>
            <td><strong>#${student.id}</strong></td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td><span class="badge badge-primary">${student.role}</span></td>
            <td>${student.teacherId ? student.teacherId : '<span style="color:var(--text-muted)">-</span>'}</td>
            <td class="actions">
                <button class="btn btn-sm btn-secondary" onclick="openStudentModal(${student.id})" title="Editar">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="openDeleteStudentModal(${student.id})" title="Eliminar">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function renderTeachersTable() {
    if (teachers.length === 0) {
        teachersTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 40px; color:var(--text-muted)">
                    No hay profesores registrados
                </td>
            </tr>`;
        return;
    }

    teachersTableBody.innerHTML = teachers.map(teacher => {
        const subjectCount = teacher.subjects ? teacher.subjects.length : 0;
        const subjectNames = teacher.subjects && teacher.subjects.length > 0
            ? teacher.subjects.map(s => s.name).join(', ')
            : '<span style="color:var(--text-muted)">Sin asignaturas</span>';
        return `
        <tr>
            <td><strong>#${teacher.id}</strong></td>
            <td>${teacher.name}</td>
            <td>${teacher.email}</td>
            <td>
                ${subjectNames}
                <button class="btn btn-sm btn-secondary" onclick="openSubjectsModal(${teacher.id})" title="Gestionar Asignaturas" style="margin-left:8px;">📘</button>
            </td>
            <td class="actions">
                <button class="btn btn-sm btn-secondary" onclick="openTeacherModal(${teacher.id})" title="Editar">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="openDeleteTeacherModal(${teacher.id})" title="Eliminar">🗑️</button>
            </td>
        </tr>`;
    }).join('');
}

// ===== MODALES ESTUDIANTES =====

function openStudentModal(id = null) {
    studentForm.reset();

    if (id) {
        studentModalTitle.textContent = "Editar Estudiante";
        const student = students.find(s => s.id === id);
        if (student) {
            document.getElementById('studentId').value = student.id;
            document.getElementById('studentName').value = student.name;
            document.getElementById('studentEmail').value = student.email;
            if (student.teacherId) document.getElementById('studentTeacherId').value = student.teacherId;
        }
    } else {
        studentModalTitle.textContent = "Nuevo Estudiante";
        document.getElementById('studentId').value = "";
    }

    studentModal.classList.add('show');
}

function closeStudentModal() {
    studentModal.classList.remove('show');
    studentForm.reset();
}

function openDeleteStudentModal(id) {
    deleteStudentTargetId.value = id;
    deleteStudentModal.classList.add('show');
}

function closeDeleteStudentModal() {
    deleteStudentModal.classList.remove('show');
    deleteStudentTargetId.value = '';
}

// ===== MODALES PROFESORES =====

function openTeacherModal(id = null) {
    teacherForm.reset();

    if (id) {
        teacherModalTitle.textContent = "Editar Profesor";
        const teacher = teachers.find(t => t.id === id);
        if (teacher) {
            document.getElementById('teacherIdField').value = teacher.id;
            document.getElementById('teacherName').value = teacher.name;
            document.getElementById('teacherEmail').value = teacher.email;
        }
    } else {
        teacherModalTitle.textContent = "Nuevo Profesor";
        document.getElementById('teacherIdField').value = "";
    }

    teacherModal.classList.add('show');
}

function closeTeacherModal() {
    teacherModal.classList.remove('show');
    teacherForm.reset();
}

function openDeleteTeacherModal(id) {
    deleteTeacherTargetId.value = id;
    deleteTeacherModal.classList.add('show');
}

function closeDeleteTeacherModal() {
    deleteTeacherModal.classList.remove('show');
    deleteTeacherTargetId.value = '';
}

// ===== MODAL ASIGNATURAS =====

async function openSubjectsModal(teacherId) {
    const teacher = teachers.find(t => t.id === parseInt(teacherId));
    subjectsModalTitle.textContent = `📘 Asignaturas de ${teacher ? teacher.name : 'Profesor'}`;
    document.getElementById('subjectTeacherId').value = teacherId;

    const subjects = await fetchSubjects(teacherId);

    if (subjects.length === 0) {
        subjectsList.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding: 20px;">No hay asignaturas asignadas</p>`;
    } else {
        subjectsList.innerHTML = subjects.map(subject => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:var(--primary-bg); border-radius:var(--radius-sm); margin-bottom:8px; border: 1px solid var(--border);">
                <div>
                    <strong>${subject.name}</strong>
                    <span style="color:var(--text-muted); font-size:12px; margin-left:8px;">(${subject.grades ? subject.grades.length : 0} notas)</span>
                </div>
                <button class="btn btn-sm btn-danger" onclick="deleteSubject(${subject.id}, ${teacherId})" title="Eliminar">🗑️</button>
            </div>
        `).join('');
    }

    subjectsModal.classList.add('show');
}

function closeSubjectsModal() {
    subjectsModal.classList.remove('show');
}

// ===== UTILIDADES =====

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
