// ===== LOGIN.JS — Lógica de autenticación =====

const API_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
    // Si ya tiene token, redirigir según rol
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
        redirectByRole(role);
        return;
    }

    const form = document.getElementById('loginForm');
    const alertEl = document.getElementById('alert');
    const alertMsg = document.getElementById('alert-message');
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Ocultar alerta previa
        alertEl.classList.remove('show');

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showAlert('Por favor completa todos los campos');
            return;
        }

        // Estado de carga
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }

            // Guardar token y role
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);

            // Redirigir según rol
            redirectByRole(data.role);

        } catch (error) {
            showAlert(error.message || 'Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    });

    function showAlert(message) {
        alertMsg.textContent = message;
        alertEl.classList.add('show');
    }

    function setLoading(loading) {
        loginBtn.disabled = loading;
        loginBtnText.style.display = loading ? 'none' : 'inline';
        loginSpinner.style.display = loading ? 'inline-block' : 'none';
    }
});

function redirectByRole(role) {
    switch (role) {
        case 'admin':
            window.location.href = '/admin.html';
            break;
        case 'student':
            window.location.href = '/student.html';
            break;
        default:
            window.location.href = '/login.html';
    }
}
