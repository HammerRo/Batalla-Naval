import { GameController } from './controllers/GameController.js';
import { UIManager } from './views/UIManager.js';
import { LoginScreen } from './views/LoginScreen.js';
import { MenuController } from './controllers/MenuController.js';
import { MenuView } from './views/MenuView.js';
import { GameModeView } from './views/GameModeView.js';
import { ProgressionService } from './services/ProgressionService.js';
import { SettingsService } from './services/SettingsService.js';
import { AudioService } from './services/AudioService.js';

class BattleshipApp {
    constructor() {
        this.gameController = null;
        this.uiManager = null;
        this.loginScreen = null;
        this.menuController = null;
        this.menuView = null;
        this.gameModeView = null;
        this.currentUser = null;
        this.gameMode = null; // 'ai' o 'local'
        this.aiDifficulty = 'normal'; // 'easy', 'normal', 'hard'
        this.progressionService = null;
        this.settingsService = null;
        this.audioService = null;
    }

    initialize() {
        try {
            console.log('🚢 Inicializando Batalla Naval...');

            // Mostrar pantalla de login
            this.settingsService = new SettingsService();
            this.audioService = new AudioService(this.settingsService);
            this.audioService.init();
            this.showLoginScreen();

        } catch (error) {
            console.error('❌ Error al inicializar el juego:', error);
            this.showErrorScreen(error);
        }
    }

    showLoginScreen() {
        console.log('📝 Mostrando pantalla de login...');
        
        this.loginScreen = new LoginScreen(this.audioService);
        this.loginScreen.onLoginSuccess = (user) => this.onLoginSuccess(user);

        const loginElement = this.loginScreen.render();
        document.body.insertBefore(loginElement, document.body.firstChild);

        // Iniciar música de menú también en la pantalla de login
        this.audioService?.playBGM('menu');

        // Renderizar control global de audio
        this.renderAudioToggle();
    }

    onLoginSuccess(user) {
        console.log('✅ Usuario autenticado:', user.username || 'Invitado');
        this.currentUser = user;

        // Inicializar servicio de progresión SOLO para usuarios registrados
        if (!user.isGuest && this.loginScreen && this.loginScreen.authService) {
            this.progressionService = new ProgressionService(this.loginScreen.authService);
            console.log('📊 Servicio de progresión inicializado');
        } else {
            // Asegurar que no hay servicio de progresión para invitados
            this.progressionService = null;
            console.log('👤 Modo invitado - Sin sistema de progresión');
        }

        // Remover pantalla de login
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.remove();
        }

        // Mostrar menú principal
        this.showMainMenu();
    }

    showMainMenu() {
        console.log('📋 Mostrando menú principal...');
        
        try {
            // Ocultar contenedor del juego
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.style.display = 'none';
            }

            // Refrescar datos del usuario desde AuthService para reflejar
            // inmediatamente la progresión actualizada después de una partida
            const auth = this.loginScreen?.authService;
            if (auth && typeof auth.getCurrentUser === 'function') {
                const refreshed = auth.getCurrentUser();
                if (refreshed) {
                    this.currentUser = refreshed;
                }
            }

            // Crear controlador del menú
            this.menuController = new MenuController();

            // Crear vista del menú
            this.menuView = new MenuView(this.menuController, this.audioService);
            const menuElement = this.menuView.render(this.currentUser);

            // Agregar menú al DOM
            document.body.appendChild(menuElement);

            // Música de menú
            this.audioService?.playBGM('menu');

            // Asegurar que el botón de audio esté presente/actualizado
            this.renderAudioToggle();

            // Conectar eventos del menú
            this.menuController.on('start-game', () => this.showGameModeSelection());
            this.menuController.on('navigate', (section) => this.navigateMenu(section));
            this.menuController.on('logout', () => this.logout());

            console.log('✅ Menú principal mostrado');

            // Exponer para debugging
            window.game = {
                menu: this.menuController,
                user: this.currentUser
            };

        } catch (error) {
            console.error('❌ Error al mostrar menú:', error);
            this.showErrorScreen(error);
        }
    }

    /**
     * Muestra la pantalla de selección de modo de juego
     */
    showGameModeSelection() {
        console.log('🎮 Mostrando selección de modo de juego...');
        
        try {
            // Ocultar contenedor del juego
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.style.display = 'none';
            }

            // Remover menú
            const menuScreen = document.getElementById('menuScreen');
            if (menuScreen) {
                menuScreen.remove();
            }

            // Crear vista de selección de modo
            this.gameModeView = new GameModeView(this.menuController, this.audioService);
            const gameModeElement = this.gameModeView.render();

            // Agregar a DOM
            document.body.appendChild(gameModeElement);

            // Conectar evento de selección de modo
            this.menuController.on('game-mode-selected', (data) => this.onGameModeSelected(data));
            this.menuController.on('back-to-menu', () => this.backToMenuFromGameMode());

            console.log('✅ Pantalla de selección de modo mostrada');

        } catch (error) {
            console.error('❌ Error al mostrar selección de modo:', error);
            this.showErrorScreen(error);
        }
    }

    /**
     * Maneja la selección del modo de juego
     * @param {Object} data - Datos con el modo seleccionado (ai o local) y dificultad
     */
    onGameModeSelected(data) {
        const modeText = data.mode === 'ai' ? 'Contra la Máquina' : 'Contra un Amigo';
        const difficultyText = data.difficulty ? ` (${data.difficulty})` : '';
        console.log(`🎮 Modo seleccionado: ${modeText}${difficultyText}`);
        
        this.gameMode = data.mode;
        this.aiDifficulty = data.difficulty || 'normal';
        this.startGame();
    }

    /**
     * Vuelve al menú desde la pantalla de selección de modo
     */
    backToMenuFromGameMode() {
        console.log('🔙 Volviendo al menú desde selección de modo...');
        
        // Limpiar referencias y listeners
        if (this.gameModeView) {
            // Si hay un método de limpieza en la vista, llamarlo
            if (typeof this.gameModeView.cleanup === 'function') {
                this.gameModeView.cleanup();
            }
            this.gameModeView = null;
        }
        
        // Remover pantalla de selección de modo
        const gameModeScreen = document.getElementById('gameModeScreen');
        if (gameModeScreen) {
            gameModeScreen.remove();
        }

        // Limpiar los controladores de eventos específicos del modo de juego
        if (this.menuController) {
            // Remover todos los listeners específicos del modo de juego
            this.menuController.callbacks['game-mode-selected'] = [];
            this.menuController.callbacks['back-to-menu'] = [];
        }

        // Mostrar menú nuevamente
        this.showMainMenu();
    }

    /**
     * Inicia un nuevo juego con el modo seleccionado
     */
    startGame() {
        console.log('🎮 Iniciando nuevo juego...');
        
        try {
            // Remover pantalla de selección de modo
            const gameModeScreen = document.getElementById('gameModeScreen');
            if (gameModeScreen) {
                gameModeScreen.remove();
            }

            // Mostrar contenedor del juego
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.style.display = 'block';
            }

            // Si ya existía una UI anterior, destruirla para evitar listeners duplicados
            if (this.uiManager && typeof this.uiManager.destroy === 'function') {
                this.uiManager.destroy();
                this.uiManager = null;
            }

            // Crear controlador del juego con el modo seleccionado
            this.gameController = new GameController(this.progressionService);
            this.gameController.gameMode = this.gameMode; // Pasar modo de juego
            
            // Si es modo AI, establecer la dificultad
            if (this.gameMode === 'ai' && this.aiDifficulty) {
                this.gameController.setAIDifficulty(this.aiDifficulty);
            }
            
            // Asegurar que la inicialización respete el modo desde el primer juego
            if (typeof this.gameController.initialize === 'function') {
                this.gameController.initialize();
            }
            
            console.log('✅ GameController creado');

            // Verificar métodos
            if (typeof this.gameController.getAvailableShips !== 'function') {
                throw new Error('GameController no tiene el método getAvailableShips');
            }

            // Crear gestor de UI con modo de juego
            this.uiManager = new UIManager(this.gameController, this.currentUser, this.audioService);
            console.log('✅ UIManager creado');
            // Música de juego
            this.audioService?.playBGM('game');

            // Mantener el botón de audio durante la partida
            this.renderAudioToggle();

            console.log('✅ Juego inicializado correctamente');
            const modeText = this.gameMode === 'ai' ? '🤖 Contra la Máquina' : '👥 Contra un Amigo';
            const difficultyEmoji = {
                'easy': '😊',
                'normal': '😐',
                'hard': '😈'
            };
            const difficultyText = this.gameMode === 'ai' ? ` - Dificultad: ${difficultyEmoji[this.aiDifficulty] || ''} ${this.aiDifficulty}` : '';
            console.log(`📊 Modo de juego: ${modeText}${difficultyText}`);

            // Exponer para debugging
            window.game = {
                controller: this.gameController,
                ui: this.uiManager,
                user: this.currentUser,
                mode: this.gameMode
            };

        } catch (error) {
            console.error('❌ Error al iniciar juego:', error);
            this.showErrorScreen(error);
        }
    }

    /**
     * Crea o actualiza el botón flotante de Mute/Unmute global
     */
    renderAudioToggle() {
        try {
            let btn = document.getElementById('audio-toggle');
            if (!btn) {
                btn = document.createElement('button');
                btn.id = 'audio-toggle';
                btn.className = 'audio-toggle';
                btn.type = 'button';
                btn.title = 'Mute/Unmute';
                btn.addEventListener('click', () => {
                    const muted = this.audioService?.toggleMute();
                    this.settingsService?.setMuted(!!muted);
                    this.updateAudioToggle(btn, !!muted);
                });
                document.body.appendChild(btn);
            }
            const muted = this.audioService?.isMuted?.() || false;
            this.updateAudioToggle(btn, muted);
        } catch (e) {
            console.warn('No se pudo renderizar el botón de audio:', e);
        }
    }

    /**
     * Actualiza apariencia/ícono del botón de audio
     * @param {HTMLButtonElement} btn 
     * @param {boolean} muted 
     */
    updateAudioToggle(btn, muted) {
        if (!btn) return;
        btn.classList.toggle('audio-toggle--muted', !!muted);
        btn.textContent = muted ? '🔇' : '🔊';
    }

    /**
     * Navega dentro del menú
     * @param {string} section - Sección a navegar
     */
    navigateMenu(section) {
        console.log(`📍 Navegando a sección: ${section}`);
        
        switch (section) {
            case 'settings':
                this.showSettings();
                break;
            case 'help':
                this.showHelp();
                break;
            default:
                this.showMainMenu();
        }
    }

    /**
     * Muestra la pantalla de configuración
     */
    showSettings() {
        console.log('⚙️ Mostrando configuración...');
        const s = this.settingsService?.getSettings() || { language: 'es', bgmVolume: 0.6, sfxVolume: 0.8 };
        const modal = document.createElement('div');
        modal.className = 'modal modal--active';
        modal.id = 'settingsModal';

        const percent = (v) => Math.round((v ?? 0) * 100);

        modal.innerHTML = `
            <div class="modal-content help-modal" style="max-width:520px;">
                <div class="help-hero">
                    <h2 class="help-hero__title">⚙️ Configuración</h2>
                    <p class="help-hero__subtitle">Ajustes de sonido</p>
                </div>
                <div class="help-body">
                    <div class="help-grid" style="margin-bottom:12px;">
                        <section class="help-card help-card--accent">
                            <h3 class="help-card__title">🔊 Volumen</h3>
                            <div style="display:grid; gap:10px;">
                                <div>
                                    <label style="font-weight:600;">Música de fondo</label>
                                    <input type="range" id="rngBgm" min="0" max="100" value="${percent(s.bgmVolume)}"/>
                                    <span id="lblBgm">${percent(s.bgmVolume)}%</span>
                                </div>
                                <div>
                                    <label style="font-weight:600;">Efectos</label>
                                    <input type="range" id="rngSfx" min="0" max="100" value="${percent(s.sfxVolume)}"/>
                                    <span id="lblSfx">${percent(s.sfxVolume)}%</span>
                                    <button class="btn btn--secondary" id="btnTestSfx" style="margin-left:10px; padding:6px 12px;">Probar</button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
                <div class="help-footer">
                    <button class="btn btn--primary" id="btnSaveSettings">Listo</button>
                </div>
            </div>`;

        document.body.appendChild(modal);

        const close = () => modal.remove();
        const rngBgm = modal.querySelector('#rngBgm');
        const rngSfx = modal.querySelector('#rngSfx');
        const lblBgm = modal.querySelector('#lblBgm');
        const lblSfx = modal.querySelector('#lblSfx');

        // Handlers
        rngBgm.addEventListener('input', () => {
            const v = Number(rngBgm.value)/100;
            lblBgm.textContent = `${rngBgm.value}%`;
            this.settingsService?.setBGMVolume(v);
            this.audioService?.setBGMVolume(v);
        });
        
        rngSfx.addEventListener('input', () => {
            const v = Number(rngSfx.value)/100;
            lblSfx.textContent = `${rngSfx.value}%`;
            this.settingsService?.setSFXVolume(v);
            this.audioService?.setSFXVolume(v);
        });
        
        // Test SFX button
        modal.querySelector('#btnTestSfx').addEventListener('click', () => this.audioService?.playSFX('confirm'));
        
        // Accept button (previously Save)
        modal.querySelector('#btnSaveSettings').addEventListener('click', () => {
            this.audioService?.playSFX('confirm');
            close();
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => { 
            if (e.target === modal) {
                this.audioService?.playSFX('confirm');
                close();
            }
        });
    }

    /**
     * Actualiza los textos de la interfaz según el idioma seleccionado
     * @param {string} lang - Código de idioma ('es' o 'en')
     */
    updateUILanguage(lang) {
        const translations = {
            es: {
                settings: {
                    title: '⚙️ Configuración',
                    subtitle: 'Idioma y sonido',
                    language: '🌐 Idioma',
                    selectLanguage: 'Selecciona idioma',
                    someTextsMayUpdate: 'Algunos textos pueden actualizarse al volver al menú.',
                    volume: '🔊 Volumen',
                    bgmVolume: 'Música de fondo',
                    sfxVolume: 'Efectos',
                    testSfx: 'Probar',
                    cancel: 'Cancelar',
                    save: 'Guardar',
                    saved: '¡Configuración guardada!'
                },
                // Add more translations as needed
            },
            en: {
                settings: {
                    title: '⚙️ Settings',
                    subtitle: 'Language and Sound',
                    language: '🌐 Language',
                    selectLanguage: 'Select language',
                    someTextsMayUpdate: 'Some texts may update when returning to the menu.',
                    volume: '🔊 Volume',
                    bgmVolume: 'Background Music',
                    sfxVolume: 'Sound Effects',
                    testSfx: 'Test',
                    cancel: 'Cancel',
                    save: 'Save',
                    saved: 'Settings saved!'
                },
                // Add more translations as needed
            }
        };

        // Get translations for the selected language, fallback to Spanish if not found
        const t = translations[lang] || translations['es'];

        // Update settings modal if it's open
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            const elements = {
                '.help-hero__title': t.settings.title,
                '.help-hero__subtitle': t.settings.subtitle,
                '.help-card__title': t.settings.language,
                '#lblLanguage': t.settings.selectLanguage,
                '.help-card:nth-child(2) .help-card__title': t.settings.volume,
                '#lblBgmText': t.settings.bgmVolume,
                '#lblSfxText': t.settings.sfxVolume,
                '#btnTestSfx': t.settings.testSfx,
                '#btnCancelSettings': t.settings.cancel,
                '#btnSaveSettings': t.settings.save
            };

            Object.entries(elements).forEach(([selector, text]) => {
                const element = settingsModal.querySelector(selector);
                if (element) {
                    element.textContent = text;
                }
            });
        }
    }

    /**
     * Muestra la pantalla de ayuda
     */
    showHelp() {
        console.log('❓ Mostrando ayuda...');
        // Crear modal reutilizando estilos generales de .modal
        const helpModal = document.createElement('div');
        helpModal.className = 'modal modal--active';
        helpModal.id = 'helpModal';

        helpModal.innerHTML = `
            <div class="modal-content help-modal">
                <div class="help-hero">
                    <h2 class="help-hero__title">⚓ Guía Rápida</h2>
                    <p class="help-hero__subtitle">Todo lo básico para disfrutar Batalla Naval</p>
                </div>
                <div class="help-body">
                    <div class="help-grid" style="margin-bottom:12px;">
                        <section class="help-card help-card--accent">
                            <h3 class="help-card__title">🎯 Objetivo</h3>
                            <p style="margin:0">Hundir todos los barcos del rival antes de que hundan los tuyos.</p>
                        </section>
                        <section class="help-card">
                            <h3 class="help-card__title">🧭 Colocación de barcos</h3>
                            <ul class="help-list">
                                <li>Haz clic sobre un barco ya colocado para <strong>rotarlo</strong>.</li>
                                <li>También puedes <strong>arrastrarlo</strong> a otra posición válida.</li>
                                <li>Botón "Colocación Aleatoria" para distribuirlos automáticamente.</li>
                            </ul>
                            <div class="help-badges" style="margin-top:6px;">
                                <span class="kbd">H</span>
                                <span>Horizontal</span>
                                <span class="kbd">V</span>
                                <span>Vertical</span>
                            </div>
                        </section>
                    </div>

                    <section class="help-card" style="margin-bottom:12px;">
                        <h3 class="help-card__title">🎯 Turnos y disparos</h3>
                        <ul class="help-list">
                            <li>Durante tu turno, haz clic en el tablero rival para disparar.</li>
                            <li>Un <strong>acierto</strong> marca la celda; sigue buscando ese barco.</li>
                            <li>Un <strong>fallo</strong> pasa el turno al oponente.</li>
                            <li>En modo local, ambos jugadores se alternan en el mismo dispositivo.</li>
                        </ul>
                    </section>

                    <section class="help-modes" style="margin-bottom:12px;">
                        <div class="help-mode help-mode--ai">
                            <div class="help-mode__title">🤖 Contra la Máquina</div>
                            <div>Ideal para practicar. Si iniciaste sesión, ganas <strong>puntos</strong>, <strong>nivel</strong> y <strong>racha</strong> al terminar cada partida.</div>
                        </div>
                        <div class="help-mode help-mode--local">
                            <div class="help-mode__title">👥 Contra un Amigo</div>
                            <div>Dos jugadores en el mismo dispositivo. Al finalizar se muestran <strong>ambos tableros</strong>. No afecta tu progreso.</div>
                        </div>
                    </section>

                    <section class="help-card">
                        <h3 class="help-card__title">💡 Consejos</h3>
                        <ul class="help-list">
                            <li>Si al rotar un barco no cabe, el juego intenta <strong>recolocarlo cerca</strong> automáticamente.</li>
                            <li>Puedes <strong>rendirte</strong> durante la partida con el botón "Rendirse".</li>
                        </ul>
                    </section>
                </div>
                <div class="help-footer">
                    <button class="btn btn--primary" id="btnCloseHelp">Entendido</button>
                </div>
            </div>
        `;

        document.body.appendChild(helpModal);

        // Cerrar con botón o clic fuera
        const close = () => {
            this.audioService?.playSFX('confirm');
            helpModal.remove();
        };
        helpModal.querySelector('#btnCloseHelp').addEventListener('click', close);
        helpModal.addEventListener('click', (e) => { if (e.target === helpModal) close(); });
    }

    /**
     * Cierra sesión del usuario
     */
    logout() {
        console.log('👋 Cerrando sesión...');
        
        // Ocultar contenedor del juego
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }

        // Remover menú
        const menuScreen = document.getElementById('menuScreen');
        if (menuScreen) {
            menuScreen.remove();
        }

        // Remover datos del usuario
        this.currentUser = null;
        this.menuController = null;
        this.menuView = null;

        // Volver a mostrar pantalla de login
        this.showLoginScreen();
    }

    showErrorScreen(error) {
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            ">
                <h1 style="font-size: 48px; margin-bottom: 20px;">⚠️</h1>
                <h2 style="margin-bottom: 10px;">Error al cargar el juego</h2>
                <p style="max-width: 500px; margin-bottom: 20px;">
                    Necesitas un servidor local para ejecutar este juego.
                </p>
                <div style="
                    background: rgba(255,255,255,0.1);
                    padding: 20px;
                    border-radius: 10px;
                    max-width: 600px;
                    text-align: left;
                ">
                    <h3 style="margin-bottom: 10px;">Soluciones:</h3>
                    <ol style="margin-left: 20px;">
                        <li style="margin-bottom: 8px;">
                            <strong>Visual Studio Code:</strong> Instala la extensión "Live Server" y haz clic derecho en index.html → "Open with Live Server"
                        </li>
                        <li style="margin-bottom: 8px;">
                            <strong>Python:</strong> Ejecuta <code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px;">python -m http.server 8000</code> en la terminal
                        </li>
                        <li>
                            <strong>Node.js:</strong> Ejecuta <code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 3px;">npx http-server</code>
                        </li>
                    </ol>
                </div>
                <pre style="
                    background: rgba(0,0,0,0.3);
                    padding: 15px;
                    border-radius: 5px;
                    max-width: 600px;
                    overflow: auto;
                    margin-top: 20px;
                    text-align: left;
                ">${error.message}</pre>
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new BattleshipApp();
    app.initialize();
    // Exponer instancia para permitir acciones globales (ej. volver al menú desde UI)
    window.__battleshipApp = app;
});

// Manejo de errores no capturados
window.addEventListener('error', (event) => {
    console.error('Error no capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rechazada:', event.reason);
});