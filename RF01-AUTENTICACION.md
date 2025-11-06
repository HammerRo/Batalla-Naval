# 🎮 RF01 - Sistema de Autenticación - Batalla Naval

## Descripción del Requisito

**RF01**: El sistema debe permitir al jugador iniciar sesión o jugar como invitado.

## Implementación Completada ✅

### 1. **Servicio de Autenticación (`AuthService.js`)**

Proporciona toda la lógica de autenticación:

#### Métodos principales:

- **`register(username, password)`** - Registra un nuevo usuario
  - Valida nombre de usuario (mínimo 3 caracteres)
  - Valida contraseña (mínimo 4 caracteres)
  - Evita duplicados
  - Almacena en localStorage

- **`login(username, password)`** - Autentica un usuario existente
  - Verifica credenciales
  - Mantiene la sesión activa
  - Guarda el usuario en sesión

- **`loginAsGuest()`** - Crea una sesión de invitado
  - Genera un identificador único
  - No requiere credenciales
  - Las estadísticas no se guardan

- **`getCurrentUser()`** - Obtiene el usuario actual
- **`logout()`** - Cierra la sesión
- **`isAuthenticated()`** - Verifica si hay usuario en sesión
- **`updatePlayerStats(shots, won)`** - Actualiza estadísticas de jugadores registrados
- **`getStats()`** - Obtiene estadísticas del usuario actual
- **`getRanking()`** - Obtiene ranking top 10 de jugadores

#### Almacenamiento:

- Usa **localStorage** para persistencia de datos
- Usuarios registrados: `batalla-naval-users`
- Usuario actual: `batalla-naval-user`

---

### 2. **Pantalla de Login (`LoginScreen.js`)**

Interfaz gráfica para autenticación:

#### Funcionalidades:

- **Dos modos**: Iniciar sesión y Registrarse
- **Cambio rápido entre modos** mediante pestañas
- **Validación en tiempo real**
- **Mensajes de error/éxito**
- **Opción de invitado**
- **Animaciones suaves**

#### Estructura HTML generada:

```
login-screen
├── login-container
│   ├── login-header
│   │   ├── login-title
│   │   └── login-subtitle
│   ├── login-tabs
│   │   ├── tab (Iniciar Sesión)
│   │   └── tab (Registrarse)
│   ├── login-form
│   │   ├── form-group (Usuario)
│   │   ├── form-group (Contraseña)
│   │   ├── form-message
│   │   └── submit button
│   ├── login-divider
│   ├── btn-guest
│   ├── login-footer
│   └── login-link
└── login-background (Olas animadas)
```

---

### 3. **Integración en UIManager**

Se actualizó `UIManager.js` para mostrar información del usuario:

#### Cambios:

- Recibe el usuario actual en el constructor
- Método `updateUserDisplay()` muestra:
  - Nombre de usuario
  - Indicador de invitado
  - Estadísticas (victorias/partidas) solo para usuarios registrados

#### Ubicación visual:

El usuario se muestra en el header del juego:
```
⚓ Batalla Naval          👤 Juan_Pérez 📊 V: 3/5
```

---

### 4. **Estilos CSS (`login.css`)**

Incluye:

- Diseño responsive
- Animaciones de entrada/salida
- Gradientes y efectos visuales
- Olas animadas de fondo
- Validación visual de formularios
- Soporte para mobile

---

### 5. **Flujo de Aplicación Actualizado**

```
BattleshipApp.initialize()
    ↓
showLoginScreen()
    ↓
LoginScreen renderiza interfaz
    ↓
Usuario elige opción:
    ├─ Iniciar sesión
    ├─ Registrarse
    └─ Invitado
    ↓
onLoginSuccess(user)
    ↓
GameController se inicializa
    ↓
UIManager se inicializa con usuario
    ↓
Juego comienza
```

---

## 📊 Casos de Uso

### Caso 1: Usuario Nuevo Registrado

```javascript
1. Usuario hace clic en "Registrarse"
2. Ingresa usuario y contraseña nuevos
3. Sistema valida datos
4. Se crea la cuenta
5. Se inicia sesión automáticamente
6. Aparece el nombre en el header
7. Se registran estadísticas después de cada partida
```

### Caso 2: Usuario Existente

```javascript
1. Usuario hace clic en "Iniciar Sesión"
2. Ingresa credenciales
3. Sistema valida en localStorage
4. Se inicia sesión
5. Se carga el historial de partidas
6. Se pueden ver estadísticas en el header
```

### Caso 3: Jugar como Invitado

```javascript
1. Usuario hace clic en "Jugar como Invitado"
2. Se genera identificador único
3. Se inicia sesión como invitado
4. El header muestra "Invitado_XXXX 👤"
5. Las estadísticas NO se guardan
6. Puede jugar sin limitaciones
```

---

## 🔒 Seguridad (Nota Importante)

⚠️ **Este sistema usa hash simple para demostración.**

En **producción** se debe:

1. Usar **bcrypt** o **Argon2** en el servidor
2. Implementar **HTTPS**
3. Usar **JWT tokens** para sesiones
4. Validar en servidor (no solo cliente)
5. Implementar **rate limiting**
6. No almacenar contraseñas en cliente

---

## 🎨 Personalización

### Cambiar estilos de login:

Editar `src/css/login.css`:

```css
/* Cambiar color del gradiente */
.login-screen {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Cambiar ancho máximo */
.login-container {
    max-width: 420px;
}
```

### Cambiar validaciones:

Editar `src/js/services/AuthService.js`:

```javascript
// Cambiar requisitos de contraseña
if (password.length < 4) { // Cambiar a 6, 8, etc.
    return { success: false, message: '...' };
}
```

---

## 📱 Datos Guardados en LocalStorage

### Usuarios registrados:
```json
{
  "id": "1699234856789",
  "username": "juan_perez",
  "password": "1234567890",
  "createdAt": "2023-11-06T10:00:00.000Z",
  "gamesPlayed": 5,
  "gamesWon": 3,
  "averageShots": 25.4
}
```

### Usuario actual en sesión:
```json
{
  "id": "1699234856789",
  "username": "juan_perez",
  "gamesPlayed": 5,
  "gamesWon": 3,
  "averageShots": 25.4
}
```

---

## 🧪 Pruebas Sugeridas

1. **Registro exitoso**: Crear nueva cuenta ✓
2. **Login exitoso**: Usar cuenta existente ✓
3. **Validaciones**: Campos vacíos, contraseña corta ✓
4. **Usuario duplicado**: No permitir dos con mismo nombre ✓
5. **Invitado**: Jugar sin registrarse ✓
6. **Persistencia**: F5 mantiene sesión ✓
7. **Estadísticas**: Se guardan solo para usuarios registrados ✓
8. **Logout**: Borrar sesión ✓

---

## 📝 Próximas Mejoras

1. Recuperación de contraseña
2. Autenticación con Google/GitHub
3. Cifrado de contraseñas más fuerte
4. Sincronización en servidor
5. Backup de datos
6. Autenticación de dos factores (2FA)

---

## ✅ Requisito Completado

- ✅ Permite iniciar sesión con usuario y contraseña
- ✅ Permite registrar nuevos usuarios
- ✅ Permite jugar como invitado
- ✅ Muestra información del usuario en la interfaz
- ✅ Persiste datos en localStorage
- ✅ Gestiona estadísticas
- ✅ Interfaz visual profesional
- ✅ Validaciones completas
