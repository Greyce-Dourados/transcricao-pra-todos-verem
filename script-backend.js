// Configurações do backend
const BACKEND_URL = 'http://localhost:3001';

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
    hasPermission(permission) {
        if (!this.isAuthenticated) return false;
        
        // Aqui você pode adicionar lógica de permissões específicas
        switch (permission) {
            case 'use_transcription':
                return this.currentUser.email.endsWith(this.ALLOWED_DOMAIN);
            case 'admin':
                return false; // Implementar lógica de admin se necessário
            default:
                return false;
        }
    }
}

// Instância global do sistema de autenticação
const auth = new Auth();

// Elementos do DOM
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const nameInput = document.getElementById('nameInput');

const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const generateBtn = document.getElementById('generateBtn');
const generateBtnText = document.getElementById('generateBtnText');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultSection = document.getElementById('resultSection');
const resultImage = document.getElementById('resultImage');
const transcriptionText = document.getElementById('transcriptionText');
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const outlookBtn = document.getElementById('outlookBtn');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Variáveis globais
let selectedImage = null;
let transcription = '';

// Event Listeners
imageInput.addEventListener('change', handleImageSelect);
generateBtn.addEventListener('click', generateTranscription);
copyBtn.addEventListener('click', copyTranscription);
saveBtn.addEventListener('click', saveTranscription);
outlookBtn.addEventListener('click', openInOutlook);

// Função para lidar com a seleção de imagem
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
        showError('Por favor, selecione um arquivo de imagem válido.');
        return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('A imagem deve ter no máximo 10MB.');
        return;
    }

    selectedImage = file;
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        imagePreview.classList.remove('hidden');
        imagePreview.classList.add('fade-in');
        
        // Habilitar botão de gerar transcrição
        generateBtn.disabled = false;
        
        // Esconder seção de resultado anterior
        resultSection.classList.add('hidden');
        hideError();
    };
    reader.readAsDataURL(file);
}

// Função para gerar transcrição usando o backend
async function generateTranscription() {
    if (!selectedImage) {
        showError('Por favor, selecione uma imagem primeiro.');
        return;
    }

    setLoading(true);
    hideError();

    try {
        // Criar FormData para enviar a imagem
        const formData = new FormData();
        formData.append('image', selectedImage);

        // Fazer requisição para o backend
        const response = await fetch(`${BACKEND_URL}/api/transcribe`, {
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
            showNotification(`Transcrição gerada com sucesso! (Modelo: ${data.model})`, 'success');
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
    const subject = 'Transcrição #PraTodosVerem';
    const body = `#PraTodosVerem\n\n${transcription}\n\n---\nTranscrição gerada automaticamente pela ferramenta #PraTodosVerem`;
    
    // Tentar abrir Outlook Online com deep link
    try {
        const outlookUrl = 'https://outlook.office.com/mail/deeplink/compose?subject=' + 
                          encodeURIComponent(subject) + 
                          '&body=' + encodeURIComponent(body);
        
        // Abrir em nova aba
        const newWindow = window.open(outlookUrl, '_blank');
        
        if (newWindow) {
            showNotification('Outlook Online aberto com transcrição!', 'success');
        } else {
            // Fallback: copiar conteúdo e abrir Outlook
            await navigator.clipboard.writeText(body);
            window.location.href = 'https://outlook.office.com/mail/';
            showNotification('Transcrição copiada! Cole no e-mail e anexe a imagem.', 'success');
        }
        
    } catch (error) {
        console.error('Erro ao abrir Outlook:', error);
        showNotification('Erro ao abrir Outlook. Tente manualmente.', 'error');
    }
}

// Função para abrir mailto
function openMailto(subject, body) {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
    
    showNotification('E-mail aberto! Anexe a imagem manualmente.', 'success');
}

// Função para mostrar notificação
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Função para mostrar erro
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('fade-in');
}

// Função para esconder erro
function hideError() {
    errorMessage.classList.add('hidden');
}

// Função para configurar estado de loading
function setLoading(loading) {
    if (loading) {
        generateBtn.disabled = true;
        generateBtnText.textContent = 'Gerando transcrição...';
        loadingSpinner.classList.remove('hidden');
    } else {
        generateBtn.disabled = false;
        generateBtnText.textContent = 'Gerar Transcrição com IA';
        loadingSpinner.classList.add('hidden');
    }
}

// Função para converter arquivo para base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(`data:${file.type};base64,${base64}`);
        };
        reader.onerror = error => reject(error);
    });
}

// Função para verificar se o backend está funcionando
async function checkBackendHealth() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const backendStatusText = document.getElementById('backendStatusText');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/health`);
        if (response.ok) {
            console.log('✅ Backend está funcionando');
            statusDot.className = 'w-2 h-2 rounded-full mr-2 bg-green-500';
            statusText.textContent = 'Backend Online';
            backendStatusText.textContent = 'Online';
            return true;
        } else {
            console.warn('⚠️ Backend não está respondendo corretamente');
            statusDot.className = 'w-2 h-2 rounded-full mr-2 bg-yellow-500';
            statusText.textContent = 'Backend com Problemas';
            backendStatusText.textContent = 'Com problemas';
            return false;
        }
    } catch (error) {
        console.warn('⚠️ Não foi possível conectar ao backend:', error.message);
        statusDot.className = 'w-2 h-2 rounded-full mr-2 bg-red-500';
        statusText.textContent = 'Backend Offline';
        backendStatusText.textContent = 'Offline';
        return false;
    }
}

// Funções de autenticação
function handleLogin(event) {
    event.preventDefault();
    
    const email = emailInput.value.trim();
    const name = nameInput.value.trim();
    
    // Usar o sistema de autenticação
    const result = auth.authenticateUser(email, name);
    
    if (result.success) {
        // Login bem-sucedido
        loginForm.reset();
        loginError.classList.add('hidden');
        showMainApp();
        showNotification('Login realizado com sucesso!', 'success');
    } else {
        // Erro no login
        showLoginError(result.error);
    }
}

function showLoginError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
}

function showMainApp() {
    loginScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
    
    // Atualizar informações do usuário
    const user = auth.getCurrentUser();
    userEmail.textContent = user.email;
}

function logout() {
    auth.logout();
    
    // Voltar para tela de login
    mainApp.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    
    // Limpar erros
    loginError.classList.add('hidden');
    
    showNotification('Logout realizado com sucesso!', 'success');
}

// Verificar se usuário já está logado
function checkAuth() {
    if (auth.checkSavedAuth()) {
        showMainApp();
        return;
    }
    
    // Se não estiver logado, mostrar tela de login
    mainApp.classList.add('hidden');
    loginScreen.classList.remove('hidden');
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação
    checkAuth();
    
    // Event listeners para autenticação
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', logout);
    
    // Desabilitar botão de gerar transcrição inicialmente
    generateBtn.disabled = true;
    
    // Verificar se o backend está funcionando
    const backendOk = await checkBackendHealth();
    if (!backendOk) {
        showNotification('⚠️ Backend não está disponível. Certifique-se de que o servidor está rodando.', 'error');
    }
    
    // Adicionar suporte para drag and drop
    const uploadArea = document.querySelector('.border-dashed');
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            imageInput.files = files;
            handleImageSelect({ target: { files: files } });
        }
    });
}); 