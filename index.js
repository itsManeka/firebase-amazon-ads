/**
 * Servidor Express para API de integração Firebase + Amazon Product Advertising API
 * 
 * Este aplicativo fornece endpoints para buscar produtos da Amazon e armazená-los
 * no Firebase Firestore com cache inteligente.
 * 
 * @author Emanuel Ozorio
 * @version 1.0.0
 */

// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Configuração de origens permitidas para CORS
const allowedOrigins = [
    process.env.URL_LOCAL,
    process.env.URL_OFICIAL
].filter(Boolean); // Remove valores undefined/null

const app = express();

// Configuração do middleware CORS
app.use(cors({
    origin: function (origin, callback) {
        // Permite requisições sem origin (ex: Postman, aplicações mobile)
        // ou de origens específicas configuradas
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            console.warn(`Tentativa de acesso negada para origem: ${origin}`);
            return callback(new Error('Acesso negado pela política CORS'));
        }
    },
    credentials: true, // Permite cookies e headers de autenticação
    optionsSuccessStatus: 200 // Para compatibilidade com navegadores legados
}));

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));

// Middleware para parsing de dados URL-encoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rota de health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: require('./package.json').version
    });
});

// Rotas da API
app.use('/amazon-products', require('./routes/amazon-products'));

// Middleware para tratar rotas não encontradas
app.use('/{*path}', (req, res) => {
    res.status(404).json({
        error: 'Endpoint não encontrado',
        path: req.originalUrl,
        method: req.method
    });
});

// Middleware global de tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    
    res.status(error.status || 500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado',
        timestamp: new Date().toISOString()
    });
});

// Configuração da porta
const PORT = process.env.PORT || 3000;

// Inicia o servidor
const server = app.listen(PORT, () => {
    console.log(`🚀 API Firebase-Amazon-Ads rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🛍️  Produtos Amazon: http://localhost:${PORT}/amazon-products/search`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Recebido SIGTERM, encerrando servidor graciosamente...');
    server.close(() => {
        console.log('Servidor encerrado.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Recebido SIGINT, encerrando servidor graciosamente...');
    server.close(() => {
        console.log('Servidor encerrado.');
        process.exit(0);
    });
});

module.exports = app;