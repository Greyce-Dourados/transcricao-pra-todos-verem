// Sistema de Autenticação
class Auth {
    constructor() {
        this.ALLOWED_DOMAIN = '@g.globo';
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    // Verificar se o usuário está autenticado
    isUserAuthenticated() {
        return this.isAuthenticated && this.currentUser !== null;
    }

    // Autenticar usuário
    authenticateUser(email, name) {
        try {
            // Validar campos
            if (!email || !name) {
                throw new Error('Por favor, preencha todos os campos.');
            }

            // Validar formato do e-mail
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Por favor, insira um e-mail válido.');
            }

            // Verificar se o domínio é permitido
            if (!email.endsWith(this.ALLOWED_DOMAIN)) {
                throw new Error(`Acesso negado. Apenas colaboradores da Globo (${this.ALLOWED_DOMAIN}) podem usar esta ferramenta.`);
            }

            // Login bem-sucedido
            this.currentUser = {
                email: email.trim(),
                name: name.trim(),
                loginTime: new Date().toISOString()
            };

            this.isAuthenticated = true;

            // Salvar no localStorage
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            localStorage.setItem('auth_status', 'authenticated');

            return {
                success: true,
                user: this.currentUser
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Verificar autenticação salva
    checkSavedAuth() {
        try {
            const savedUser = localStorage.getItem('user');
            const authStatus = localStorage.getItem('auth_status');

            if (savedUser && authStatus === 'authenticated') {
                const user = JSON.parse(savedUser);
                
                // Verificar se o domínio ainda é válido
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

    // Fazer logout
    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        
        localStorage.removeItem('user');
        localStorage.removeItem('auth_status');
        
        return true;
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar permissões
    hasPermission() {
        return this.isUserAuthenticated();
    }
}

// Inicializar sistema de autenticação
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

// Variáveis globais
let selectedFile = null;
let transcription = '';

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    if (auth.checkSavedAuth()) {
        showMainApp();
    } else {
        showLoginForm();
    }
    
    // Verificar status do servidor
    checkServerHealth();
});

// Função para verificar saúde do servidor
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

// Função para mostrar formulário de login
function showLoginForm() {
    loginSection.classList.remove('hidden');
    mainApp.classList.add('hidden');
}

// Função para mostrar aplicação principal
function showMainApp() {
    loginSection.classList.add('hidden');
    mainApp.classList.remove('hidden');
    
    const user = auth.getCurrentUser();
    if (user) {
        userInfo.textContent = `Olá, ${user.name}!`;
    }
}

// Função para lidar com o login
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

// Função para fazer logout
function handleLogout() {
    auth.logout();
    showLoginForm();
    showNotification('Logout realizado com sucesso!', 'success');
}

// Função para lidar com seleção de arquivo
function handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showError('Por favor, selecione uma imagem válida (JPEG, PNG, GIF, WebP).');
        return;
    }
    
    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('A imagem deve ter no máximo 10MB.');
        return;
    }
    
    selectedFile = file;
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        previewImage.classList.remove('hidden');
        uploadBtn.disabled = false;
        transcribeBtn.disabled = false; // Habilitar botão de transcrição
    };
    reader.readAsDataURL(file);
    
    showNotification('Imagem selecionada com sucesso!', 'success');
}

// Função para gerar transcrição
async function generateTranscription() {
    if (!selectedFile) {
        showError('Por favor, selecione uma imagem primeiro.');
        return;
    }
    
    setLoading(true);
    
    try {
        // Criar FormData para enviar arquivo
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('email', auth.getCurrentUser().email);
        formData.append('name', auth.getCurrentUser().name);
        
        // Fazer requisição para o backend
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

// Função para exibir o resultado
function displayResult() {
    // Configurar imagem do resultado
    resultImage.src = previewImage.src;
    
    // Configurar texto da transcrição
    transcriptionText.value = transcription;
    
    // Mostrar seção de resultado
    resultSection.classList.remove('hidden');
    resultSection.classList.add('fade-in');
    
    // Scroll para o resultado
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// Função para copiar transcrição
function copyTranscription() {
    const currentText = transcriptionText.value;
    transcriptionText.select();
    transcriptionText.setSelectionRange(0, 99999); // Para dispositivos móveis
    
    try {
        document.execCommand('copy');
        showNotification('Transcrição copiada para a área de transferência!', 'success');
    } catch (err) {
        // Fallback para navegadores modernos
        navigator.clipboard.writeText(currentText).then(() => {
            showNotification('Transcrição copiada para a área de transferência!', 'success');
        }).catch(() => {
            showError('Erro ao copiar transcrição.');
        });
    }
}

// Função para salvar alterações da transcrição
function saveTranscription() {
    const currentText = transcriptionText.value.trim();
    
    if (!currentText) {
        showError('A transcrição não pode estar vazia.');
        return;
    }
    
    // Atualizar a variável global com o texto editado
    transcription = currentText;
    
    showNotification('Alterações salvas com sucesso!', 'success');
}

// Função para abrir no Outlook
async function openInOutlook() {
    if (!transcription) {
        showError('Nenhuma transcrição disponível.');
        return;
    }
    
    try {
        // Tentar abrir via deep link do Outlook
        const emailBody = `#PraTodosVerem\n\n${transcription}`;
        const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?subject=Transcrição%20#PraTodosVerem&body=${encodeURIComponent(emailBody)}`;
        
        const newWindow = window.open(outlookUrl, '_blank');
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            // Fallback: copiar texto e abrir Outlook Web
            await navigator.clipboard.writeText(emailBody);
            showNotification('Texto copiado! Abrindo Outlook Web...', 'info');
            window.open('https://outlook.office.com/mail/', '_blank');
        }
        
    } catch (error) {
        console.error('Erro ao abrir Outlook:', error);
        showError('Erro ao abrir Outlook. Tente copiar o texto manualmente.');
    }
}

// Função para mostrar/ocultar loading
function setLoading(loading) {
    if (loading) {
        loadingSpinner.classList.remove('hidden');
        transcribeBtn.disabled = true;
    } else {
        loadingSpinner.classList.add('hidden');
        transcribeBtn.disabled = false;
    }
}

// Função para mostrar notificação
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Função para mostrar erro
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