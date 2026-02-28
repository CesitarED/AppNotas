// ===== PUBLIC DIRECTORY LOGIC =====
const API_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
    fetchDirectory();
});

async function fetchDirectory() {
    const loadingEl = document.getElementById('loading');
    const gridEl = document.getElementById('teachersGrid');
    const errorEl = document.getElementById('error-message');

    try {
        const response = await fetch(`${API_URL}/public/directory`);

        if (!response.ok) {
            throw new Error('No se pudo cargar la información del directorio.');
        }

        const teachers = await response.json();

        loadingEl.style.display = 'none';

        if (teachers.length === 0) {
            errorEl.style.display = 'block';
            errorEl.style.backgroundColor = 'white';
            errorEl.style.borderColor = 'var(--border)';
            errorEl.style.color = 'var(--text-secondary)';
            errorEl.innerHTML = '<div style="font-size: 40px; margin-bottom: 12px;">👨‍🏫</div>Aún no hay profesores registrados en el sistema.';
            return;
        }

        renderTeachers(teachers, gridEl);
        gridEl.style.display = 'grid';

    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = error.message;
    }
}

function renderTeachers(teachers, container) {
    const html = teachers.map(teacher => {
        const initial = teacher.name.charAt(0).toUpperCase();

        let subjectsHtml = '<p style="color: var(--text-muted); font-size: 14px; font-style: italic;">Sin asignaturas registradas</p>';

        if (teacher.subjects && teacher.subjects.length > 0) {
            subjectsHtml = teacher.subjects.map(sub =>
                `<span class="subject-badge">${sub.name}</span>`
            ).join('');
        }

        return `
            <div class="teacher-card">
                <div class="teacher-header">
                    <div class="teacher-avatar">${initial}</div>
                    <div class="teacher-name">${teacher.name}</div>
                    <div class="teacher-email">${teacher.email}</div>
                </div>
                <div class="subjects-list">
                    <h4 style="font-size: 13px; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.05em;">Asignaturas a cargo</h4>
                    <div>
                        ${subjectsHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}
