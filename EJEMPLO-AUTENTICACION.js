/**
 * EJEMPLO DE USO - Sistema de Autenticación RF01
 * 
 * Este archivo muestra cómo usar el sistema de autenticación
 * implementado en Batalla Naval
 */

// ==================== ACCESO A TRAVÉS DE window.game ====================

// Después de que el usuario se autentica, puedes acceder a:

// 1. Usuario actual
console.log(window.game.user);
// Salida:
// {
//   id: "1699234856789",
//   username: "juan_perez",
//   gamesPlayed: 5,
//   gamesWon: 3,
//   averageShots: 25.4
// }


// ==================== INTERACCIÓN CON AuthService ====================

// El servicio de autenticación se puede acceder a través de:
// window.game.ui.gameController (tiene acceso al servicio)

// Pero para acceso directo, puedes hacer:
import { AuthService } from './src/js/services/AuthService.js';

const auth = new AuthService();

// Registrar usuario
const registerResult = auth.register('nuevo_usuario', 'password123');
console.log(registerResult);
// {
//   success: true,
//   message: 'Usuario registrado correctamente',
//   user: { ... }
// }

// Iniciar sesión
const loginResult = auth.login('nuevo_usuario', 'password123');
console.log(loginResult);
// {
//   success: true,
//   message: 'Sesión iniciada correctamente',
//   user: { ... }
// }

// Jugar como invitado
const guestResult = auth.loginAsGuest();
console.log(guestResult);
// {
//   success: true,
//   message: 'Sesión de invitado iniciada',
//   user: {
//     id: 'guest_1699234856789',
//     username: 'Invitado_4527',
//     isGuest: true,
//     ...
//   }
// }

// Obtener usuario actual
const currentUser = auth.getCurrentUser();
console.log(currentUser.username);

// Verificar si está autenticado
if (auth.isAuthenticated()) {
    console.log('Usuario autenticado');
}

// Obtener estadísticas
const stats = auth.getStats();
console.log(stats);
// {
//   username: 'juan_perez',
//   gamesPlayed: 5,
//   gamesWon: 3,
//   winRate: 60.00,
//   averageShots: 25.40
// }

// Obtener ranking top 10
const ranking = auth.getRanking();
console.log(ranking);
// [
//   { rank: 1, username: 'master_gamer', gamesWon: 50, gamesPlayed: 75, winRate: 66.67 },
//   { rank: 2, username: 'juan_perez', gamesWon: 3, gamesPlayed: 5, winRate: 60.00 },
//   ...
// ]

// Actualizar estadísticas (se llama automáticamente en gameOver)
auth.updatePlayerStats(25, true); // 25 disparos, ganó la partida

// Cerrar sesión
auth.logout();


// ==================== DATOS GUARDADOS EN LOCALSTORAGE ====================

// Usuarios registrados
localStorage.getItem('batalla-naval-users');
// Devuelve JSON string con array de usuarios

// Usuario actual en sesión
localStorage.getItem('batalla-naval-user');
// Devuelve JSON string con el usuario actual


// ==================== VALIDACIONES ====================

// El sistema valida automáticamente:

// Nombre de usuario:
// - Mínimo 3 caracteres
// - No puede estar vacío
// - No puede ser duplicado

// Contraseña:
// - Mínimo 4 caracteres
// - No puede estar vacío

// Ejemplo de error:
const failResult = auth.register('ab', 'pass');
console.log(failResult);
// {
//   success: false,
//   message: 'El usuario debe tener al menos 3 caracteres'
// }


// ==================== INTEGRACIÓN CON GAMEPLAY ====================

// Los datos se actualizan automáticamente cuando termina una partida
// En UIManager → onGameOver():
// auth.updatePlayerStats(shots, isWinner);

// Esto ocurre sin intervención del usuario


// ==================== CASOS DE ERROR ====================

// Credenciales incorrectas
const wrongPass = auth.login('usuario', 'wrongpass');
// { success: false, message: 'Usuario o contraseña incorrectos' }

// Usuario duplicado
const duplicate = auth.register('nuevo_usuario', 'pass123');
// { success: false, message: 'El usuario ya existe' }

// Contraseña muy corta
const shortPass = auth.register('nuevo_usuario_2', 'ab');
// { success: false, message: 'La contraseña debe tener al menos 4 caracteres' }


// ==================== FLUJO COMPLETO ESPERADO ====================

/*
1. Usuario abre la aplicación
   ↓
2. Se muestra pantalla de login
   ↓
3. Usuario elige:
   a) Registrarse → crea cuenta nueva
   b) Iniciar sesión → accede con cuenta existente
   c) Jugar como invitado → sesión temporal
   ↓
4. Sistema valida credenciales
   ↓
5. Si es válido → UIManager obtiene usuario
   ↓
6. Nombre aparece en header del juego
   ↓
7. Usuario juega partidas
   ↓
8. Al terminar → se guardan estadísticas
   ↓
9. Ranking se actualiza automáticamente
*/


// ==================== DEBUGGING ====================

// Acceso rápido desde consola del navegador:

// Ver usuario actual
window.game.user

// Ver todas las estadísticas
window.game.ui.gameController // (necesita acceso a AuthService)

// Ver datos en storage
console.table(JSON.parse(localStorage.getItem('batalla-naval-users')));
console.table(JSON.parse(localStorage.getItem('batalla-naval-user')));

// Limpiar todo (cuidado!)
localStorage.removeItem('batalla-naval-users');
localStorage.removeItem('batalla-naval-user');
