#!/bin/bash

# Script de inicialização para Transcrição #PraTodosVerem
echo "🚀 Iniciando Transcrição #PraTodosVerem..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado."
    echo "📥 Por favor, instale o Node.js de https://nodejs.org/"
    echo ""
    echo "💡 Alternativamente, você pode usar a versão frontend only:"
    echo "   Abra o arquivo 'index.html' diretamente no navegador"
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não está instalado."
    echo "📥 Por favor, instale o npm junto com o Node.js"
    exit 1
fi

echo "✅ Node.js e npm encontrados"

# Navegar para o diretório do backend
cd "$(dirname "$0")/backend"

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao instalar dependências"
        exit 1
    fi
fi

echo "✅ Dependências instaladas"

# Iniciar o servidor
echo "🌐 Iniciando servidor na porta 3001..."
echo "📝 Acesse: http://localhost:3001/api/health para verificar o status"
echo "🌍 Abra o arquivo 'index-backend.html' no navegador"
echo ""
echo "⏹️  Pressione Ctrl+C para parar o servidor"
echo ""

npm start 