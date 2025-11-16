/**
 * MenuView - Vista del Menú Principal
 * Renderiza el menú principal con 3 botones: Juego, Configuración, Ayuda
 * Muestra el usuario actual o "Modo Invitado"
 */

export class MenuView {
    constructor(menuController, audioService = null) {
        this.menuController = menuController;
        this.audioService = audioService;
        this.container = null;
    }

    /**
     * Renderiza la vista del menú principal
     * @param {Object} user - Objeto del usuario autenticado
     * @returns {HTMLElement} - Elemento del menú
     */
    render(user) {
        this.container = document.createElement('div');
        this.container.className = 'menu-screen';
        this.container.id = 'menuScreen';

        // Determinar nombre de usuario
        const username = user?.username || 'Invitado';
        // Detectar correctamente modo invitado usando la bandera isGuest
        const isGuest = user?.isGuest === true;

        // Generar HTML de progresión solo para usuarios registrados
        let progressionHTML = '';
        if (!isGuest && user) {
            const level = user.level || 1;
            const points = user.points || 0;
            const victories = user.totalVictories || 0;
            const streak = user.winStreak || 0;
            
            // Calcular progreso del nivel actual
            const getPointsForLevel = (lvl) => Math.floor(10 * lvl * Math.pow(1.5, lvl - 1));
            let pointsUsed = 0;
            for (let i = 1; i < level; i++) {
                pointsUsed += getPointsForLevel(i);
            }
            const currentLevelPoints = points - pointsUsed;
            const pointsForNextLevel = getPointsForLevel(level);
            const progressPercentage = Math.floor((currentLevelPoints / pointsForNextLevel) * 100);

            progressionHTML = `
                <div class="user-progression">
                    <div class="progression-item">
                        <span class="progression-label">⭐ Nivel ${level}</span>
                    </div>
                    <div class="progression-bar-container">
                        <div class="progression-bar">
                            <div class="progression-bar-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                        <span class="progression-points">${currentLevelPoints}/${pointsForNextLevel} pts</span>
                    </div>
                    <div class="progression-stats">
                        <span class="progression-stat">🏆 ${victories}</span>
                        <span class="progression-stat">🔥 ${streak}</span>
                    </div>
                </div>
            `;
        }

        this.container.innerHTML = `
            <div class="menu-container">
                <!-- Header con usuario -->
                <div class="menu-header">
                    <h1 class="menu-title">⚓ Batalla Naval</h1>
                    <div class="menu-user">
                        <span class="user-badge ${isGuest ? 'user-badge--guest' : 'user-badge--logged'}">
                            ${isGuest ? '👤 Modo Invitado' : `👤 ${username}`}
                        </span>
                        ${progressionHTML}
                    </div>
                </div>

                <!-- Menú Principal -->
                <div class="menu-content">
                    <div class="menu-buttons">
                        <!-- Botón Juego -->
                        <button class="menu-button menu-button--game" id="btnGame">
                            <span class="menu-button-icon">🎮</span>
                            <span class="menu-button-text">
                                <span class="menu-button-title">Juego</span>
                                <span class="menu-button-desc">Comienza una nueva partida</span>
                            </span>
                        </button>

                        <!-- Botón Configuración -->
                        <button class="menu-button menu-button--settings" id="btnSettings">
                            <span class="menu-button-icon">⚙️</span>
                            <span class="menu-button-text">
                                <span class="menu-button-title">Configuración</span>
                                <span class="menu-button-desc">Ajusta las opciones del juego</span>
                            </span>
                        </button>

                        <!-- Botón Ayuda -->
                        <button class="menu-button menu-button--help" id="btnHelp">
                            <span class="menu-button-icon">❓</span>
                            <span class="menu-button-text">
                                <span class="menu-button-title">Ayuda</span>
                                <span class="menu-button-desc">Aprende a jugar</span>
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Footer -->
                <div class="menu-footer">
                    <button class="btn-logout" id="btnLogout">
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </div>
        `;

        // Agregar event listeners
        this.attachEventListeners();

        return this.container;
    }

    /**
     * Conecta los event listeners de los botones
     */
    attachEventListeners() {
        const btnGame = this.container.querySelector('#btnGame');
        const btnSettings = this.container.querySelector('#btnSettings');
        const btnHelp = this.container.querySelector('#btnHelp');
        const btnLogout = this.container.querySelector('#btnLogout');

        // Click en botón Juego
        if (btnGame) {
            btnGame.addEventListener('click', () => {
                this.audioService?.playSFX('click');
                console.log('🎮 Click en Juego');
                this.menuController.startGame();
            });
        }

        // Click en botón Configuración
        if (btnSettings) {
            btnSettings.addEventListener('click', () => {
                this.audioService?.playSFX('click');
                console.log('⚙️ Click en Configuración');
                this.menuController.navigateTo('settings');
            });
        }

        // Click en botón Ayuda
        if (btnHelp) {
            btnHelp.addEventListener('click', () => {
                this.audioService?.playSFX('click');
                console.log('❓ Click en Ayuda');
                this.menuController.navigateTo('help');
            });
        }

        // Click en botón Cerrar Sesión
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                this.audioService?.playSFX('cancel');
                console.log('👋 Click en Cerrar Sesión');
                this.menuController.logout();
            });
        }
    }

    /**
     * Muestra un mensaje de notificación
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación ('info', 'success', 'error')
     */
    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}
