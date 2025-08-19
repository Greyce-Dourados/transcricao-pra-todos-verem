const express = require('express');
const cors = require('cors');
const multer = require('multer');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'file://'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuração do OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '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'
});

// Configuração do Multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos'), false);
        }
    }
});

// Middleware de rate limiting simples
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX = 10; // 10 requisições por minuto

function rateLimit(req, res, next) {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(clientIP)) {
        requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else {
        const clientData = requestCounts.get(clientIP);
        if (now > clientData.resetTime) {
            clientData.count = 1;
            clientData.resetTime = now + RATE_LIMIT_WINDOW;
        } else {
            clientData.count++;
        }
        
        if (clientData.count > RATE_LIMIT_MAX) {
            return res.status(429).json({
                error: 'Muitas requisições. Tente novamente em 1 minuto.'
            });
        }
    }
    
    next();
}

// Rota de teste
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando!' });
});

// Rota para transcrição de imagem
app.post('/api/transcribe', rateLimit, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
        }

        // Converter buffer para base64
        const base64Image = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        // Preparar prompt para a OpenAI
        const prompt = `Transcreva a imagem a seguir de forma corrida (não topicalizada), simples e objetiva.
Seja bem rigoroso ao transcrever os números e estatísticas da imagem.
Pule introduções e apresentações, vá direto ao conteúdo.

Orientações:
- Siglas como SEM1, refira como semana 1.
- Use sempre o nome da cidade, nunca a sigla, mesmo que na imagem tenha a sigla.
- Escreva os números com numerais, não por extenso.
- As datas estão no formato dia/mês/ano`;

        // Chamada para a API da OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Você é um especialista em adaptar conteúdos para deficientes visuais."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: dataUrl
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500,
            temperature: 0.3
        });

        const transcription = response.choices[0].message.content.trim();

        res.json({
            success: true,
            transcription: transcription,
            model: response.model,
            usage: response.usage
        });

    } catch (error) {
        console.error('Erro na transcrição:', error);
        
        if (error.response) {
            res.status(error.response.status).json({
                error: `Erro da API OpenAI: ${error.response.data.error?.message || error.message}`
            });
        } else {
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
});

// Rota para transcrição via base64 (alternativa)
app.post('/api/transcribe-base64', rateLimit, async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        
        if (!imageBase64) {
            return res.status(400).json({ error: 'Imagem em base64 não fornecida' });
        }

        const prompt = `Transcreva a imagem a seguir de forma corrida (não topicalizada), simples e objetiva.
Seja bem rigoroso ao transcrever os números e estatísticas da imagem.
Pule introduções e apresentações, vá direto ao conteúdo.

Orientações:
- Siglas como SEM1, refira como semana 1.
- Use sempre o nome da cidade, nunca a sigla, mesmo que na imagem tenha a sigla.
- Escreva os números com numerais, não por extenso.
- As datas estão no formato dia/mês/ano`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Você é um especialista em adaptar conteúdos para deficientes visuais."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageBase64
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500,
            temperature: 0.3
        });

        const transcription = response.choices[0].message.content.trim();

        res.json({
            success: true,
            transcription: transcription,
            model: response.model,
            usage: response.usage
        });

    } catch (error) {
        console.error('Erro na transcrição base64:', error);
        
        if (error.response) {
            res.status(error.response.status).json({
                error: `Erro da API OpenAI: ${error.response.data.error?.message || error.message}`
            });
        } else {
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📝 API de transcrição disponível em http://localhost:${PORT}/api/transcribe`);
    console.log(`🔍 Health check em http://localhost:${PORT}/api/health`);
});

module.exports = app; 