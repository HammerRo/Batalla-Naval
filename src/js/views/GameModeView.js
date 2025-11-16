/**
 * GameModeView - Vista de Selección de Modo de Juego
 * Permite seleccionar entre "Contra la Máquina" o "Contra un Amigo"
 */

export class GameModeView {
    constructor(menuController, audioService = null) {
        this.menuController = menuController;
        this.audioService = audioService;
        this.container = null;
        this.selectedDifficulty = 'normal'; // Por defecto: normal
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

            <!-- Modal de Selección de Dificultad -->
            <div class="modal" id="difficultyModal" style="display: none;">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2>🎯 Selecciona la Dificultad</h2>
                    </div>
                    <div class="modal-body">
                        <div class="difficulty-options">
                            <button class="difficulty-btn difficulty-btn--easy" data-difficulty="easy">
                                <div class="difficulty-icon">😊</div>
                                <div class="difficulty-info">
                                    <h3>Fácil</h3>
                                    <p>La IA ataca aleatoriamente</p>
                                </div>
                            </button>
                            <button class="difficulty-btn difficulty-btn--normal difficulty-btn--selected" data-difficulty="normal">
                                <div class="difficulty-icon">😐</div>
                                <div class="difficulty-info">
                                    <h3>Normal</h3>
                                    <p>La IA ataca cerca de sus aciertos</p>
                                </div>
                            </button>
                            <button class="difficulty-btn difficulty-btn--hard" data-difficulty="hard">
                                <div class="difficulty-icon">😈</div>
                                <div class="difficulty-info">
                                    <h3>Difícil</h3>
                                    <p>La IA busca en línea para hundir barcos</p>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn--secondary" id="btnCancelDifficulty">Cancelar</button>
                        <button class="btn btn--primary" id="btnConfirmDifficulty">Comenzar</button>
                    </div>
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
        const difficultyModal = this.container.querySelector('#difficultyModal');
        const difficultyButtons = this.container.querySelectorAll('.difficulty-btn');
        const btnConfirmDifficulty = this.container.querySelector('#btnConfirmDifficulty');
        const btnCancelDifficulty = this.container.querySelector('#btnCancelDifficulty');

        // Guardar referencias a las funciones de los manejadores
        this._handleAIClick = () => {
            this.audioService?.playSFX('confirm');
            console.log('🤖 Mostrando selección de dificultad...');
            // Mostrar modal de dificultad
            difficultyModal.style.display = 'flex';
        };

        this._handleLocalClick = () => {
            this.audioService?.playSFX('confirm');
            console.log('👥 Seleccionado: Contra un Amigo');
            this.menuController.emit('game-mode-selected', { mode: 'local' });
        };

        this._handleBackClick = () => {
            this.audioService?.playSFX('confirm');
            console.log('🔙 Volviendo al menú...');
            this.menuController.emit('back-to-menu');
        };

        // Manejadores de selección de dificultad
        difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.audioService?.playSFX('click');
                // Remover selección anterior
                difficultyButtons.forEach(b => b.classList.remove('difficulty-btn--selected'));
                // Marcar como seleccionado
                btn.classList.add('difficulty-btn--selected');
                this.selectedDifficulty = btn.dataset.difficulty;
            });
        });

        // Confirmar dificultad y empezar juego
        this._handleConfirmDifficulty = () => {
            this.audioService?.playSFX('confirm');
            console.log(`🤖 Seleccionado: Contra la Máquina - Dificultad: ${this.selectedDifficulty}`);
            difficultyModal.style.display = 'none';
            this.menuController.emit('game-mode-selected', { 
                mode: 'ai', 
                difficulty: this.selectedDifficulty 
            });
        };

        // Cancelar selección de dificultad
        this._handleCancelDifficulty = () => {
            this.audioService?.playSFX('cancel');
            difficultyModal.style.display = 'none';
        };

        // Asignar los manejadores
        if (btnAI) btnAI.addEventListener('click', this._handleAIClick);
        if (btnLocal) btnLocal.addEventListener('click', this._handleLocalClick);
        if (btnBack) btnBack.addEventListener('click', this._handleBackClick);
        if (btnConfirmDifficulty) btnConfirmDifficulty.addEventListener('click', this._handleConfirmDifficulty);
        if (btnCancelDifficulty) btnCancelDifficulty.addEventListener('click', this._handleCancelDifficulty);

        // Cerrar modal al hacer click fuera
        difficultyModal?.addEventListener('click', (e) => {
            if (e.target === difficultyModal) {
                this.audioService?.playSFX('cancel');
                difficultyModal.style.display = 'none';
            }
        });
    }

    /**
     * Limpia los event listeners
     */
    cleanup() {
        const btnAI = this.container?.querySelector('#btnGameAI');
        const btnLocal = this.container?.querySelector('#btnGameLocal');
        const btnBack = this.container?.querySelector('#btnBackToMenu');
        const btnConfirmDifficulty = this.container?.querySelector('#btnConfirmDifficulty');
        const btnCancelDifficulty = this.container?.querySelector('#btnCancelDifficulty');

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
        if (btnConfirmDifficulty && this._handleConfirmDifficulty) {
            btnConfirmDifficulty.removeEventListener('click', this._handleConfirmDifficulty);
        }
        if (btnCancelDifficulty && this._handleCancelDifficulty) {
            btnCancelDifficulty.removeEventListener('click', this._handleCancelDifficulty);
        }
    }
}
