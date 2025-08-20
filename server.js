const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { OpenAI } = require('openai');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Configuração do OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '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',
    maxRetries: 3,
    timeout: 30000
});

// Middleware de segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "https://api.openai.com"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite por IP
    message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
});
app.use(limiter);

// Rate limiting específico para transcrição
const transcriptionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // máximo 10 transcrições por minuto
    message: 'Limite de transcrições excedido, aguarde um minuto.'
});

// CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'],
    credentials: true
}));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuração do Multer
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não suportado. Use JPEG, PNG, GIF ou WebP.'), false);
        }
    }
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Logging de segurança
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rota de transcrição com upload de arquivo
app.post('/api/transcribe', 
    transcriptionLimiter,
    upload.single('image'),
    [
        body('email').isEmail().withMessage('Email inválido'),
        body('email').custom(value => {
            if (!value.endsWith('@g.globo')) {
                throw new Error('Apenas emails @g.globo são permitidos');
            }
            return true;
        }),
        body('name').isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres')
    ],
    async (req, res) => {
        try {
            // Validar entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Dados inválidos',
                    details: errors.array()
                });
            }

            // Verificar se há arquivo
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Nenhuma imagem fornecida'
                });
            }

            // Converter imagem para base64
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

            // Preparar dados para OpenAI
            const requestData = {
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'Você é um especialista em adaptar conteúdos para deficientes visuais.'
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Transcreva a imagem a seguir de forma corrida (não topicalizada), simples e objetiva. Seja bem rigoroso ao transcrever os números e estatísticas da imagem. Pule introduções e apresentações, vá direto ao conteúdo. Orientações: - Siglas como SEM1, refira como semana 1. - Use sempre o nome da cidade, nunca a sigla, mesmo que na imagem tenha a sigla. - Escreva os números com numerais, não por extenso. - As datas estão no formato dia/mês/ano'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: base64Image
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500,
                temperature: 0.3
            };

            // Fazer requisição para OpenAI com timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout na requisição')), 30000);
            });

            const openaiPromise = openai.chat.completions.create(requestData);

            const response = await Promise.race([openaiPromise, timeoutPromise]);

            if (response.choices && response.choices[0] && response.choices[0].message) {
                const transcription = response.choices[0].message.content.trim();
                
                res.json({
                    success: true,
                    transcription: transcription,
                    user: {
                        email: req.body.email,
                        name: req.body.name
                    }
                });
            } else {
                throw new Error('Resposta inválida da API OpenAI');
            }

        } catch (error) {
            console.error('Erro na transcrição:', error);
            
            res.status(500).json({
                success: false,
                error: 'Erro ao gerar transcrição',
                message: error.message
            });
        }
    }
);

// Rota de transcrição com base64
app.post('/api/transcribe-base64',
    transcriptionLimiter,
    [
        body('image').isString().withMessage('Imagem em base64 é obrigatória'),
        body('email').isEmail().withMessage('Email inválido'),
        body('email').custom(value => {
            if (!value.endsWith('@g.globo')) {
                throw new Error('Apenas emails @g.globo são permitidos');
            }
            return true;
        }),
        body('name').isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres')
    ],
    async (req, res) => {
        try {
            // Validar entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Dados inválidos',
                    details: errors.array()
                });
            }

            const { image, email, name } = req.body;

            // Preparar dados para OpenAI
            const requestData = {
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: 'Você é um especialista em adaptar conteúdos para deficientes visuais.'
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Transcreva a imagem a seguir de forma corrida (não topicalizada), simples e objetiva. Seja bem rigoroso ao transcrever os números e estatísticas da imagem. Pule introduções e apresentações, vá direto ao conteúdo. Orientações: - Siglas como SEM1, refira como semana 1. - Use sempre o nome da cidade, nunca a sigla, mesmo que na imagem tenha a sigla. - Escreva os números com numerais, não por extenso. - As datas estão no formato dia/mês/ano'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: image
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500,
                temperature: 0.3
            };

            // Fazer requisição para OpenAI com timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout na requisição')), 30000);
            });

            const openaiPromise = openai.chat.completions.create(requestData);

            const response = await Promise.race([openaiPromise, timeoutPromise]);

            if (response.choices && response.choices[0] && response.choices[0].message) {
                const transcription = response.choices[0].message.content.trim();
                
                res.json({
                    success: true,
                    transcription: transcription,
                    user: {
                        email: email,
                        name: name
                    }
                });
            } else {
                throw new Error('Resposta inválida da API OpenAI');
            }

        } catch (error) {
            console.error('Erro na transcrição:', error);
            
            res.status(500).json({
                success: false,
                error: 'Erro ao gerar transcrição',
                message: error.message
            });
        }
    }
);

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'Arquivo muito grande. Máximo 10MB.'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

// Rota 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Segurança: Helmet, Rate Limiting, CORS configurados`);
    console.log(`🤖 OpenAI: Configurado para GPT-4o`);
}); 