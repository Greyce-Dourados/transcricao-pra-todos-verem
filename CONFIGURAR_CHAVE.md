# 🔑 Configuração da Chave da API OpenAI

## ⚠️ IMPORTANTE: Configure sua chave antes de usar!

### **Passo 1: Obter sua chave da API**
1. Acesse: https://platform.openai.com/api-keys
2. Faça login na sua conta OpenAI
3. Clique em "Create new secret key"
4. Copie a chave gerada

### **Passo 2: Configurar a chave**

#### **Opção A: Para uso local (recomendado)**
1. Abra o arquivo `script.js`
2. Localize a linha:
   ```javascript
   const OPENAI_API_KEY = 'SUA_CHAVE_OPENAI_AQUI';
   ```
3. Substitua `SUA_CHAVE_OPENAI_AQUI` pela sua chave real
4. Salve o arquivo

#### **Opção B: Para uso com backend**
1. Abra o arquivo `backend/config.js`
2. Localize a linha:
   ```javascript
   OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'SUA_CHAVE_OPENAI_AQUI',
   ```
3. Substitua `SUA_CHAVE_OPENAI_AQUI` pela sua chave real
4. Salve o arquivo

### **Passo 3: Testar**
1. Abra `index.html` no navegador
2. Faça login com seu email @g.globo
3. Teste o upload e transcrição de uma imagem

## 🔒 Segurança
- ⚠️ **NUNCA** compartilhe sua chave da API
- ⚠️ **NUNCA** faça commit da chave no GitHub
- ✅ Use variáveis de ambiente em produção
- ✅ Mantenha a chave em arquivos locais apenas

## 💡 Dica
Para cada analista que usar a ferramenta, eles precisarão configurar sua própria chave da API OpenAI. 