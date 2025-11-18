# Batalla Naval


## ¿Cómo se juega?
- Inicia sesión o entra como invitado.
- Selecciona un modo de juego:
  - Contra la Máquina (fácil/normal/difícil)
  - Contra un Amigo (2 jugadores locales, mismo dispositivo)
- Coloca tus barcos en tu tablero (arrastrar/soltar y rotación):
  - Clic sobre un barco colocado para rotarlo (H/V)
  - Botón de colocación aleatoria disponible
- Turnos y disparos:
  - Dispara haciendo clic en el tablero enemigo
  - Aciertos y fallos se marcan con animaciones

- La partida termina al hundir todos los barcos del rival. Se muestra un resumen final.

## Estructura del proyecto
```
index.html
src/
  assets/
    sounds/
      bgm/
        README.txt
      sfx/
        README.txt
    images/
      board/              # Sprites/animaciones de celdas
      ships/              # Sprites por tipo y segmento (normal/destruido)
      covers/             # Portadas login/menu (README con tamaños)
  css/
    animations.css
    base.css
    components.css
    gamemode.css
    login.css
    menu.css
    variables.css
  js/
    main.js               # Punto de entrada; navega entre pantallas
    config/
      constants.js
    controllers/
      GameController.js
      MenuController.js
    models/
      Board.js
      Player.js
      Ship.js
    services/
      AIService.js
      AudioService.js
      AuthService.js
      ProgressionService.js
      SettingsService.js
    utils/
      EventEmitter.js
      UISoundManager.js
      Validator.js
    views/
      BoardView.js        # Render del tablero con sprites/animaciones
      GameModeView.js
      LoginScreen.js
      MenuView.js
      UIManager.js        # Orquesta UI, modales, transiciones
      UIManager_temp.js
test/
  game.test.js
```

## Tecnologías usadas
- HTML5 para la estructura de vistas y modales
- CSS3: variables, Grid/Flexbox, animaciones, gradientes, `backdrop-filter`
- JavaScript ES6+ (módulos/clases) con patrón tipo MVC (models/controllers/views)
- Patrón Pub/Sub con `EventEmitter`
- Web APIs: DOM, `localStorage` (autenticación/progreso/ajustes), Audio (BGM/SFX)


## Ejecutar localmente
- VS Code: extensión "Live Server" y abrir `index.html` con "Open with Live Server".
