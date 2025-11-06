/**
 * LoginScreen - Pantalla de login
 * Gestiona la interfaz de autenticación (login/registro/invitado)
 */

import { AuthService } from '../services/AuthService.js';

export class LoginScreen {
    constructor() {
        this.authService = new AuthService();
        this.onLoginSuccess = null;
        this.mode = 'login'; // 'login', 'register'
    }

    /**
     * Renderiza la pantalla de login
     * @returns {HTMLElement} - Elemento de la pantalla de login
     */
    render() {
        const container = document.createElement('div');
        container.className = 'login-screen';
        container.id = 'loginScreen';

        container.innerHTML = `
            <div class="login-container">
                <div class="login-header">
                    <h1 class="login-title">⚓ Batalla Naval</h1>
                    <p class="login-subtitle">Bienvenido</p>
                </div>

                <div class="login-tabs">
                    <button class="login-tab login-tab--active" data-mode="login">
                        Iniciar Sesión
                    </button>
                    <button class="login-tab" data-mode="register">
                        Registrarse
                    </button>
                </div>

                <form class="login-form" id="authForm">
                    <div class="form-group">
                        <label class="form-label" for="username">Usuario</label>
                        <input
                            class="form-input"
                            type="text"
                            id="username"
                            placeholder="Ingresa tu usuario"
                            required
                            autocomplete="username"
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="password">Contraseña</label>
                        <input
                            class="form-input"
                            type="password"
                            id="password"
                            placeholder="Ingresa tu contraseña"
                            required
                            autocomplete="current-password"
                        />
                    </div>

                    <div class="form-message" id="formMessage"></div>

                    <button type="submit" class="btn btn--primary btn--large login-btn">
                        Iniciar Sesión
                    </button>
                </form>

                <div class="login-divider">
                    <span>o</span>
                </div>

                <button class="btn btn--secondary btn--large login-btn-guest" id="btnGuest">
                    👤 Jugar como Invitado
                </button>

                <div class="login-footer">
                    <a href="#" class="login-link" id="toggleMode">
                        ¿No tienes cuenta? Regístrate
                    </a>
                </div>
            </div>

            <div class="login-background">
                <div class="wave wave--1"></div>
                <div class="wave wave--2"></div>
                <div class="wave wave--3"></div>
            </div>
        `;

        this.attachEventListeners(container);
        return container;
    }

    /**
     * Adjunta los event listeners
     */
    attachEventListeners(container) {
        const form = container.querySelector('#authForm');
        const btnGuest = container.querySelector('#btnGuest');
        const toggleMode = container.querySelector('#toggleMode');
        const tabs = container.querySelectorAll('.login-tab');

        form.addEventListener('submit', (e) => this.handleFormSubmit(e, container));
        btnGuest.addEventListener('click', () => this.handleGuestLogin(container));
        toggleMode.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMode(container);
        });

        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchMode(container, mode);
            });
        });

        // Enter key en el último input
        container.querySelector('#password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                form.dispatchEvent(new Event('submit'));
            }
        });
    }

    /**
     * Maneja el envío del formulario
     */
    handleFormSubmit(e, container) {
        e.preventDefault();

        const username = container.querySelector('#username').value.trim();
        const password = container.querySelector('#password').value;
        const messageEl = container.querySelector('#formMessage');

        if (!username || !password) {
            this.showMessage(messageEl, 'Los campos son requeridos', 'error');
            return;
        }

        let result;

        if (this.mode === 'login') {
            result = this.authService.login(username, password);
        } else {
            result = this.authService.register(username, password);
        }

        if (result.success) {
            this.showMessage(messageEl, result.message, 'success');
            setTimeout(() => this.loginSuccess(result.user), 1000);
        } else {
            this.showMessage(messageEl, result.message, 'error');
        }
    }

    /**
     * Maneja el login como invitado
     */
    handleGuestLogin(container) {
        const result = this.authService.loginAsGuest();
        if (result.success) {
            const messageEl = container.querySelector('#formMessage');
            this.showMessage(messageEl, result.message, 'success');
            setTimeout(() => this.loginSuccess(result.user), 800);
        }
    }

    /**
     * Alterna entre modo login y registro
     */
    toggleMode(container) {
        this.mode = this.mode === 'login' ? 'register' : 'login';
        this.updateFormUI(container);
    }

    /**
     * Cambia de pestaña
     */
    switchMode(container, mode) {
        this.mode = mode;
        this.updateFormUI(container);

        const tabs = container.querySelectorAll('.login-tab');
        tabs.forEach(tab => tab.classList.remove('login-tab--active'));
        container.querySelector(`[data-mode="${mode}"]`).classList.add('login-tab--active');
    }

    /**
     * Actualiza la interfaz del formulario
     */
    updateFormUI(container) {
        const submitBtn = container.querySelector('.login-btn');
        const toggleLink = container.querySelector('#toggleMode');
        const subtitle = container.querySelector('.login-subtitle');

        if (this.mode === 'login') {
            submitBtn.textContent = 'Iniciar Sesión';
            toggleLink.textContent = '¿No tienes cuenta? Regístrate';
            subtitle.textContent = 'Bienvenido de vuelta';
        } else {
            submitBtn.textContent = 'Crear Cuenta';
            toggleLink.textContent = '¿Ya tienes cuenta? Inicia sesión';
            subtitle.textContent = 'Únete a la batalla';
        }

        container.querySelector('#formMessage').textContent = '';
    }

    /**
     * Muestra mensajes en la interfaz
     */
    showMessage(element, message, type) {
        element.textContent = message;
        element.className = `form-message form-message--${type}`;

        if (type === 'error') {
            setTimeout(() => {
                element.textContent = '';
            }, 4000);
        }
    }

    /**
     * Callback cuando el login es exitoso
     */
    loginSuccess(user) {
        console.log('✅ Usuario autenticado:', user.username);
        
        const loginScreen = document.querySelector('#loginScreen');
        if (loginScreen) {
            loginScreen.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                loginScreen.remove();
                if (this.onLoginSuccess) {
                    this.onLoginSuccess(user);
                }
            }, 300);
        }
    }

    /**
     * Obtiene el usuario autenticado
     */
    getCurrentUser() {
        return this.authService.getCurrentUser();
    }

    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated() {
        return this.authService.isAuthenticated();
    }
}
