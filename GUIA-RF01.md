# ⚓ BATALLA NAVAL - Guía de Implementación RF01

## 📋 Resumen de Cambios

Se ha implementado completamente el **Requisito Funcional RF01**: *"El sistema debe permitir al jugador iniciar sesión o jugar como invitado"*

### ✅ Implementado:

1. **Sistema de Autenticación Completo**
   - Registro de nuevos usuarios
   - Login con credenciales
   - Modo invitado sin registro
   - Persistencia en localStorage
   - Gestión de sesiones

2. **Interfaz de Login Profesional**
   - Diseño moderno con gradientes
   - Animaciones suaves
   - Cambio entre pestañas (Login/Registro)
   - Validación en tiempo real
   - Mensajes de error/éxito

3. **Gestión de Estadísticas**
   - Registro de partidas jugadas
   - Contador de victorias
   - Promedio de disparos
   - Ranking top 10
   - Solo para usuarios registrados

4. **Integración Visual**
   - Muestra nombre del usuario en header
   - Indicador de modo invitado
   - Estadísticas en tiempo real

---

## 🚀 Cómo Usar

### Instalación

No requiere instalación adicional. Los cambios están integrados en el proyecto existente.

### Iniciar la Aplicación

```bash
# Opción 1: Con Live Server en VS Code
Clic derecho en index.html → "Open with Live Server"

# Opción 2: Con Python
python -m http.server 8000

# Opción 3: Con Node.js
npx http-server
```

Luego abre: `http://localhost:8000`

### Pantalla de Login

Al cargar la aplicación verás:

```
┌─────────────────────────────────────┐
│           ⚓ Batalla Naval           │
│            Bienvenido                │
│                                     │
│  [Iniciar Sesión]  [Registrarse]   │
│                                     │
│  Usuario: [_______________]        │
│  Contraseña: [_______________]     │
│                                     │
│  [Iniciar Sesión]                  │
│                                     │
│              o                       │
│                                     │
│  [👤 Jugar como Invitado]         │
│                                     │
│  ¿No tienes cuenta? Regístrate      │
└─────────────────────────────────────┘
```

### Opciones

#### 1️⃣ Registrarse (Nuevo Usuario)

- Haz clic en pestaña "Registrarse"
- Ingresa usuario (mínimo 3 caracteres)
- Ingresa contraseña (mínimo 4 caracteres)
- Haz clic en "Crear Cuenta"
- Se inicia sesión automáticamente

**Requisitos:**
- Usuario único (no puede repetirse)
- Usuario: 3-50 caracteres
- Contraseña: 4-50 caracteres

#### 2️⃣ Iniciar Sesión (Usuario Existente)

- Mantente en pestaña "Iniciar Sesión"
- Ingresa usuario y contraseña
- Haz clic en "Iniciar Sesión"

#### 3️⃣ Jugar como Invitado

- Haz clic en "👤 Jugar como Invitado"
- Se inicia sesión inmediatamente
- Identificador único generado
- **Importante:** Las estadísticas NO se guardan

---

## 📁 Archivos Nuevos Creados

```
src/
├── js/
│   ├── services/
│   │   └── AuthService.js          ✨ Lógica de autenticación
│   └── views/
│       └── LoginScreen.js          ✨ Interfaz de login
└── css/
    └── login.css                   ✨ Estilos de login

Documentación:
├── RF01-AUTENTICACION.md           📖 Documentación completa
└── EJEMPLO-AUTENTICACION.js        📚 Ejemplos de uso
```

---

## 📊 Archivos Modificados

```
src/
├── js/
│   ├── main.js                     🔄 Integración de login
│   └── views/
│       └── UIManager.js            🔄 Mostrar usuario en UI
└── css/

index.html                          🔄 Incluir CSS de login
```

---

## 💾 Datos Almacenados

### LocalStorage Keys

**`batalla-naval-users`** - Todos los usuarios registrados
```json
[
  {
    "id": "1699234856789",
    "username": "juan_perez",
    "password": "1234567890",
    "createdAt": "2023-11-06T10:00:00.000Z",
    "gamesPlayed": 5,
    "gamesWon": 3,
    "averageShots": 25.4
  }
]
```

**`batalla-naval-user`** - Usuario actual en sesión
```json
{
  "id": "1699234856789",
  "username": "juan_perez",
  "gamesPlayed": 5,
  "gamesWon": 3,
  "averageShots": 25.4
}
```

### Datos Persistentes

- ✅ Usuarios registrados persisten entre recargas
- ✅ Sesión activa persiste (F5 mantiene login)
- ✅ Estadísticas se guardan automáticamente
- ✅ Ranking se actualiza en tiempo real

---

## 🎮 Flujo de Uso Completo

```
1. Abrir aplicación
           ↓
2. Ver pantalla de login
           ↓
3. Elegir opción:
   ├─ Registrarse → crear cuenta
   ├─ Iniciar sesión → acceder
   └─ Invitado → jugar sin cuenta
           ↓
4. Validación de credenciales
           ↓
5. Inicio de sesión exitoso
           ↓
6. Aparecer nombre en header
           ↓
7. Jugar batalla naval
           ↓
8. Terminar partida
           ↓
9. Guardar estadísticas (solo usuarios registrados)
           ↓
10. Volver a jugar o cerrar
```

---

## 🔍 Validaciones

### Registro

| Campo | Validación | Mensaje |
|-------|-----------|---------|
| Usuario | Mínimo 3 caracteres | "El usuario debe tener al menos 3 caracteres" |
| Usuario | No vacío | "El usuario y contraseña son requeridos" |
| Usuario | Único | "El usuario ya existe" |
| Contraseña | Mínimo 4 caracteres | "La contraseña debe tener al menos 4 caracteres" |
| Contraseña | No vacío | "El usuario y contraseña son requeridos" |

### Login

| Escenario | Resultado | Mensaje |
|-----------|-----------|---------|
| Credenciales válidas | ✅ Login | "Sesión iniciada correctamente" |
| Credenciales inválidas | ❌ Error | "Usuario o contraseña incorrectos" |
| Campos vacíos | ❌ Error | "El usuario y contraseña son requeridos" |

---

## 🎨 Estilos Personalizables

### Colores

Editar `src/css/login.css`:

```css
/* Gradiente de fondo */
.login-screen {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Color de botones (ver variables.css) */
:root {
    --color-primary: #667eea;
}
```

### Animaciones

```css
.login-screen { animation: fadeIn 0.3s ease-in; }
.login-container { animation: slideUp 0.4s ease-out; }
```

---

## 🔐 Consideraciones de Seguridad

⚠️ **IMPORTANTE**: Este sistema es para DEMOSTRACIÓN educativa.

Para **PRODUCCIÓN** se requiere:

1. **Backend**: Validación servidor (no solo cliente)
2. **Base de datos**: PostgreSQL, MongoDB, etc.
3. **Cifrado**: bcrypt, Argon2 (no hash simple)
4. **Transporte**: HTTPS obligatorio
5. **Sesiones**: JWT tokens con expiración
6. **Rate limiting**: Limitar intentos de login
7. **Auditoría**: Registrar intentos fallidos

---

## 📱 Responsive Design

La interfaz de login es completamente responsive:

- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

---

## 🧪 Pruebas Recomendadas

### Caso 1: Registro Nuevo Usuario
```
1. Abrir app
2. Cambiar a "Registrarse"
3. Usuario: "test_user"
4. Contraseña: "test1234"
5. Crear cuenta
✅ Debería loguearse y aparecer en header
```

### Caso 2: Login Usuario Existente
```
1. Cerrar sesión o recargar F5
2. Usuario: "test_user"
3. Contraseña: "test1234"
4. Iniciar sesión
✅ Debería loguearse
```

### Caso 3: Invitado
```
1. Haz clic en "Jugar como Invitado"
✅ Debería aparecer "Invitado_XXXX"
```

### Caso 4: Error de Validación
```
1. Cambiar a "Registrarse"
2. Usuario: "ab" (muy corto)
3. Contraseña: "123" (muy corta)
✅ Debería mostrar errores
```

### Caso 5: Persistencia
```
1. Loguearse como "test_user"
2. Presionar F5
✅ Debería mantener la sesión
```

---

## 🐛 Debugging

### Acceso desde Consola (F12)

```javascript
// Ver usuario actual
window.game.user

// Ver controlador
window.game.controller

// Ver interfaz
window.game.ui

// Ver datos en storage
JSON.parse(localStorage.getItem('batalla-naval-users'))
JSON.parse(localStorage.getItem('batalla-naval-user'))
```

### Limpiar Datos (si es necesario)

```javascript
// Borrar todos los usuarios
localStorage.removeItem('batalla-naval-users')

// Borrar sesión actual
localStorage.removeItem('batalla-naval-user')

// Recargar
location.reload()
```

---

## 📚 Documentación Adicional

- 📖 **RF01-AUTENTICACION.md** - Documentación técnica completa
- 📚 **EJEMPLO-AUTENTICACION.js** - Ejemplos de código

---

## ✨ Características Adicionales

- 🎯 Sistema de ranking top 10
- 📊 Estadísticas de jugador
- 🎨 Animaciones suaves
- 📱 Diseño responsive
- ⌚ Persisten sesiones
- 🌊 Efectos visuales con olas

---

## 🤝 Contribuciones

¿Encontraste un bug? Abre un issue.
¿Tienes mejoras? Abre un pull request.

---

## 📄 Licencia

Proyecto educativo - Libre de usar y modificar

---

## 📞 Soporte

Para preguntas sobre el sistema de autenticación:
1. Consulta **RF01-AUTENTICACION.md**
2. Revisa **EJEMPLO-AUTENTICACION.js**
3. Abre la consola (F12) y verifica errores

---

**Implementado por**: Sistema de Autenticación RF01
**Fecha**: Noviembre 2024
**Estado**: ✅ Completado
