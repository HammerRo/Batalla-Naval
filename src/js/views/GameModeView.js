/**
 * GameModeView - Vista de Selección de Modo de Juego
 * Permite seleccionar entre "Contra la Máquina" o "Contra un Amigo"
 */

export class GameModeView {
    constructor(menuController, audioService = null) {
        this.menuController = menuController;
        this.audioService = audioService;
        this.container = null;
    }

    /**
     * Renderiza la vista de selección de modo
     * @returns {HTMLElement} - Elemento de selección de modo
     */
    render() {
        this.container = document.createElement('div');
        this.container.className = 'gamemode-screen';
        this.container.id = 'gameModeScreen';

        this.container.innerHTML = `
            <div class="gamemode-container">
                <!-- Header -->
                <div class="gamemode-header">
                    <h1 class="gamemode-title">🎮 Selecciona Modo de Juego</h1>
                    <p class="gamemode-subtitle">¿Cómo deseas jugar?</p>
                </div>

                <!-- Modos de Juego -->
                <div class="gamemode-content">
                    <div class="gamemode-options">
                        <!-- Modo: Contra la Máquina -->
                        <button class="gamemode-card gamemode-card--ai" id="btnGameAI">
                            <div class="gamemode-card-icon">🤖</div>
                            <div class="gamemode-card-content">
                                <h2 class="gamemode-card-title">Contra la Máquina</h2>
                                <p class="gamemode-card-desc">
                                    Juega contra la IA en diferentes niveles de dificultad
                                </p>
                                <ul class="gamemode-card-features">
                                    <li>✅ Fácil, Normal, Difícil</li>
                                    <li>✅ Juega a tu ritmo</li>
                                    <li>✅ Perfecto para practicar</li>
                                </ul>
                            </div>
                        </button>

                        <!-- Modo: Contra un Amigo -->
                        <button class="gamemode-card gamemode-card--local" id="btnGameLocal">
                            <div class="gamemode-card-icon">👥</div>
                            <div class="gamemode-card-content">
                                <h2 class="gamemode-card-title">Contra un Amigo</h2>
                                <p class="gamemode-card-desc">
                                    Juega con otro jugador en el mismo dispositivo
                                </p>
                                <ul class="gamemode-card-features">
                                    <li>✅ Dos jugadores locales</li>
                                    <li>✅ Turnos alternos</li>
                                    <li>✅ Modo multijugador</li>
                                </ul>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Footer -->
                <div class="gamemode-footer">
                    <button class="btn-back" id="btnBackToMenu">
                        🔙 Volver al Menú
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
        // Limpiar cualquier listener existente primero
        this.cleanup();
        
        const btnAI = this.container.querySelector('#btnGameAI');
        const btnLocal = this.container.querySelector('#btnGameLocal');
        const btnBack = this.container.querySelector('#btnBackToMenu');

        // Guardar referencias a las funciones de los manejadores
        this._handleAIClick = () => {
            this.audioService?.playSFX('confirm');
            console.log('🤖 Seleccionado: Contra la Máquina');
            this.menuController.emit('game-mode-selected', { mode: 'ai' });
        };

        this._handleLocalClick = () => {
            this.audioService?.playSFX('confirm');
            console.log('👥 Seleccionado: Contra un Amigo');
            this.menuController.emit('game-mode-selected', { mode: 'local' });
        };

        this._handleBackClick = () => {
            this.audioService?.playSFX('back');
            console.log('🔙 Volviendo al menú...');
            this.menuController.emit('back-to-menu');
        };

        // Asignar los manejadores
        if (btnAI) btnAI.addEventListener('click', this._handleAIClick);
        if (btnLocal) btnLocal.addEventListener('click', this._handleLocalClick);
        if (btnBack) btnBack.addEventListener('click', this._handleBackClick);
    }

    /**
     * Limpia los event listeners
     */
    cleanup() {
        const btnAI = this.container?.querySelector('#btnGameAI');
        const btnLocal = this.container?.querySelector('#btnGameLocal');
        const btnBack = this.container?.querySelector('#btnBackToMenu');

        // Remover listeners existentes si existen
        if (btnAI && this._handleAIClick) {
            btnAI.removeEventListener('click', this._handleAIClick);
        }
        if (btnLocal && this._handleLocalClick) {
            btnLocal.removeEventListener('click', this._handleLocalClick);
        }
        if (btnBack && this._handleBackClick) {
            btnBack.removeEventListener('click', this._handleBackClick);
        }
    }
}
