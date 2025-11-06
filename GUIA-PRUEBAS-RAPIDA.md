# 🧪 Guía de Pruebas Rápida - Batalla Naval

**Objetivo:** Verificar que todo funciona correctamente con la nueva selección de modo de juego.

---

## 🚀 Cómo Probar

### Paso 1: Iniciar el Servidor

#### Opción A: VS Code Live Server
1. Abre la carpeta del proyecto en VS Code
2. Click derecho en `index.html`
3. Selecciona "Open with Live Server"
4. Se abre automáticamente en `http://localhost:5500`

#### Opción B: Python
```bash
cd c:\Users\hamme\OneDrive\Documentos\GitHub\Batalla-Naval
python -m http.server 8000
# Abre http://localhost:8000 en tu navegador
```

#### Opción C: Node.js
```bash
cd c:\Users\hamme\OneDrive\Documentos\GitHub\Batalla-Naval
npx http-server
# Abre http://127.0.0.1:8080 en tu navegador
```

---

## ✅ Prueba 1: Flujo Completo (5 min)

### Pasos:

1. **Abre el juego**
   - Debe aparecer pantalla de login

2. **Prueba Login**
   - Usuario: `admin`
   - Contraseña: `123456`
   - Click "Iniciar Sesión"
   - Debe ir a Menú Principal

3. **Verifica Menú**
   - Se debe ver: "👤 admin" o "👤 Modo Invitado"
   - 3 botones visibles: Juego, Configuración, Ayuda
   - Botón "🚪 Cerrar Sesión"

4. **Click en Juego**
   - Aparece pantalla con 2 tarjetas
   - 🤖 Contra la Máquina
   - 👥 Contra un Amigo
   - Botón "🔙 Volver al Menú"

5. **Selecciona Modo**
   - Click en "Contra la Máquina"
   - Debe ir a la pantalla de juego
   - Abre Console (F12) y verifica: `window.game.mode === 'ai'`

6. **Vuelve atrás**
   - Aún en pantalla de juego, haz click en el menú (si hay botón)
   - O recarga la página y vuelve a hacer login

### ✅ Resultado Esperado:
- ✅ Login funciona
- ✅ Menú muestra usuario
- ✅ Selección de modo aparece
- ✅ Juego se inicia con modo

---

## ✅ Prueba 2: Modo Invitado (3 min)

### Pasos:

1. **Abre el juego**
   - Aparece pantalla de login

2. **Click en "Jugar como Invitado"**
   - Debe ir directo a Menú Principal
   - Badge debe decir "👤 Modo Invitado" (naranja)

3. **Click en Juego**
   - Aparece selección de modo
   - Las dos opciones están disponibles

4. **Selecciona "Contra un Amigo"**
   - Debe ir a juego
   - Console: `window.game.mode === 'local'`

### ✅ Resultado Esperado:
- ✅ Modo Invitado funciona
- ✅ Badge diferenciado (naranja)
- ✅ Selección de modo disponible
- ✅ Modo 'local' se propaga

---

## ✅ Prueba 3: Responsividad (2 min por tamaño)

### Desktop (> 768px):

1. Abre el juego a pantalla completa
2. Click en Juego
3. Deberías ver 2 tarjetas lado a lado
4. Redimensiona a 1200px, 1000px, 800px
5. Tarjetas deben mantenerse lado a lado

### Tablet (768px - 480px):

1. Redimensiona a 768px
2. Click en Juego
3. Deberías ver tarjetas apiladas (1 columna)
4. Redimensiona a 600px, 500px
5. Sigue siendo legible

### Móvil (< 480px):

1. Redimensiona a 480px
2. Click en Juego
3. Tarjetas optimizadas para móvil
4. Botones accesibles
5. Redimensiona a 400px, 320px
6. Sigue siendo funcional

### ✅ Resultado Esperado:
- ✅ Desktop: 2 columnas
- ✅ Tablet: 1 columna
- ✅ Móvil: Optimizado
- ✅ Sin overflow horizontal

---

## ✅ Prueba 4: Navegación Atrás (2 min)

### Pasos:

1. Login
2. Menú Principal visible
3. Click en Juego
4. Selección de Modo visible
5. Click en "🔙 Volver al Menú"
6. **Debe volver a Menú Principal**

7. Click nuevamente en Juego
8. Selección de Modo debe volver a aparecer

### ✅ Resultado Esperado:
- ✅ Vuelve al menú sin problemas
- ✅ Sin errores en console
- ✅ Puede repetir el ciclo infinitas veces

---

## 🔍 Verificación en Console (F12)

### Abre Developer Tools:
```
Presiona F12 en el navegador
Pestaña "Console"
```

### Busca estos logs:

✅ **Al iniciar:**
```
🚢 Inicializando Batalla Naval...
📝 Mostrando pantalla de login...
```

✅ **Al hacer login:**
```
✅ Usuario autenticado: admin
📋 Mostrando menú principal...
✅ Menú principal mostrado
```

✅ **Al hacer click en Juego:**
```
🎮 Mostrando selección de modo de juego...
✅ Pantalla de selección de modo mostrada
```

✅ **Al seleccionar modo:**
```
🤖 Seleccionado: Contra la Máquina
[O]
👥 Seleccionado: Contra un Amigo

🎮 Iniciando nuevo juego...
✅ GameController creado
✅ UIManager creado
✅ Juego inicializado correctamente
📊 Modo de juego: 🤖 Contra la Máquina
[O]
📊 Modo de juego: 👥 Contra un Amigo
```

### No debe haber:
❌ Errores en rojo  
❌ Undefined variables  
❌ Mensajes de error

---

## 🎨 Verificación Visual

### Colores Esperados:

| Elemento | Color |
|----------|-------|
| Fondo Login | Gradiente Azul-Morado |
| Fondo Menú | Gradiente Azul-Morado |
| Fondo Selección | Gradiente Azul-Morado |
| Badge Usuario | Azul-Morado |
| Badge Invitado | Naranja |
| Tarjeta AI | Borde izquierdo Azul |
| Tarjeta Local | Borde izquierdo Morado |
| Botón Logout | Rojo |
| Botón Volver | Gris |

### Elementos Visibles:

- ✅ Título "⚓ Batalla Naval"
- ✅ Iconos (👤, 🎮, ⚙️, ❓, 🤖, 👥, 🚪, 🔙)
- ✅ Texto legible
- ✅ Botones con hover effect
- ✅ Animaciones suaves

---

## 🧪 Checklist de Pruebas

### Funcionalidad

- [ ] Login funciona
- [ ] Modo Invitado funciona
- [ ] Menú muestra usuario/invitado
- [ ] Click Juego muestra selección
- [ ] Seleccionar AI inicia juego
- [ ] Seleccionar Local inicia juego
- [ ] Volver al Menú funciona
- [ ] Ciclo repetible

### Visual

- [ ] Colores correctos
- [ ] Iconos visibles
- [ ] Texto legible
- [ ] Botones accesibles
- [ ] Animaciones suaves
- [ ] Hover effects funcionan

### Responsividad

- [ ] Desktop funciona
- [ ] Tablet funciona
- [ ] Móvil funciona
- [ ] Sin overflow
- [ ] Legible en todos los tamaños

### Console

- [ ] Sin errores
- [ ] Sin undefined
- [ ] Logs esperados presentes
- [ ] Sin mensajes de error

### Performance

- [ ] Carga rápida
- [ ] Transiciones suaves
- [ ] Sin lag/stuttering
- [ ] Clics responsivos

---

## 🐛 Solución de Problemas

### Problema: Pantalla en blanco
**Solución:**
- Abre Console (F12)
- Busca errores en rojo
- Revisa que index.html esté en la raíz
- Verifica que los archivos CSS/JS existan

### Problema: Botones no responden
**Solución:**
- Abre Console y busca errores
- Verifica que JavaScript esté habilitado
- Intenta recargar la página (Ctrl+F5)
- Limpia cache (Ctrl+Shift+Delete)

### Problema: Estilos incorrectos
**Solución:**
- Verifica que gamemode.css esté enlazado en index.html
- Limpia cache del navegador
- Verifica que los archivos CSS sean accesibles

### Problema: Modo no se propaga
**Solución:**
- Abre Console
- Ejecuta: `window.game.mode`
- Debe mostrar 'ai' o 'local'
- Si no existe, revisa logs de error

---

## 📊 Reportar Resultados

### Template de Reporte

```
✅ PRUEBA COMPLETADA

Navegador: [Chrome/Firefox/Edge]
Dispositivo: [Desktop/Tablet/Móvil]
Tamaño: [1920x1080 / 768x1024 / 375x667]

Funcionalidad:
- [ ] Login: ✅ / ⚠️ / ❌
- [ ] Menú: ✅ / ⚠️ / ❌
- [ ] Selección: ✅ / ⚠️ / ❌
- [ ] Modos: ✅ / ⚠️ / ❌

Visual:
- [ ] Colores: ✅ / ⚠️ / ❌
- [ ] Responsivo: ✅ / ⚠️ / ❌
- [ ] Animaciones: ✅ / ⚠️ / ❌

Performance:
- [ ] Carga rápida: ✅ / ⚠️ / ❌
- [ ] Transiciones suaves: ✅ / ⚠️ / ❌

Notas:
[Agregar cualquier observación]
```

---

## 📝 Notas Importantes

1. **Datos Persistentes**
   - Los usuarios se guardan en localStorage
   - Puedes crear múltiples cuentas
   - Los datos persisten entre sesiones

2. **Modo Invitado**
   - No requiere credenciales
   - Úsalo para probar rápido
   - Se reinicia cada sesión

3. **Selección de Modo**
   - Es obligatoria (no hay valor por defecto)
   - Se propaga a GameController
   - Se mantiene durante la partida

4. **Console Logs**
   - Muy útiles para debugging
   - Mantén F12 abierto durante pruebas
   - Busca errores en rojo

---

## 🎓 Tips para Probar

1. **Prueba en diferentes navegadores**
   - Chrome
   - Firefox
   - Edge
   - Safari (si tienes acceso)

2. **Prueba en diferentes tamaños**
   - 1920x1080 (Desktop)
   - 1280x720 (Desktop)
   - 768x1024 (Tablet)
   - 375x667 (Móvil iPhone)
   - 420x900 (Móvil Android)

3. **Prueba flujos alternativos**
   - Login normal
   - Modo Invitado
   - Múltiples ciclos
   - Volver atrás

4. **Verifica Console constantemente**
   - Busca errores
   - Verifica logs esperados
   - Comprueba valores de variables

---

## ✨ Conclusión

Con esta guía puedes validar completamente la funcionalidad de:
- ✅ Autenticación (RF01)
- ✅ Menú Principal (RF02)
- ✅ Selección de Modo (Nuevo)

**Tiempo estimado:** 15-20 minutos para todas las pruebas

¡Buen testing! 🎮

---

**Versión:** 1.0  
**Fecha:** Noviembre 6, 2025  
**Actualizado:** Noviembre 6, 2025
