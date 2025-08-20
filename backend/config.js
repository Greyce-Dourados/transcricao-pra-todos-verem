// Configurações do backend
module.exports = {
    // Chave da API OpenAI (em produção, use variáveis de ambiente)
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'SUA_CHAVE_OPENAI_AQUI', // Substitua pela sua chave da OpenAI
    
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