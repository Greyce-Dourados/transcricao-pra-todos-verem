# 🚀 Guia Completo: Hospedar no Netlify

## 📋 **Solução Prática para a Equipe**

Esta solução permite que cada analista configure sua própria chave da API OpenAI diretamente na interface web, sem precisar de conhecimentos técnicos.

## 🎯 **Vantagens desta Solução:**

- ✅ **Sem conhecimentos técnicos** - Interface amigável
- ✅ **Chave segura** - Cada usuário configura sua própria chave
- ✅ **Hospedagem gratuita** - Netlify oferece plano gratuito
- ✅ **Fácil manutenção** - Sem servidor para gerenciar
- ✅ **Acesso global** - Disponível 24/7

## 📁 **Arquivos Necessários:**

1. `index-netlify.html` - Interface principal
2. `script-netlify.js` - Lógica da aplicação
3. `styles.css` - Estilos da aplicação

## 🚀 **Passo a Passo para Deploy:**

### **Passo 1: Preparar os Arquivos**

1. **Crie uma nova pasta** para o projeto Netlify:
   ```bash
   mkdir transcricao-netlify
   cd transcricao-netlify
   ```

2. **Copie os arquivos** para a nova pasta:
   - `index-netlify.html` → renomeie para `index.html`
   - `script-netlify.js` → renomeie para `script.js`
   - `styles.css` → mantenha o nome

### **Passo 2: Criar Conta no Netlify**

1. **Acesse:** https://netlify.com
2. **Clique** em "Sign up"
3. **Escolha** "Sign up with GitHub" (recomendado)
4. **Autorize** o acesso ao GitHub

### **Passo 3: Fazer Deploy**

#### **Opção A: Deploy via GitHub (Recomendado)**

1. **Crie um repositório** no GitHub:
   - Nome: `transcricao-pra-todos-verem-netlify`
   - Público ou privado

2. **Faça upload** dos arquivos:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/transcricao-pra-todos-verem-netlify.git
   git push -u origin main
   ```

3. **No Netlify:**
   - Clique em "New site from Git"
   - Escolha GitHub
   - Selecione o repositório
   - Clique em "Deploy site"

#### **Opção B: Deploy Manual**

1. **No Netlify:**
   - Clique em "New site from Git"
   - Escolha "Deploy manually"
   - Arraste a pasta com os arquivos
   - Clique em "Deploy site"

### **Passo 4: Configurar Domínio**

1. **Netlify gera** um domínio automático (ex: `amazing-site-123.netlify.app`)
2. **Você pode personalizar** o domínio:
   - Vá em "Site settings" → "Domain management"
   - Clique em "Change site name"
   - Escolha um nome personalizado (ex: `pra-todos-verem`)

## 🔑 **Como Cada Analista Configura sua Chave:**

### **Passo 1: Obter Chave da API**
1. Acesse: https://platform.openai.com/api-keys
2. Faça login na conta OpenAI
3. Clique em "Create new secret key"
4. Copie a chave (começa com `sk-`)

### **Passo 2: Configurar na Ferramenta**
1. **Acesse** o link da ferramenta
2. **Faça login** com email @g.globo
3. **Na barra amarela**, cole sua chave da API
4. **Clique** em "Salvar"
5. **Pronto!** A ferramenta está configurada

## 📧 **Email para Compartilhar com a Equipe:**

```
Assunto: Nova Ferramenta #PraTodosVerem - Fácil de Usar!

Olá equipe!

Criei uma ferramenta para transcrição de imagens seguindo o padrão #PraTodosVerem.

🌐 Link: [LINK_DO_NETLIFY]

📋 Como usar (MUITO SIMPLES):

1. Acesse o link acima
2. Faça login com seu email @g.globo
3. Configure sua chave da API OpenAI (1 minuto):
   - Acesse: https://platform.openai.com/api-keys
   - Clique em "Create new secret key"
   - Copie a chave (começa com sk-)
   - Cole na ferramenta e clique em "Salvar"
4. Faça upload de uma imagem
5. Clique em "Gerar Transcrição"
6. Edite se necessário
7. Clique em "Abrir no Outlook"

✅ Funcionalidades:
- Interface simples e intuitiva
- Cada um configura sua própria chave
- Transcrição automática via IA
- Edição do texto gerado
- Integração com Outlook
- Autenticação por email @g.globo

❓ Dúvidas? Me avisem!

Abraços,
Greyce
```

## 🔒 **Segurança:**

- ✅ **Chaves individuais** - Cada usuário tem sua própria chave
- ✅ **Armazenamento local** - Chave salva apenas no navegador do usuário
- ✅ **Sem servidor** - Não há risco de vazamento no servidor
- ✅ **Domínio @g.globo** - Apenas colaboradores da Globo podem usar

## 💡 **Dicas Importantes:**

1. **Teste primeiro** - Faça o deploy e teste antes de compartilhar
2. **Documente** - Mantenha o link e instruções em local acessível
3. **Monitore** - Verifique se todos conseguem acessar
4. **Backup** - Mantenha os arquivos salvos localmente

## 🆘 **Suporte:**

Se algum analista tiver problemas:

1. **Verificar** se a chave da API está correta
2. **Confirmar** se o email é @g.globo
3. **Testar** em outro navegador
4. **Verificar** se a imagem não é muito grande

**Esta solução é perfeita para equipes sem conhecimentos técnicos!** 🎯 