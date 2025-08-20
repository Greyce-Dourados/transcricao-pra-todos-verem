// Configurações da API OpenAI
const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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

// Função para gerar transcrição usando OpenAI
async function generateTranscription() {
    if (!selectedImage) {
        showError('Por favor, selecione uma imagem primeiro.');
        return;
    }

    setLoading(true);
    hideError();

    try {
        // Converter imagem para base64
        const base64Image = await fileToBase64(selectedImage);
        
        // Preparar dados para a API
        const requestData = {
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Você é um especialista em adaptar conteúdos para deficientes visuais."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Transcreva a imagem a seguir de forma corrida (não topicalizada), simples e objetiva.
Seja bem rigoroso ao transcrever os números e estatísticas da imagem.
Pule introduções e apresentações, vá direto ao conteúdo.

Orientações:
- Siglas como SEM1, refira como semana 1.
- Use sempre o nome da cidade, nunca a sigla, mesmo que na imagem tenha a sigla.
- Escreva os números com numerais, não por extenso.
- As datas estão no formato dia/mês/ano`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64Image
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500,
            temperature: 0.3
        };

        // Fazer requisição para a API
        console.log('Fazendo requisição para OpenAI...');
        console.log('URL:', OPENAI_API_URL);
        console.log('Headers:', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY.substring(0, 20)}...`
        });
        
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(requestData)
        });

        console.log('Status da resposta:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Resposta de erro completa:', errorText);
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            transcription = data.choices[0].message.content.trim();
            displayResult();
        } else {
            throw new Error('Resposta inválida da API');
        }

    } catch (error) {
        console.error('Erro ao gerar transcrição:', error);
        showError(`Erro ao gerar transcrição: ${error.message}`);
    } finally {
        setLoading(false);
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
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    checkAuth();
    
    // Event listeners para autenticação
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', logout);
    
    // Desabilitar botão de gerar transcrição inicialmente
    generateBtn.disabled = true;
    
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