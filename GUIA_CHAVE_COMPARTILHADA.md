# 🔑 Guia: Chave Compartilhada para a Equipe

## 📋 **Solução para Chave Única**

Esta solução permite que você configure sua chave da API OpenAI uma vez e toda a equipe use a mesma ferramenta.

## 🎯 **Como Funciona:**

1. **Você configura** a chave uma vez via URL
2. **A chave fica salva** no navegador de cada usuário
3. **Todos usam** a mesma ferramenta sem precisar configurar nada

## 🚀 **Passo a Passo:**

### **Passo 1: Configurar a Chave (Você faz uma vez)**

1. **Obtenha sua chave** da API OpenAI:
   - Acesse: https://platform.openai.com/api-keys
   - Copie sua chave (começa com `sk-`)

2. **Configure a chave** na ferramenta:
   - Acesse a ferramenta
   - Adicione `?api_key=SUA_CHAVE_AQUI` no final da URL
   - Exemplo: `https://seu-site.netlify.app?api_key=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`
   - A chave será salva automaticamente

3. **Remova a chave da URL** após a configuração:
   - A URL voltará ao normal: `https://seu-site.netlify.app`
   - A chave ficará salva no navegador

### **Passo 2: Compartilhar com a Equipe**

**Email para enviar:**

```
Assunto: Ferramenta #PraTodosVerem - Pronta para Usar!

Olá equipe!

Criei uma ferramenta para transcrição de imagens seguindo o padrão #PraTodosVerem.

🌐 Link: [LINK_DA_FERRAMENTA]

📋 Como usar (MUITO SIMPLES):

1. Acesse o link acima
2. Faça login com seu email @g.globo
3. Faça upload de uma imagem
4. Clique em "Gerar Transcrição"
5. Edite se necessário
6. Clique em "Abrir no Outlook"

✅ Funcionalidades:
- Interface simples e intuitiva
- Transcrição automática via IA
- Edição do texto gerado
- Integração com Outlook
- Autenticação por email @g.globo
- Chave da API já configurada

❓ Dúvidas? Me avisem!

Abraços,
Greyce
```

## 🔒 **Segurança:**

- ✅ **Chave salva localmente** - Cada navegador salva a chave
- ✅ **Sem exposição** - A chave não aparece na URL após configuração
- ✅ **Domínio restrito** - Apenas @g.globo pode usar
- ✅ **Fácil manutenção** - Você controla a chave

## 📁 **Arquivos para Deploy:**

1. `index-shared-key.html` → renomeie para `index.html`
2. `script-shared-key.js` → renomeie para `script.js`
3. `styles.css` → mantenha o nome

## 🚀 **Deploy no Netlify:**

### **Opção 1: Deploy Manual**

1. **Acesse:** https://netlify.com
2. **Faça login** ou crie conta
3. **Clique** em "New site from Git"
4. **Escolha** "Deploy manually"
5. **Arraste** a pasta com os arquivos
6. **Clique** em "Deploy site"

### **Opção 2: Deploy via GitHub**

1. **Crie repositório** no GitHub
2. **Faça upload** dos arquivos
3. **Conecte** ao Netlify
4. **Deploy automático**

## 🔧 **Configuração da Chave:**

### **Método 1: Via URL (Recomendado)**

1. **Após o deploy**, acesse o link da ferramenta
2. **Adicione** sua chave na URL:
   ```
   https://seu-site.netlify.app?api_key=sk-proj-SUA_CHAVE_AQUI
   ```
3. **Acesse** essa URL uma vez
4. **A chave será salva** automaticamente
5. **Use o link normal** depois: `https://seu-site.netlify.app`

### **Método 2: Via Console do Navegador**

1. **Abra** a ferramenta no navegador
2. **Pressione F12** para abrir as ferramentas do desenvolvedor
3. **Vá para a aba Console**
4. **Digite:**
   ```javascript
   localStorage.setItem('shared_openai_api_key', 'sk-proj-SUA_CHAVE_AQUI');
   location.reload();
   ```

## 💡 **Dicas Importantes:**

1. **Teste primeiro** - Configure a chave e teste antes de compartilhar
2. **Backup da chave** - Mantenha sua chave da API em local seguro
3. **Monitoramento** - Verifique se todos conseguem acessar
4. **Renovação** - Se a chave expirar, repita o processo de configuração

## 🆘 **Troubleshooting:**

### **Problema: Chave não funciona**
- Verifique se a chave está correta
- Tente configurar novamente via URL
- Verifique se não há espaços extras

### **Problema: Usuários não conseguem acessar**
- Verifique se o email é @g.globo
- Teste em outro navegador
- Limpe o cache do navegador

### **Problema: Transcrição não gera**
- Verifique se a chave está configurada
- Verifique se a imagem não é muito grande
- Verifique se a chave tem créditos disponíveis

## 🎯 **Vantagens desta Solução:**

- ✅ **Configuração única** - Você configura uma vez
- ✅ **Fácil para a equipe** - Ninguém precisa configurar nada
- ✅ **Seguro** - Chave não fica exposta
- ✅ **Econômico** - Uma chave para toda a equipe
- ✅ **Fácil manutenção** - Você controla tudo

**Esta é a solução ideal para equipes que compartilham uma chave da API!** 🚀 