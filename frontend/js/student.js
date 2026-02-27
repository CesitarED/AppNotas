// ===== STUDENT.JS — Lógica del Portal de Estudiante =====

const API_URL = window.location.origin;

// Verificar sesión
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'student') {
    window.location.href = '/login.html';
}

// Elementos DOM
const logoutBtn = document.getElementById('logoutBtn');
const loadingState = document.getElementById('loadingState');
const profileContent = document.getElementById('profileContent');

// Elementos de datos
const topName = document.getElementById('topName');
const topAvatar = document.getElementById('topAvatar');
const mainAvatar = document.getElementById('mainAvatar');
const profileName = document.getElementById('profileName');
const infoId = document.getElementById('infoId');
const infoEmail = document.getElementById('infoEmail');
const infoDate = document.getElementById('infoDate');
const infoTeacher = document.getElementById('infoTeacher');

const alertEl = document.getElementById('alert');
const alertMsg = document.getElementById('alert-message');

document.addEventListener('DOMContentLoaded', () => {
    fetchProfile();
    logoutBtn.addEventListener('click', logout);
});

// Función simple para decodificar JWT sin librerías externas
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

async function fetchProfile() {
    try {
        // En el JWT, el id del usuario está codificado. Lo extraemos:
        const payload = parseJwt(token);

        if (!payload || !payload.id) {
            throw new Error('Token inválido o expirado. Por favor, inicia sesión de nuevo.');
        }

        const studentId = payload.id;

        const response = await fetch(`${API_URL}/students/${studentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) logout();
            throw new Error('Error al obtener datos del perfil');
        }

        const student = await response.json();

        renderProfile(student);

    } catch (error) {
        showGlobalAlert(error.message, 'error');
        loadingState.innerHTML = `<p style="color:var(--danger)">${error.message}</p>`;

        // Si el error es de token invalido, sacarlo despues de 3 segundos
        if (error.message.includes('Token')) {
            setTimeout(logout, 3000);
        }
    }
}

function renderProfile(student) {
    // Inicial para el Avatar
    const initial = student.name ? student.name.charAt(0).toUpperCase() : 'E';

    // Top Bar
    topName.textContent = student.name;
    topAvatar.textContent = initial;

    // Main Card
    mainAvatar.textContent = initial;
    profileName.textContent = student.name;
    infoId.textContent = `#${student.id}`;
    infoEmail.textContent = student.email;

    // Formatear Fecha
    const date = new Date(student.createdAt);
    infoDate.textContent = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Profesor
    if (student.teacherId) {
        infoTeacher.textContent = `Profesor ID: # ${student.teacherId}`;
        infoTeacher.style.color = "var(--primary)";
    } else {
        infoTeacher.textContent = "Aún no tienes un profesor asignado";
        infoTeacher.style.color = "var(--text-secondary)";
        infoTeacher.style.fontWeight = "500";
    }

    // Cambiar vista de carga a vista de datos
    loadingState.style.display = 'none';
    profileContent.style.display = 'block';
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
