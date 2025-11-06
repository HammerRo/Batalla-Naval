# 🧪 Pruebas - Selección de Modo de Juego

## Descripción
Este documento detalla las pruebas para la nueva funcionalidad de selección de modo de juego que aparece cuando se hace click en el botón "Juego" del menú principal.

---

## ✅ Prueba 1: Mostrar Selección de Modo

### Pasos:
1. Inicia el juego (login o invitado)
2. Se muestra el menú principal
3. Haz click en el botón "🎮 Juego"

### Resultados Esperados:
- ✅ Menú principal desaparece
- ✅ Pantalla de selección de modo aparece con animación
- ✅ Se muestra el título "🎮 Selecciona Modo de Juego"
- ✅ Se muestran dos tarjetas:
  - 🤖 Contra la Máquina
  - 👥 Contra un Amigo
- ✅ Se muestra botón "🔙 Volver al Menú"

---

## ✅ Prueba 2: Seleccionar "Contra la Máquina"

### Pasos:
1. Muestra pantalla de selección de modo
2. Haz click en la tarjeta "🤖 Contra la Máquina"

### Resultados Esperados:
- ✅ Pantalla de selección desaparece
- ✅ Se inicia el juego contra la IA
- ✅ Se muestra el tablero de juego
- ✅ Console muestra: "🤖 Seleccionado: Contra la Máquina"
- ✅ Console muestra: "📊 Modo de juego: 🤖 Contra la Máquina"
- ✅ `window.game.mode` es 'ai'

---

## ✅ Prueba 3: Seleccionar "Contra un Amigo"

### Pasos:
1. Muestra pantalla de selección de modo
2. Haz click en la tarjeta "👥 Contra un Amigo"

### Resultados Esperados:
- ✅ Pantalla de selección desaparece
- ✅ Se inicia el juego multijugador
- ✅ Se muestra el tablero de juego
- ✅ Console muestra: "👥 Seleccionado: Contra un Amigo"
- ✅ Console muestra: "📊 Modo de juego: 👥 Contra un Amigo"
- ✅ `window.game.mode` es 'local'

---

## ✅ Prueba 4: Volver al Menú desde Selección

### Pasos:
1. Muestra pantalla de selección de modo
2. Haz click en botón "🔙 Volver al Menú"

### Resultados Esperados:
- ✅ Pantalla de selección desaparece
- ✅ Menú principal vuelve a aparecer
- ✅ Console muestra: "🔙 Volviendo al menú desde selección de modo..."
- ✅ Usuario se mantiene en sesión
- ✅ Se puede volver a hacer click en "Juego"

---

## ✅ Prueba 5: Diseño Responsivo - Desktop

### Condiciones:
- Pantalla: > 768px de ancho

### Resultados Esperados:
- ✅ Dos tarjetas se muestran lado a lado (grid 2 columnas)
- ✅ Tarjetas tienen buena proporción
- ✅ Texto legible
- ✅ Botones accesibles
- ✅ Efecto hover funciona suavemente

---

## ✅ Prueba 6: Diseño Responsivo - Tablet

### Condiciones:
- Pantalla: 768px a 480px de ancho

### Resultados Esperados:
- ✅ Tarjetas se apilan verticalmente (grid 1 columna)
- ✅ Texto sigue siendo legible
- ✅ Botones son tocables (mínimo 44px)
- ✅ Estilos se adaptan correctamente

---

## ✅ Prueba 7: Diseño Responsivo - Móvil

### Condiciones:
- Pantalla: < 480px de ancho

### Resultados Esperados:
- ✅ Tarjetas optimizadas para móvil
- ✅ Padding reducido pero aún legible
- ✅ Botones con tamaño apropiado
- ✅ Sin horizontalscroll
- ✅ Todo accesible con dedo

---

## ✅ Prueba 8: Estilos Visuales

### Verificar:
1. Colores correctos
   - Fondo: Gradiente azul-morado
   - Tarjeta AI: Borde izquierdo azul (#667eea)
   - Tarjeta Local: Borde izquierdo morado (#764ba2)
2. Iconos se muestran correctamente (🤖 y 👥)
3. Animaciones suaves al pasar mouse
4. Sombras se ven correctas
5. Badge de usuario no aparece

---

## ✅ Prueba 9: Flujo Completo

### Pasos:
1. Login exitoso
2. Ver menú principal
3. Click en "Juego"
4. Ver selección de modo
5. Click en "Contra la Máquina"
6. Ver tablero de juego

### Resultados Esperados:
- ✅ Todas las pantallas transicionan suavemente
- ✅ No hay elementos superpuestos
- ✅ Console limpio sin errores
- ✅ Modo de juego se propaga correctamente

---

## ✅ Prueba 10: Flujo Alternativo (Volver atrás)

### Pasos:
1. Login exitoso
2. Ver menú principal
3. Click en "Juego"
4. Ver selección de modo
5. Click en "Volver al Menú"
6. Ver menú principal nuevamente
7. Click en "Juego"
8. Ver selección de modo nuevamente

### Resultados Esperados:
- ✅ Ciclo se repite sin problemas
- ✅ Sin pérdida de datos
- ✅ Sin errores en console
- ✅ Estados se mantienen correctamente

---

## 🔍 Verificación en Consola

### Logs Esperados (Flujo completo):

```
✅ Menú principal mostrado
🎮 Mostrando selección de modo de juego...
✅ Pantalla de selección de modo mostrada
🤖 Seleccionado: Contra la Máquina
🎮 Iniciando nuevo juego...
✅ GameController creado
✅ UIManager creado
✅ Juego inicializado correctamente
📊 Modo de juego: 🤖 Contra la Máquina
```

---

## 📊 Checklist de Implementación

- [x] GameModeView creada
- [x] gamemode.css creado
- [x] Método showGameModeSelection() en main.js
- [x] Método onGameModeSelected() en main.js
- [x] Método backToMenuFromGameMode() en main.js
- [x] Método startGame() actualizado
- [x] Integración con MenuController
- [x] Eventos conectados correctamente
- [x] CSS incluido en index.html
- [x] Sin errores en build

---

## 🎯 Próximas Pruebas

Una vez que se implementen RF05 (Tablero) y RF07 (Flota), se podrán hacer pruebas más completas:

- [ ] Verificar que modo 'ai' muestra IA en tablero enemigo
- [ ] Verificar que modo 'local' espera segundo jugador
- [ ] Pruebas de colocación de barcos según modo
- [ ] Pruebas de gameplay según modo

---

**Última Actualización:** Noviembre 6, 2025  
**Funcionalidad:** Selección de Modo de Juego  
**Status:** ✅ COMPLETADA
