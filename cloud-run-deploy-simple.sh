#!/bin/bash

echo "🚀 Deploy Direto da Ferramenta #PraTodosVerem"
echo "============================================="
echo ""

# Configurações
SERVICE_NAME="transcricao-pra-todos-verem"
REGION="us-central1"
PROJECT_ID=$(gcloud config get-value project)

echo "📋 Configurações:"
echo "   Projeto: $PROJECT_ID"
echo "   Serviço: $SERVICE_NAME"
echo "   Região: $REGION"
echo ""

# Criar diretório temporário
echo "📁 Preparando arquivos..."
mkdir -p /tmp/transcricao-deploy
cd /tmp/transcricao-deploy

# Baixar arquivos do repositório
echo "📥 Baixando código do repositório..."
git clone https://github.com/Greyce-Dourados/transcricao-pra-todos-verem.git .
git checkout cloud-run-deploy

echo "✅ Código baixado com sucesso!"
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
else
    echo "❌ Não foi possível obter a URL do serviço"
fi

echo ""
echo "🧹 Limpando arquivos temporários..."
cd /
rm -rf /tmp/transcricao-deploy

echo "✅ Processo concluído!" 