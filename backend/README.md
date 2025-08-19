# Backend - Transcrição #PraTodosVerem

Servidor Node.js para processar requisições de transcrição de imagens de forma segura.

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação

1. **Instalar dependências:**
```bash
cd backend
npm install
```

2. **Configurar variáveis de ambiente (opcional):**
Crie um arquivo `.env` na pasta `backend` com:
```
OPENAI_API_KEY=sua_chave_da_openai_aqui
PORT=3001
```

3. **Executar o servidor:**
```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

## 📡 Endpoints da API

### Health Check
- **GET** `/api/health`
- Retorna status do servidor

### Transcrição de Imagem
- **POST** `/api/transcribe`
- **Content-Type:** `multipart/form-data`
- **Body:** `image` (arquivo de imagem)
- **Resposta:**
```json
{
  "success": true,
  "transcription": "Texto da transcrição...",
  "model": "gpt-4o",
  "usage": { ... }
}
```

### Transcrição via Base64
- **POST** `/api/transcribe-base64`
- **Content-Type:** `application/json`
- **Body:**
```json
{
  "imageBase64": "data:image/jpeg;base64,..."
}
```

## 🔧 Configurações

### Rate Limiting
- **Janela de tempo:** 1 minuto
- **Máximo de requisições:** 10 por IP

### Upload de Arquivos
- **Tamanho máximo:** 10MB
- **Tipos permitidos:** JPEG, JPG, PNG, GIF, WebP

### CORS
Origens permitidas:
- `http://localhost:3000`
- `http://127.0.0.1:5500`
- `file://` (para arquivos locais)

## 🛡️ Segurança

- Rate limiting por IP
- Validação de tipos de arquivo
- Limite de tamanho de upload
- CORS configurado
- Tratamento de erros

## 🐛 Solução de Problemas

### Erro de CORS
Se receber erros de CORS, verifique se a origem está na lista de `CORS_ORIGINS` no arquivo `config.js`.

### Erro de API OpenAI
Verifique se a chave da API está configurada corretamente.

### Porta em uso
Se a porta 3001 estiver em uso, altere a variável `PORT` no arquivo `config.js`.

## 📊 Monitoramento

O servidor loga:
- Requisições recebidas
- Erros de API
- Uso de tokens da OpenAI
- Status de saúde

## 🔄 Desenvolvimento

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

O servidor reiniciará automaticamente quando você fizer alterações nos arquivos. 