#!/bin/bash

# Script de Deploy para Google Cloud Run
# Ferramenta #PraTodosVerem

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
SERVICE_NAME="transcricao-pra-todos-verem"
REGION="us-central1"
PROJECT_ID=""

# Função para imprimir com cores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar se o comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar pré-requisitos
check_prerequisites() {
    print_status "Verificando pré-requisitos..."
    
    if ! command_exists gcloud; then
        print_error "Google Cloud SDK não está instalado."
        print_status "Instale em: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    if ! command_exists docker; then
        print_warning "Docker não está instalado. O build será feito no Cloud Build."
    fi
    
    print_success "Pré-requisitos verificados!"
}

# Verificar autenticação
check_auth() {
    print_status "Verificando autenticação..."
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        print_error "Você não está autenticado no Google Cloud."
        print_status "Execute: gcloud auth login"
        exit 1
    fi
    
    print_success "Autenticação verificada!"
}

# Configurar projeto
setup_project() {
    print_status "Configurando projeto..."
    
    # Obter projeto atual
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
    
    if [ -z "$CURRENT_PROJECT" ]; then
        print_error "Nenhum projeto configurado."
        print_status "Execute: gcloud config set project SEU_PROJETO_ID"
        exit 1
    fi
    
    PROJECT_ID=$CURRENT_PROJECT
    print_success "Projeto configurado: $PROJECT_ID"
}

# Habilitar APIs necessárias
enable_apis() {
    print_status "Habilitando APIs necessárias..."
    
    gcloud services enable run.googleapis.com --quiet
    gcloud services enable cloudbuild.googleapis.com --quiet
    
    print_success "APIs habilitadas!"
}

# Verificar variáveis de ambiente
check_env_vars() {
    print_status "Verificando variáveis de ambiente..."
    
    if [ -z "$OPENAI_API_KEY" ]; then
        print_warning "OPENAI_API_KEY não está definida."
        print_status "Defina a variável: export OPENAI_API_KEY=sua_chave_aqui"
        print_status "Ou use a chave padrão configurada no código."
    else
        print_success "OPENAI_API_KEY configurada!"
    fi
}

# Fazer deploy
deploy_service() {
    print_status "Iniciando deploy do serviço..."
    
    # Comando base
    DEPLOY_CMD="gcloud run deploy $SERVICE_NAME --source . --platform managed --region $REGION"
    
    # Adicionar variáveis de ambiente se definidas
    if [ ! -z "$OPENAI_API_KEY" ]; then
        DEPLOY_CMD="$DEPLOY_CMD --set-env-vars OPENAI_API_KEY=$OPENAI_API_KEY"
    fi
    
    # Adicionar outras variáveis
    DEPLOY_CMD="$DEPLOY_CMD --set-env-vars NODE_ENV=production"
    DEPLOY_CMD="$DEPLOY_CMD --set-env-vars ALLOWED_ORIGINS=*"
    
    # Permitir acesso não autenticado (pode ser alterado depois)
    DEPLOY_CMD="$DEPLOY_CMD --allow-unauthenticated"
    
    print_status "Executando: $DEPLOY_CMD"
    
    # Executar deploy
    if eval $DEPLOY_CMD; then
        print_success "Deploy concluído com sucesso!"
    else
        print_error "Deploy falhou!"
        exit 1
    fi
}

# Obter URL do serviço
get_service_url() {
    print_status "Obtendo URL do serviço..."
    
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")
    
    if [ ! -z "$SERVICE_URL" ]; then
        print_success "Serviço disponível em: $SERVICE_URL"
        echo ""
        echo "🎉 Deploy concluído!"
        echo "🌐 URL: $SERVICE_URL"
        echo "📊 Console: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME"
        echo ""
    else
        print_error "Não foi possível obter a URL do serviço."
    fi
}

# Função principal
main() {
    echo "🚀 Deploy da Ferramenta #PraTodosVerem no Google Cloud Run"
    echo "=================================================="
    echo ""
    
    check_prerequisites
    check_auth
    setup_project
    enable_apis
    check_env_vars
    deploy_service
    get_service_url
    
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Teste a ferramenta acessando a URL"
    echo "2. Configure IAM se necessário"
    echo "3. Configure monitoramento e alertas"
    echo "4. Compartilhe com a equipe"
    echo ""
    echo "📚 Documentação: GUIA_CLOUD_RUN.md"
}

# Executar função principal
main "$@" 