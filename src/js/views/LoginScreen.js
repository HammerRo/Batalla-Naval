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

                <button class="btn btn--tertiary btn--large login-btn-ranking" id="btnRanking">
                    🏆 Ver Ranking
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
        const btnRanking = container.querySelector('#btnRanking');
        const toggleMode = container.querySelector('#toggleMode');
        const tabs = container.querySelectorAll('.login-tab');

        form.addEventListener('submit', (e) => this.handleFormSubmit(e, container));
        btnGuest.addEventListener('click', () => this.handleGuestLogin(container));
        btnRanking.addEventListener('click', () => this.showRanking(container));
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

    /**
     * Muestra el ranking de jugadores
     */
    showRanking(container) {
        // Crear modal de ranking
        const rankingModal = document.createElement('div');
        rankingModal.className = 'modal modal--active';
        rankingModal.id = 'rankingModal';

        // Obtener ranking ordenado por nivel, puntos, victorias y racha
        const users = this.authService.users
            .filter(u => u.gamesPlayed > 0)
            .sort((a, b) => {
                // 1. Ordenar por nivel primero
                if ((b.level || 1) !== (a.level || 1)) {
                    return (b.level || 1) - (a.level || 1);
                }
                // 2. Si tienen el mismo nivel, ordenar por puntos
                if ((b.points || 0) !== (a.points || 0)) {
                    return (b.points || 0) - (a.points || 0);
                }
                // 3. Si tienen los mismos puntos, ordenar por victorias
                if ((b.totalVictories || 0) !== (a.totalVictories || 0)) {
                    return (b.totalVictories || 0) - (a.totalVictories || 0);
                }
                // 4. Si tienen las mismas victorias, ordenar por racha
                return (b.winStreak || 0) - (a.winStreak || 0);
            })
            .slice(0, 10);

        let rankingHTML = '';
        users.forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            
            // Calcular progreso del nivel
            const level = user.level || 1;
            const points = user.points || 0;
            const getPointsForLevel = (lvl) => Math.floor(10 * lvl * Math.pow(1.5, lvl - 1));
            let pointsUsed = 0;
            for (let i = 1; i < level; i++) {
                pointsUsed += getPointsForLevel(i);
            }
            const currentLevelPoints = points - pointsUsed;
            const pointsForNextLevel = getPointsForLevel(level);
            const progressPercentage = Math.floor((currentLevelPoints / pointsForNextLevel) * 100);
            
            rankingHTML += `
                <div class="ranking-item ${index < 3 ? 'ranking-item--top' : ''}">
                    <div class="ranking-position">${medal}</div>
                    <div class="ranking-info">
                        <div class="ranking-name">${user.username}</div>
                        <div class="ranking-progress">
                            <div class="ranking-level">⭐ Nivel ${level}</div>
                            <div class="ranking-bar">
                                <div class="ranking-bar-fill" style="width: ${progressPercentage}%"></div>
                            </div>
                            <div class="ranking-bar-text">${currentLevelPoints}/${pointsForNextLevel} pts</div>
                        </div>
                        <div class="ranking-stats-row">
                            <span class="ranking-stat">🏆 ${user.totalVictories || 0}</span>
                            <span class="ranking-stat">🔥 ${user.winStreak || 0}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        if (users.length === 0) {
            rankingHTML = '<div class="ranking-empty">No hay jugadores registrados aún</div>';
        }

        rankingModal.innerHTML = `
            <div class="modal-content ranking-modal">
                <div class="ranking-header">
                    <h2 class="ranking-title">🏆 Ranking de Jugadores</h2>
                    <button class="ranking-close" id="closeRanking">✕</button>
                </div>
                <div class="ranking-list">
                    ${rankingHTML}
                </div>
                <div class="ranking-footer">
                    <p class="ranking-note">Top 10 jugadores ordenados por nivel y puntuación</p>
                </div>
            </div>
        `;

        document.body.appendChild(rankingModal);

        // Event listener para cerrar
        document.getElementById('closeRanking').addEventListener('click', () => {
            rankingModal.remove();
        });

        // Cerrar al hacer click fuera del modal
        rankingModal.addEventListener('click', (e) => {
            if (e.target === rankingModal) {
                rankingModal.remove();
            }
        });
    }
}
