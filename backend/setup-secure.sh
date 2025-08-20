#!/bin/bash

# 🔒 Script de Configuração Segura - Backend #PraTodosVerem
# Este script configura o backend com proteções de segurança

echo "🔒 Configurando Backend Seguro para #PraTodosVerem..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir mensagens coloridas
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

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado. Instale o Node.js primeiro."
    exit 1
fi

print_status "Node.js encontrado ✓"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado. Instale o npm primeiro."
    exit 1
fi

print_status "npm encontrado ✓"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "package.json não encontrado. Execute este script na pasta backend."
    exit 1
fi

print_status "Diretório correto ✓"

# Instalar dependências
print_status "Instalando dependências de segurança..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependências instaladas ✓"
else
    print_error "Erro ao instalar dependências."
    exit 1
fi

# Configurar chave da API
echo ""
print_warning "⚠️  CONFIGURAÇÃO DA CHAVE DA API"
echo ""
echo "Para proteger sua chave da OpenAI, você tem duas opções:"
echo ""
echo "1. 🔐 Variável de ambiente (RECOMENDADO)"
echo "2. 📁 Arquivo de configuração"
echo ""

read -p "Escolha a opção (1 ou 2): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[1]$ ]]; then
    # Opção 1: Variável de ambiente
    print_status "Configurando variável de ambiente..."
    
    echo ""
    read -p "Digite sua chave da OpenAI (sk-proj-...): " api_key
    
    if [ -n "$api_key" ]; then
        # Criar arquivo .env
        echo "OPENAI_API_KEY=$api_key" > .env
        echo "PORT=3001" >> .env
        
        print_success "Variável de ambiente configurada ✓"
        print_warning "⚠️  Arquivo .env criado - NÃO compartilhe este arquivo!"
        
        # Adicionar .env ao .gitignore se não existir
        if ! grep -q ".env" ../.gitignore; then
            echo "" >> ../.gitignore
            echo "# Arquivos de configuração" >> ../.gitignore
            echo ".env" >> ../.gitignore
            echo "config.js" >> ../.gitignore
        fi
        
    else
        print_error "Chave da API não pode estar vazia."
        exit 1
    fi
    
elif [[ $REPLY =~ ^[2]$ ]]; then
    # Opção 2: Arquivo de configuração
    print_status "Configurando arquivo de configuração..."
    
    echo ""
    read -p "Digite sua chave da OpenAI (sk-proj-...): " api_key
    
    if [ -n "$api_key" ]; then
        # Atualizar config.js
        sed -i.bak "s/OPENAI_API_KEY: 'SUA_CHAVE_OPENAI_AQUI'/OPENAI_API_KEY: '$api_key'/" config.js
        
        print_success "Arquivo de configuração atualizado ✓"
        print_warning "⚠️  Arquivo config.js atualizado - NÃO compartilhe este arquivo!"
        
        # Adicionar config.js ao .gitignore se não existir
        if ! grep -q "config.js" ../.gitignore; then
            echo "" >> ../.gitignore
            echo "# Arquivos de configuração" >> ../.gitignore
            echo "config.js" >> ../.gitignore
        fi
        
    else
        print_error "Chave da API não pode estar vazia."
        exit 1
    fi
    
else
    print_error "Opção inválida."
    exit 1
fi

# Verificar se a chave foi configurada
if [ -f ".env" ] || grep -q "sk-proj" config.js; then
    print_success "Chave da API configurada ✓"
else
    print_error "Chave da API não foi configurada corretamente."
    exit 1
fi

# Criar script de inicialização
print_status "Criando script de inicialização..."

cat > start-secure.sh << 'EOF'
#!/bin/bash

# 🚀 Script de Inicialização Segura - Backend #PraTodosVerem

echo "🚀 Iniciando servidor seguro..."

# Verificar se a chave da API está configurada
if [ -f ".env" ]; then
    echo "✅ Usando variável de ambiente"
elif grep -q "sk-proj" config.js; then
    echo "✅ Usando arquivo de configuração"
else
    echo "❌ Chave da API não configurada"
    echo "Execute: ./setup-secure.sh"
    exit 1
fi

# Iniciar servidor seguro
echo "🔒 Iniciando servidor com proteções de segurança..."
node server-secure.js
EOF

chmod +x start-secure.sh
print_success "Script de inicialização criado ✓"

# Criar arquivo de instruções
cat > INSTRUCOES_SEGURANCA.md << 'EOF'
# 🔒 Instruções de Segurança - Backend #PraTodosVerem

## ✅ Configuração Concluída

O backend foi configurado com as seguintes proteções de segurança:

### 🛡️ Proteções Implementadas:

1. **Helmet** - Proteções HTTP
2. **Rate Limiting** - 100 req/15min, 10 transcrições/min
3. **CORS** - Apenas origens permitidas
4. **Validação de Entrada** - Todos os dados validados
5. **Logging de Segurança** - Monitoramento de tentativas suspeitas
6. **Timeout** - 30 segundos para requisições
7. **Validação de Arquivos** - Apenas imagens permitidas
8. **Proteção de Chave** - Validação da API key

### 🚀 Como Usar:

1. **Iniciar servidor:**
   ```bash
   ./start-secure.sh
   ```

2. **Acessar frontend:**
   - Abra: `../index-backend.html`
   - Ou use: `http://localhost:3001`

3. **Testar:**
   - Upload de imagem
   - Transcrição automática
   - Verificar logs de segurança

### 🔍 Monitoramento:

- **Logs:** Todos os acessos são logados
- **Rate Limiting:** Proteção contra spam
- **Tentativas Suspeitas:** Alertas automáticos
- **Uso de Tokens:** Monitoramento de custos

### ⚠️ Importante:

- **NUNCA** compartilhe o arquivo `.env` ou `config.js`
- **MONITORE** os logs regularmente
- **BACKUP** da chave em local seguro
- **ATUALIZE** dependências regularmente

### 📊 Endpoints Disponíveis:

- `GET /api/health` - Status do servidor
- `POST /api/transcribe` - Transcrição via upload
- `POST /api/transcribe-base64` - Transcrição via base64

### 🆘 Suporte:

Se encontrar problemas:
1. Verifique os logs do servidor
2. Confirme se a chave da API está correta
3. Verifique se as dependências estão instaladas
4. Teste a conectividade com a OpenAI

---

**Status:** ✅ Configurado e Seguro  
**Versão:** 1.0.0  
**Data:** Dezembro 2024
EOF

print_success "Instruções de segurança criadas ✓"

# Resumo final
echo ""
print_success "🎉 Configuração segura concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute: ./start-secure.sh"
echo "2. Abra: ../index-backend.html"
echo "3. Teste a ferramenta"
echo ""
echo "🔒 Proteções ativas:"
echo "• Rate limiting: 100 req/15min, 10 transcrições/min"
echo "• CORS: Apenas origens permitidas"
echo "• Validação: Todos os dados validados"
echo "• Logging: Monitoramento de segurança"
echo "• Timeout: 30 segundos por requisição"
echo ""
print_warning "⚠️  IMPORTANTE: NUNCA compartilhe os arquivos .env ou config.js!"
echo ""
print_status "📖 Consulte INSTRUCOES_SEGURANCA.md para mais detalhes" 