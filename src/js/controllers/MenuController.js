/**
 * MenuController - Controlador del Menú Principal
 * Gestiona la lógica y navegación del menú principal
 */

export class MenuController {
    constructor() {
        this.currentSection = 'menu'; // 'menu', 'game', 'settings', 'help'
        this.callbacks = {};
    }

    /**
     * Registra un callback para un evento
     * @param {string} event - Nombre del evento
     * @param {Function} callback - Función a ejecutar
     */
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }

    /**
     * Ejecuta los callbacks de un evento
     * @param {string} event - Nombre del evento
     * @param {*} data - Datos a pasar al callback
     */
    emit(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(data));
        }
    }

    /**
     * Navega a una sección del menú
     * @param {string} section - Sección a navegar ('game', 'settings', 'help')
     */
    navigateTo(section) {
        console.log(`📍 Navegando a: ${section}`);
        this.currentSection = section;
        this.emit('navigate', section);
    }

    /**
     * Inicia un nuevo juego
     */
    startGame() {
        console.log('🎮 Iniciando nuevo juego...');
        this.emit('start-game');
    }

    /**
     * Vuelve al menú principal
     */
    backToMenu() {
        console.log('🔙 Volviendo al menú principal...');
        this.currentSection = 'menu';
        this.emit('back-to-menu');
    }

    /**
     * Cierra sesión del usuario
     */
    logout() {
        console.log('👋 Cerrando sesión...');
        this.emit('logout');
    }
}
