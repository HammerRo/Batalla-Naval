/**
 * ProgressionService - Servicio de progresión del jugador
 * Gestiona puntos, niveles, rachas y estadísticas
 */

export class ProgressionService {
    constructor(authService) {
        this.authService = authService;
    }

    /**
     * Calcula los puntos necesarios para alcanzar un nivel
     * La fórmula aumenta progresivamente: nivel 1->2 = 10pts, 2->3 = 15pts, 3->4 = 21pts, etc.
     */
    getPointsForLevel(level) {
        // Fórmula: 10 * level * 1.5^(level-1) redondeado
        return Math.floor(10 * level * Math.pow(1.5, level - 1));
    }

    /**
     * Calcula el nivel actual basado en los puntos totales
     */
    calculateLevel(totalPoints) {
        let level = 1;
        let pointsUsed = 0;

        while (true) {
            const pointsForNextLevel = this.getPointsForLevel(level);
            if (pointsUsed + pointsForNextLevel > totalPoints) {
                break;
            }
            pointsUsed += pointsForNextLevel;
            level++;
        }

        return {
            level: level,
            currentLevelPoints: totalPoints - pointsUsed,
            pointsForNextLevel: this.getPointsForLevel(level)
        };
    }

    /**
     * Calcula los puntos ganados por victoria según la racha
     */
    calculateVictoryPoints(winStreak) {
        // Primera victoria: +2, segunda: +3, tercera: +4, etc.
        return 2 + winStreak;
    }

    /**
     * Procesa una victoria contra la IA
     */
    processVictory() {
        const user = this.authService.getCurrentUser();
        
        // Solo usuarios registrados ganan puntos
        if (!user || user.isGuest) {
            return null;
        }

        // Calcular puntos ganados según racha
        const pointsEarned = this.calculateVictoryPoints(user.winStreak || 0);
        
        // Actualizar estadísticas
        user.points = (user.points || 0) + pointsEarned;
        user.winStreak = (user.winStreak || 0) + 1;
        user.totalVictories = (user.totalVictories || 0) + 1;
        user.gamesWon = (user.gamesWon || 0) + 1;
        user.gamesPlayed = (user.gamesPlayed || 0) + 1;

        // Calcular nivel
        const levelInfo = this.calculateLevel(user.points);
        const oldLevel = user.level || 1;
        user.level = levelInfo.level;

        // Guardar cambios
        this.authService.updateCurrentUser(user);

        return {
            pointsEarned,
            totalPoints: user.points,
            winStreak: user.winStreak,
            level: user.level,
            leveledUp: user.level > oldLevel,
            currentLevelPoints: levelInfo.currentLevelPoints,
            pointsForNextLevel: levelInfo.pointsForNextLevel
        };
    }

    /**
     * Procesa una derrota contra la IA
     */
    processDefeat() {
        const user = this.authService.getCurrentUser();
        
        // Solo usuarios registrados pierden puntos
        if (!user || user.isGuest) {
            return null;
        }

        const pointsLost = 2;
        
        // Actualizar estadísticas
        user.points = Math.max(0, (user.points || 0) - pointsLost);
        user.winStreak = 0; // Resetear racha
        user.totalDefeats = (user.totalDefeats || 0) + 1;
        user.gamesPlayed = (user.gamesPlayed || 0) + 1;

        // Calcular nivel
        const levelInfo = this.calculateLevel(user.points);
        const oldLevel = user.level || 1;
        user.level = levelInfo.level;

        // Guardar cambios
        this.authService.updateCurrentUser(user);

        return {
            pointsLost,
            totalPoints: user.points,
            winStreak: 0,
            level: user.level,
            leveledDown: user.level < oldLevel,
            currentLevelPoints: levelInfo.currentLevelPoints,
            pointsForNextLevel: levelInfo.pointsForNextLevel
        };
    }

    /**
     * Obtiene el progreso actual del usuario
     */
    getProgress() {
        const user = this.authService.getCurrentUser();
        
        if (!user || user.isGuest) {
            return null;
        }

        const levelInfo = this.calculateLevel(user.points || 0);
        
        return {
            username: user.username,
            points: user.points || 0,
            level: user.level || 1,
            winStreak: user.winStreak || 0,
            totalVictories: user.totalVictories || 0,
            totalDefeats: user.totalDefeats || 0,
            currentLevelPoints: levelInfo.currentLevelPoints,
            pointsForNextLevel: levelInfo.pointsForNextLevel,
            progressPercentage: Math.floor((levelInfo.currentLevelPoints / levelInfo.pointsForNextLevel) * 100)
        };
    }

    /**
     * Obtiene información sobre el próximo nivel
     */
    getNextLevelInfo() {
        const user = this.authService.getCurrentUser();
        
        if (!user || user.isGuest) {
            return null;
        }

        const currentLevel = user.level || 1;
        const pointsForNext = this.getPointsForLevel(currentLevel);
        const levelInfo = this.calculateLevel(user.points || 0);

        return {
            currentLevel,
            nextLevel: currentLevel + 1,
            currentLevelPoints: levelInfo.currentLevelPoints,
            pointsNeeded: pointsForNext,
            pointsRemaining: pointsForNext - levelInfo.currentLevelPoints
        };
    }
}
