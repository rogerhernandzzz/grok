# 🚀 SETUP VPS LOCAL - SKYNET

**Objetivo:** Ejecutar Skynet completamente en tu PC (VPS local) con PostgreSQL, Redis y Celery.

---

## **PASO 1: CLONAR REPOSITORIO**

```bash
cd ~/
git clone https://github.com/rogerhernandzzz/skynet.git
cd skynet
```

---

## **PASO 2: INSTALAR POSTGRESQL**

### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS:
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Windows:
- Descargar: https://www.postgresql.org/download/windows/
- Instalar con password: `postgres`

---

## **PASO 3: CREAR BASE DE DATOS**

```bash
sudo -u postgres psql

CREATE DATABASE skynet_db;
CREATE USER skynet_user WITH PASSWORD 'skynet_password123';
ALTER ROLE skynet_user SET client_encoding TO 'utf8';
ALTER ROLE skynet_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE skynet_user SET default_transaction_deferrable TO on;
ALTER ROLE skynet_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE skynet_db TO skynet_user;
\q
```

---

## **PASO 4: INSTALAR REDIS**

### Ubuntu/Debian:
```bash
sudo apt-get install redis-server -y
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### macOS:
```bash
brew install redis
brew services start redis
```

### Windows:
- Opción 1: WSL2 + Ubuntu + Redis
- Opción 2: Docker: `docker run -d -p 6379:6379 redis`

---

## **PASO 5: INSTALAR PYTHON & DEPENDENCIAS**

```bash
# Crear virtual environment
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt
```

---

## **PASO 6: CONFIGURAR .env**

Crear archivo `.env` en raíz del proyecto:

```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://skynet_user:skynet_password123@localhost:5432/skynet_db
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
SECRET_KEY=tu_secret_key_aqui_cambiar
EOF
```

---

## **PASO 7: INICIALIZAR BASE DE DATOS**

```bash
python init_db.py  # (Crearás este archivo)
```

---

## **PASO 8: EJECUTAR SERVIDOR**

### Terminal 1 - FastAPI:
```bash
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2 - Celery Worker:
```bash
source venv/bin/activate
celery -A celery_app worker --loglevel=info
```

### Terminal 3 - Celery Beat (scheduler):
```bash
source venv/bin/activate
celery -A celery_app beat --loglevel=info
```

---

## **PASO 9: ACCEDER**

```
Localmente:     http://localhost:8000
Desde otra PC:  http://tu-ip-local:8000
                Ejemplo: http://192.168.1.100:8000
```

---

## **PASO 10: NGINX REVERSO PROXY (Opcional)**

```bash
sudo apt-get install nginx

# Config: /etc/nginx/sites-available/skynet

sudo nano /etc/nginx/sites-available/skynet
```

Agregar:
```nginx
server {
    listen 80;
    server_name tu-ip-local;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Activar:
```bash
sudo ln -s /etc/nginx/sites-available/skynet /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

---

## **PASO 11: FIREWALL (Opcional)**

```bash
sudo ufw allow 8000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 5432/tcp  # PostgreSQL
sudo ufw allow 6379/tcp  # Redis
```

---

## **VERIFICAR TODO FUNCIONA**

```bash
# PostgreSQL
psql -U skynet_user -d skynet_db -c "SELECT 1;"

# Redis
redis-cli ping  # Debe responder: PONG

# FastAPI
curl http://localhost:8000/health
# Debe responder: {"status":"ok",...}
```

---

## **SOLUCIONAR PROBLEMAS**

### PostgreSQL falla:
```bash
sudo systemctl status postgresql
sudo journalctl -u postgresql -n 50
```

### Redis falla:
```bash
redis-cli
PING  # Debe responder PONG
```

### FastAPI no inicia:
```bash
python main.py  # Ver error exacto
```

### Celery falla:
```bash
celery -A celery_app inspect active
```

---

## **PRÓXIMOS PASOS**

1. ✅ Guardar en GitHub con cambios PostgreSQL
2. ✅ Agregar cronjobs para mantenimiento
3. ✅ Configurar backups PostgreSQL
4. ✅ SSL/HTTPS con Let's Encrypt

---

**Estado:** 🟢 READY TO DEPLOY

**Tiempo estimado:** 30-45 minutos
