import { GameController } from './controllers/GameController.js';
import { UIManager } from './views/UIManager.js';

class BattleshipApp {
    constructor() {
        this.gameController = null;
        this.uiManager = null;
    }

    initialize() {
        try {
            console.log('🚢 Inicializando Batalla Naval...');

            // Crear controlador del juego
            this.gameController = new GameController();
            console.log('✅ GameController creado');

            // Verificar métodos
            if (typeof this.gameController.getAvailableShips !== 'function') {
                throw new Error('GameController no tiene el método getAvailableShips');
            }

            // Crear gestor de UI
            this.uiManager = new UIManager(this.gameController);
            console.log('✅ UIManager creado');

            console.log('✅ Juego inicializado correctamente');

            // Exponer para debugging
            window.game = {
                controller: this.gameController,
                ui: this.uiManager
            };

        } catch (error) {
            console.error('❌ Error al inicializar el juego:', error);
            this.showErrorScreen(error);
        }
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
});

// Manejo de errores no capturados
window.addEventListener('error', (event) => {
    console.error('Error no capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rechazada:', event.reason);
});