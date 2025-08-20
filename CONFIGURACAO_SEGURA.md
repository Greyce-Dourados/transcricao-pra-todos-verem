# 🔒 Guia de Configuração Segura da Chave da API

## ⚠️ **IMPORTANTE: Segurança da Chave da API**

A chave da OpenAI é um recurso valioso e deve ser protegida. Nunca compartilhe ou exponha sua chave publicamente.

---

## 🎯 **Método 1: Frontend-Only (Mais Simples)**

### **Para uso local/desenvolvimento:**

1. **Abra o arquivo:** `script.js`
2. **Localize a linha 2:**
   ```javascript
   const OPENAI_API_KEY = 'SUA_CHAVE_OPENAI_AQUI';
   ```
3. **Substitua pela sua chave:**
   ```javascript
   const OPENAI_API_KEY = 'sk-proj-sua-chave-real-aqui';
   ```

### **⚠️ Limitações:**
- ❌ Chave visível no código
- ❌ Qualquer pessoa pode ver a chave
- ❌ Risco de vazamento se compartilhar o código

### **✅ Vantagens:**
- ✅ Funciona imediatamente
- ✅ Não requer configuração adicional
- ✅ Ideal para testes e desenvolvimento

---

## 🔐 **Método 2: Backend Seguro (Recomendado)**

### **Passo 1: Criar arquivo de configuração**

1. **Crie um arquivo:** `backend/config.js` (já existe)
2. **Adicione sua chave:**
   ```javascript
   module.exports = {
       OPENAI_API_KEY: 'sk-proj-sua-chave-real-aqui',
       // ... outras configurações
   };
   ```

### **Passo 2: Configurar .gitignore**

1. **Adicione ao arquivo:** `.gitignore`
   ```gitignore
   # Arquivos de configuração com chaves
   backend/config.js
   .env
   .env.local
   ```

### **Passo 3: Usar a versão backend**

1. **Abra:** `index-backend.html`
2. **Inicie o servidor:**
   ```bash
   cd backend
   npm install
   node server.js
   ```

### **✅ Vantagens:**
- ✅ Chave protegida no servidor
- ✅ Rate limiting implementado
- ✅ Validação de entrada
- ✅ Logs de segurança

---

## 🌐 **Método 3: Deploy em Produção (Mais Seguro)**

### **Para GitHub Pages (Frontend-Only):**

1. **Use variáveis de ambiente do navegador:**
   ```javascript
   const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_KEY || 'sua-chave';
   ```

2. **Configure no GitHub:**
   - Settings > Secrets and variables > Actions
   - Adicione: `REACT_APP_OPENAI_KEY`

### **Para servidor próprio:**

1. **Use arquivo .env:**
   ```bash
   # .env
   OPENAI_API_KEY=sk-proj-sua-chave-real-aqui
   ```

2. **Configure no servidor:**
   ```bash
   export OPENAI_API_KEY="sk-proj-sua-chave-real-aqui"
   ```

---

## 🛡️ **Método 4: Proxy Seguro (Mais Avançado)**

### **Criar um proxy para proteger a chave:**

1. **Servidor proxy simples:**
   ```javascript
   // proxy.js
   const express = require('express');
   const OpenAI = require('openai');
   
   const app = express();
   const openai = new OpenAI({
       apiKey: process.env.OPENAI_API_KEY
   });
   
   app.post('/api/transcribe', async (req, res) => {
       // Lógica de transcrição aqui
   });
   
   app.listen(3001);
   ```

2. **Frontend faz requisições para o proxy:**
   ```javascript
   fetch('/api/transcribe', {
       method: 'POST',
       body: formData
   });
   ```

---

## 📋 **Checklist de Segurança**

### **✅ Antes de compartilhar:**
- [ ] Chave não está no código público
- [ ] Arquivo .gitignore configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Rate limiting ativo
- [ ] Logs de segurança habilitados

### **✅ Para produção:**
- [ ] HTTPS configurado
- [ ] CORS configurado corretamente
- [ ] Validação de entrada implementada
- [ ] Monitoramento de uso ativo
- [ ] Backup da chave em local seguro

---

## 🚨 **O que NUNCA fazer:**

### **❌ NUNCA:**
- Commitar chave no Git
- Compartilhar chave em emails
- Postar chave em fóruns
- Deixar chave em código público
- Usar chave em demos públicas

### **❌ NUNCA:**
- Hardcodar chave em JavaScript frontend
- Incluir chave em screenshots
- Compartilhar chave no Slack/Teams
- Deixar chave em logs públicos

---

## 🔧 **Configuração Rápida (Recomendada)**

### **Para uso imediato:**

1. **Edite:** `script.js` linha 2
2. **Substitua:** `SUA_CHAVE_OPENAI_AQUI` pela sua chave real
3. **Teste** a ferramenta
4. **NÃO** compartilhe o arquivo `script.js`

### **Para uso em equipe:**

1. **Configure o backend** (método 2)
2. **Use:** `index-backend.html`
3. **Inicie o servidor** localmente
4. **Compartilhe** apenas a URL do frontend

---

## 📞 **Suporte**

Se precisar de ajuda com a configuração:

1. **Para uso pessoal:** Método 1 (Frontend-Only)
2. **Para equipe pequena:** Método 2 (Backend)
3. **Para produção:** Método 3 (Deploy)
4. **Para máxima segurança:** Método 4 (Proxy)

---

## 💡 **Dica Importante**

**Para GitHub Pages:** Use a versão frontend-only com sua chave, mas NUNCA compartilhe o código fonte. Apenas compartilhe a URL da ferramenta funcionando.

**Para equipe interna:** Use a versão backend para maior segurança e controle. 