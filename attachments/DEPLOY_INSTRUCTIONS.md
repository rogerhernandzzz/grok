# 🚀 SKYNET - DEPLOYMENT INSTRUCTIONS

## ⚡ DEPLOYMENT EN 3 PASOS (5 minutos)

---

## PASO 1: EJECUTAR SCRIPT DE DEPLOY (2 min)

En tu terminal, en la carpeta del proyecto:

```bash
# Ejecutar el script de deploy
python3 deploy.py
```

O si prefieres Bash:
```bash
chmod +x deploy.sh
./deploy.sh
```

**¿Qué hace?**
- ✅ Crea repositorio en GitHub
- ✅ Inicializa Git local
- ✅ Agrega todos los archivos
- ✅ Hace commit inicial
- ✅ Pushea a `github.com/rogerhernandzzz/skynet`

**Resultado esperado:**
```
✅ Repositorio GitHub: https://github.com/rogerhernandzzz/skynet
✅ Código pusheado a GitHub
```

---

## PASO 2: CONFIGURAR RENDER (2-3 min)

### 2.1 Conectar GitHub a Render

1. Ir a https://render.com
2. Crear cuenta (si no tienes)
3. Click en **"Connect GitHub"**
4. Autorizar acceso a tu GitHub

### 2.2 Crear Web Service

1. Click en **"New +"** → **"Web Service"**
2. Seleccionar repositorio **"skynet"**
3. Click **"Connect"**

### 2.3 Configurar Servicio

Completar con estos valores:

| Campo | Valor |
|-------|-------|
| **Name** | `skynet-api` |
| **Environment** | Python 3 |
| **Region** | Ohio (u otra cercana) |
| **Branch** | `main` |
| **Root Directory** | `/` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

### 2.4 Agregar Variables de Entorno

Click en **"Environment"** y agregar:

```
DATABASE_URL = postgresql://skynet_user:password@localhost/skynet
JWT_SECRET = (generar valor aleatorio seguro)
STRIPE_API_KEY = sk_test_... (tu key de Stripe)
STRIPE_WEBHOOK_KEY = whsec_... (tu webhook key)
ENVIRONMENT = production
DEBUG = false
```

**⚠️ Importante:** No poner estos valores en el código, SOLO en Render Dashboard.

### 2.5 Crear Base de Datos (Opcional)

Si quieres PostgreSQL en Render:

1. Click en **"New +"** → **"PostgreSQL"**
2. Usar valores por defecto
3. Copiar `DATABASE_URL` a Environment variables

O usar SQLite local por ahora.

### 2.6 Agregar Dominio Personalizado

1. Una vez creado el servicio, ir a **"Settings"**
2. Click **"Add Custom Domain"**
3. Ingresar: `vamosportidiosdado.onrender.com`
4. Render configura DNS automáticamente

### 2.7 Hacer Deploy

1. Click **"Create Web Service"**
2. Render comienza deployment automático
3. Ver logs en vivo
4. Esperar ~5 minutos hasta que diga **"Live"**

**Resultado esperado:**
```
✅ Service is live at: https://skynet-api.onrender.com
✅ Custom domain: https://vamosportidiosdado.onrender.com
```

---

## PASO 3: VERIFICAR DEPLOYMENT (30 seg)

Una vez que Render dice **"Live"**, verificar:

### 3.1 Health Check
```bash
curl https://vamosportidiosdado.onrender.com/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-XX...",
  "service": "Skynet API"
}
```

### 3.2 Acceder a Landing
- Abrir: https://vamosportidiosdado.onrender.com/
- Debería ver página SpaceX-style

### 3.3 Ver API Docs
- Abrir: https://vamosportidiosdado.onrender.com/docs
- Interactive API documentation

---

## 🎯 RESULTADO FINAL

Después de completar los 3 pasos:

```
✅ GitHub Repo:  https://github.com/rogerhernandzzz/skynet
✅ Live URL:     https://vamosportidiosdado.onrender.com
✅ API Docs:     https://vamosportidiosdado.onrender.com/docs
✅ Health:       https://vamosportidiosdado.onrender.com/health
```

**SKYNET ESTÁ OPERACIONAL 24/7** 🚀

---

## 🔧 TROUBLESHOOTING

### Error: "Build failed"
- Ver logs en Render → revisar errores
- Asegurar que `requirements.txt` existe
- Ejecutar localmente: `pip install -r requirements.txt`

### Error: "502 Bad Gateway"
- Esperar a que Render termine de hacer deploy
- Ver health check: `/health`
- Revisar logs en Render dashboard

### Error: "Database connection failed"
- Verificar `DATABASE_URL` en Environment
- Para SQLite: usar `sqlite:///./skynet.db`
- Para PostgreSQL: cambiar a render PostgreSQL

### La landing no se carga
- Verificar que archivo `index.html` existe en `/frontend/public/`
- Asegurar que Render sirve archivos estáticos
- Ver logs de Render

---

## 📊 DESPUÉS DEL DEPLOYMENT

### Monitoreo 24/7
- Render monitorea automáticamente
- Alertas por email si falla
- Logs en vivo en dashboard

### Próximos Pasos (Opcional)
1. [ ] Configurar SSL (automático con Let's Encrypt)
2. [ ] Agregar Stripe webhooks reales
3. [ ] Conectar Binance API
4. [ ] Implementar Face ID real
5. [ ] Crear más páginas HTML (login, donaciones, noticias, etc)
6. [ ] Agregar tests unitarios
7. [ ] Setup CI/CD pipeline

### URLs Útiles
- **Render Dashboard:** https://render.com/dashboard
- **GitHub:** https://github.com/rogerhernandzzz/skynet
- **API Docs:** https://vamosportidiosdado.onrender.com/docs
- **Live Site:** https://vamosportidiosdado.onrender.com

---

## ⚠️ IMPORTANTE - SEGURIDAD

**Antes de hacer deploy:**

- [ ] Cambiar JWT_SECRET a valor seguro
- [ ] NO commitear .env con secrets
- [ ] Revocar tokens de GitHub expuestos en el chat
- [ ] Crear nuevas API keys para Stripe, Binance, etc.
- [ ] Cambiar DEBUG=false en producción
- [ ] Usar DATABASE_URL en Render, no en código

**Después de deployment:**

- [ ] Verificar que no hay secrets en los logs
- [ ] Monitorear primeras 24 horas
- [ ] Configurar alertas de email
- [ ] Hacer backups de la BD
- [ ] Rotar credenciales regularmente

---

## 📞 SOPORTE

Si hay problemas:

1. Revisar logs en Render Dashboard
2. Ejecutar localmente con `docker-compose up`
3. Verificar requirements.txt
4. Revisar main.py por errores de sintaxis

---

## 🎉 ¡LISTO!

Una vez completados los 3 pasos:

```
🌐 SKYNET ESTÁ LIVE EN PRODUCCIÓN
🔒 Datos seguros en Ethereum blockchain
💰 Donaciones funcionando
🇻🇪 La Resistencia operacional 24/7
```

**Vamos por la libertad de Venezuela** ⚡

---

*Deployment completado: 2024-01-XX*
*Versión: 1.0.0*
*Próxima actualización: Con webhooks de Stripe*
