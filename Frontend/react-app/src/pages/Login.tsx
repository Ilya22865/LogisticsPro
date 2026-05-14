import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
    const { login, register, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState<"login" | "register">("login");
    const [error, setError] = useState("");

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regCompany, setRegCompany] = useState("");
    const [regType, setRegType] = useState("customer");
    const [regStaffCode, setRegStaffCode] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regPasswordConfirm, setRegPasswordConfirm] = useState("");

    useEffect(() => {
        if (isAuthenticated) {
            navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
        }
    }, [isAuthenticated, isAdmin, navigate]);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await login(loginEmail, loginPassword);
            navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
        } catch (err: any) {
            setError(err.message || "Ошибка входа");
        }
    };

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        if (regPassword !== regPasswordConfirm) {
            setError("Пароли не совпадают");
            return;
        }
        if (regType === "staff" && !regStaffCode) {
            setError("Введите код сотрудника");
            return;
        }
        try {
            await register({
                fullName: regName,
                email: regEmail,
                nameOfCompany: regCompany,
                password: regPassword,
                adminCode: regType === "staff" ? regStaffCode : undefined,
            });
            navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
        } catch (err: any) {
            setError(err.message || "Ошибка регистрации");
        }
    };

    useEffect(() => {
        const tabsEl = document.querySelector(".auth-tabs");
        if (tabsEl) {
            if (tab === "register") {
                tabsEl.classList.add("register-active");
            } else {
                tabsEl.classList.remove("register-active");
            }
        }
    }, [tab]);

    function togglePassword(id: string, btn: HTMLElement) {
        const input = document.getElementById(id) as HTMLInputElement;
        if (!input) return;
        const icon = btn.querySelector("i");
        if (input.type === "password") {
            input.type = "text";
            icon?.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            input.type = "password";
            icon?.classList.replace("fa-eye-slash", "fa-eye");
        }
    }

    return (
        <div className="auth-container">
            <div className="floating-shapes">
                <div className="shape shape-circle"></div>
                <div className="shape shape-triangle"></div>
                <div className="shape shape-square"></div>
                <div className="shape shape-circle"></div>
                <div className="shape shape-triangle"></div>
                <div className="shape shape-square"></div>
                <div className="shape shape-circle"></div>
                <div className="shape shape-triangle"></div>
            </div>

            <div className="auth-box">
                <h1>LogisticsPro</h1>
                <p className="subtitle">Система управления логистикой</p>

                <div className="auth-tabs">
                    <button
                        className={tab === "login" ? "active" : ""}
                        onClick={() => setTab("login")}
                    >
                        <i className="fas fa-sign-in-alt"></i> Вход
                    </button>
                    <button
                        className={tab === "register" ? "active" : ""}
                        onClick={() => setTab("register")}
                    >
                        <i className="fas fa-user-plus"></i> Регистрация
                    </button>
                </div>

                {error && (
                    <div
                        className="auth-box error"
                        style={{
                            textAlign: "center",
                            color: "var(--color-danger)",
                            marginBottom: 16,
                            fontSize: 14,
                        }}
                    >
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                )}

                {tab === "login" ? (
                    <form
                        id="loginForm"
                        className="auth-form"
                        onSubmit={handleLogin}
                    >
                        <div className="form-group">
                            <input
                                type="email"
                                id="loginEmail"
                                placeholder=" "
                                required
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                            />
                            <i className="fas fa-envelope input-icon"></i>
                            <label htmlFor="loginEmail">
                                <i className="fas fa-envelope"></i> Email
                            </label>
                        </div>

                        <div className="form-group">
                            <input
                                type="password"
                                id="loginPassword"
                                placeholder=" "
                                required
                                value={loginPassword}
                                onChange={(e) =>
                                    setLoginPassword(e.target.value)
                                }
                            />
                            <i className="fas fa-lock input-icon"></i>
                            <label htmlFor="loginPassword">
                                <i className="fas fa-lock"></i> Пароль
                            </label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={(e) =>
                                    togglePassword(
                                        "loginPassword",
                                        e.currentTarget,
                                    )
                                }
                            >
                                <i className="fas fa-eye"></i>
                            </button>
                        </div>

                        <div className="form-footer-links">
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    cursor: "pointer",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    style={{ width: "auto", margin: 0 }}
                                />
                                <span style={{ fontSize: 13 }}>
                                    Запомнить меня
                                </span>
                            </label>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    alert(
                                        "Функция восстановления пароля будет доступна в следующей версии",
                                    );
                                }}
                            >
                                <i className="fas fa-key"></i> Забыли пароль?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ marginTop: 20 }}
                        >
                            <i className="fas fa-sign-in-alt"></i> Войти в
                            систему
                        </button>

                        <div className="divider">
                            <span>или войти через</span>
                        </div>

                        <div className="social-auth">
                            <button
                                type="button"
                                className="social-btn google"
                                onClick={() =>
                                    (window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/Auth/external-login?provider=Google`)
                                }
                            >
                                <i className="fab fa-google"></i>
                                <span>Google</span>
                            </button>
                        </div>

                        <p className="auth-footer">
                            Нет аккаунта?{" "}
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setTab("register");
                                }}
                            >
                                Зарегистрироваться
                            </a>
                        </p>
                    </form>
                ) : (
                    <form
                        id="registerForm"
                        className="auth-form"
                        onSubmit={handleRegister}
                    >
                        <div className="form-group">
                            <input
                                type="text"
                                id="registerName"
                                placeholder=" "
                                required
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                            />
                            <i className="fas fa-user input-icon"></i>
                            <label htmlFor="registerName">
                                <i className="fas fa-user"></i> ФИО
                            </label>
                        </div>

                        <div className="form-group">
                            <input
                                type="email"
                                id="registerEmail"
                                placeholder=" "
                                required
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                            />
                            <i className="fas fa-envelope input-icon"></i>
                            <label htmlFor="registerEmail">
                                <i className="fas fa-envelope"></i> Email
                            </label>
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                id="registerCompany"
                                placeholder=" "
                                required
                                value={regCompany}
                                onChange={(e) => setRegCompany(e.target.value)}
                            />
                            <i className="fas fa-building input-icon"></i>
                            <label htmlFor="registerCompany">
                                <i className="fas fa-building"></i> Название
                                компании
                            </label>
                        </div>

                        <div className="form-group">
                            <select
                                id="registerType"
                                value={regType}
                                onChange={(e) => setRegType(e.target.value)}
                                required
                            >
                                <option value="customer">
                                    Клиент (заказчик)
                                </option>
                                <option value="staff">
                                    Сотрудник логистической компании
                                </option>
                            </select>
                            <label
                                htmlFor="registerType"
                                style={{
                                    top: 0,
                                    left: 16,
                                    fontSize: 12,
                                    background: "rgba(255, 255, 255, 0.95)",
                                    transform: "translateY(-50%)",
                                }}
                            >
                                <i className="fas fa-briefcase"></i> Тип
                                регистрации
                            </label>
                        </div>

                        {regType === "staff" && (
                            <div className="form-group" id="staffCodeGroup">
                                <input
                                    type="text"
                                    id="staffCode"
                                    placeholder=" "
                                    value={regStaffCode}
                                    onChange={(e) =>
                                        setRegStaffCode(e.target.value)
                                    }
                                />
                                <i className="fas fa-id-badge input-icon"></i>
                                <label htmlFor="staffCode">
                                    <i className="fas fa-id-badge"></i> Код
                                    сотрудника
                                </label>
                                <small className="hint">
                                    Код выдается вашим руководителем
                                </small>
                            </div>
                        )}

                        <div className="form-group">
                            <input
                                type="password"
                                id="registerPassword"
                                placeholder=" "
                                required
                                minLength={6}
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                            />
                            <i className="fas fa-lock input-icon"></i>
                            <label htmlFor="registerPassword">
                                <i className="fas fa-lock"></i> Пароль
                            </label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={(e) =>
                                    togglePassword(
                                        "registerPassword",
                                        e.currentTarget,
                                    )
                                }
                            >
                                <i className="fas fa-eye"></i>
                            </button>
                            <small className="hint">Минимум 8 символов</small>
                            <div
                                className="password-strength"
                                id="passwordStrengthContainer"
                                style={{
                                    display: regPassword ? "block" : "none",
                                }}
                            >
                                <div
                                    className="password-strength-bar"
                                    id="passwordStrengthBar"
                                    style={{
                                        width:
                                            regPassword.length < 6
                                                ? "25%"
                                                : regPassword.length < 8
                                                  ? "50%"
                                                  : regPassword.length < 12
                                                    ? "75%"
                                                    : "100%",
                                        background:
                                            regPassword.length < 6
                                                ? "var(--color-danger)"
                                                : regPassword.length < 8
                                                  ? "var(--color-warning)"
                                                  : regPassword.length < 12
                                                    ? "var(--color-info)"
                                                    : "var(--color-accent-green)",
                                    }}
                                ></div>
                            </div>
                            <div
                                className="password-strength-text"
                                id="passwordStrengthText"
                                style={{
                                    display: regPassword ? "block" : "none",
                                }}
                            >
                                {regPassword.length < 6
                                    ? "Слишком короткий"
                                    : regPassword.length < 8
                                      ? "Средний"
                                      : regPassword.length < 12
                                        ? "Хороший"
                                        : "Надёжный"}
                            </div>
                        </div>

                        <div className="form-group">
                            <input
                                type="password"
                                id="registerPasswordConfirm"
                                placeholder=" "
                                required
                                minLength={6}
                                value={regPasswordConfirm}
                                onChange={(e) =>
                                    setRegPasswordConfirm(e.target.value)
                                }
                            />
                            <i className="fas fa-lock input-icon"></i>
                            <label htmlFor="registerPasswordConfirm">
                                <i className="fas fa-lock"></i> Подтверждение
                                пароля
                            </label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={(e) =>
                                    togglePassword(
                                        "registerPasswordConfirm",
                                        e.currentTarget,
                                    )
                                }
                            >
                                <i className="fas fa-eye"></i>
                            </button>
                        </div>

                        <div
                            className="form-footer-links"
                            style={{ marginTop: 12 }}
                        >
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    cursor: "pointer",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    id="agreeTerms"
                                    required
                                    style={{ width: "auto", margin: 0 }}
                                />
                                <span style={{ fontSize: 13 }}>
                                    Согласен с{" "}
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            alert(
                                                "Условия использования будут доступны позже",
                                            );
                                        }}
                                    >
                                        условиями использования
                                    </a>
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ marginTop: 20 }}
                        >
                            <i className="fas fa-user-plus"></i>{" "}
                            Зарегистрироваться
                        </button>

                        <p className="auth-footer">
                            Уже есть аккаунт?{" "}
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setTab("login");
                                }}
                            >
                                Войти
                            </a>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
