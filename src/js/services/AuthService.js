/**
 * AuthService - Servicio de autenticación
 * Gestiona el login de usuarios y modo invitado
 */

export class AuthService {
    constructor() {
        this.currentUser = this.loadUserFromStorage();
        this.users = this.loadUsersFromStorage();
    }

    /**
     * Registra un nuevo usuario
     * @param {string} username - Nombre de usuario
     * @param {string} password - Contraseña (será hasheada básicamente)
     * @returns {Object} - Resultado del registro
     */
    register(username, password) {
        if (!username || !password) {
            return {
                success: false,
                message: 'El usuario y contraseña son requeridos'
            };
        }

        if (username.length < 3) {
            return {
                success: false,
                message: 'El usuario debe tener al menos 3 caracteres'
            };
        }

        if (password.length < 4) {
            return {
                success: false,
                message: 'La contraseña debe tener al menos 4 caracteres'
            };
        }

        if (this.users.find(u => u.username === username)) {
            return {
                success: false,
                message: 'El usuario ya existe'
            };
        }

        const newUser = {
            id: Date.now().toString(),
            username: username,
            password: this.simpleHash(password),
            createdAt: new Date().toISOString(),
            gamesPlayed: 0,
            gamesWon: 0,
            averageShots: 0,
            // Sistema de puntuación y niveles
            points: 0,
            level: 1,
            winStreak: 0,
            totalVictories: 0,
            totalDefeats: 0
        };

        this.users.push(newUser);
        this.saveUsersToStorage();

        return {
            success: true,
            message: 'Usuario registrado correctamente',
            user: this.sanitizeUser(newUser)
        };
    }

    /**
     * Inicia sesión con un usuario existente
     * @param {string} username - Nombre de usuario
     * @param {string} password - Contraseña
     * @returns {Object} - Resultado del login
     */
    login(username, password) {
        if (!username || !password) {
            return {
                success: false,
                message: 'El usuario y contraseña son requeridos'
            };
        }

        const user = this.users.find(u => u.username === username);

        if (!user || user.password !== this.simpleHash(password)) {
            return {
                success: false,
                message: 'Usuario o contraseña incorrectos'
            };
        }

        this.currentUser = user;
        this.saveCurrentUserToStorage();

        return {
            success: true,
            message: 'Sesión iniciada correctamente',
            user: this.sanitizeUser(user)
        };
    }

    /**
     * Inicia sesión como invitado
     * @returns {Object} - Usuario invitado
     */
    loginAsGuest() {
        const guestUser = {
            id: `guest_${Date.now()}`,
            username: `Invitado_${Math.floor(Math.random() * 10000)}`,
            isGuest: true,
            gamesPlayed: 0,
            gamesWon: 0,
            averageShots: 0
        };

        this.currentUser = guestUser;
        this.saveCurrentUserToStorage();

        return {
            success: true,
            message: 'Sesión de invitado iniciada',
            user: this.sanitizeUser(guestUser)
        };
    }

    /**
     * Cierra la sesión actual
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem('batalla-naval-user');
    }

    /**
     * Obtiene el usuario actual
     * @returns {Object|null} - Usuario actual o null
     */
    getCurrentUser() {
        return this.currentUser ? this.sanitizeUser(this.currentUser) : null;
    }

    /**
     * Verifica si hay un usuario en sesión
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.currentUser;
    }

    /**
     * Actualiza las estadísticas de un jugador
     * @param {number} shots - Número de disparos
     * @param {boolean} won - Si ganó la partida
     */
    updatePlayerStats(shots, won) {
        if (!this.currentUser) return;

        // Para usuarios invitados, no almacenar estadísticas
        if (this.currentUser.isGuest) return;

        const user = this.users.find(u => u.id === this.currentUser.id);
        if (user) {
            user.gamesPlayed += 1;
            if (won) {
                user.gamesWon += 1;
            }

            const totalShots = (user.gamesPlayed - 1) * (user.averageShots || 0) + shots;
            user.averageShots = totalShots / user.gamesPlayed;

            this.saveUsersToStorage();
            this.currentUser = user;
            this.saveCurrentUserToStorage();
        }
    }

    /**
     * Actualiza el usuario actual (para progresión)
     * @param {Object} userData - Datos actualizados del usuario
     */
    updateCurrentUser(userData) {
        if (!this.currentUser || this.currentUser.isGuest) return;

        const user = this.users.find(u => u.id === this.currentUser.id);
        if (user) {
            // Actualizar datos del usuario
            Object.assign(user, userData);
            
            this.saveUsersToStorage();
            this.currentUser = user;
            this.saveCurrentUserToStorage();
        }
    }

    /**
     * Obtiene las estadísticas del usuario actual
     * @returns {Object}
     */
    getStats() {
        if (!this.currentUser) return null;

        return {
            username: this.currentUser.username,
            gamesPlayed: this.currentUser.gamesPlayed || 0,
            gamesWon: this.currentUser.gamesWon || 0,
            winRate: this.currentUser.gamesPlayed 
                ? ((this.currentUser.gamesWon / this.currentUser.gamesPlayed) * 100).toFixed(2)
                : 0,
            averageShots: (this.currentUser.averageShots || 0).toFixed(2)
        };
    }

    /**
     * Obtiene el ranking de usuarios
     * @returns {Array} - Array de usuarios ordenados por victorias
     */
    getRanking() {
        return this.users
            .filter(u => u.gamesPlayed > 0)
            .sort((a, b) => {
                const winRateA = a.gamesWon / a.gamesPlayed;
                const winRateB = b.gamesWon / b.gamesPlayed;
                return winRateB - winRateA;
            })
            .slice(0, 10)
            .map((user, index) => ({
                rank: index + 1,
                username: user.username,
                gamesWon: user.gamesWon,
                gamesPlayed: user.gamesPlayed,
                winRate: ((user.gamesWon / user.gamesPlayed) * 100).toFixed(2)
            }));
    }

    // ==================== Private Methods ====================

    /**
     * Hash simple para contraseñas (solo para demostración)
     * En producción, usar bcrypt o similar en el servidor
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    /**
     * Sanitiza la información del usuario (elimina contraseña)
     */
    sanitizeUser(user) {
        const sanitized = { ...user };
        delete sanitized.password;
        return sanitized;
    }

    /**
     * Carga el usuario actual del localStorage
     */
    loadUserFromStorage() {
        try {
            const data = localStorage.getItem('batalla-naval-user');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al cargar usuario:', error);
            return null;
        }
    }

    /**
     * Guarda el usuario actual en localStorage
     */
    saveCurrentUserToStorage() {
        try {
            localStorage.setItem('batalla-naval-user', JSON.stringify(this.currentUser));
        } catch (error) {
            console.error('Error al guardar usuario:', error);
        }
    }

    /**
     * Carga los usuarios registrados del localStorage
     */
    loadUsersFromStorage() {
        try {
            const data = localStorage.getItem('batalla-naval-users');
            const users = data ? JSON.parse(data) : [];
            
            // Migrar usuarios existentes añadiendo campos de progresión si no los tienen
            return users.map(user => ({
                ...user,
                points: user.points ?? 0,
                level: user.level ?? 1,
                winStreak: user.winStreak ?? 0,
                totalVictories: user.totalVictories ?? 0,
                totalDefeats: user.totalDefeats ?? 0
            }));
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            return [];
        }
    }

    /**
     * Guarda los usuarios en localStorage
     */
    saveUsersToStorage() {
        try {
            localStorage.setItem('batalla-naval-users', JSON.stringify(this.users));
        } catch (error) {
            console.error('Error al guardar usuarios:', error);
        }
    }
}
