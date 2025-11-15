import { GameController } from './controllers/GameController.js';
import { UIManager } from './views/UIManager.js';
import { LoginScreen } from './views/LoginScreen.js';
import { MenuController } from './controllers/MenuController.js';
import { MenuView } from './views/MenuView.js';
import { GameModeView } from './views/GameModeView.js';
import { ProgressionService } from './services/ProgressionService.js';

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
        this.progressionService = null;
    }

    initialize() {
        try {
            console.log('🚢 Inicializando Batalla Naval...');

            // Mostrar pantalla de login
            this.showLoginScreen();

        } catch (error) {
            console.error('❌ Error al inicializar el juego:', error);
            this.showErrorScreen(error);
        }
    }

    showLoginScreen() {
        console.log('📝 Mostrando pantalla de login...');
        
        this.loginScreen = new LoginScreen();
        this.loginScreen.onLoginSuccess = (user) => this.onLoginSuccess(user);

        const loginElement = this.loginScreen.render();
        document.body.insertBefore(loginElement, document.body.firstChild);
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
            // Crear controlador del menú
            this.menuController = new MenuController();

            // Crear vista del menú
            this.menuView = new MenuView(this.menuController);
            const menuElement = this.menuView.render(this.currentUser);

            // Agregar menú al DOM
            document.body.appendChild(menuElement);

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
            // Remover menú
            const menuScreen = document.getElementById('menuScreen');
            if (menuScreen) {
                menuScreen.remove();
            }

            // Crear vista de selección de modo
            this.gameModeView = new GameModeView(this.menuController);
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
     * @param {Object} data - Datos con el modo seleccionado (ai o local)
     */
    onGameModeSelected(data) {
        console.log(`🎮 Modo seleccionado: ${data.mode === 'ai' ? 'Contra la Máquina' : 'Contra un Amigo'}`);
        
        this.gameMode = data.mode;
        this.startGame();
    }

    /**
     * Vuelve al menú desde la pantalla de selección de modo
     */
    backToMenuFromGameMode() {
        console.log('🔙 Volviendo al menú desde selección de modo...');
        
        // Remover pantalla de selección de modo
        const gameModeScreen = document.getElementById('gameModeScreen');
        if (gameModeScreen) {
            gameModeScreen.remove();
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

            // Si ya existía una UI anterior, destruirla para evitar listeners duplicados
            if (this.uiManager && typeof this.uiManager.destroy === 'function') {
                this.uiManager.destroy();
                this.uiManager = null;
            }

            // Crear controlador del juego con el modo seleccionado
            this.gameController = new GameController(this.progressionService);
            this.gameController.gameMode = this.gameMode; // Pasar modo de juego
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
            this.uiManager = new UIManager(this.gameController, this.currentUser);
            console.log('✅ UIManager creado');

            console.log('✅ Juego inicializado correctamente');
            console.log(`📊 Modo de juego: ${this.gameMode === 'ai' ? '🤖 Contra la Máquina' : '👥 Contra un Amigo'}`);

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
        // TODO: Implementar pantalla de configuración para RF02
        alert('Configuración - Próximamente disponible');
        this.menuController.backToMenu();
    }

    /**
     * Muestra la pantalla de ayuda
     */
    showHelp() {
        console.log('❓ Mostrando ayuda...');
        // TODO: Implementar pantalla de ayuda para RF02
        alert('Ayuda - Próximamente disponible');
        this.menuController.backToMenu();
    }

    /**
     * Cierra sesión del usuario
     */
    logout() {
        console.log('👋 Cerrando sesión...');
        
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