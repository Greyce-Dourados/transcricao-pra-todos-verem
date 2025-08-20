// Configurações do backend
module.exports = {
    // Chave da API OpenAI (em produção, use variáveis de ambiente)
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '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', // Chave da OpenAI atualizada
    
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