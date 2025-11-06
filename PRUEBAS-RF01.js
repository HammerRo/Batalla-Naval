/**
 * PRUEBAS - Sistema de Autenticación RF01
 * 
 * Este archivo contiene pruebas unitarias para validar
 * el funcionamiento del sistema de autenticación
 */

import { AuthService } from './src/js/services/AuthService.js';

class AuthenticationTests {
    constructor() {
        this.authService = new AuthService();
        this.testsRun = 0;
        this.testsPassed = 0;
        this.testsFailed = 0;
    }

    // ==================== Test Framework ====================

    test(description, fn) {
        this.testsRun++;
        try {
            fn();
            this.testsPassed++;
            console.log(`✅ PASS: ${description}`);
            return true;
        } catch (error) {
            this.testsFailed++;
            console.error(`❌ FAIL: ${description}`);
            console.error(`   Error: ${error.message}`);
            return false;
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(
                `${message}\nExpected: ${expected}\nActual: ${actual}`
            );
        }
    }

    assertObjectEqual(actual, expected, message) {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        if (actualStr !== expectedStr) {
            throw new Error(
                `${message}\nExpected: ${expectedStr}\nActual: ${actualStr}`
            );
        }
    }

    runAll() {
        console.clear();
        console.log('🧪 Iniciando Pruebas de Autenticación RF01\n');

        this.runRegistrationTests();
        this.runLoginTests();
        this.runGuestTests();
        this.runValidationTests();
        this.runStatsTests();
        this.runRankingTests();

        this.printSummary();
    }

    // ==================== Registration Tests ====================

    runRegistrationTests() {
        console.log('\n📝 PRUEBAS DE REGISTRO\n');

        // Limpiar antes de tests
        localStorage.removeItem('batalla-naval-users');
        this.authService = new AuthService();

        this.test('Registrar usuario válido', () => {
            const result = this.authService.register('juan_perez', 'password123');
            this.assert(result.success, 'Registro debería ser exitoso');
            this.assert(result.user, 'Debería retornar usuario');
            this.assertEqual(result.user.username, 'juan_perez', 'Username correcto');
            this.assert(!result.user.password, 'No debe incluir contraseña');
        });

        this.test('Usuario se guarda en localStorage', () => {
            const users = JSON.parse(localStorage.getItem('batalla-naval-users'));
            this.assert(users.length > 0, 'Usuarios guardados');
            this.assertEqual(users[0].username, 'juan_perez', 'Usuario guardado correctamente');
        });

        this.test('No permitir usuario duplicado', () => {
            const result = this.authService.register('juan_perez', 'otherpass');
            this.assert(!result.success, 'No debería permitir duplicado');
            this.assert(result.message.includes('ya existe'), 'Mensaje de error correcto');
        });

        this.test('Validar longitud mínima de usuario', () => {
            const result = this.authService.register('ab', 'password123');
            this.assert(!result.success, 'Usuario muy corto');
            this.assert(result.message.includes('3 caracteres'), 'Mensaje error correcto');
        });

        this.test('Validar longitud mínima de contraseña', () => {
            const result = this.authService.register('user_valido', 'ab');
            this.assert(!result.success, 'Contraseña muy corta');
            this.assert(result.message.includes('4 caracteres'), 'Mensaje error correcto');
        });

        this.test('No permitir campos vacíos', () => {
            const result1 = this.authService.register('', 'password123');
            this.assert(!result1.success, 'Usuario vacío rechazado');

            const result2 = this.authService.register('usuario', '');
            this.assert(!result2.success, 'Contraseña vacía rechazada');
        });

        this.test('Usuario se autentica automáticamente después de registrarse', () => {
            const result = this.authService.register('maria_garcia', 'securepass456');
            this.assert(this.authService.isAuthenticated(), 'Usuario autenticado');
            this.assertEqual(this.authService.getCurrentUser().username, 'maria_garcia', 'Usuario correcto');
        });
    }

    // ==================== Login Tests ====================

    runLoginTests() {
        console.log('\n🔐 PRUEBAS DE LOGIN\n');

        // Setup: Crear usuario para tests
        localStorage.removeItem('batalla-naval-users');
        this.authService = new AuthService();
        this.authService.register('test_user', 'test_password');
        this.authService.logout();

        this.test('Login con credenciales válidas', () => {
            const result = this.authService.login('test_user', 'test_password');
            this.assert(result.success, 'Login debería ser exitoso');
            this.assertEqual(result.user.username, 'test_user', 'Usuario correcto');
        });

        this.test('Usuario en sesión después del login', () => {
            this.assert(this.authService.isAuthenticated(), 'Usuario autenticado');
            this.assertEqual(this.authService.getCurrentUser().username, 'test_user', 'Usuario actual correcto');
        });

        this.test('Sesión persiste en localStorage', () => {
            const user = JSON.parse(localStorage.getItem('batalla-naval-user'));
            this.assert(user, 'Usuario en localStorage');
            this.assertEqual(user.username, 'test_user', 'Usuario persistido correctamente');
        });

        this.test('Rechazar contraseña incorrecta', () => {
            const result = this.authService.login('test_user', 'wrong_password');
            this.assert(!result.success, 'Login debería fallar');
            this.assert(result.message.includes('incorrectos'), 'Mensaje error correcto');
        });

        this.test('Rechazar usuario inexistente', () => {
            const result = this.authService.login('inexistente', 'test_password');
            this.assert(!result.success, 'Login debería fallar');
            this.assert(result.message.includes('incorrectos'), 'Mensaje error correcto');
        });

        this.test('No permitir login con campos vacíos', () => {
            const result = this.authService.login('', 'password');
            this.assert(!result.success, 'Campos vacíos rechazados');
        });

        this.test('Logout limpia sesión', () => {
            this.authService.logout();
            this.assert(!this.authService.isAuthenticated(), 'Usuario desautenticado');
            this.assert(!localStorage.getItem('batalla-naval-user'), 'localStorage limpiado');
        });
    }

    // ==================== Guest Tests ====================

    runGuestTests() {
        console.log('\n👤 PRUEBAS DE INVITADO\n');

        // Limpiar sesión anterior
        this.authService.logout();

        this.test('Crear sesión de invitado', () => {
            const result = this.authService.loginAsGuest();
            this.assert(result.success, 'Login de invitado exitoso');
            this.assert(result.user.isGuest, 'Usuario marcado como invitado');
            this.assert(result.user.username.includes('Invitado'), 'Nombre contiene "Invitado"');
        });

        this.test('Invitado se autentica', () => {
            this.assert(this.authService.isAuthenticated(), 'Usuario autenticado');
            this.assert(this.authService.getCurrentUser().isGuest, 'Usuario es invitado');
        });

        this.test('Invitado tiene ID único', () => {
            const guest1 = this.authService.loginAsGuest();
            const guest2 = this.authService.loginAsGuest();
            this.assert(guest1.user.id !== guest2.user.id, 'IDs diferentes para cada invitado');
        });

        this.test('Invitado no se guarda en usuarios registrados', () => {
            this.authService.loginAsGuest();
            const users = JSON.parse(localStorage.getItem('batalla-naval-users') || '[]');
            const hasGuest = users.some(u => u.isGuest);
            this.assert(!hasGuest, 'Invitado no guardado en usuarios');
        });
    }

    // ==================== Validation Tests ====================

    runValidationTests() {
        console.log('\n✔️ PRUEBAS DE VALIDACIÓN\n');

        localStorage.removeItem('batalla-naval-users');
        this.authService = new AuthService();

        this.test('Usuario mínimo 3 caracteres', () => {
            const result = this.authService.register('ab', 'password');
            this.assert(!result.success);
        });

        this.test('Usuario máximo alcanzable', () => {
            const longUsername = 'a'.repeat(50);
            const result = this.authService.register(longUsername, 'password');
            this.assert(result.success);
        });

        this.test('Contraseña mínimo 4 caracteres', () => {
            const result = this.authService.register('usuario', 'abc');
            this.assert(!result.success);
        });

        this.test('Contraseña máximo alcanzable', () => {
            const longPassword = 'a'.repeat(50);
            const result = this.authService.register('usuario', longPassword);
            this.assert(result.success);
        });

        this.test('Caracteres especiales en usuario', () => {
            const result = this.authService.register('user@#$%', 'password');
            this.assert(result.success, 'Caracteres especiales permitidos');
        });

        this.test('Espacios en usuario', () => {
            const result = this.authService.register('user name', 'password');
            this.assert(result.success, 'Espacios permitidos');
        });
    }

    // ==================== Stats Tests ====================

    runStatsTests() {
        console.log('\n📊 PRUEBAS DE ESTADÍSTICAS\n');

        localStorage.removeItem('batalla-naval-users');
        this.authService = new AuthService();

        this.test('Usuario registrado inicia con 0 estadísticas', () => {
            this.authService.register('stats_user', 'password');
            const stats = this.authService.getStats();
            this.assertEqual(stats.gamesPlayed, 0, 'Sin partidas jugadas');
            this.assertEqual(stats.gamesWon, 0, 'Sin victorias');
            this.assertEqual(stats.winRate, 0, 'Win rate 0');
        });

        this.test('Actualizar estadísticas después de victoria', () => {
            this.authService.updatePlayerStats(25, true);
            const stats = this.authService.getStats();
            this.assertEqual(stats.gamesPlayed, 1, 'Una partida jugada');
            this.assertEqual(stats.gamesWon, 1, 'Una victoria');
            this.assertEqual(stats.winRate, '100.00', 'Win rate 100%');
        });

        this.test('Actualizar estadísticas después de derrota', () => {
            this.authService.updatePlayerStats(30, false);
            const stats = this.authService.getStats();
            this.assertEqual(stats.gamesPlayed, 2, 'Dos partidas jugadas');
            this.assertEqual(stats.gamesWon, 1, 'Una victoria');
            this.assertEqual(stats.winRate, '50.00', 'Win rate 50%');
        });

        this.test('Promedio de disparos se calcula correctamente', () => {
            const stats = this.authService.getStats();
            // (25 + 30) / 2 = 27.5
            this.assertEqual(stats.averageShots, '27.50', 'Promedio correcto');
        });

        this.test('Invitado no guarda estadísticas', () => {
            this.authService.loginAsGuest();
            this.authService.updatePlayerStats(100, true);
            const user = this.authService.getCurrentUser();
            this.assertEqual(user.gamesPlayed || 0, 0, 'No se guardan estadísticas de invitado');
        });
    }

    // ==================== Ranking Tests ====================

    runRankingTests() {
        console.log('\n🏆 PRUEBAS DE RANKING\n');

        // Setup: Crear varios usuarios con diferentes estadísticas
        localStorage.removeItem('batalla-naval-users');
        this.authService = new AuthService();

        this.test('Ranking está vacío inicialmente', () => {
            const ranking = this.authService.getRanking();
            this.assertEqual(ranking.length, 0, 'Ranking vacío');
        });

        // Crear usuario 1: 3 victorias de 5 (60%)
        this.authService.register('player1', 'pass');
        this.authService.updatePlayerStats(25, true);
        this.authService.updatePlayerStats(30, true);
        this.authService.updatePlayerStats(28, false);
        this.authService.updatePlayerStats(26, true);
        this.authService.updatePlayerStats(29, false);
        this.authService.logout();

        // Crear usuario 2: 4 victorias de 5 (80%)
        this.authService.register('player2', 'pass');
        this.authService.updatePlayerStats(20, true);
        this.authService.updatePlayerStats(21, true);
        this.authService.updatePlayerStats(22, true);
        this.authService.updatePlayerStats(25, false);
        this.authService.updatePlayerStats(23, true);
        this.authService.logout();

        this.test('Ranking contiene a usuarios con partidas', () => {
            const ranking = this.authService.getRanking();
            this.assert(ranking.length > 0, 'Ranking no vacío');
            this.assert(ranking.length <= 10, 'Máximo 10 usuarios');
        });

        this.test('Ranking ordena por tasa de victorias (descendente)', () => {
            const ranking = this.authService.getRanking();
            for (let i = 1; i < ranking.length; i++) {
                const prevRate = parseFloat(ranking[i - 1].winRate);
                const currRate = parseFloat(ranking[i].winRate);
                this.assert(prevRate >= currRate, 'Orden descendente por win rate');
            }
        });

        this.test('Ranking incluye datos correctos', () => {
            const ranking = this.authService.getRanking();
            if (ranking.length > 0) {
                const firstRank = ranking[0];
                this.assert(firstRank.rank, 'Tiene rank');
                this.assert(firstRank.username, 'Tiene username');
                this.assert(firstRank.gamesWon !== undefined, 'Tiene gamesWon');
                this.assert(firstRank.gamesPlayed !== undefined, 'Tiene gamesPlayed');
                this.assert(firstRank.winRate !== undefined, 'Tiene winRate');
            }
        });

        this.test('Ranking limita a top 10', () => {
            // Crear 11 usuarios
            for (let i = 0; i < 11; i++) {
                this.authService.register(`player_${i}`, 'pass');
                this.authService.updatePlayerStats(20, true);
                this.authService.logout();
            }
            const ranking = this.authService.getRanking();
            this.assert(ranking.length <= 10, 'Máximo 10 en ranking');
        });
    }

    // ==================== Summary ====================

    printSummary() {
        console.log('\n' + '='.repeat(50));
        console.log('📈 RESUMEN DE PRUEBAS');
        console.log('='.repeat(50));
        console.log(`Total de pruebas:  ${this.testsRun}`);
        console.log(`✅ Aprobadas:      ${this.testsPassed}`);
        console.log(`❌ Fallidas:       ${this.testsFailed}`);
        console.log('='.repeat(50));

        if (this.testsFailed === 0) {
            console.log('✨ ¡TODAS LAS PRUEBAS PASARON! ✨');
        } else {
            console.log(`⚠️  ${this.testsFailed} prueba(s) fallaron`);
        }

        console.log('='.repeat(50) + '\n');
    }
}

// Ejecutar pruebas
const tests = new AuthenticationTests();
tests.runAll();

export { AuthenticationTests };
