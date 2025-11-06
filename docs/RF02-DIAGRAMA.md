# 📊 RF02 - Diagrama de Componentes y Flujo

## 🏗️ Estructura de Archivos RF02

```
Batalla-Naval/
├── src/
│   ├── js/
│   │   ├── main.js                           ← Hub central
│   │   │   ├── showMainMenu()                ← Nueva: muestra menú
│   │   │   ├── startGame()                   ← Actualizado
│   │   │   ├── navigateMenu()                ← Nueva
│   │   │   ├── logout()                      ← Nueva
│   │   │   └── ...
│   │   │
│   │   ├── controllers/
│   │   │   ├── MenuController.js             ← NUEVO
│   │   │   │   ├── on()
│   │   │   │   ├── emit()
│   │   │   │   ├── navigateTo()
│   │   │   │   ├── startGame()
│   │   │   │   ├── backToMenu()
│   │   │   │   └── logout()
│   │   │   │
│   │   │   └── GameController.js
│   │   │
│   │   └── views/
│   │       ├── MenuView.js                   ← NUEVO
│   │       │   ├── render(user)
│   │       │   └── attachEventListeners()
│   │       │
│   │       ├── LoginScreen.js
│   │       └── UIManager.js
│   │
│   └── css/
│       ├── menu.css                          ← NUEVO
│       ├── login.css
│       └── ...
│
└── index.html                                 ← Actualizado
    ├── <link> menu.css
    └── ...
```

---

## 🔗 Diagrama de Integración

```
                    BattleshipApp
                         │
                         │
            ┌────────────┼────────────┐
            │            │            │
       LoginScreen   MenuController  MenuView
            │            │            │
            └────────────┼────────────┘
                         │
                    main.js/DOM
```

---

## 🎬 Flujo de Eventos RF02

```
Usuario Login
     │
     ▼
┌─────────────────────────────────┐
│ LoginScreen.onLoginSuccess()    │
│ → BattleshipApp.onLoginSuccess()│
└──────────────┬──────────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │ showMainMenu()          │
    │  ├─ new MenuController()│
    │  ├─ new MenuView()      │
    │  └─ render(user)        │
    └──────────┬──────────────┘
               │
               ▼
    ┌─────────────────────────────────┐
    │ MenuView DOM                    │
    │  ├─ #btnGame                   │
    │  ├─ #btnSettings               │
    │  ├─ #btnHelp                   │
    │  └─ #btnLogout                 │
    └──────────┬──────────────────────┘
               │
        ┌──────┼──────┬──────┐
        │      │      │      │
        ▼      ▼      ▼      ▼
      Game  Config  Help  Logout
        │      │      │      │
        └──────┴──────┴──────┘
             │
             ▼
    MenuController.on() listeners
        │
    ┌───┴───┬─────────┬────────┐
    │       │         │        │
    ▼       ▼         ▼        ▼
start-game navigate back-to- logout
          menu       menu

```

---

## 📋 Flujo Detallado: Click en Botón Juego

```
1. Usuario hace click en #btnGame
   │
   ▼
2. attachEventListeners() → Click Handler
   │
   ▼
3. this.menuController.startGame()
   │
   ▼
4. MenuController.startGame() → emit('start-game')
   │
   ▼
5. main.js → this.menuController.on('start-game', () => this.startGame())
   │
   ▼
6. BattleshipApp.startGame()
   ├─ Remover menú del DOM
   ├─ Crear GameController
   ├─ Crear UIManager
   └─ Mostrar tablero
```

---

## 🎨 UI/UX Flow RF02

```
┌─────────────────────────────────────────┐
│          Login Screen (RF01)            │
│  [Usuario] [Contraseña] [Registro]     │
│           [Jugar como Invitado]         │
└─────────────────────────────────────────┘
              Click Submit
              │
              ▼
┌─────────────────────────────────────────┐
│       Menu Principal (RF02)             │
│                                         │
│       ⚓ Batalla Naval                  │
│       👤 usuario_name / Modo Invitado  │
│                                         │
│   ┌──────────┐ ┌──────────┐ ┌────┐   │
│   │ 🎮 Juego │ │ ⚙️ Config│ │❓A│   │
│   │ Nueva... │ │ Opciones │ │udา│   │
│   └──────────┘ └──────────┘ └────┘   │
│                                         │
│              🚪 Cerrar Sesión          │
└─────────────────────────────────────────┘
        │           │           │
        │Click      │Click      │Click
        │ Juego     │ Config    │ Ayuda
        │           │           │
        ▼           ▼           ▼
    Tablero    (Coming Soon) (Coming Soon)
    (RF03+)
```

---

## 🔄 Estados del Menú

```
Initial State: Login
       │
       ▼
       ├──→ Guest Mode
       │        │
       ▼        ▼
   User Mode ──┤
       │       │
       ├───────┴──→ Main Menu
       │            │
       ├─ Settings  │
       │            │
       ├─ Help      │
       │            │
       ├─ Game (RF03+)
       │
       ▼
    Logout → Back to Login
```

---

## 📱 Responsividad RF02

```
Desktop (> 768px)          Tablet (768px-480px)      Mobile (< 480px)
┌──────────────────┐       ┌─────────────┐           ┌────────┐
│ ⚓ Batalla Naval │       │⚓ Batalla   │           │⚓ B.N. │
│ 👤 username     │       │👤 username │           │👤 user │
│                 │       │            │            │        │
│ ┌─────────────┐ │       │┌─────────┐ │           │┌──────┐│
│ │🎮 Juego     │ │       ││🎮 Juego │ │           ││🎮 J ││
│ │Nueva Partida│ │       ││Nueva    │ │           ││Nueva││
│ └─────────────┘ │       │└─────────┘ │           │└──────┘│
│                 │       │            │            │        │
│ ┌─────────────┐ │       │┌─────────┐ │           │┌──────┐│
│ │⚙️ Configurar│ │       ││⚙️ Config│ │           ││⚙️ C ││
│ │Opciones     │ │       ││Opciones │ │           ││Opc.  ││
│ └─────────────┘ │       │└─────────┘ │           │└──────┘│
│                 │       │            │            │        │
│ ┌─────────────┐ │       │┌─────────┐ │           │┌──────┐│
│ │❓ Ayuda     │ │       ││❓ Ayuda │ │           ││❓ A ││
│ │Aprende      │ │       ││Aprende  │ │           ││Aprnd ││
│ └─────────────┘ │       │└─────────┘ │           │└──────┘│
│                 │       │            │            │        │
│ [🚪 Cerrar]    │       │[🚪 Cerrar] │           │[🚪 C] │
└──────────────────┘       └─────────────┘           └────────┘
```

---

## 🔐 Gestión de Datos RF02

```
Usuario (RF01)
│
├── username: string
├── password: hash
├── mode: 'registered' | 'guest'
├── stats: { wins, losses, ... }
└── ranking: number

            │
            ▼
     BattleshipApp
            │
            ├─ currentUser (referencia)
            ├─ menuController
            └─ menuView

            │
            ▼
     MenuView.render(user)
            │
            └─ Muestra:
               ├─ username (si es registered)
               └─ "Modo Invitado" (si guest)
```

---

## 🎯 Componentes y Responsabilidades

### MenuController (Lógica)
```
Responsabilidades:
✓ Gestionar eventos ('start-game', 'navigate', 'logout')
✓ Notificar cambios a listeners
✓ Mantener estado de sección actual
✓ Iniciar nuevas acciones (game, logout)

NO hace:
✗ Renderizar HTML
✗ Acceder al DOM directamente
✗ Gestionar autenticación
```

### MenuView (Presentación)
```
Responsabilidades:
✓ Renderizar HTML del menú
✓ Conectar botones con listeners
✓ Mostrar usuario/invitado
✓ Mantener estructura visual

NO hace:
✗ Lógica de negocio
✗ Gestión de eventos de negocio
✗ Acceso a localStorage
```

### BattleshipApp (Orquestación)
```
Responsabilidades:
✓ Coordinar Login → Menú → Juego
✓ Manejar callbacks de MenuController
✓ Inicializar GameController cuando sea necesario
✓ Gestionar flujo global

NO hace:
✗ Renderizar menú (lo hace MenuView)
✗ Lógica de menú (lo hace MenuController)
```

---

## 🧪 Testing RF02

```
Test Suite: MenuController
├─ on(event, callback)
├─ emit(event, data)
├─ navigateTo(section)
├─ startGame()
├─ logout()
└─ Event Listeners

Test Suite: MenuView
├─ render(user) - usuario registrado
├─ render(user) - usuario invitado
├─ attachEventListeners()
└─ Click handlers

Integration Tests:
├─ Login → Menu flow
├─ Menu → Game flow
├─ Menu → Settings flow
├─ Menu → Help flow
└─ Menu → Logout flow
```

---

## 📈 Escalabilidad RF02

Para futuras expansiones:

```
Configuración Completa
├─ Dificultad: Easy, Medium, Hard
├─ Idioma: ES, EN, FR, ...
├─ Volumen: 0-100%
├─ Tamaño tablero: 8x8, 10x10, 12x12
└─ Tema: Light, Dark

Ayuda Expandida
├─ Cómo jugar
├─ Controles
├─ FAQ
├─ Estrategias
└─ Créditos

Estadísticas
├─ Partidas jugadas
├─ Razón de ganancia
├─ Mejor tiempo
├─ Enemigos vencidos
└─ Ranking global

Historial
├─ Últimas 10 partidas
├─ Filtrar por tipo
├─ Ver replays
└─ Descargar stats
```

---

**Diagrama Actualizado:** Noviembre 6, 2024  
**RF02 Status:** ✅ 100% Completo  
**Próximo:** RF03 - Iniciar Partida vs CPU
