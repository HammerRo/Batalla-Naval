# 🧪 Pruebas RF02 - Menú Principal

## Checklist de Validación RF02

**Objetivo:** Validar que el menú principal se muestre correctamente después del login con 3 botones (Juego, Configuración, Ayuda) y que se muestre el usuario correspondiente o "Modo Invitado".

---

## ✅ Prueba 1: Login Exitoso + Menú

### Pasos:
1. Abre `index.html` en el navegador
2. Completa el login con usuario y contraseña válidos
3. Verifica que se muestre el menú principal

### Resultados Esperados:
- ✅ Pantalla de login desaparece
- ✅ Menú principal se muestra con animación
- ✅ Se muestra "👤 [username]" en la parte superior
- ✅ Los 3 botones son visibles: 🎮 Juego, ⚙️ Configuración, ❓ Ayuda

---

## ✅ Prueba 2: Modo Invitado

### Pasos:
1. Abre `index.html` en el navegador
2. Haz clic en el botón "Jugar como Invitado"
3. Verifica que se muestre el menú principal

### Resultados Esperados:
- ✅ Pantalla de login desaparece
- ✅ Menú principal se muestra
- ✅ Se muestra "👤 Modo Invitado" con badge naranja
- ✅ Los 3 botones funcionan normalmente

---

## ✅ Prueba 3: Botón Juego

### Pasos:
1. Completa el login (usuario o invitado)
2. Haz clic en el botón "🎮 Juego"

### Resultados Esperados:
- ✅ Menú desaparece
- ✅ Se muestra el tablero de juego
- ✅ Se inicializa GameController correctamente
- ✅ Console muestra "🎮 Iniciando nuevo juego..."

---

## ✅ Prueba 4: Botón Configuración

### Pasos:
1. Completa el login
2. Haz clic en el botón "⚙️ Configuración"

### Resultados Esperados:
- ✅ Se muestra mensaje "Configuración - Próximamente disponible"
- ✅ Al cerrar el mensaje, se vuelve al menú principal
- ✅ Console muestra "⚙️ Mostrando configuración..."

---

## ✅ Prueba 5: Botón Ayuda

### Pasos:
1. Completa el login
2. Haz clic en el botón "❓ Ayuda"

### Resultados Esperados:
- ✅ Se muestra mensaje "Ayuda - Próximamente disponible"
- ✅ Al cerrar el mensaje, se vuelve al menú principal
- ✅ Console muestra "❓ Mostrando ayuda..."

---

## ✅ Prueba 6: Botón Cerrar Sesión

### Pasos:
1. Completa el login
2. Haz clic en el botón "🚪 Cerrar Sesión"

### Resultados Esperados:
- ✅ Menú desaparece
- ✅ Se muestra la pantalla de login nuevamente
- ✅ Los datos del usuario se limpian
- ✅ Console muestra "👋 Cerrando sesión..."

---

## ✅ Prueba 7: Responsividad

### Pasos:
1. Completa el login
2. Redimensiona la ventana del navegador
3. Prueba en diferentes tamaños (desktop, tablet, móvil)

### Resultados Esperados:
- ✅ Menú se adapta correctamente en todos los tamaños
- ✅ Botones son tocables en móvil
- ✅ Texto se ajusta sin desbordamientos
- ✅ Badge de usuario se muestra correctamente

---

## ✅ Prueba 8: Estilo Visual

### Pasos:
1. Completa el login
2. Verifica los colores y estilos del menú

### Resultados Esperados:
- ✅ Fondo con gradiente azul/morado
- ✅ Botones con estilos diferenciados
- ✅ Badge de usuario con color diferente si es invitado
- ✅ Animaciones suaves al pasar mouse

---

## 🔍 Verificación en Consola

Abre la consola del navegador (F12) y verifica que aparezcan estos mensajes:

```
🚢 Inicializando Batalla Naval...
📝 Mostrando pantalla de login...
✅ Usuario autenticado: [username]
📋 Mostrando menú principal...
✅ Menú principal mostrado
```

---

## 📊 Estado de Implementación RF02

| Componente | Status |
|-----------|--------|
| MenuController.js | ✅ Completo |
| MenuView.js | ✅ Completo |
| menu.css | ✅ Completo |
| Integración main.js | ✅ Completo |
| Mostrar usuario | ✅ Completo |
| 3 Botones | ✅ Completo |
| Cerrar Sesión | ✅ Completo |
| Botón Juego | ✅ Funcional |
| Botón Configuración | ✅ Placeholder |
| Botón Ayuda | ✅ Placeholder |

---

## 🎯 Próximos Pasos

- [ ] Implementar pantalla de configuración (RF02 avanzado)
- [ ] Implementar pantalla de ayuda (RF02 avanzado)
- [ ] Agregar más temas de ayuda (FAQ, Controles, etc.)
- [ ] Agregar opciones de dificultad en configuración
- [ ] Agregar control de volumen en configuración

---

## 📝 Notas

- El menú usa localStorage implícitamente a través de AuthService
- Los botones de Configuración y Ayuda muestran placeholders por ahora
- El flujo de navegación es: Login → Menú → Juego o Logout
- Los estilos son completamente responsive

---

**Última Actualización:** Noviembre 6, 2024
**RF02 Status:** ✅ 100% Funcional (Básico)
