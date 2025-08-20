# 🚀 Guia Completo: Deploy no Google Cloud Run

## 📋 **Solução Empresarial para GCP**

Esta solução é otimizada para empresas que usam Google Cloud Platform, oferecendo segurança, escalabilidade e integração com IAM.

## 🎯 **Vantagens do Cloud Run:**

- ✅ **Segurança empresarial** - Integração com IAM
- ✅ **Escalabilidade automática** - 0 a 1000 instâncias
- ✅ **Custo otimizado** - Paga apenas pelo uso
- ✅ **Deploy simples** - Um comando
- ✅ **HTTPS automático** - SSL/TLS incluído
- ✅ **Logs integrados** - Cloud Logging

## 📁 **Estrutura do Projeto:**

```
cloud-run/
├── Dockerfile              # Configuração do container
├── package.json            # Dependências Node.js
├── server.js               # Servidor Express
├── .dockerignore           # Arquivos ignorados no build
├── env.example             # Exemplo de variáveis de ambiente
└── public/                 # Arquivos estáticos
    ├── index.html          # Interface principal
    ├── script.js           # JavaScript do frontend
    └── styles.css          # Estilos CSS
```

## 🚀 **Passo a Passo para Deploy:**

### **Pré-requisitos:**

1. **Google Cloud SDK** instalado
2. **Conta GCP** ativa
3. **Projeto GCP** criado
4. **Billing** habilitado

### **Passo 1: Configurar Google Cloud SDK**

```bash
# Instalar Google Cloud SDK (se não tiver)
# https://cloud.google.com/sdk/docs/install

# Fazer login
gcloud auth login

# Configurar projeto
gcloud config set project SEU_PROJETO_ID

# Habilitar APIs necessárias
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### **Passo 2: Preparar Arquivos**

1. **Navegue** para a pasta do projeto:
   ```bash
   cd cloud-run
   ```

2. **Instale dependências** (opcional, para teste local):
   ```bash
   npm install
   ```

3. **Teste localmente** (opcional):
   ```bash
   npm start
   ```

### **Passo 3: Configurar Variáveis de Ambiente**

1. **Crie** um arquivo `.env` baseado no `env.example`:
   ```bash
   cp env.example .env
   ```

2. **Edite** o arquivo `.env` com suas configurações:
   ```env
   OPENAI_API_KEY=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
   NODE_ENV=production
   ALLOWED_ORIGINS=*
   ```

### **Passo 4: Deploy no Cloud Run**

```bash
# Deploy com build automático
gcloud run deploy transcricao-pra-todos-verem \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "OPENAI_API_KEY=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" \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "ALLOWED_ORIGINS=*"
```

### **Passo 5: Configurar IAM (Opcional)**

Para restringir acesso apenas a usuários da empresa:

```bash
# Remover acesso público
gcloud run services update transcricao-pra-todos-verem \
  --region us-central1 \
  --no-allow-unauthenticated

# Adicionar usuários específicos
gcloud run services add-iam-policy-binding transcricao-pra-todos-verem \
  --region us-central1 \
  --member="user:usuario@g.globo" \
  --role="roles/run.invoker"
```

## 🔒 **Configurações de Segurança:**

### **1. Rate Limiting**
- **Geral:** 100 requisições por 15 minutos
- **Transcrição:** 10 requisições por minuto

### **2. Validação de Entrada**
- **Email:** Apenas @g.globo
- **Arquivos:** Apenas imagens (JPEG, PNG, GIF, WebP)
- **Tamanho:** Máximo 10MB

### **3. Headers de Segurança**
- **Helmet:** Proteção contra ataques comuns
- **CORS:** Configurável
- **CSP:** Content Security Policy

## 📊 **Monitoramento:**

### **Cloud Logging**
```bash
# Ver logs em tempo real
gcloud logs tail --service=transcricao-pra-todos-verem
```

### **Cloud Monitoring**
- **Métricas automáticas:** CPU, memória, requisições
- **Alertas configuráveis:** Erros, latência, custos

## 💰 **Custos Estimados:**

### **Cenário Típico (100 usuários):**
- **Requisições:** ~1.000/mês
- **Tempo de execução:** ~30 segundos/requisição
- **Custo estimado:** $5-15/mês

### **Fatores de Custo:**
- **Requisições:** $0.40/milhão
- **CPU:** $0.00002400/vCPU-segundo
- **Memória:** $0.00000250/GB-segundo

## 🔧 **Comandos Úteis:**

### **Deploy**
```bash
# Deploy inicial
gcloud run deploy transcricao-pra-todos-verem --source .

# Deploy com variáveis de ambiente
gcloud run deploy transcricao-pra-todos-verem \
  --source . \
  --set-env-vars "OPENAI_API_KEY=SUA_CHAVE"
```

### **Gerenciamento**
```bash
# Listar serviços
gcloud run services list

# Ver detalhes
gcloud run services describe transcricao-pra-todos-verem

# Ver logs
gcloud logs read --service=transcricao-pra-todos-verem

# Deletar serviço
gcloud run services delete transcricao-pra-todos-verem
```

### **Escalabilidade**
```bash
# Configurar escalabilidade
gcloud run services update transcricao-pra-todos-verem \
  --min-instances=0 \
  --max-instances=10 \
  --cpu=1 \
  --memory=512Mi
```

## 📧 **Email para Compartilhar:**

```
Assunto: Nova Ferramenta #PraTodosVerem - Google Cloud Run

Olá equipe!

Criei uma ferramenta para transcrição de imagens seguindo o padrão #PraTodosVerem.

🌐 Link: [URL_DO_CLOUD_RUN]

📋 Como usar:

1. Acesse o link acima
2. Faça login com seu email @g.globo
3. Faça upload de uma imagem
4. Clique em "Gerar Transcrição"
5. Edite se necessário
6. Clique em "Abrir no Outlook"

✅ Funcionalidades:
- Interface moderna e responsiva
- Transcrição automática via IA
- Edição do texto gerado
- Integração com Outlook
- Autenticação por email @g.globo
- Backend seguro no Google Cloud Run
- Escalabilidade automática

🔒 Segurança:
- Rate limiting configurado
- Validação de entrada
- Headers de segurança
- Logs de auditoria

❓ Dúvidas? Me avisem!

Abraços,
Greyce
```

## 🆘 **Troubleshooting:**

### **Problema: Deploy falha**
```bash
# Verificar logs do build
gcloud builds log [BUILD_ID]

# Verificar configuração
gcloud run services describe transcricao-pra-todos-verem
```

### **Problema: Erro 500**
```bash
# Ver logs do serviço
gcloud logs read --service=transcricao-pra-todos-verem --limit=50
```

### **Problema: Timeout**
```bash
# Aumentar timeout
gcloud run services update transcricao-pra-todos-verem \
  --timeout=300
```

## 🎯 **Próximos Passos:**

1. **Deploy inicial** - Teste básico
2. **Configurar domínio** - Custom domain (opcional)
3. **Configurar IAM** - Restringir acesso
4. **Monitoramento** - Alertas e métricas
5. **Backup** - Estratégia de backup

**Esta solução é ideal para empresas que já usam GCP!** 🚀 