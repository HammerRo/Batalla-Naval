# 🚀 INICIO RÁPIDO - Sistema de Autenticación RF01

## ⚡ 5 Minutos para Empezar

### Paso 1: Iniciar el Servidor (1 min)

Elige una opción:

```bash
# Opción A: VS Code Live Server (Recomendado)
1. Clic derecho en index.html
2. "Open with Live Server"
3. Abre http://localhost:5500

# Opción B: Python
python -m http.server 8000
# Abre http://localhost:8000

# Opción C: Node.js
npx http-server
# Abre http://localhost:8080
```

### Paso 2: Ver Pantalla de Login (Automático)

Al cargar la página verás:
```
⚓ Batalla Naval
[Iniciar Sesión] [Registrarse]

Usuario: ___
Contraseña: ___

[Iniciar Sesión]
        o
[👤 Jugar como Invitado]
```

### Paso 3: Probar (4 minutos)

#### Test 1: Registrarse (1 min)
```
1. Pestaña: "Registrarse"
2. Usuario: "prueba_user"
3. Contraseña: "1234"
4. Click: "Crear Cuenta"
✓ Verás el nombre en el header
```

#### Test 2: Jugar como Invitado (1 min)
```
1. Recargar página (F5)
2. Click: "👤 Jugar como Invitado"
✓ Verás "Invitado_XXXX" en header
✓ Las stats NO se guardan
```

#### Test 3: Volver a Iniciar Sesión (1 min)
```
1. Recargar página (F5)
2. Usuario: "prueba_user"
3. Contraseña: "1234"
4. Click: "Iniciar Sesión"
✓ Tus datos se mantuvieron
```

#### Test 4: Ver Datos (1 min)
```
1. Abre consola: F12
2. Escribe: window.game.user
3. Ver todos los datos guardados
```

---

## 🎮 Flujos Principales

### Flujo 1: Nuevo Usuario
```
App → Login → Registrarse → Usuario: "juan" → Pass: "1234" 
→ Create → ✓ Loguea automático → Juega
```

### Flujo 2: Usuario Existente
```
App → Login → Usuario: "juan" → Pass: "1234" → Login → ✓ Acceso
```

### Flujo 3: Invitado
```
App → Login → "Jugar como Invitado" → ✓ Acceso inmediato
```

---

## ✅ Validaciones Automáticas

| Campo | Error |
|-------|-------|
| Usuario < 3 caracteres | ❌ "Usuario debe tener 3+ caracteres" |
| Usuario duplicado | ❌ "Usuario ya existe" |
| Contraseña < 4 caracteres | ❌ "Contraseña debe tener 4+ caracteres" |
| Credenciales incorrectas | ❌ "Usuario o contraseña incorrectos" |

---

## 💾 Dónde se Guardan los Datos

**Todos se guardan en localStorage del navegador:**

```javascript
// Ver en consola (F12):
console.table(JSON.parse(localStorage.getItem('batalla-naval-users')))
console.table(JSON.parse(localStorage.getItem('batalla-naval-user')))
```

**Estructura:**
```json
{
  "id": "1234567890",
  "username": "juan_perez",
  "gamesPlayed": 3,
  "gamesWon": 2,
  "averageShots": 25.5
}
```

---

## 🔄 Persistencia de Datos

- ✅ **Sesión persiste**: F5 = mantienes login
- ✅ **Datos persisten**: Cierres el navegador = vuelven
- ✅ **Otros usuarios**: Diferentes navegadores = datos separados
- ✅ **Invitados**: No se guardan datos

---

## 🆘 Troubleshooting Rápido

### "No veo pantalla de login"
```
✓ ¿Desde servidor local? (http://localhost)
✓ Abre DevTools: F12
✓ Ve a Console y busca errores rojos
✓ Recarga: Ctrl+F5
```

### "Olvidé la contraseña"
```
✓ No hay recuperación (sistema educativo)
✓ Solución: Abre DevTools → Application → localStorage
✓ Busca "batalla-naval-users" y edita/borra el usuario
✓ Recarga la página
```

### "Se perdieron mis datos"
```
✓ Verifica: DevTools → Application → localStorage
✓ Si existen "batalla-naval-*" = datos aún están ahí
✓ Abre consola: localStorage.clear()
✓ Recarga: F5
```

### "Quiero empezar de cero"
```
// Consola (F12):
localStorage.removeItem('batalla-naval-users');
localStorage.removeItem('batalla-naval-user');
location.reload();
```

---

## 📊 Qué Pasa Después del Login

### 1. Aparece tu nombre
```
Header: "⚓ Batalla Naval        👤 juan_perez 📊 V: 2/3"
```

### 2. Puedes jugar
```
Se oculta panel de barcos
Se habilita tablero enemigo
Comienza el juego
```

### 3. Estadísticas se guardan
```
Al terminar partida:
- +1 a "gamesPlayed"
- +1 a "gamesWon" (si ganaste)
- Se calcula promedio de disparos
```

---

## 🎯 Casos de Uso

### Caso 1: Soy nuevo jugador
```
1. Click "Registrarse"
2. Usuario: "mi_usuario"
3. Contraseña: "mi_contraseña"
4. ¡A jugar!
5. Mis datos se guardan automáticamente
```

### Caso 2: Volví a jugar
```
1. Usuario: "mi_usuario"
2. Contraseña: "mi_contraseña"
3. ¡Mi historial está ahí!
```

### Caso 3: Solo quiero jugar
```
1. Click "Jugar como Invitado"
2. ¡Juega sin registrarte!
3. Tus datos NO se guardan
```

---

## 🔐 Seguridad Importante

⚠️ **Este es un sistema EDUCATIVO**

**Nunca uses:**
- Contraseñas reales
- Información personal
- Datos sensibles

**En producción:**
- Usa servidor con HTTPS
- Cifra contraseñas con bcrypt
- Usa base de datos
- Implementa JWT tokens

---

## 📁 Archivos Principales

```
src/
├── js/
│   ├── services/
│   │   └── AuthService.js        ← Toda la lógica
│   ├── views/
│   │   ├── LoginScreen.js        ← Pantalla login
│   │   └── UIManager.js          ← Mostrar usuario
│   └── main.js                   ← Integración
└── css/
    └── login.css                 ← Estilos
```

---

## 📱 Funciona en

- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile (iPhone, Android)
- ✅ Tablet (iPad, Android tablets)

---

## 🎨 Personalizar Colores

Edit `src/css/login.css`:

```css
/* Línea 15: Cambiar gradiente */
.login-screen {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* Cambiar a: */
    background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
}

/* Línea 156: Cambiar color de botón */
.btn--primary {
    background: var(--color-primary);
    /* Cambiar color en variables.css */
}
```

---

## 🧪 Ejecutar Pruebas

```javascript
// Abre consola (F12) y copia:
import { AuthenticationTests } from './PRUEBAS-RF01.js';
const tests = new AuthenticationTests();
tests.runAll();

// O simplemente ejecuta: PRUEBAS-RF01.js en el navegador
```

---

## 📞 Ayuda Rápida

| Pregunta | Respuesta |
|----------|-----------|
| ¿Dónde está mi usuario? | Console (F12) → `window.game.user` |
| ¿Dónde se guardan datos? | localStorage en DevTools |
| ¿Puedo cambiar contraseña? | No (educativo), borra y registra de nuevo |
| ¿Puedo usar desde otro PC? | No, está en tu navegador nada más |
| ¿Cuánto espacio tengo? | ~5-10 MB en localStorage |
| ¿Se ven mis datos en internet? | No, están solo en tu PC |

---

## 🚀 Próximo Paso

1. **Inicia el servidor** (arriba ⬆️)
2. **Abre la app** en navegador
3. **Regístrate o sé invitado**
4. **¡Juega Batalla Naval!**

---

## 📚 Documentación Completa

Para detalles técnicos:
- `RF01-AUTENTICACION.md` - Especificación completa
- `GUIA-RF01.md` - Manual detallado
- `EJEMPLO-AUTENTICACION.js` - Ejemplos de código
- `PRUEBAS-RF01.js` - Tests automatizados

---

**¡Listo para jugar! 🎮**

¿Preguntas? Abre la consola (F12) y revisa los logs.
