/**
 * Логика авторизации и регистрации
 *
 * Подключите ваш ASP.NET бекенд и замените mock-функции на реальные API вызовы.
 */

const API_BASE_URL = 'http://localhost:5000/api';

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tabs button');

    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}

function toggleStaffCodeField() {
    const registerType = document.getElementById('registerType');
    const staffCodeGroup = document.getElementById('staffCodeGroup');
    const staffCodeInput = document.getElementById('staffCode');

    if (registerType && registerType.value === 'staff') {
        staffCodeGroup.style.display = 'block';
        staffCodeInput.required = true;
    } else {
        staffCodeGroup.style.display = 'none';
        staffCodeInput.required = false;
    }
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const userData = await response.json();
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', userData.token);

                if (userData.role === 'admin' || userData.role === 'staff') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } else {
                const error = await response.json();
                alert('Ошибка входа: ' + (error.message || 'Неверный email или пароль'));
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером');
        }
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const company = document.getElementById('registerCompany').value;
        const type = document.getElementById('registerType').value;
        const staffCode = document.getElementById('staffCode').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

        if (password !== passwordConfirm) {
            alert('Пароли не совпадают!');
            return;
        }

        if (type === 'staff' && !staffCode) {
            alert('Введите код сотрудника!');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/Auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: name,
                    email,
                    nameOfCompany: company,
                    password,
                    code: staffCode
                })
            });

            if (response.ok) {
                const userData = await response.json();
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', userData.token);

                if (userData.role === 'admin' || userData.role === 'staff') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } else {
                const error = await response.json();
                alert('Ошибка регистрации: ' + (error.message || 'Не удалось зарегистрироваться'));
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером');
        }
    });
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (user && window.location.pathname.includes('login.html')) {
        if (user.role === 'admin' || user.role === 'staff') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        return null;
    }

    if (!user && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return null;
    }

    return user;
}

function updateUserInfo() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (user) {
        const nameEl = document.getElementById('userName') || document.getElementById('adminName');
        const companyEl = document.getElementById('userCompany') || document.getElementById('adminCompany');
        const avatarEl = document.getElementById('userAvatar');
        const companyNameEl = document.getElementById('companyName');
        const companyPhoneEl = document.getElementById('companyPhone');

        if (nameEl) nameEl.textContent = user.fullName || user.name || '';
        if (companyEl) companyEl.textContent = user.nameOfCompany || user.company || '';

        if (avatarEl) {
            const name = user.fullName || user.name || user.email || '';
            const initials = name.split(' ').map(n => n[0]).filter(c => c).join('').toUpperCase().slice(0, 2);
            avatarEl.textContent = initials || 'U';
        }

        if (companyNameEl) companyNameEl.textContent = user.nameOfCompany || user.company || '';
        if (companyPhoneEl) companyPhoneEl.textContent = user.companyPhone || '';
    }
}

function toggleFullscreen() {
    const fullscreen = document.getElementById('fullscreenMap');
    if (fullscreen) {
        fullscreen.style.display = fullscreen.style.display === 'none' ? 'block' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateUserInfo();
});
