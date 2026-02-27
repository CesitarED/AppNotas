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

// Elementos DOM
const tableBody = document.getElementById('studentsTableBody');
const totalStudentsEl = document.getElementById('totalStudents');
const logoutBtn = document.getElementById('logoutBtn');
const alertEl = document.getElementById('alert');
const alertMsg = document.getElementById('alert-message');

// Modal Form Elements
const modal = document.getElementById('studentModal');
const studentForm = document.getElementById('studentForm');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const addStudentBtn = document.getElementById('addStudentBtn');
const saveBtnText = document.getElementById('saveBtnText');
const saveSpinner = document.getElementById('saveSpinner');

// Modal Eliminar Elements
const deleteModal = document.getElementById('deleteModal');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const deleteTargetId = document.getElementById('deleteTargetId');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    fetchStudents();

    // Event Listeners
    logoutBtn.addEventListener('click', logout);

    // Modal ABM
    addStudentBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    studentForm.addEventListener('submit', handleStudentSave);

    // Modal Delete
    closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
});

// --- FUNCIONES API ---

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

        // Actualizar UI
        totalStudentsEl.textContent = students.length;
        renderTable();
    } catch (error) {
        showGlobalAlert(error.message, 'error');
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--danger)">${error.message}</td></tr>`;
    }
}

async function handleStudentSave(e) {
    e.preventDefault();

    const id = document.getElementById('studentId').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const teacherId = document.getElementById('teacherId').value;

    const isEdit = !!id;

    // Validación básica
    if (!isEdit && !password) {
        alert("La contraseña es requerida para un nuevo estudiante");
        return;
    }

    const payload = { name, email };
    if (password) payload.password = password;
    if (teacherId) payload.teacherId = parseInt(teacherId);

    // UX Carga
    saveBtnText.style.display = 'none';
    saveSpinner.style.display = 'inline-block';

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
        closeModal();
        fetchStudents();
    } catch (error) {
        showGlobalAlert(error.message, 'error');
    } finally {
        saveBtnText.style.display = 'inline';
        saveSpinner.style.display = 'none';
    }
}

async function handleDeleteConfirm() {
    const id = deleteTargetId.value;

    try {
        const response = await fetch(`${API_URL}/students/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al eliminar');

        showGlobalAlert('Estudiante eliminado', 'success');
        closeDeleteModal();
        fetchStudents();
    } catch (error) {
        showGlobalAlert(error.message, 'error');
        closeDeleteModal();
    }
}

// --- FUNCIONES UI ---

function renderTable() {
    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 40px; color:var(--text-muted)">
                    No hay estudiantes registrados
                </td>
            </tr>`;
        return;
    }

    tableBody.innerHTML = students.map(student => `
        <tr>
            <td><strong>#${student.id}</strong></td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td><span class="badge ${student.role === 'student' ? 'badge-primary' : 'badge-warning'}">${student.role}</span></td>
            <td>${student.teacherId ? student.teacherId : '<span style="color:var(--text-muted)">-</span>'}</td>
            <td class="actions">
                <button class="btn btn-sm btn-secondary" onclick="openModal(${student.id})" title="Editar">✏️</button>
                <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${student.id})" title="Eliminar">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function openModal(id = null) {
    studentForm.reset();

    if (id) {
        // Edit mode
        modalTitle.textContent = "Editar Estudiante";
        const student = students.find(s => s.id === id);
        if (student) {
            document.getElementById('studentId').value = student.id;
            document.getElementById('name').value = student.name;
            document.getElementById('email').value = student.email;
            if (student.teacherId) document.getElementById('teacherId').value = student.teacherId;
        }
    } else {
        // Create mode
        modalTitle.textContent = "Nuevo Estudiante";
        document.getElementById('studentId').value = "";
    }

    modal.classList.add('show');
}

function closeModal() {
    modal.classList.remove('show');
    studentForm.reset();
}

function openDeleteModal(id) {
    deleteTargetId.value = id;
    deleteModal.classList.add('show');
}

function closeDeleteModal() {
    deleteModal.classList.remove('show');
    deleteTargetId.value = '';
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
