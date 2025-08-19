// Configurações do backend
module.exports = {
    // Chave da API OpenAI (em produção, use variáveis de ambiente)
    OPENAI_API_KEY: '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',
    
    // Porta do servidor
    PORT: process.env.PORT || 3001,
    
    // Configurações de CORS
    CORS_ORIGINS: [
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'file://'
    ],
    
    // Configurações de rate limiting
    RATE_LIMIT_WINDOW: 60000, // 1 minuto
    RATE_LIMIT_MAX: 10, // 10 requisições por minuto
    
    // Configurações de upload
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
}; 