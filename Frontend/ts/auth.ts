const API_BASE_URL = 'http://localhost:5000/api';

interface User {
    fullName: string;
    email: string;
    role: 'admin' | 'user';
    nameOfCompany?: string;
    companyPhone?: string;
    token?: string;
}

interface LoginResponse extends User {
    token: string;
}

function switchTab(tab: 'login' | 'register') {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tabs button');

    if (tab === 'login') {
        loginForm!.style.display = 'block';
        registerForm!.style.display = 'none';
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        loginForm!.style.display = 'none';
        registerForm!.style.display = 'block';
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}

function toggleStaffCodeField() {
    const registerType = document.getElementById('registerType') as HTMLSelectElement;
    const staffCodeGroup = document.getElementById('staffCodeGroup');
    const staffCodeInput = document.getElementById('staffCode') as HTMLInputElement;

    if (registerType && registerType.value === 'staff') {
        staffCodeGroup!.style.display = 'block';
        staffCodeInput.required = true;
    } else {
        staffCodeGroup!.style.display = 'none';
        staffCodeInput.required = false;
    }
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
        const password = (document.getElementById('loginPassword') as HTMLInputElement).value;

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
    })
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = (document.getElementById('registerName') as HTMLInputElement).value;
        const email = (document.getElementById('registerEmail') as HTMLInputElement).value;
        const company = (document.getElementById('registerCompany') as HTMLInputElement).value;
        const type = (document.getElementById('registerType') as HTMLInputElement).value;
        const staffCode = (document.getElementById('staffCode') as HTMLInputElement).value;
        const password = (document.getElementById('registerPassword') as HTMLInputElement).value;
        const passwordConfirm = (document.getElementById('registerPasswordConfirm') as HTMLInputElement).value;

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
    window.location.href = 'index.html';
}

function checkAuth(): User | null {
    const user = JSON.parse(localStorage.getItem('user') || 'null') as User | null;

    if (user && window.location.pathname.includes('index.html')) {
        const role = (user.role || '').toLowerCase();
        if (role === 'admin' || role === 'staff') {
            window.location.href = 'admin.html';
        } else {
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
    const user = JSON.parse(localStorage.getItem('user') || 'null') as User | null;

    if (user) {
        const nameEl = document.getElementById('userName') || document.getElementById('adminName');
        const companyEl = document.getElementById('userCompany') || document.getElementById('adminCompany');
        const avatarEl = document.getElementById('userAvatar');
        const companyNameEl = document.getElementById('companyName');
        const companyPhoneEl = document.getElementById('companyPhone');

        if (nameEl) nameEl.textContent = user.fullName || user.fullName || '';
        if (companyEl) companyEl.textContent = user.nameOfCompany || user.nameOfCompany || '';

        if (avatarEl) {
            const name = user.fullName || user.fullName || user.email || '';
            const initials = name.split(' ').map(n => n[0]).filter(c => c).join('').toUpperCase().slice(0, 2);
            avatarEl.textContent = initials || 'U';
        }

        if (companyNameEl) companyNameEl.textContent = user.nameOfCompany || user.nameOfCompany || '';
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
        } else {
            window.location.href = 'dashboard.html';
        }
    }
}

// Google button click handler
function loginWithGoogle() {
    window.location.href = `${API_BASE_URL}/auth/external-login?provider=Google`;
}
