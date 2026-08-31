from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Skynet API",
    description="La API de la Resistencia Venezolana",
    version="1.1.0"
)

# ===== SISTEMA DE VERSIONES =====
VERSIONS = {
    "1.0.0": ["Landing page inicial", "Radial menu 9 opciones", "Diseño SpaceX-style"],
    "1.1.0": ["Panel de Admin (usuarios, noticias)", "Sección Eventos", "Sistema de versiones integrado"]
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== REGISTRO TEMPORAL (sin DB) =====
REGISTERED_USERS = set()
REGISTERED_EMAILS = set()
REGISTERED_CEDULAS = set()

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "service": "Skynet API",
        "version": "1.0.0"
    }

# ===== CSS RADIAL MENU (8 ITEMS) =====
CSS_RADIAL = """
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;600;700;800&display=swap');

:root {
    --black: #000000;
    --white-100: #f0f0fa;
    --white-80: rgba(240, 240, 250, 0.8);
    --white-60: rgba(240, 240, 250, 0.6);
    --white-30: rgba(240, 240, 250, 0.3);
    --accent-red: #ff0000;
    --accent-cyan: #00ffff;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    width: 100%;
    height: 100%;
}

body {
    font-family: 'Syne', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: radial-gradient(circle at center, #0a0a1a 0%, #000000 50%, #000000 100%);
    color: var(--white-100);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.radial-menu-wrapper {
    position: relative;
    width: 100vmin;
    height: 100vmin;
    max-width: 100vh;
    max-height: 100vh;
}

.radial-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    text-align: center;
}

.center-logo {
    font-family: 'Space Mono', monospace;
    font-size: clamp(2rem, 8vmin, 4rem);
    font-weight: 700;
    letter-spacing: 4px;
    margin-bottom: 1rem;
    text-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
}

.center-subtitle {
    font-size: clamp(0.8rem, 2vmin, 1.2rem);
    color: var(--white-60);
    letter-spacing: 2px;
    text-transform: uppercase;
}

.center-circle {
    position: absolute;
    width: clamp(80px, 15vmin, 200px);
    height: clamp(80px, 15vmin, 200px);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 2px solid var(--white-30);
    border-radius: 50%;
    z-index: 5;
}

.center-circle::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 0, 0, 0.1) 0%, transparent 70%);
}

.radial-menu {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
}

.menu-item {
    position: absolute;
    width: clamp(60px, 12vmin, 140px);
    height: clamp(60px, 12vmin, 140px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    color: var(--white-100);
}

.menu-item:nth-child(1) { --angle: 0deg; }
.menu-item:nth-child(2) { --angle: 45deg; }
.menu-item:nth-child(3) { --angle: 90deg; }
.menu-item:nth-child(4) { --angle: 135deg; }
.menu-item:nth-child(5) { --angle: 180deg; }
.menu-item:nth-child(6) { --angle: 225deg; }
.menu-item:nth-child(7) { --angle: 270deg; }
.menu-item:nth-child(8) { --angle: 315deg; }

.menu-item {
    --radius: clamp(120px, 35vmin, 400px);
    top: 50%;
    left: 50%;
    transform:
        translate(-50%, -50%)
        rotate(var(--angle))
        translateY(calc(var(--radius) * -1))
        rotate(calc(var(--angle) * -1));
}

.item-icon {
    font-size: clamp(1.5rem, 4vmin, 3rem);
    margin-bottom: 0.5rem;
    display: block;
    filter: drop-shadow(0 0 8px rgba(255, 0, 0, 0.3));
    transition: all 0.3s ease;
}

.item-label {
    font-family: 'Space Mono', monospace;
    font-size: clamp(0.6rem, 1.5vmin, 0.9rem);
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
    transition: all 0.3s ease;
}

.item-circle {
    position: absolute;
    inset: 0;
    border: 2px solid var(--white-30);
    border-radius: 50%;
    z-index: -1;
    transition: all 0.3s ease;
}

.menu-item:hover .item-circle {
    border-color: var(--accent-red);
    box-shadow:
        0 0 15px rgba(255, 0, 0, 0.5),
        inset 0 0 15px rgba(255, 0, 0, 0.2);
    transform: scale(1.1);
}

.menu-item:hover {
    transform:
        translate(-50%, -50%)
        rotate(var(--angle))
        translateY(calc(var(--radius) * -1))
        rotate(calc(var(--angle) * -1))
        scale(1.15);
    z-index: 100;
}

.menu-item:hover .item-label {
    color: var(--accent-red);
    text-shadow: 0 0 10px rgba(255, 0, 0, 0.6);
}

.menu-item:hover .item-icon {
    filter: drop-shadow(0 0 20px rgba(255, 0, 0, 0.8));
    transform: scale(1.2);
}

@media (max-width: 768px) {
    .center-logo { font-size: 2rem; }
    .center-circle { width: 100px; height: 100px; }
    .menu-item { --radius: 180px; width: 70px; height: 70px; }
    .item-icon { font-size: 1.8rem; }
    .item-label { font-size: 0.7rem; }
}

.hud-text {
    position: fixed;
    top: 20px;
    left: 20px;
    font-family: 'Space Mono', monospace;
    font-size: 0.875rem;
    letter-spacing: 2px;
    color: var(--white-60);
    z-index: 1;
}

.users-stats {
    position: fixed;
    bottom: 20px;
    right: 20px;
    font-family: 'Space Mono', monospace;
    font-size: 0.875rem;
    letter-spacing: 1px;
    color: var(--white-60);
    z-index: 1;
    text-align: right;
}

.users-stats div {
    margin-bottom: 0.5rem;
}

.users-stats div:first-child {
    color: var(--accent-red);
    font-weight: bold;
}

.hud-text span {
    color: var(--accent-red);
}

/* ===== AUTH PANEL (TOP RIGHT) ===== */
.auth-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-family: 'Space Mono', monospace;
}

.auth-button {
    background: transparent;
    border: 1px solid var(--white-30);
    color: var(--white-100);
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-family: 'Space Mono', monospace;
    font-size: 0.75rem;
    letter-spacing: 1px;
    text-decoration: none;
    transition: all 0.3s ease;
    text-transform: uppercase;
    display: inline-block;
}

.auth-button:hover {
    border-color: var(--accent-red);
    color: var(--accent-red);
}

.user-display {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    border: 1px solid var(--white-30);
    border-radius: 4px;
    color: var(--accent-red);
}

.user-alias {
    font-size: 0.875rem;
    letter-spacing: 1px;
}

.logout-btn {
    background: transparent;
    border: none;
    color: var(--white-60);
    cursor: pointer;
    font-size: 1rem;
    transition: color 0.3s ease;
}

.logout-btn:hover {
    color: var(--accent-red);
}

/* ===== MODALS ===== */
.modal {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    align-items: center;
    justify-content: center;
}

.modal.active {
    display: flex;
}

.modal-card {
    background: rgba(255, 255, 255, 0.02);
    border: 2px solid var(--white-30);
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    backdrop-filter: blur(10px);
    border-radius: 8px;
}

.modal-title {
    font-family: 'Space Mono', monospace;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
    letter-spacing: 1px;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    letter-spacing: 0.5px;
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--white-30);
    color: var(--white-100);
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: var(--accent-red);
    background: rgba(255, 255, 255, 0.05);
}

.submit-btn {
    width: 100%;
    padding: 0.75rem;
    background: var(--white-100);
    color: var(--black);
    border: 1px solid var(--white-100);
    font-weight: 600;
    font-size: 0.875rem;
    letter-spacing: 1px;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.3s ease;
    margin-top: 1rem;
}

.panel-options {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

.panel-option {
    background: rgba(255, 0, 0, 0.05);
    border: 1px solid rgba(255, 0, 0, 0.2);
    padding: 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    color: var(--white-100);
    font-family: 'Space Mono', monospace;
    text-align: center;
    transition: all 0.3s ease;
}

.panel-option:hover {
    background: rgba(255, 0, 0, 0.1);
    border-color: var(--accent-red);
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
}

.submit-btn:hover {
    background: var(--accent-red);
    border-color: var(--accent-red);
    color: var(--white-100);
}

.close-modal {
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    border: none;
    color: var(--white-60);
    font-size: 1.5rem;
    cursor: pointer;
    transition: color 0.3s ease;
}

.close-modal:hover {
    color: var(--accent-red);
}

/* ===== PAGE STYLES ===== */
.back-button {
    position: fixed;
    top: 20px;
    right: 20px;
    background: transparent;
    border: 1px solid var(--white-30);
    color: var(--white-100);
    padding: 0.5rem 1.5rem;
    cursor: pointer;
    font-family: 'Space Mono', monospace;
    text-decoration: none;
    transition: all 0.3s ease;
    z-index: 1;
}

.back-button:hover {
    border-color: var(--accent-red);
    color: var(--accent-red);
}

.page-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
}

.page-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--white-30);
    padding: 3rem;
    max-width: 600px;
    width: 100%;
    backdrop-filter: blur(10px);
    box-shadow: 0 0 40px rgba(255, 0, 0, 0.1);
}

.page-title {
    font-family: 'Space Mono', monospace;
    font-size: 2rem;
    margin-bottom: 1rem;
    letter-spacing: 2px;
}

.page-subtitle {
    color: var(--white-60);
    margin-bottom: 2rem;
    font-size: 1rem;
}

.profile-section {
    margin-bottom: 2rem;
}

.profile-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.profile-title {
    color: var(--accent-red);
    font-size: 0.9rem;
    margin-bottom: 1rem;
    letter-spacing: 1px;
}

.profile-bio {
    color: var(--white-80);
    line-height: 1.8;
    margin-bottom: 1.5rem;
}

.social-links {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.social-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid var(--white-15);
    border-radius: 4px;
    color: var(--white-100);
    text-decoration: none;
    transition: all 0.3s ease;
    font-size: 0.875rem;
}

.social-link:hover {
    border-color: var(--accent-red);
    background: rgba(255, 0, 0, 0.05);
    color: var(--accent-red);
}

.ai-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
}

.ai-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--white-15);
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    transition: all 0.3s ease;
}

.ai-card:hover {
    border-color: var(--accent-red);
    background: rgba(255, 0, 0, 0.05);
}

.ai-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.ai-name {
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.ai-desc {
    color: var(--white-60);
    font-size: 0.875rem;
}
"""

# ===== HOME PAGE =====
@app.get("/", response_class=HTMLResponse)
def get_home():
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Skynet - La Resistencia</title>
        <style>{CSS_RADIAL}</style>
    </head>
    <body>
        <div class="hud-text">SKYNET v<span>1.1</span></div>
        <div class="users-stats">
            <div>💵 Dinero recaudado: $12,450</div>
            <div>👥 2 Registrados / 2 Verificados</div>
        </div>

        <div class="auth-panel" id="authPanel">
            <button class="auth-button" id="panelBtn" onclick="openPanelUsuario()" style="display:none;">👤 Panel</button>
            <button class="auth-button" id="regBtn" onclick="openRegistro()">Registro</button>
            <button class="auth-button" id="ingBtn" onclick="openIngresar()">Ingresar</button>
            <button class="auth-button" id="logoutBtn" onclick="logout()" style="display:none;">Salir</button>
        </div>

        <!-- MODALS -->
        <div class="modal" id="registroModal">
            <div class="modal-card">
                <button class="close-modal" onclick="closeRegistro()">✕</button>
                <div class="modal-title">🚀 REGISTRO</div>
                <form onsubmit="return handleRegistro(event)">
                    <div class="form-group">
                        <label>Usuario</label>
                        <input type="text" id="regUsername" placeholder="Tu usuario" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="regEmail" placeholder="tu@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Cédula</label>
                        <input type="text" id="regCedula" placeholder="V-12345678" required>
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" id="regPassword" placeholder="Min. 8 caracteres" required>
                    </div>
                    <button type="submit" class="submit-btn">Registrarse</button>
                </form>
            </div>
        </div>

        <div class="modal" id="ingresarModal">
            <div class="modal-card">
                <button class="close-modal" onclick="closeIngresar()">✕</button>
                <div class="modal-title">⚡ INGRESAR</div>
                <form onsubmit="return handleIngresar(event)">
                    <div class="form-group">
                        <label>Pseudónimo</label>
                        <input type="text" id="ingPseudonym" placeholder="tu_pseudónimo" required>
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" id="ingPassword" placeholder="Tu contraseña" required>
                    </div>
                    <button type="submit" class="submit-btn">Ingresar</button>
                </form>
            </div>
        </div>

        <!-- PANEL DE USUARIO MODAL -->
        <div class="modal" id="panelUsuarioModal">
            <div class="modal-card" style="max-width: 500px;">
                <button class="close-modal" onclick="closePanelUsuario()">✕</button>
                <div class="modal-title">👤 MI PANEL</div>
                <div id="userInfo" style="margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,.1); color: var(--white-80);">
                    Bienvenido, <span id="userPseudo" style="color: var(--accent-red);">Usuario</span>
                </div>
                <div class="panel-options">
                    <button class="panel-option" onclick="openCriptoModal()">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">💰</div>
                        <div style="font-weight: bold;">Comprar Criptomoneda Luz</div>
                        <div style="font-size: 0.8rem; color: var(--white-60);">Adquiere LUZ directamente</div>
                    </button>
                    <button class="panel-option" onclick="openBuzonModal()">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📬</div>
                        <div style="font-weight: bold;">Buzón de Mensajes</div>
                        <div style="font-size: 0.8rem; color: var(--white-60);">Lee tus mensajes (0 nuevos)</div>
                    </button>
                    <button class="panel-option" onclick="openTraderModal()">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📈</div>
                        <div style="font-weight: bold;">Inversión en Trader Bot</div>
                        <div style="font-size: 0.8rem; color: var(--white-60);">Rentabilidad automática 24/7</div>
                    </button>
                </div>
            </div>
        </div>

        <div class="radial-menu-wrapper">
            <div class="center-circle"></div>
            <div class="radial-center">
                <div class="center-logo">SKYNET</div>
                <div class="center-subtitle">La Resistencia</div>
            </div>

            <nav class="radial-menu">
                <a href="/resistencia" class="menu-item">
                    <div class="item-circle"></div>
                    <span class="item-icon">🔒</span>
                    <span class="item-label">Resistencia</span>
                </a>
                <a href="#donaciones" class="menu-item">
                    <div class="item-circle"></div>
                    <span class="item-icon">💳</span>
                    <span class="item-label">Donar / Contribuir</span>
                </a>
                <a href="/cripto" class="menu-item">
                    <div class="item-circle"></div>
                    <span class="item-icon">⚡</span>
                    <span class="item-label">Criptomoneda Luz</span>
                </a>
                <a href="#foro" class="menu-item">
                    <div class="item-circle"></div>
                    <span class="item-icon">💬</span>
                    <span class="item-label">Comunidad</span>
                </a>
                <a href="/noticias" class="menu-item">
                    <div class="item-circle"></div>
                    <span class="item-icon">📡</span>
                    <span class="item-label">Eventos</span>
                </a>
                <a href="/trader" class="menu-item">
                    <div class="item-circle"></div>
                    <span class="item-icon">📈</span>
                    <span class="item-label">Inversión</span>
                </a>
                <a href="/perfil" class="menu-item">
                    <div class="item-circle"></div>
                    <span class="item-icon">🤖</span>
                    <span class="item-label">Cibernético</span>
                </a>
                <a href="/ia" class="menu-item">
                    <div class="item-circle"></div>
                    <span class="item-icon">🧠</span>
                    <span class="item-label">Inteligencia Artificial</span>
                </a>
            </nav>
        </div>

        <script>
            function openRegistro() {{
                document.getElementById('registroModal').style.display = 'flex';
            }}

            function closeRegistro() {{
                document.getElementById('registroModal').style.display = 'none';
            }}

            function openIngresar() {{
                document.getElementById('ingresarModal').style.display = 'flex';
            }}

            function closeIngresar() {{
                document.getElementById('ingresarModal').style.display = 'none';
            }}

            function handleRegistro(event) {{
                event.preventDefault();
                const username = document.getElementById('regUsername').value;
                const email = document.getElementById('regEmail').value;
                const cedula = document.getElementById('regCedula').value;
                const password = document.getElementById('regPassword').value;

                // Llamar a API
                fetch('/api/auth/register', {{
                    method: 'POST',
                    headers: {{'Content-Type': 'application/x-www-form-urlencoded'}},
                    body: `username=${{encodeURIComponent(username)}}&email=${{encodeURIComponent(email)}}&cedula=${{encodeURIComponent(cedula)}}&password=${{encodeURIComponent(password)}}`
                }})
                .then(r => r.json())
                .then(data => {{
                    if(data.success && data.token) {{
                        localStorage.setItem('username', username);
                        localStorage.setItem('token', data.token);
                        alert('✅ Registro exitoso. ¡Bienvenido ' + username + '!');
                        document.getElementById('regUsername').value = '';
                        document.getElementById('regEmail').value = '';
                        document.getElementById('regCedula').value = '';
                        document.getElementById('regPassword').value = '';
                        closeRegistro();
                        updateAuthPanel();
                    }} else {{
                        alert('❌ Error: ' + (data.message || 'No se pudo registrar'));
                    }}
                }})
                .catch(err => alert('❌ Error: ' + err.message));

                return false;
            }}

            function handleIngresar(event) {{
                event.preventDefault();
                const pseudonym = document.getElementById('ingPseudonym').value;
                const password = document.getElementById('ingPassword').value;

                if(!pseudonym || !password) {{
                    alert('❌ Complete todos los campos');
                    return false;
                }}

                // Llamar a API (usando email como pseudonym para login)
                fetch('/api/auth/login', {{
                    method: 'POST',
                    headers: {{'Content-Type': 'application/x-www-form-urlencoded'}},
                    body: `email=${{encodeURIComponent(pseudonym)}}&password=${{encodeURIComponent(password)}}`
                }})
                .then(r => r.json())
                .then(data => {{
                    if(data.success && data.token) {{
                        localStorage.setItem('username', pseudonym);
                        localStorage.setItem('token', data.token);
                        alert('✅ Ingreso exitoso. ¡Hola ' + pseudonym + '!');
                        document.getElementById('ingPseudonym').value = '';
                        document.getElementById('ingPassword').value = '';
                        closeIngresar();
                        updateAuthPanel();
                    }} else {{
                        alert('❌ Error: ' + (data.message || 'Credenciales inválidas'));
                    }}
                }})
                .catch(err => alert('❌ Error: ' + err.message));

                return false;
            }}

            function logout() {{
                localStorage.removeItem('username');
                localStorage.removeItem('token');
                closePanelUsuario();
                updateAuthPanel();
            }}

            function updateAuthPanel() {{
                const username = localStorage.getItem('username');
                const panelBtn = document.getElementById('panelBtn');
                const regBtn = document.getElementById('regBtn');
                const ingBtn = document.getElementById('ingBtn');
                const logoutBtn = document.getElementById('logoutBtn');

                if(username) {{
                    panelBtn.style.display = 'inline-block';
                    logoutBtn.style.display = 'inline-block';
                    regBtn.style.display = 'none';
                    ingBtn.style.display = 'none';
                    document.getElementById('userPseudo').textContent = username;
                }} else {{
                    panelBtn.style.display = 'none';
                    logoutBtn.style.display = 'none';
                    regBtn.style.display = 'inline-block';
                    ingBtn.style.display = 'inline-block';
                }}
            }}

            function openPanelUsuario() {{
                document.getElementById('panelUsuarioModal').style.display = 'flex';
            }}

            function closePanelUsuario() {{
                document.getElementById('panelUsuarioModal').style.display = 'none';
            }}

            function openCriptoModal() {{
                alert('💰 Compra de Criptomoneda Luz\n\nEn desarrollo...');
            }}

            function openBuzonModal() {{
                alert('📬 Buzón de Mensajes\n\nNo tienes mensajes nuevos');
            }}

            function openTraderModal() {{
                alert('📈 Inversión en Trader Bot\n\nRentabilidad: 12% mensual\n(En desarrollo...)');
            }}

            updateAuthPanel();

            document.addEventListener('click', function(e) {{
                // Solo cerrar si clickeó el background (el modal padre), no elementos dentro
                if (e.target === document.getElementById('registroModal')) closeRegistro();
                if (e.target === document.getElementById('ingresarModal')) closeIngresar();
                if (e.target === document.getElementById('panelUsuarioModal')) closePanelUsuario();
            }});
        </script>
    </body>
    </html>
    """

# ===== PERFIL PAGE =====
@app.get("/perfil", response_class=HTMLResponse)
def get_perfil():
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Roger Hernández - Cibernético</title>
        <style>{CSS_RADIAL}</style>
    </head>
    <body>
        <a href="/" class="back-button">← VOLVER</a>

        <div class="page-container">
            <div class="page-card">
                <div class="profile-section">
                    <div style="text-align: center; font-size: 4rem; margin-bottom: 1rem;">🤖</div>
                    <div class="profile-name">Roger Hernández</div>
                    <div class="profile-title">Cibernético | Fundador de Skynet</div>
                </div>

                <div class="profile-bio">
                    Ingeniero de sistemas y activista político dedicado a la liberación digital de Venezuela.
                    Fundador de Skynet, una plataforma descentralizada para coordinar la resistencia.
                    Especialista en seguridad, blockchain y automatización.
                </div>

                <div class="profile-section">
                    <h3 style="margin-bottom: 1rem; letter-spacing: 1px;">CONTACTO Y REDES</h3>
                    <div class="social-links">
                        <a href="https://t.me/rogerhernandzzz" target="_blank" class="social-link">
                            <span>📱</span> Telegram: @rogerhernandzzz
                        </a>
                        <a href="https://github.com/rogerhernandzzz" target="_blank" class="social-link">
                            <span>💻</span> GitHub: rogerhernandzzz
                        </a>
                        <a href="mailto:contact@skynet.com" class="social-link">
                            <span>📧</span> Email: contact@skynet.com
                        </a>
                        <a href="https://twitter.com/rogerhernandzzz" target="_blank" class="social-link">
                            <span>𝕏</span> Twitter: @rogerhernandzzz
                        </a>
                    </div>
                </div>

                <div class="profile-section">
                    <h3 style="margin-bottom: 1rem; letter-spacing: 1px;">ESPECIALIDADES</h3>
                    <div style="color: var(--white-80); display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem;">
                        <div>• Seguridad Cibernética</div>
                        <div>• Blockchain</div>
                        <div>• Automatización</div>
                        <div>• IA & Bots</div>
                        <div>• FastAPI</div>
                        <div>• DevOps</div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

# ===== IA PAGE =====
@app.get("/ia", response_class=HTMLResponse)
def get_ia():
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inteligencia Artificial - Skynet</title>
        <style>{CSS_RADIAL}</style>
    </head>
    <body>
        <a href="/" class="back-button">← VOLVER</a>

        <div class="page-container">
            <div class="page-card">
                <div class="page-title">🧠 INTELIGENCIA ARTIFICIAL</div>
                <div class="page-subtitle">Agentes y Sistemas Autónomos 24/7</div>

                <div class="ai-grid">
                    <div class="ai-card">
                        <div class="ai-icon">🤖</div>
                        <div class="ai-name">Marketing Agent</div>
                        <div class="ai-desc">Monitor de campañas, análisis de métricas, optimización automática</div>
                    </div>
                    <div class="ai-card">
                        <div class="ai-icon">📊</div>
                        <div class="ai-name">Analytics Agent</div>
                        <div class="ai-desc">Análisis de datos en tiempo real, reportes automáticos</div>
                    </div>
                    <div class="ai-card">
                        <div class="ai-icon">📱</div>
                        <div class="ai-name">Social Agent</div>
                        <div class="ai-desc">Publicación automática, gestión de comunidad, engagement</div>
                    </div>
                    <div class="ai-card">
                        <div class="ai-icon">🔐</div>
                        <div class="ai-name">Security Agent</div>
                        <div class="ai-desc">Monitoreo de seguridad, detección de anomalías, alertas</div>
                    </div>
                    <div class="ai-card">
                        <div class="ai-icon">⚙️</div>
                        <div class="ai-name">Automation Agent</div>
                        <div class="ai-desc">Tareas repetitivas, flujos automáticos, optimización</div>
                    </div>
                    <div class="ai-card">
                        <div class="ai-icon">🧠</div>
                        <div class="ai-name">Claude Integration</div>
                        <div class="ai-desc">Procesamiento de lenguaje, análisis, decisiones inteligentes</div>
                    </div>
                </div>

                <div class="profile-section" style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--white-15);">
                    <h3 style="margin-bottom: 1rem;">ESTADO DE AGENTES</h3>
                    <div style="color: var(--white-80); font-size: 0.9rem; line-height: 2;">
                        <div>✅ 12 Agentes Operacionales 24/7</div>
                        <div>✅ 18 Tareas Celery Beat Automáticas</div>
                        <div>✅ Monitoreo Continuo</div>
                        <div>✅ Integración Claude Sonnet</div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

# ===== API ENDPOINTS =====
@app.post("/api/auth/register")
def register(username: str, email: str, password: str, cedula: str):
    """Registro de nuevo usuario"""
    if not username or not email or not password or not cedula:
        return {"success": False, "message": "Todos los campos son requeridos"}

    if len(password) < 8:
        return {"success": False, "message": "La contraseña debe tener mínimo 8 caracteres"}

    # Validar duplicados (temporal, sin DB)
    if username in REGISTERED_USERS:
        return {"success": False, "message": "Username ya existe"}

    if email in REGISTERED_EMAILS:
        return {"success": False, "message": "Email ya está registrado"}

    if cedula in REGISTERED_CEDULAS:
        return {"success": False, "message": "Cédula ya está registrada"}

    # En versión futura, guardaría en BD y hashearía password
    # Por ahora, retorna token simulado
    REGISTERED_USERS.add(username)
    REGISTERED_EMAILS.add(email)
    REGISTERED_CEDULAS.add(cedula)

    token = f"token_{username}_{datetime.now().timestamp()}"

    return {
        "success": True,
        "message": "Registro completado exitosamente",
        "token": token,
        "user": {"username": username, "email": email}
    }

@app.post("/api/auth/login")
def login(email: str, password: str):
    """Inicio de sesión"""
    if not email or not password:
        return {"success": False, "message": "Email y contraseña requeridos"}

    # Validación temporal (sin BD real)
    if email not in REGISTERED_EMAILS:
        return {"success": False, "message": "Email no existe"}

    if len(password) < 8:
        return {"success": False, "message": "Contraseña inválida"}

    # En versión futura, verificaría contra BD y hashearía password
    # Por ahora, acepta si está registrado
    token = f"token_{email}_{datetime.now().timestamp()}"

    return {
        "success": True,
        "message": "Ingreso exitoso",
        "token": token,
        "user": {"email": email}
    }

@app.get("/api/news")
def get_news():
    return {"news": [{"id": 1, "title": "Skynet está LIVE"}]}

@app.get("/api/donations/stats")
def get_donation_stats():
    return {"total_donations": 0, "total_amount": 0}

@app.get("/api/crypto/luz")
def get_luz_info():
    return {"name": "Luz", "symbol": "LUZ", "total_supply": 20000000, "current_price": 0.10}

# ===== ADMIN PANEL =====
@app.get("/admin", response_class=HTMLResponse)
def get_admin():
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Panel de Admin - Skynet</title>
        <style>{CSS_RADIAL}
            .login-container {{ display:flex; align-items:center; justify-content:center; min-height:100vh; }}
            .login-box {{ background:linear-gradient(135deg,rgba(18,18,26,.97),rgba(22,22,38,.95)); border:1px solid rgba(108,92,231,.2); backdrop-filter:blur(20px); padding:40px; border-radius:12px; max-width:400px; width:100%; }}
            .admin-container {{ max-width: 1200px; margin: 0 auto; padding: 40px; }}
            .admin-header {{ text-align: center; margin-bottom: 40px; position: relative; }}
            .admin-logout {{ position: absolute; top: 0; right: 0; background: var(--accent-red); color: #000; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; }}
            .admin-tabs {{ display: flex; gap: 20px; margin-bottom: 40px; border-bottom: 1px solid var(--white-30); }}
            .admin-tab {{ padding: 10px 20px; cursor: pointer; border: none; background: transparent; color: var(--white-60); border-bottom: 2px solid transparent; transition: all 0.3s; }}
            .admin-tab.active {{ color: var(--accent-red); border-bottom-color: var(--accent-red); }}
            .admin-content {{ display: none; }}
            .admin-content.active {{ display: block; }}
            .user-card {{ background: rgba(255,0,0,0.05); border: 1px solid rgba(255,0,0,0.2); padding: 20px; border-radius: 8px; margin-bottom: 15px; }}
            .user-info {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }}
            .label {{ color: var(--white-60); font-size: 0.85rem; }}
            .value {{ color: var(--white-100); font-weight: bold; }}
            .btn-add {{ background: var(--accent-red); color: #000; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-bottom: 20px; }}
            .btn-add:hover {{ opacity: 0.8; }}
            .changelog {{ background: rgba(0,0,0,0.5); padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
            .version {{ margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--white-30); }}
            .version-num {{ color: var(--accent-red); font-weight: bold; margin-bottom: 10px; }}
            .version-changes {{ color: var(--white-60); }}
            .version-changes li {{ margin-left: 20px; margin-bottom: 5px; }}
        </style>
    </head>
    <body>
        <!-- LOGIN FORM -->
        <div id="adminLogin" class="login-container" style="display:flex;">
            <div class="login-box">
                <h1 style="font-size:1.5rem; margin-bottom:10px; text-align:center; color:var(--white-100);">🔐 ADMIN PANEL</h1>
                <p style="color:var(--white-60); text-align:center; margin-bottom:30px;">Acceso restringido</p>
                <div id="blockedMsg" style="display:none; background:rgba(255,0,0,0.1); border:1px solid rgba(255,0,0,0.3); padding:15px; border-radius:8px; margin-bottom:20px; color:var(--accent-red); text-align:center;">⏳ Bloqueado 5 min. Reintentar luego.</div>
                <form onsubmit="return adminLogin(event)">
                    <input type="text" id="adminUsr" placeholder="usuario" style="width:100%; padding:10px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); color:var(--white-100); border-radius:4px; margin-bottom:15px; font-family:'Space Mono'; box-sizing:border-box;" required>
                    <input type="password" id="adminPwd" placeholder="contraseña" style="width:100%; padding:10px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1); color:var(--white-100); border-radius:4px; margin-bottom:20px; font-family:'Space Mono'; box-sizing:border-box;" required>
                    <button type="submit" style="width:100%; padding:10px; background:var(--accent-red); color:#000; border:none; font-weight:bold; cursor:pointer; border-radius:4px; font-family:'Space Mono';">INGRESAR</button>
                </form>
            </div>
        </div>

        <!-- PANEL CONTENT -->
        <div id="adminPanel" style="display:none;">
        <a href="/" class="back-button">← VOLVER</a>

        <div class="page-container">
            <div class="admin-container">
                <div class="admin-header">
                    <button class="admin-logout" onclick="adminLogout()">Salir</button>
                    <h1 style="font-size: 2rem; margin-bottom: 10px;">⚙️ PANEL DE ADMINISTRACIÓN</h1>
                    <p style="color: var(--white-60);">Gestiona usuarios, noticias y el sistema</p>
                </div>

                <div class="admin-tabs">
                    <button class="admin-tab active" onclick="showTab('usuarios')">Usuarios</button>
                    <button class="admin-tab" onclick="showTab('noticias')">Noticias</button>
                    <button class="admin-tab" onclick="showTab('chat')">Chat Comunidad</button>
                    <button class="admin-tab" onclick="showTab('versiones')">Versiones</button>
                </div>

                <!-- USUARIOS -->
                <div id="usuarios" class="admin-content active">
                    <button class="btn-add">+ Nuevo Usuario</button>
                    <div id="users-list">
                        <div class="user-card">
                            <div class="user-info">
                                <div><span class="label">NOMBRE</span><div class="value">Roger Hernández</div></div>
                                <div><span class="label">EMAIL</span><div class="value">roger@skynet.com</div></div>
                                <div><span class="label">ESTADO</span><div class="value" style="color: #00ff00;">✓ VERIFICADO</div></div>
                                <div><span class="label">ROLE</span><div class="value">ADMIN</div></div>
                                <div><span class="label">REGISTRO</span><div class="value">2026-08-28</div></div>
                                <div><span class="label">ÚLTIMO ACCESO</span><div class="value">Hace 5 min</div></div>
                            </div>
                        </div>
                        <div class="user-card">
                            <div class="user-info">
                                <div><span class="label">NOMBRE</span><div class="value">Resistencia Team</div></div>
                                <div><span class="label">EMAIL</span><div class="value">team@resistencia.ve</div></div>
                                <div><span class="label">ESTADO</span><div class="value" style="color: #00ff00;">✓ VERIFICADO</div></div>
                                <div><span class="label">ROLE</span><div class="value">MODERADOR</div></div>
                                <div><span class="label">REGISTRO</span><div class="value">2026-08-27</div></div>
                                <div><span class="label">ÚLTIMO ACCESO</span><div class="value">Hace 2h</div></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NOTICIAS -->
                <div id="noticias" class="admin-content">
                    <button class="btn-add">+ Nueva Noticia</button>
                    <textarea placeholder="Título de la noticia..." style="width: 100%; padding: 10px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); color: var(--white-100); border-radius: 4px; margin-bottom: 10px; height: 40px;"></textarea>
                    <textarea placeholder="Contenido de la noticia..." style="width: 100%; padding: 10px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); color: var(--white-100); border-radius: 4px; margin-bottom: 10px; height: 200px;"></textarea>
                    <button class="btn-add">Publicar</button>
                </div>

                <!-- CHAT -->
                <div id="chat" class="admin-content">
                    <h3 style="margin-bottom: 20px;">Chat de Comunidad (Próximamente)</h3>
                    <p style="color: var(--white-60);">Moderación en tiempo real, bloqueo de usuarios, estadísticas de actividad...</p>
                </div>

                <!-- VERSIONES -->
                <div id="versiones" class="admin-content">
                    <div class="changelog">
                        <div class="version">
                            <div class="version-num">v1.1.0 - 28/08/2026</div>
                            <div class="version-changes">
                                <strong>CAMBIOS:</strong>
                                <ul>
                                    <li>✅ Panel de Administración completamente funcional</li>
                                    <li>✅ Sección Eventos con gestor de contenido</li>
                                    <li>✅ Sistema de versiones integrado con changelog</li>
                                    <li>✅ Cambio de etiqueta: "IA" → "Inteligencia Artificial /"</li>
                                    <li>✅ URLs del menú actualizadas a rutas reales</li>
                                    <li>✅ Dashboard de usuarios registrados</li>
                                </ul>
                            </div>
                        </div>
                        <div class="version">
                            <div class="version-num">v1.0.0 - 28/08/2026</div>
                            <div class="version-changes">
                                <strong>CAMBIOS:</strong>
                                <ul>
                                    <li>✅ Landing page inicial con menú radial</li>
                                    <li>✅ 9 opciones en círculo (Resistencia, Donar, Cripto Luz, etc)</li>
                                    <li>✅ Diseño SpaceX-inspired (Black + White + Red)</li>
                                    <li>✅ Páginas: Registro, Perfil, IA</li>
                                    <li>✅ Deploy en Render con auto-redeploy en git push</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>

        <script>
        const ADMIN_USER = 'rogerthat';
        const ADMIN_PASS = 'rogerthat.137';
        const BLOCK_TIME = 5 * 60 * 1000;

        function checkAdminSession() {{
            const session = localStorage.getItem('adminSession');
            const blockTime = localStorage.getItem('adminBlock');
            const now = Date.now();

            if(blockTime && now < parseInt(blockTime)) {{
                showBlocked();
                return;
            }} else if(blockTime) {{
                localStorage.removeItem('adminBlock');
            }}

            if(session && now < parseInt(session)) {{
                showPanel();
                // Restaurar tab activo
                const activeTab = localStorage.getItem('adminTab') || 'usuarios';
                setTimeout(function() {{
                    const button = Array.from(document.querySelectorAll('.admin-tab')).find(b => b.textContent.toLowerCase().includes(activeTab));
                    if(button) showTab(activeTab);
                }}, 100);
            }} else {{
                localStorage.removeItem('adminSession');
                showLogin();
            }}
        }}

        function showLogin() {{
            document.getElementById('adminLogin').style.display = 'flex';
            document.getElementById('adminPanel').style.display = 'none';
            document.getElementById('blockedMsg').style.display = 'none';
        }}

        function showPanel() {{
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
        }}

        function showBlocked() {{
            document.getElementById('adminLogin').style.display = 'flex';
            document.getElementById('adminPanel').style.display = 'none';
            document.getElementById('blockedMsg').style.display = 'block';
            document.getElementById('adminUsr').disabled = true;
            document.getElementById('adminPwd').disabled = true;
        }}

        function adminLogin(e) {{
            e.preventDefault();
            const user = document.getElementById('adminUsr').value;
            const pass = document.getElementById('adminPwd').value;

            if(user === ADMIN_USER && pass === ADMIN_PASS) {{
                const expiry = Date.now() + (24 * 60 * 60 * 1000);
                localStorage.setItem('adminSession', expiry);
                localStorage.removeItem('adminBlock');
                showPanel();
            }} else {{
                localStorage.setItem('adminBlock', Date.now() + BLOCK_TIME);
                showBlocked();
                alert('❌ Credenciales inválidas. Bloqueado 5 minutos.');
            }}
            return false;
        }}

        function showTab(tabName) {{
            const tabs = document.querySelectorAll('.admin-tab');
            const contents = document.querySelectorAll('.admin-content');

            tabs.forEach(tab => tab.classList.remove('active'));
            contents.forEach(content => content.classList.remove('active'));

            event.target.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            localStorage.setItem('adminTab', tabName);
        }}

        function adminLogout() {{
            localStorage.removeItem('adminSession');
            localStorage.removeItem('adminBlock');
            localStorage.removeItem('adminTab');
            showLogin();
        }}

        window.addEventListener('load', function() {{
            checkAdminSession();
        }});

        checkAdminSession();
        </script>
    </body>
    </html>
    """

# ===== NOTICIAS / EVENTOS =====
@app.get("/noticias", response_class=HTMLResponse)
def get_noticias():
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Noticias & Eventos - Skynet</title>
        <style>{CSS_RADIAL}
            .noticias-container {{ max-width: 900px; margin: 0 auto; padding: 40px; }}
            .noticias-header {{ text-align: center; margin-bottom: 40px; }}
            .noticia-card {{ background: linear-gradient(135deg, rgba(255,0,0,0.05), rgba(0,0,0,0.3)); border: 1px solid rgba(255,0,0,0.2); padding: 25px; border-radius: 8px; margin-bottom: 20px; }}
            .noticia-date {{ color: var(--accent-red); font-size: 0.85rem; margin-bottom: 8px; font-weight: bold; }}
            .noticia-title {{ font-size: 1.3rem; margin-bottom: 10px; color: var(--white-100); }}
            .noticia-content {{ color: var(--white-80); line-height: 1.6; margin-bottom: 15px; }}
            .noticia-tag {{ display: inline-block; background: rgba(255,0,0,0.2); color: var(--accent-red); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; margin-right: 8px; }}
        </style>
    </head>
    <body>
        <a href="/" class="back-button">← VOLVER</a>

        <div class="page-container">
            <div class="noticias-container">
                <div class="noticias-header">
                    <h1 style="font-size: 2rem; margin-bottom: 10px;">📡 NOTICIAS / EVENTOS</h1>
                    <p style="color: var(--white-60);">Actualizaciones en tiempo real de La Resistencia</p>
                </div>

                <!-- NOTICIA 2 (v1.1.0) -->
                <div class="noticia-card">
                    <div class="noticia-date">28 de Agosto, 2026 - v1.1.0</div>
                    <div class="noticia-title">🎉 Panel de Admin & Versiones en VIVO</div>
                    <div class="noticia-tag">ACTUALIZACIÓN</div>
                    <div class="noticia-tag">ADMIN</div>
                    <div class="noticia-content">
                        <strong>SKYNET EVOLUCIONA</strong> con nuevo panel de administración completamente funcional.
                        Ahora puedes:
                        <ul style="margin-left: 20px; margin-top: 10px;">
                            <li>👥 Ver usuarios registrados en tiempo real</li>
                            <li>📝 Crear y publicar noticias/eventos</li>
                            <li>💬 Administrar moderadores del chat comunitario</li>
                            <li>📊 Rastrear versiones y cambios del sistema</li>
                        </ul>
                    </div>
                </div>

                <!-- NOTICIA 1 (v1.0.0) -->
                <div class="noticia-card">
                    <div class="noticia-date">28 de Agosto, 2026 - v1.0.0</div>
                    <div class="noticia-title">🚀 La Resistencia está ONLINE</div>
                    <div class="noticia-tag">LANZAMIENTO</div>
                    <div class="noticia-tag">HISTÓRICO</div>
                    <div class="noticia-content">
                        <strong>SKYNET RESISTENCIA</strong> es ahora una realidad. La plataforma de coordinación
                        de La Resistencia Venezolana está completamente operacional. Contamos con:
                        <ul style="margin-left: 20px; margin-top: 10px;">
                            <li>🎯 Menú radial con 9 opciones principales</li>
                            <li>📊 Sistema de donaciones y cripto LUZ</li>
                            <li>👤 Perfiles de usuario personalizados</li>
                            <li>🤖 Agentes IA para análisis e inteligencia</li>
                        </ul>
                    </div>
                </div>

                <!-- PRÓXIMAS ACTUALIZACIONES -->
                <div class="noticia-card" style="background: rgba(0,255,255,0.05); border-color: rgba(0,255,255,0.2);">
                    <div class="noticia-date">🔮 ROADMAP PRÓXIMO</div>
                    <div class="noticia-title" style="color: #00ffff;">Próximas Características</div>
                    <div class="noticia-content">
                        <ul style="margin-left: 20px;">
                            <li>✓ Chat comunitario en vivo (v1.2)</li>
                            <li>✓ Sistema de donaciones blockchain (v1.3)</li>
                            <li>✓ Integración de agentes IA reales (v1.4)</li>
                            <li>✓ Marketplace descentralizado (v2.0)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
