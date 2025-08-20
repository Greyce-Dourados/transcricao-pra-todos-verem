# 🔒 Guia do Backend Seguro - #PraTodosVerem

## 🎯 **Configuração Segura da Chave da API**

Este guia mostra como configurar o backend com proteções robustas para proteger sua chave da OpenAI.

---

## 🚀 **Configuração Rápida (5 minutos)**

### **Passo 1: Acessar a pasta backend**
```bash
cd backend
```

### **Passo 2: Executar script de configuração**
```bash
./setup-secure.sh
```

### **Passo 3: Seguir as instruções**
- Escolher método de configuração da chave
- Inserir sua chave da OpenAI
- Aguardar instalação das dependências

### **Passo 4: Iniciar servidor seguro**
```bash
./start-secure.sh
```

### **Passo 5: Testar a ferramenta**
- Abrir: `../index-backend.html`
- Fazer upload de imagem
- Verificar transcrição

---

## 🛡️ **Proteções de Segurança Implementadas**

### **1. 🔐 Proteção da Chave da API**
- ✅ **Variável de ambiente** (.env)
- ✅ **Validação de formato** (sk-proj-...)
- ✅ **Verificação de existência**
- ✅ **Não exposição em logs**

### **2. 🚦 Rate Limiting**
- ✅ **Geral:** 100 requisições/15 minutos por IP
- ✅ **Transcrição:** 10 transcrições/minuto por IP
- ✅ **Proteção contra spam**
- ✅ **Logs de tentativas excedidas**

### **3. 🌐 CORS Seguro**
- ✅ **Origins permitidas apenas:**
  - `http://localhost:3000`
  - `http://127.0.0.1:5500`
  - `https://Greyce-Dourados.github.io`
- ✅ **Métodos restritos:** GET, POST
- ✅ **Headers controlados**

### **4. 🛡️ Helmet (Proteções HTTP)**
- ✅ **Content Security Policy**
- ✅ **HSTS (HTTPS Strict)**
- ✅ **XSS Protection**
- ✅ **No Sniff**
- ✅ **Frame Options**

### **5. ✅ Validação de Entrada**
- ✅ **Tipo de arquivo** (apenas imagens)
- ✅ **Tamanho máximo** (10MB)
- ✅ **Extensões permitidas**
- ✅ **JSON válido**
- ✅ **Base64 válido**

### **6. 📊 Logging de Segurança**
- ✅ **Todos os acessos logados**
- ✅ **IP e User-Agent registrados**
- ✅ **Tentativas suspeitas alertadas**
- ✅ **Uso de tokens monitorado**

### **7. ⏱️ Timeout e Retry**
- ✅ **Timeout:** 30 segundos por requisição
- ✅ **Retry:** 3 tentativas automáticas
- ✅ **Promise.race** para controle

### **8. 🚨 Tratamento de Erros**
- ✅ **Não exposição de detalhes internos**
- ✅ **Mensagens de erro amigáveis**
- ✅ **Logs de erro detalhados**
- ✅ **Status codes apropriados**

---

## 📁 **Estrutura de Arquivos Segura**

```
backend/
├── server-secure.js          # Servidor com proteções
├── setup-secure.sh          # Script de configuração
├── start-secure.sh          # Script de inicialização
├── config.js               # Configurações (protegido)
├── .env                    # Variáveis de ambiente (protegido)
├── package.json            # Dependências
└── INSTRUCOES_SEGURANCA.md # Instruções detalhadas
```

---

## 🔧 **Métodos de Configuração da Chave**

### **Opção 1: Variável de Ambiente (Recomendado)**
```bash
# Criar arquivo .env
echo "OPENAI_API_KEY=sua_chave_aqui" > .env
echo "PORT=3001" >> .env
```

### **Opção 2: Arquivo de Configuração**
```javascript
// config.js
module.exports = {
    OPENAI_API_KEY: 'sua_chave_aqui',
    // ... outras configurações
};
```

---

## 📊 **Monitoramento e Logs**

### **Logs de Acesso**
```
[2024-12-XX] POST /api/transcribe - IP: 192.168.1.100 - UA: Mozilla/5.0...
[TRANSCRIÇÃO] Iniciando processamento - IP: 192.168.1.100
[TRANSCRIÇÃO] Sucesso - IP: 192.168.1.100 - Tokens: 150
```

### **Logs de Segurança**
```
[SEGURANÇA] Tentativa de acesso suspeito: /admin - IP: 192.168.1.100
[SEGURANÇA] Chave da API não configurada
[ERRO] Rate limit excedido - IP: 192.168.1.100
```

---

## 🚨 **Alertas de Segurança**

### **Tentativas Suspeitas Detectadas:**
- ❌ Acesso a `/admin`
- ❌ Acesso a `/config`
- ❌ Acesso a `/.env`
- ❌ Rate limit excedido
- ❌ Tipo de arquivo inválido
- ❌ Tamanho de arquivo excedido

### **Ações Automáticas:**
- ✅ **Log** de tentativa suspeita
- ✅ **Bloqueio** temporário (rate limit)
- ✅ **Resposta** de erro apropriada
- ✅ **Monitoramento** contínuo

---

## 🔍 **Testes de Segurança**

### **Teste 1: Rate Limiting**
```bash
# Fazer 11 requisições em 1 minuto
for i in {1..11}; do
  curl -X POST http://localhost:3001/api/transcribe
done
```

### **Teste 2: Validação de Arquivo**
```bash
# Tentar upload de arquivo não-imagem
curl -X POST -F "image=@arquivo.txt" http://localhost:3001/api/transcribe
```

### **Teste 3: CORS**
```bash
# Tentar acesso de origem não permitida
curl -H "Origin: https://site-malicioso.com" http://localhost:3001/api/health
```

---

## 📈 **Métricas de Uso**

### **Informações Monitoradas:**
- 📊 **Requisições por IP**
- 🎯 **Transcrições realizadas**
- 💰 **Tokens utilizados**
- ⏱️ **Tempo de resposta**
- 🚨 **Tentativas suspeitas**

### **Relatórios Disponíveis:**
- 📅 **Uso diário**
- 📊 **IPs mais ativos**
- 💸 **Custos por período**
- 🛡️ **Alertas de segurança**

---

## 🆘 **Solução de Problemas**

### **Problema: "Chave da API não configurada"**
**Solução:**
1. Verificar se arquivo `.env` existe
2. Verificar se `config.js` tem a chave
3. Executar `./setup-secure.sh` novamente

### **Problema: "Rate limit excedido"**
**Solução:**
1. Aguardar 1 minuto
2. Verificar se não há múltiplas instâncias
3. Verificar logs para tentativas suspeitas

### **Problema: "CORS error"**
**Solução:**
1. Verificar origem da requisição
2. Adicionar origem ao CORS se necessário
3. Verificar se frontend está na origem correta

### **Problema: "Timeout da API"**
**Solução:**
1. Verificar conectividade com OpenAI
2. Verificar se chave da API está correta
3. Verificar se há problemas na rede

---

## 🔄 **Atualizações de Segurança**

### **Atualizar Dependências:**
```bash
npm update
npm audit fix
```

### **Verificar Vulnerabilidades:**
```bash
npm audit
```

### **Backup da Configuração:**
```bash
cp .env .env.backup
cp config.js config.js.backup
```

---

## 📞 **Suporte**

### **Para Problemas Técnicos:**
1. Verificar logs do servidor
2. Consultar `INSTRUCOES_SEGURANCA.md`
3. Verificar conectividade
4. Testar com imagem simples

### **Para Questões de Segurança:**
1. Monitorar logs de segurança
2. Verificar tentativas suspeitas
3. Atualizar dependências
4. Revisar configurações CORS

---

## ✅ **Checklist de Segurança**

### **Antes de Colocar em Produção:**
- [ ] Chave da API configurada
- [ ] Rate limiting ativo
- [ ] CORS configurado
- [ ] Logs funcionando
- [ ] Validações ativas
- [ ] Timeout configurado
- [ ] Dependências atualizadas
- [ ] Backup da configuração

### **Monitoramento Contínuo:**
- [ ] Verificar logs diariamente
- [ ] Monitorar uso de tokens
- [ ] Verificar tentativas suspeitas
- [ ] Atualizar dependências mensalmente
- [ ] Backup semanal da configuração

---

**Status:** ✅ Configurado e Seguro  
**Versão:** 1.0.0  
**Data:** Dezembro 2024  
**Desenvolvido para:** Proteção máxima da chave da API OpenAI 