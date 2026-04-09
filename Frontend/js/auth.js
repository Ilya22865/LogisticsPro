"use strict";
const API_BASE_URL = 'http://localhost:5000/api';


        function togglePassword(inputId, button) {
            const input = document.getElementById(inputId);
            const icon = button.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }

        function checkPasswordStrength(password) {
            const container = document.getElementById('passwordStrengthContainer');
            const bar = document.getElementById('passwordStrengthBar');
            const text = document.getElementById('passwordStrengthText');

            if (!password) {
                container.style.display = 'none';
                text.style.display = 'none';
                return;
            }

            container.style.display = 'block';
            text.style.display = 'block';

            let strength = 0;
            if (password.length >= 8) strength++;
            if (password.length >= 12) strength++;
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
            if (/\d/.test(password)) strength++;
            if (/[^a-zA-Z0-9]/.test(password)) strength++;

            bar.className = 'password-strength-bar';

            if (strength <= 1) {
                bar.classList.add('weak');
                text.textContent = 'Слабый пароль';
                text.style.color = 'var(--color-danger)';
            } else if (strength <= 2) {
                bar.classList.add('fair');
                text.textContent = 'Средний пароль';
                text.style.color = 'var(--color-warning)';
            } else if (strength <= 3) {
                bar.classList.add('good');
                text.textContent = 'Хороший пароль';
                text.style.color = 'var(--color-info)';
            } else {
                bar.classList.add('strong');
                text.textContent = 'Надежный пароль';
                text.style.color = 'var(--color-accent-green)';
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');

            [loginForm, registerForm].forEach(form => {
                form.addEventListener('submit', function(e) {
                    const submitBtn = form.querySelector('.btn-lg');
                    submitBtn.classList.add('loading');
                    submitBtn.disabled = true;

                    setTimeout(() => {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                    }, 3000);
                });
            });

            const inputs = document.querySelectorAll('.form-group input, .form-group select');
            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    this.closest('.form-group').style.transform = 'scale(1.02)';
                    this.closest('.form-group').style.transition = 'transform 0.2s ease';
                });

                input.addEventListener('blur', function() {
                    this.closest('.form-group').style.transform = 'scale(1)';
                });
            });
        });
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tabs button');
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    }
    else {
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
    }
    else {
        staffCodeGroup.style.display = 'none';
        staffCodeInput.required = false;
    }
}
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
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
                const role = (userData.role || '').toLowerCase();
                if (role === 'admin' || role === 'staff') {
                    window.location.href = 'admin.html';
                }
                else {
                    window.location.href = 'dashboard.html';
                }
            }
            else {
                const error = await response.json();
                alert('Ошибка входа: ' + (error.message || 'Неверный email или пароль'));
            }
        }
        catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером');
        }
    });
}
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
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
                    adminCode: staffCode
                })
            });
            if (response.ok) {
                const userData = await response.json();
                // Server returns 'adminToken' for admin registration, 'token' for regular
                const token = userData.adminToken || userData.token;
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', token);
                const role = (userData.role || '').toLowerCase();
                if (role === 'admin' || role === 'staff') {
                    window.location.href = 'admin.html';
                }
                else {
                    window.location.href = 'dashboard.html';
                }
            }
            else {
                const error = await response.json();
                alert('Ошибка регистрации: ' + (error.message || 'Не удалось зарегистрироваться'));
            }
        }
        catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка соединения с сервером');
        }
    });
}
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && window.location.pathname.includes('index.html')) {
        const role = (user.role || '').toLowerCase();
        if (role === 'admin' || role === 'staff') {
            window.location.href = 'admin.html';
        }
        else {
            window.location.href = 'dashboard.html';
        }
        return null;
    }
    if (!user && !window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
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
        if (nameEl)
            nameEl.textContent = user.fullName || user.fullName || '';
        if (companyEl)
            companyEl.textContent = user.nameOfCompany || user.nameOfCompany || '';
        if (avatarEl) {
            const name = user.fullName || user.fullName || user.email || '';
            const initials = name.split(' ').map(n => n[0]).filter(c => c).join('').toUpperCase().slice(0, 2);
            avatarEl.textContent = initials || 'U';
        }
        if (companyNameEl)
            companyNameEl.textContent = user.nameOfCompany || user.nameOfCompany || '';
        if (companyPhoneEl)
            companyPhoneEl.textContent = user.companyPhone || '';
    }
}
function toggleFullscreen() {
    const fullscreen = document.getElementById('fullscreenMap');
    if (fullscreen) {
        fullscreen.style.display = fullscreen.style.display === 'none' ? 'block' : 'none';
    }
}
document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    updateUserInfo();
    handleGoogleCallbackToken();
});
// Handle Google OAuth redirect with token in URL
function handleGoogleCallbackToken() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
        const userData = {
            token: token,
            id: params.get('user_id'),
            email: params.get('email') || '',
            fullName: params.get('name') || '',
            role: params.get('role') || 'user',
            nameOfCompany: ''
        };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        const role = userData.role.toLowerCase();
        if (role === 'admin' || role === 'staff') {
            window.location.href = 'admin.html';
        }
        else {
            window.location.href = 'dashboard.html';
        }
    }
}
// Google button click handler
function loginWithGoogle() {
    window.location.href = `${API_BASE_URL}/auth/external-login?provider=Google`;
}
//# sourceMappingURL=auth.js.map