# Transcrição #PraTodosVerem

Ferramenta web para criar descrições textuais de imagens no padrão #PraTodosVerem usando inteligência artificial.

## 🚀 Funcionalidades

- **Upload de Imagens**: Suporte para PNG, JPG, JPEG até 10MB
- **Transcrição Automática**: Usa OpenAI GPT-4 Vision para gerar descrições
- **Padrão #PraTodosVerem**: Segue as regras específicas de acessibilidade
- **Integração com Outlook**: Abre nova janela de e-mail com conteúdo preenchido
- **Interface Responsiva**: Funciona em desktop e mobile
- **Drag & Drop**: Arraste imagens diretamente na interface

## 📋 Regras da Transcrição

- Texto corrido, simples e objetivo (sem tópicos)
- Números sempre em algarismos (não por extenso)
- Datas no formato dia/mês/ano
- Siglas como "SEM1" devem virar "semana 1"
- Sempre usar nome da cidade completo (nunca sigla)
- Eliminar introduções como "na imagem vemos...", começar direto pelo conteúdo

## 🛠️ Como Usar

1. **Abrir a aplicação**: Abra o arquivo `index.html` em qualquer navegador moderno
2. **Inserir imagem**: Clique na área de upload ou arraste uma imagem
3. **Gerar transcrição**: Clique em "Gerar Transcrição com IA"
4. **Revisar resultado**: Veja a imagem e a transcrição gerada
5. **Copiar ou enviar**: Use os botões para copiar ou abrir no Outlook

## 🔧 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **UI Framework**: Tailwind CSS
- **IA**: OpenAI GPT-4 Vision API
- **Compatibilidade**: Chrome, Edge, Firefox, Safari

## ⚠️ Segurança

**IMPORTANTE**: Esta é uma versão de protótipo com a chave da API exposta no frontend. Para uso em produção:

1. Crie um backend (Node.js/Python) para proteger a chave da API
2. Implemente rate limiting e validações
3. Use variáveis de ambiente para as chaves
4. Adicione autenticação se necessário

## 📁 Estrutura do Projeto

```
transcricao-pra-todos-verem/
├── index.html          # Página principal
├── styles.css          # Estilos customizados
├── script.js           # Lógica da aplicação
└── README.md           # Este arquivo
```

## 🚀 Como Executar

1. Clone ou baixe os arquivos
2. Abra o arquivo `index.html` em um navegador
3. A aplicação funcionará imediatamente

## 🔑 Configuração da API

A chave da OpenAI está configurada no arquivo `script.js`. Para usar sua própria chave:

1. Acesse [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Crie uma nova chave
3. Substitua a chave no arquivo `script.js`

## 📧 Integração com Outlook

A aplicação tenta abrir o Outlook de duas formas:

1. **Microsoft Graph API**: Se o usuário estiver logado no Microsoft 365
2. **Fallback mailto**: Abre o cliente de e-mail padrão

## 🐛 Solução de Problemas

- **Erro de API**: Verifique se a chave da OpenAI está válida
- **Imagem não carrega**: Verifique se o arquivo é uma imagem válida
- **Outlook não abre**: Use o fallback mailto ou configure o cliente de e-mail padrão

## 📝 Licença

Este projeto é de uso livre para fins educacionais e de acessibilidade.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:

- Reportar bugs
- Sugerir melhorias
- Adicionar novas funcionalidades
- Melhorar a documentação

---

**Desenvolvido para promover a acessibilidade digital através do padrão #PraTodosVerem** 