#!/bin/bash

# Script para Deploy via Cloud Shell
# Ferramenta #PraTodosVerem

echo "🚀 Deploy da Ferramenta #PraTodosVerem via Cloud Shell"
echo "=================================================="
echo ""

# Verificar se estamos no Cloud Shell
if [ -z "$CLOUD_SHELL" ]; then
    echo "⚠️  Este script deve ser executado no Google Cloud Shell"
    echo "Abra o Cloud Shell no console do Google Cloud e execute novamente"
    exit 1
fi

# Configurações
SERVICE_NAME="transcricao-pra-todos-verem"
REGION="us-central1"
PROJECT_ID=$(gcloud config get-value project)

echo "📋 Configurações:"
echo "   Projeto: $PROJECT_ID"
echo "   Serviço: $SERVICE_NAME"
echo "   Região: $REGION"
echo ""

# Verificar projeto
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Nenhum projeto configurado"
    echo "Execute: gcloud config set project SEU_PROJETO_ID"
    exit 1
fi

# Habilitar APIs
echo "🔧 Habilitando APIs necessárias..."
gcloud services enable run.googleapis.com --quiet
gcloud services enable cloudbuild.googleapis.com --quiet
echo "✅ APIs habilitadas!"
echo ""

# Criar diretório temporário
echo "📁 Preparando arquivos..."
mkdir -p /tmp/transcricao-deploy
cd /tmp/transcricao-deploy

# Criar Dockerfile
echo "🐳 Criando Dockerfile..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 8080
CMD ["npm", "start"]
EOF

# Criar package.json
echo "📦 Criando package.json..."
cat > package.json << 'EOF'
{
  "name": "transcricao-pra-todos-verem",
  "version": "1.0.0",
  "description": "Ferramenta de transcrição de imagens #PraTodosVerem",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "openai": "^4.20.1",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "dotenv": "^16.3.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Criar .dockerignore
echo "🚫 Criando .dockerignore..."
cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.DS_Store
*.log
EOF

# Criar server.js
echo "⚙️  Criando server.js..."
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { OpenAI } = require('openai');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuração do OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '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',
    maxRetries: 3,
    timeout: 30000
});

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "https://api.openai.com"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
});
app.use(limiter);

const transcriptionLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: 'Limite de transcrições excedido, aguarde um minuto.'
});

// CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuração do Multer
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.'), false);
        }
    }
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rota de transcrição
app.post('/api/transcribe', 
    transcriptionLimiter,
    upload.single('image'),
    [
        body('email').isEmail().withMessage('Email inválido'),
        body('email').custom(value => {
            if (!value.endsWith('@g.globo')) {
                throw new Error('Apenas emails @g.globo são permitidos');
            }
            return true;
        }),
        body('name').isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Dados inválidos',
                    details: errors.array()
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Nenhuma imagem fornecida'
                });
            }

            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

            const requestData = {
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'Você é um especialista em adaptar conteúdos para deficientes visuais.'
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Transcreva a imagem a seguir de forma corrida (não topicalizada), simples e objetiva. Seja bem rigoroso ao transcrever os números e estatísticas da imagem. Pule introduções e apresentações, vá direto ao conteúdo. Orientações: - Siglas como SEM1, refira como semana 1. - Use sempre o nome da cidade, nunca a sigla, mesmo que na imagem tenha a sigla. - Escreva os números com numerais, não por extenso. - As datas estão no formato dia/mês/ano'
                            },
                            {
                                type: 'image_url',
                                image_url: { url: base64Image }
                            }
                        ]
                    }
                ],
                max_tokens: 500,
                temperature: 0.3
            };

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout na requisição')), 30000);
            });

            const openaiPromise = openai.chat.completions.create(requestData);
            const response = await Promise.race([openaiPromise, timeoutPromise]);

            if (response.choices && response.choices[0] && response.choices[0].message) {
                const transcription = response.choices[0].message.content.trim();
                
                res.json({
                    success: true,
                    transcription: transcription,
                    user: {
                        email: req.body.email,
                        name: req.body.name
                    }
                });
            } else {
                throw new Error('Resposta inválida da API OpenAI');
            }

        } catch (error) {
            console.error('Erro na transcrição:', error);
            
            res.status(500).json({
                success: false,
                error: 'Erro ao gerar transcrição',
                message: error.message
            });
        }
    }
);

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'Arquivo muito grande. Máximo 10MB.'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

// Rota 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Segurança: Helmet, Rate Limiting, CORS configurados`);
    console.log(`🤖 OpenAI: Configurado para GPT-4o`);
});
EOF

# Criar pasta public
echo "📂 Criando pasta public..."
mkdir -p public

# Criar index.html
echo "🌐 Criando index.html..."
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>#PraTodosVerem - Transcrição de Imagens</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Seção de Login -->
    <div id="loginSection" class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800 mb-2">#PraTodosVerem</h1>
                <p class="text-gray-600">Ferramenta de Transcrição de Imagens</p>
                <p class="text-sm text-gray-500 mt-2">Powered by Google Cloud Run</p>
            </div>
            
            <form id="loginForm" class="space-y-4">
                <div>
                    <label for="emailInput" class="block text-sm font-medium text-gray-700 mb-2">
                        E-mail da Globo
                    </label>
                    <input 
                        type="email" 
                        id="emailInput" 
                        placeholder="seu.email@g.globo"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    >
                </div>
                <div>
                    <label for="nameInput" class="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo
                    </label>
                    <input 
                        type="text" 
                        id="nameInput" 
                        placeholder="Seu nome completo"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    >
                </div>
                <button 
                    type="submit"
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                    Entrar
                </button>
            </form>
        </div>
    </div>

    <!-- Aplicação Principal -->
    <div id="mainApp" class="hidden">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center space-x-4">
                        <h1 class="text-2xl font-bold text-gray-800">#PraTodosVerem</h1>
                        <span class="text-sm text-gray-500">Transcrição de Imagens</span>
                        <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Cloud Run</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span id="userInfo" class="text-sm text-gray-600"></span>
                        <button id="logoutBtn" class="text-sm text-red-600 hover:text-red-800">Sair</button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Status do Servidor -->
        <div class="bg-green-50 border-b border-green-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <span id="serverStatus" class="text-sm font-medium text-green-600">🟢 Servidor conectado</span>
                        <span class="text-sm text-green-700">Backend seguro no Google Cloud Run</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Conteúdo Principal -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Seção de Upload -->
            <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Upload da Imagem</h2>
                
                <div class="space-y-4">
                    <!-- Área de Upload -->
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                        <input type="file" id="fileInput" accept="image/*" class="hidden">
                        <button id="uploadBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Selecionar Imagem
                        </button>
                        <p class="mt-2 text-sm text-gray-500">JPEG, PNG, GIF ou WebP (máx. 10MB)</p>
                    </div>

                    <!-- Preview da Imagem -->
                    <div class="hidden" id="previewContainer">
                        <img id="previewImage" class="max-w-full h-auto rounded-lg shadow-sm" alt="Preview da imagem">
                    </div>

                    <!-- Botão de Transcrição -->
                    <div class="flex items-center space-x-4">
                        <button 
                            id="transcribeBtn" 
                            class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled
                        >
                            <span id="transcribeText">Gerar Transcrição</span>
                            <div id="loadingSpinner" class="hidden inline-block ml-2">
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Seção de Resultado -->
            <div id="resultSection" class="hidden bg-white rounded-lg shadow-sm border p-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Resultado da Transcrição</h2>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Imagem -->
                    <div>
                        <h3 class="text-md font-medium text-gray-700 mb-2">Imagem Original</h3>
                        <img id="resultImage" class="max-w-full h-auto rounded-lg shadow-sm" alt="Imagem transcrita">
                    </div>

                    <!-- Transcrição -->
                    <div>
                        <h3 class="text-md font-medium text-gray-700 mb-2">Transcrição #PraTodosVerem</h3>
                        <textarea 
                            id="transcriptionText" 
                            class="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none bg-white" 
                            placeholder="A transcrição aparecerá aqui..."
                        ></textarea>
                        <div class="mt-2 flex space-x-2">
                            <button id="copyBtn" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                                Copiar Transcrição
                            </button>
                            <button id="saveBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Botão do Outlook -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <button 
                        id="outlookBtn" 
                        class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Abrir no Outlook
                    </button>
                </div>
            </div>
        </main>
    </div>

    <script src="script.js"></script>
</body>
</html>
EOF

# Criar script.js
echo "📜 Criando script.js..."
cat > public/script.js << 'EOF'
// Sistema de Autenticação
class Auth {
    constructor() {
        this.ALLOWED_DOMAIN = '@g.globo';
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    isUserAuthenticated() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    authenticateUser(email, name) {
        try {
            if (!email || !name) {
                throw new Error('Por favor, preencha todos os campos.');
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Por favor, insira um e-mail válido.');
            }

            if (!email.endsWith(this.ALLOWED_DOMAIN)) {
                throw new Error(`Acesso negado. Apenas colaboradores da Globo (${this.ALLOWED_DOMAIN}) podem usar esta ferramenta.`);
            }

            this.currentUser = {
                email: email.trim(),
                name: name.trim(),
                loginTime: new Date().toISOString()
            };

            this.isAuthenticated = true;
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            localStorage.setItem('auth_status', 'authenticated');

            return { success: true, user: this.currentUser };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    checkSavedAuth() {
        try {
            const savedUser = localStorage.getItem('user');
            const authStatus = localStorage.getItem('auth_status');

            if (savedUser && authStatus === 'authenticated') {
                const user = JSON.parse(savedUser);
                if (user.email.endsWith(this.ALLOWED_DOMAIN)) {
                    this.currentUser = user;
                    this.isAuthenticated = true;
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Erro ao verificar autenticação salva:', error);
            return false;
        }
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('user');
        localStorage.removeItem('auth_status');
        return true;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

const auth = new Auth();

// Elementos do DOM
const loginSection = document.getElementById('loginSection');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const nameInput = document.getElementById('nameInput');
const userInfo = document.getElementById('userInfo');
const logoutBtn = document.getElementById('logoutBtn');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const transcribeBtn = document.getElementById('transcribeBtn');
const previewImage = document.getElementById('previewImage');
const resultSection = document.getElementById('resultSection');
const resultImage = document.getElementById('resultImage');
const transcriptionText = document.getElementById('transcriptionText');
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const outlookBtn = document.getElementById('outlookBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const serverStatus = document.getElementById('serverStatus');

let selectedFile = null;
let transcription = '';

document.addEventListener('DOMContentLoaded', function() {
    if (auth.checkSavedAuth()) {
        showMainApp();
    } else {
        showLoginForm();
    }
    checkServerHealth();
});

async function checkServerHealth() {
    try {
        const response = await fetch('/health');
        if (response.ok) {
            serverStatus.textContent = '🟢 Servidor conectado';
            serverStatus.className = 'text-sm font-medium text-green-600';
        } else {
            throw new Error('Servidor não respondeu corretamente');
        }
    } catch (error) {
        console.error('Erro ao verificar servidor:', error);
        serverStatus.textContent = '🔴 Servidor desconectado';
        serverStatus.className = 'text-sm font-medium text-red-600';
    }
}

function showLoginForm() {
    loginSection.classList.remove('hidden');
    mainApp.classList.add('hidden');
}

function showMainApp() {
    loginSection.classList.add('hidden');
    mainApp.classList.remove('hidden');
    
    const user = auth.getCurrentUser();
    if (user) {
        userInfo.textContent = `Olá, ${user.name}!`;
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = emailInput.value.trim();
    const name = nameInput.value.trim();
    
    const result = auth.authenticateUser(email, name);
    
    if (result.success) {
        showMainApp();
        showNotification('Login realizado com sucesso!', 'success');
    } else {
        showError(result.error);
    }
}

function handleLogout() {
    auth.logout();
    showLoginForm();
    showNotification('Logout realizado com sucesso!', 'success');
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showError('Por favor, selecione uma imagem válida (JPEG, PNG, GIF, WebP).');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showError('A imagem deve ter no máximo 10MB.');
        return;
    }
    
    selectedFile = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        previewImage.classList.remove('hidden');
        uploadBtn.disabled = false;
        transcribeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
    
    showNotification('Imagem selecionada com sucesso!', 'success');
}

async function generateTranscription() {
    if (!selectedFile) {
        showError('Por favor, selecione uma imagem primeiro.');
        return;
    }
    
    setLoading(true);
    
    try {
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('email', auth.getCurrentUser().email);
        formData.append('name', auth.getCurrentUser().name);
        
        const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.transcription) {
            transcription = data.transcription;
            displayResult();
            showNotification('Transcrição gerada com sucesso!', 'success');
        } else {
            throw new Error('Resposta inválida do servidor');
        }
        
    } catch (error) {
        console.error('Erro ao gerar transcrição:', error);
        showError(`Erro ao gerar transcrição: ${error.message}`);
    } finally {
        setLoading(false);
    }
}

function displayResult() {
    resultImage.src = previewImage.src;
    transcriptionText.value = transcription;
    resultSection.classList.remove('hidden');
    resultSection.classList.add('fade-in');
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function copyTranscription() {
    const currentText = transcriptionText.value;
    transcriptionText.select();
    transcriptionText.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showNotification('Transcrição copiada para a área de transferência!', 'success');
    } catch (err) {
        navigator.clipboard.writeText(currentText).then(() => {
            showNotification('Transcrição copiada para a área de transferência!', 'success');
        }).catch(() => {
            showError('Erro ao copiar transcrição.');
        });
    }
}

function saveTranscription() {
    const currentText = transcriptionText.value.trim();
    
    if (!currentText) {
        showError('A transcrição não pode estar vazia.');
        return;
    }
    
    transcription = currentText;
    showNotification('Alterações salvas com sucesso!', 'success');
}

async function openInOutlook() {
    if (!transcription) {
        showError('Nenhuma transcrição disponível.');
        return;
    }
    
    try {
        const emailBody = `#PraTodosVerem\n\n${transcription}`;
        const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?subject=Transcrição%20#PraTodosVerem&body=${encodeURIComponent(emailBody)}`;
        
        const newWindow = window.open(outlookUrl, '_blank');
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            await navigator.clipboard.writeText(emailBody);
            showNotification('Texto copiado! Abrindo Outlook Web...', 'info');
            window.open('https://outlook.office.com/mail/', '_blank');
        }
        
    } catch (error) {
        console.error('Erro ao abrir Outlook:', error);
        showError('Erro ao abrir Outlook. Tente copiar o texto manualmente.');
    }
}

function setLoading(loading) {
    if (loading) {
        loadingSpinner.classList.remove('hidden');
        transcribeBtn.disabled = true;
    } else {
        loadingSpinner.classList.add('hidden');
        transcribeBtn.disabled = false;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    showNotification(message, 'error');
}

// Event listeners
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
fileInput.addEventListener('change', handleFileSelect);
uploadBtn.addEventListener('click', () => fileInput.click());
transcribeBtn.addEventListener('click', generateTranscription);
copyBtn.addEventListener('click', copyTranscription);
saveBtn.addEventListener('click', saveTranscription);
outlookBtn.addEventListener('click', openInOutlook);
EOF

# Criar styles.css
echo "🎨 Criando styles.css..."
cat > public/styles.css << 'EOF'
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.fade-in {
    animation: fadeIn 0.5s ease-out;
}

.animate-spin {
    animation: spin 1s linear infinite;
}

.drag-over {
    border-color: #3b82f6 !important;
    background-color: #eff6ff;
}

.notification {
    position: fixed;
    top: 1rem;
    right: 1rem;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 50;
    animation: fadeIn 0.3s ease-out;
}

.notification.success {
    background-color: #10b981;
    color: white;
}

.notification.error {
    background-color: #ef4444;
    color: white;
}

.notification.info {
    background-color: #3b82f6;
    color: white;
}

@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }
    
    .grid {
        grid-template-columns: 1fr;
    }
    
    .text-3xl {
        font-size: 1.875rem;
    }
    
    .text-2xl {
        font-size: 1.5rem;
    }
}

.loading {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid #ffffff;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s ease-in-out infinite;
}

.preview-container {
    position: relative;
    display: inline-block;
}

.preview-container img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

textarea {
    font-family: inherit;
    line-height: 1.5;
}

textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

button:not(:disabled):hover {
    transform: translateY(-1px);
    transition: transform 0.2s ease;
}

input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.card {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
}

.card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease;
}

.gradient-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.status-online {
    color: #10b981;
}

.status-offline {
    color: #ef4444;
}

.status-warning {
    color: #f59e0b;
}

.badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 9999px;
}

.badge-success {
    background-color: #d1fae5;
    color: #065f46;
}

.badge-error {
    background-color: #fee2e2;
    color: #991b1b;
}

.badge-warning {
    background-color: #fef3c7;
    color: #92400e;
}

.badge-info {
    background-color: #dbeafe;
    color: #1e40af;
}
EOF

echo "✅ Arquivos criados com sucesso!"
echo ""

# Fazer deploy
echo "🚀 Iniciando deploy..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "OPENAI_API_KEY=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" \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "ALLOWED_ORIGINS=*"

echo ""
echo "🎉 Deploy concluído!"
echo ""

# Obter URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")

if [ ! -z "$SERVICE_URL" ]; then
    echo "🌐 URL do serviço: $SERVICE_URL"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Teste a ferramenta acessando a URL"
    echo "2. Compartilhe com a equipe"
    echo "3. Configure monitoramento se necessário"
    echo ""
    echo "📊 Console: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME"
else
    echo "❌ Não foi possível obter a URL do serviço"
fi

echo ""
echo "🧹 Limpando arquivos temporários..."
cd /
rm -rf /tmp/transcricao-deploy

echo "✅ Processo concluído!"
EOF

echo "✅ Script criado: deploy-cloudshell.sh"
echo ""
echo "📋 Como usar no Cloud Shell:"
echo ""
echo "1. Faça upload do arquivo deploy-cloudshell.sh para o Cloud Shell"
echo "2. Execute o comando:"
echo "   bash deploy-cloudshell.sh"
echo ""
echo "🎯 O script fará tudo automaticamente!" 