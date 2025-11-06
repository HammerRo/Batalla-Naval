# 📊 Flujo Completo de Navegación - Batalla Naval

## 🎬 Flujo Principal Actualizado

```
START
  │
  ▼
┌──────────────────────────┐
│ BattleshipApp.initialize()
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ showLoginScreen()        │
│  ├─ LoginScreen render()
│  └─ Esperar autenticación
└──────┬───────────────────┘
       │
   [RF01]
       │
       ▼
┌──────────────────────────────┐
│ onLoginSuccess(user)         │
│  ├─ Guardar this.currentUser
│  └─ Remover login del DOM
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ showMainMenu()               │  [RF02]
│  ├─ new MenuController()
│  ├─ new MenuView()
│  └─ render(user)
└──────┬───────────────────────┘
       │
       ▼
    ┌──────────────────────────────────────┐
    │  MENÚ PRINCIPAL                      │
    │  ┌─────────┐ ┌──────┐ ┌────┐       │
    │  │ Juego   │ │Config│ │Help│       │
    │  └────┬────┘ └──────┘ └────┘       │
    │       │                             │
    │  👤 username                         │
    │  🚪 Cerrar Sesión                    │
    └───┬──┬────────────────┬──────┬──────┘
        │  │                │      │
        │  └─ Settings     │      └─ Help
        │   (Coming Soon)  │     (Coming Soon)
        │                  │
        └─ NEW: showGameModeSelection()
              [RF03/04]
              │
              ▼
    ┌──────────────────────────────────┐
    │ SELECCIÓN DE MODO                │
    │ ┌──────────────┐ ┌───────────┐  │
    │ │ 🤖           │ │ 👥        │  │
    │ │ Contra IA    │ │ Vs Amigo  │  │
    │ └────┬─────────┘ └─────┬─────┘  │
    │      │                 │        │
    │ 🔙 Volver al Menú      │        │
    └──────┼─────────────────┼────────┘
           │                 │
        mode='ai'      mode='local'
           │                 │
           └─────────┬───────┘
                     │
                     ▼
           ┌──────────────────────┐
           │ startGame()          │
           │ ├─ this.gameMode    │
           │ ├─ GameController() │
           │ └─ UIManager()      │
           └──────┬───────────────┘
                  │
                  ▼
           ┌──────────────────────┐
           │ JUEGO EN PROGRESO    │  [RF05-RF19]
           │                      │
           │ ┌─────────┐          │
           │ │ Tablero │          │
           │ │ Barcos  │          │
           │ │ Ataque  │          │
           │ │ Turnos  │          │
           │ └─────────┘          │
           └──────┬───────────────┘
                  │
                  ▼ [Fin Partida]
           ┌──────────────────────┐
           │ RESULTADO            │
           │ Victoria / Derrota   │
           │ 🏆 / 💔             │
           └──────┬───────────────┘
                  │
                  ├─ Jugar de Nuevo → showGameModeSelection()
                  │
                  └─ Ir al Menú → showMainMenu()
```

---

## 📍 Estado de la Aplicación por Pantalla

```
┌────────────────────────────────────────────────────────┐
│ PANTALLA                 │ Estado Actual               │
├────────────────────────────────────────────────────────┤
│ LoginScreen              │ this.currentUser = null     │
│                          │ this.gameMode = null        │
├────────────────────────────────────────────────────────┤
│ MenuScreen               │ this.currentUser = usuario  │
│                          │ this.gameMode = null        │
├────────────────────────────────────────────────────────┤
│ GameModeScreen (NEW)     │ this.currentUser = usuario  │
│                          │ this.gameMode = null        │
├────────────────────────────────────────────────────────┤
│ GameScreen (AI)          │ this.currentUser = usuario  │
│                          │ this.gameMode = 'ai'        │
├────────────────────────────────────────────────────────┤
│ GameScreen (Local)       │ this.currentUser = usuario  │
│                          │ this.gameMode = 'local'     │
└────────────────────────────────────────────────────────┘
```

---

## 🔄 Eventos de MenuController

```
                    MenuController
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
    'start-game'   'navigate'          'logout'
        │                 │                 │
        │                 │                 │
        ├─ showGameMode   ├─ Settings      ├─ logout()
        │  Selection()    │                 │
        │                 ├─ Help          │
        └─ Listener en    │                 │
           main.js        └─ Listener en    │
                             main.js       │
                                           │
                                    'game-mode-selected'
                                           │
                                    ┌──────┴──────┐
                                    │             │
                              mode='ai'      mode='local'
                                    │             │
                                    └──────┬──────┘
                                           │
                                    onGameModeSelected()
                                           │
                                    startGame()
```

---

## 📱 Flujo de Pantallas Responsivas

### Desktop (> 768px)

```
Login ──→ Menu (3 botones) ──→ GameMode (2 tarjetas lado a lado)
                                      │
                                    Game
```

### Tablet (768px - 480px)

```
Login ──→ Menu (3 botones apilados) ──→ GameMode (1 tarjeta por línea)
                                             │
                                           Game
```

### Móvil (< 480px)

```
Login ──→ Menu (3 botones compactos) ──→ GameMode (Tarjetas móvil)
              (touch optimizado)              (touch optimizado)
                                                  │
                                                Game
```

---

## 🎯 Selección de Modo Detallada

```
showGameModeSelection()
    │
    ├─ 1. Remover menú del DOM
    │      document.getElementById('menuScreen').remove()
    │
    ├─ 2. Crear GameModeView
    │      this.gameModeView = new GameModeView(this.menuController)
    │
    ├─ 3. Renderizar
    │      const element = this.gameModeView.render()
    │
    ├─ 4. Agregar al DOM
    │      document.body.appendChild(element)
    │
    ├─ 5. Conectar evento 'game-mode-selected'
    │      this.menuController.on('game-mode-selected', (data) => 
    │                             this.onGameModeSelected(data))
    │
    └─ 6. Conectar evento 'back-to-menu'
           this.menuController.on('back-to-menu', () =>
                                  this.backToMenuFromGameMode())


onGameModeSelected(data)
    │
    ├─ 1. Guardar modo seleccionado
    │      this.gameMode = data.mode  // 'ai' o 'local'
    │
    └─ 2. Iniciar juego
           this.startGame()


startGame()
    │
    ├─ 1. Remover pantalla de selección
    │      document.getElementById('gameModeScreen').remove()
    │
    ├─ 2. Crear GameController
    │      this.gameController = new GameController()
    │
    ├─ 3. Pasar modo de juego
    │      this.gameController.gameMode = this.gameMode
    │
    ├─ 4. Crear UIManager
    │      this.uiManager = new UIManager(this.gameController, user)
    │
    └─ 5. Exponer para debugging
           window.game = { controller, ui, user, mode }
```

---

## 🔗 Conexión de Capas

```
         ┌────────────────────────────┐
         │   BattleshipApp (Main)     │
         │   - Orquestación           │
         │   - Estado global          │
         └────────┬──────────┬────────┘
                  │          │
          ┌───────┴┐        ┌┴───────┐
          │        │        │        │
          ▼        ▼        ▼        ▼
      LoginScreen MenuView GameModeView UIManager
      (RF01)      (RF02)   (NEW)     (Game)
          │        │        │        │
          └────────┴─┬──────┴────────┘
                     │
              MenuController
              (Eventos)
                     │
          ┌──────────┼──────────┐
          │          │          │
       'login'   'navigate'  'game-mode'
                            'selected'
```

---

## 📊 Árbol de Componentes Completo

```
BattleshipApp
├── LoginScreen (RF01)
│   ├── AuthService
│   └── LoginScreen.js
│
├── MenuController (RF02)
│   ├── MenuView
│   │   └── UI: Menu + Usuario
│   │
│   ├── GameModeView (NEW - RF03/04)
│   │   ├── Tarjeta AI
│   │   └── Tarjeta Local
│   │
│   ├── Settings (TODO)
│   └── Help (TODO)
│
└── GameController (RF05+)
    ├── Board (RF05)
    ├── Fleet (RF07)
    ├── Ship (RF07)
    ├── AIService (RF20)
    └── UIManager
        ├── BoardView
        ├── FleetView
        └── AttackView
```

---

## 🎮 Modo de Juego: Impacto en Componentes

```
┌─────────────────────────────────────────────────┐
│ GameController.gameMode = 'ai' | 'local'       │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴──────────┐
        │                   │
        ▼ (AI)              ▼ (Local)
        
    AIService          Player2Handling
    ├─ randomAttack() ├─ waitForP2()
    ├─ smartAttack()  ├─ setupP2Board()
    └─ hardAttack()   └─ handleP2Input()
    
    Opponents      Opponents
    ├─ AI           ├─ Player 1
    └─ Player      └─ Player 2
```

---

## 📈 Estadísticas del Flujo

| Métrica | Valor |
|---------|-------|
| **Pantallas** | 5 |
| **Eventos** | 4 |
| **Estados** | 6 |
| **Transiciones** | 8 |
| **Componentes** | 6 |
| **Capas** | 4 |

---

## ✅ Checklist de Implementación

### Fase 1 (Completada)
- [x] LoginScreen (RF01)
- [x] MenuView + MenuController (RF02)
- [x] GameModeView (NEW - RF03/04)
- [x] Integración main.js

### Fase 2 (Próxima)
- [ ] Board (RF05)
- [ ] Fleet (RF07)
- [ ] Colocación de barcos (RF08-RF10)
- [ ] Adaptación UI según modo

### Fase 3
- [ ] Turnos (RF12)
- [ ] Ataques (RF13-RF17)
- [ ] AI Strategy (RF20-RF22)

### Fase 4
- [ ] Estadísticas (RF23-RF24)
- [ ] Multi-idioma (RF29)
- [ ] Guardado (RF30)

---

**Diagrama Actualizado:** Noviembre 6, 2025  
**Estado:** ✅ RF01, RF02 Completos + Selección de Modo  
**Próximo:** RF05 - Tablero 10x10
