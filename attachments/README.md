# SKYNET - La Resistencia de Venezuela

Plataforma SaaS para la coordinación, recaudación de fondos y organización de la resistencia venezolana.

## 🚀 Stack Tecnológico

- **Backend**: FastAPI + SQLAlchemy
- **Frontend**: HTML/CSS/JS (Vanilla)
- **Database**: PostgreSQL (producción) / SQLite (desarrollo)
- **Auth**: JWT
- **Deploy**: Render
- **Blockchain**: Ethereum (Smart Contracts)
- **Pagos**: Stripe, Binance, Bitcoin, Pago Móvil

## 📁 Estructura del Proyecto

```
skynet/
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── models.py               # SQLAlchemy models
│   ├── database.py             # DB config
│   ├── api/
│   │   ├── auth.py             # Authentication
│   │   ├── donations.py        # Donations
│   │   ├── users.py            # User profiles
│   │   ├── news.py             # News/Blog
│   │   ├── forum.py            # Forum
│   │   ├── admin.py            # Admin panel
│   │   └── trader.py           # Trader bot
│   ├── services/
│   │   ├── payment_service.py  # Payment processing
│   │   ├── email_service.py    # Email sending
│   │   └── crypto_service.py   # Crypto handling
│   ├── smart_contracts/
│   │   └── transparency.sol    # Smart contracts
│   ├── requirements.txt
│   ├── .env.example
│   └── seed_data.py
│
├── frontend/
│   ├── public/
│   │   ├── index.html          # Landing (SpaceX style)
│   │   ├── registro.html       # Registration
│   │   ├── login.html          # Login
│   │   ├── donaciones.html     # Donations
│   │   ├── noticias.html       # News
│   │   ├── foro.html           # Forum
│   │   ├── trader.html         # Trader bot
│   │   ├── panel.html          # Admin panel
│   │   ├── lider.html          # Leader info
│   │   ├── css/
│   │   │   ├── styles.css
│   │   │   ├── animations.css
│   │   │   └── responsive.css
│   │   └── js/
│   │       ├── api.js
│   │       ├── auth.js
│   │       ├── face-id.js
│   │       └── utils.js
│   └── assets/
│       ├── images/
│       ├── videos/
│       └── logo.svg
│
├── docker-compose.yml
├── Dockerfile
├── render.yaml                 # Render deployment config
├── .gitignore
├── .env.example
└── README.md
```

## 🛠️ Setup Local

### Requisitos
- Python 3.11+
- PostgreSQL (opcional, usa SQLite por defecto)
- Node.js (opcional, solo para build tools)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/rogerhernandzzz/skynet.git
cd skynet
```

2. **Crear entorno virtual**
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus valores
```

5. **Iniciar base de datos**
```bash
# FastAPI crea las tablas automáticamente al iniciar
python main.py
```

6. **Acceder a la aplicación**
- Frontend: http://localhost:5000
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

## 📚 API Endpoints

### Auth
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verificar email
- `POST /api/auth/forgot-password` - Recuperar contraseña

### News
- `GET /api/news` - Obtener noticias
- `POST /api/news` - Crear noticia (admin)

### Forum
- `GET /api/forum` - Obtener posts
- `POST /api/forum` - Crear post (pseudonimizado)

### Donations
- `GET /api/donations/stats` - Estadísticas
- `POST /api/donations/create` - Crear donación

### Leader
- `GET /api/leader` - Info del líder
- `PUT /api/leader` - Actualizar (admin)

### Trader Bot
- `GET /api/trader/sim` - Simulación de trading

### Crypto LUZ
- `GET /api/crypto/luz` - Info de moneda

### Smart Contracts
- `GET /api/contracts/transparency` - Contrato de transparencia

## 🌐 Deploy a Render

### Opción 1: Automático (Recomendado)

1. Conectar tu GitHub a Render
2. Crear nuevo servicio web desde `render.yaml`
3. Render desplegará automáticamente

### Opción 2: Manual

```bash
# Instalar Render CLI
npm install -g render-cli

# Deployar
render deploy

# El dominio será: vamosportidiosdado.onrender.com
```

### Variables de Entorno en Render

En Render Dashboard, agregar:
- `DATABASE_URL` - PostgreSQL string
- `JWT_SECRET` - Clave secreta
- `STRIPE_API_KEY` - Stripe key
- `STRIPE_WEBHOOK_KEY` - Webhook key
- etc...

## 📱 Features Principales

### 1. **Landing Page (SpaceX Style)**
- Hero section con video
- Información de resistencia
- Cards de características
- Info del líder
- CTA para registro

### 2. **Autenticación Segura**
- Registro con cédula + datos
- Login con JWT
- Face ID (local, no almacenado)
- Verificación email

### 3. **Donaciones**
- Stripe (tarjeta de crédito)
- Bitcoin
- Binance
- Pago Móvil (Venezuela)
- Dashboard de estadísticas

### 4. **Blog/Noticias Real-time**
- Posts creados por admin
- Timestamped
- Imágenes
- SEO optimizado

### 5. **Foro Pseudonímico**
- Posts con pseudónimo
- Datos reales encriptados
- Likes/comentarios
- Sistema de reputación

### 6. **Panel Admin (Roger)**
- Crear noticias
- Gestionar usuarios
- Ver donaciones
- Analytics
- Actualizar info del líder

### 7. **Trader Bot (Educativo)**
- Simulación sin dinero real
- Aprendizaje de trading
- Histórico de trades
- ROI calculator

### 8. **Criptomoneda LUZ**
- 20M tokens
- Smart contract en Ethereum
- Transparencia 100%
- Compra directa

### 9. **Smart Contracts**
- Contrato de transparencia
- Auditoría en blockchain
- Verificable públicamente
- Gas-optimizado

## 🔐 Seguridad

- ✅ JWT con expiración
- ✅ Password hashing con Werkzeug
- ✅ CORS configurado
- ✅ Rate limiting (agregar soon)
- ✅ SQL injection prevention (SQLAlchemy)
- ✅ XSS protection
- ✅ HTTPS en producción
- ✅ Face ID local (no enviado a servidor)

## 📊 Desarrollo Futuro (Roadmap)

**Fase 2:**
- [ ] Agregar rate limiting
- [ ] Webhooks de Stripe completos
- [ ] Bitcoin node integration
- [ ] SMS alerts via Twilio
- [ ] Telegram bot
- [ ] Dashboard analytics avanzado
- [ ] Email campaigns automáticas

**Fase 3:**
- [ ] Mobile app (React Native)
- [ ] VoIP integration
- [ ] Video conferencing
- [ ] Encrypted messaging
- [ ] Offline-first support
- [ ] AI chatbot assistant

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto bajo licencia MIT.

## 📧 Contacto

**Líder del Proyecto**: Roger Hernández
- Telegram: https://t.me/rogerhernandzzz
- Email: roger@skynet.resist
- WhatsApp: [número privado]

## ⚠️ Legal

Skynet es una plataforma de organización política legítima dedicada a la resistencia pacífica contra la dictadura venezolana. Todas las funciones cumplen con leyes de privacidad y transparencia.

---

**Vamos por la libertad de Venezuela** 🇻🇪
