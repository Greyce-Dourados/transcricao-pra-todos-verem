# 📋 Instruções de Uso - Transcrição #PraTodosVerem

## 🎯 Visão Geral

Esta aplicação permite criar descrições textuais de imagens no padrão #PraTodosVerem usando inteligência artificial da OpenAI. Duas versões estão disponíveis:

1. **Versão Frontend Only** (`index.html`) - Mais simples, mas menos segura
2. **Versão com Backend** (`index-backend.html`) - Mais segura, recomendada para produção

## 🚀 Como Usar

### Opção 1: Versão Frontend Only (Mais Simples)

1. **Abrir a aplicação:**
   - Abra o arquivo `index.html` em qualquer navegador moderno
   - Funciona imediatamente, sem instalação

2. **Usar a ferramenta:**
   - Clique em "Inserir Imagem" ou arraste uma imagem
   - Clique em "Gerar Transcrição com IA"
   - Veja o resultado e use os botões para copiar ou abrir no Outlook

### Opção 2: Versão com Backend (Mais Segura)

1. **Instalar Node.js:**
   ```bash
   # No macOS (usando Homebrew)
   brew install node
   
   # Ou baixe de https://nodejs.org/
   ```

2. **Configurar o backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Executar o servidor:**
   ```bash
   npm start
   # ou para desenvolvimento: npm run dev
   ```

4. **Abrir a aplicação:**
   - Abra o arquivo `index-backend.html` no navegador
   - Verifique se o status do backend está "Online"

## 📁 Estrutura dos Arquivos

```
transcricao-pra-todos-verem/
├── index.html              # Versão frontend only
├── index-backend.html      # Versão com backend
├── script.js               # JavaScript para frontend only
├── script-backend.js       # JavaScript para versão com backend
├── styles.css              # Estilos da aplicação
├── README.md               # Documentação principal
├── INSTRUCOES.md           # Este arquivo
└── backend/                # Pasta do servidor Node.js
    ├── server.js           # Servidor principal
    ├── config.js           # Configurações
    ├── package.json        # Dependências
    └── README.md           # Documentação do backend
```

## 🔧 Configurações

### Chave da API OpenAI

A chave da API está configurada nos seguintes locais:

- **Frontend Only:** `script.js` (linha 2)
- **Backend:** `backend/config.js` (linha 3)

Para usar sua própria chave:
1. Acesse [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Crie uma nova chave
3. Substitua a chave nos arquivos mencionados

### Porta do Backend

Por padrão, o backend roda na porta 3001. Para alterar:
- **Backend:** Edite `backend/config.js` (linha 6)
- **Frontend:** Edite `script-backend.js` (linha 2)

## 🛡️ Segurança

### Versão Frontend Only
- ⚠️ **Chave da API exposta** no navegador
- ✅ Funciona imediatamente
- ✅ Não requer instalação

### Versão com Backend
- ✅ **Chave da API protegida** no servidor
- ✅ Rate limiting implementado
- ✅ Validação de arquivos
- ⚠️ Requer instalação do Node.js

## 📧 Integração com Outlook

A aplicação tenta abrir o Outlook de duas formas:

1. **Microsoft Graph API** (se disponível)
2. **Fallback mailto** (cliente de e-mail padrão)

### Para melhor integração com Microsoft 365:

1. Configure o Microsoft Graph API
2. Adicione autenticação OAuth
3. Use a biblioteca Microsoft Graph JavaScript SDK

## 🐛 Solução de Problemas

### Erro "Backend Offline"
- Verifique se o servidor Node.js está rodando
- Confirme se a porta 3001 está livre
- Verifique os logs do servidor

### Erro de API OpenAI
- Verifique se a chave da API está válida
- Confirme se tem créditos na conta OpenAI
- Verifique se o modelo `gpt-4o` está disponível

### Erro de CORS
- Use a versão frontend only
- Ou configure o CORS no backend

### Imagem não carrega
- Verifique se o arquivo é uma imagem válida
- Confirme se o tamanho é menor que 10MB
- Tente outro formato (JPG, PNG)

## 📱 Compatibilidade

### Navegadores Suportados
- ✅ Chrome (recomendado)
- ✅ Edge
- ✅ Firefox
- ✅ Safari

### Sistemas Operacionais
- ✅ Windows
- ✅ macOS
- ✅ Linux

## 🔄 Atualizações

Para atualizar a aplicação:

1. **Frontend:** Substitua os arquivos HTML, CSS e JS
2. **Backend:** 
   ```bash
   cd backend
   npm update
   ```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do console do navegador (F12)
2. Verifique os logs do servidor (se usando backend)
3. Confirme se todas as dependências estão instaladas
4. Teste com uma imagem simples primeiro

## 🎉 Funcionalidades Principais

- ✅ Upload de imagens (drag & drop)
- ✅ Preview da imagem
- ✅ Transcrição automática com IA
- ✅ Formatação no padrão #PraTodosVerem
- ✅ Copiar transcrição
- ✅ Abrir no Outlook
- ✅ Interface responsiva
- ✅ Validação de arquivos
- ✅ Tratamento de erros
- ✅ Notificações visuais

---

**Desenvolvido para promover a acessibilidade digital através do padrão #PraTodosVerem** 