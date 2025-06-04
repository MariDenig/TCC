// app.js (ou server.js)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { connectToDatabase, getDb } = require('./js/db.js'); // Importa a conexão
// Importar as rotas
const personagemRoutes = require('./routes/personagem.routes');
const contentRoutes = require('./routes/content.routes');
const hqRoutes = require('./routes/hq.routes');
const pageRoutes = require('./routes/page.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());       // Habilita o CORS para todas as origens
app.use(express.json()); // Para parsear JSON no corpo das requisições (req.body)
app.use(express.urlencoded({ extended: true })); // Para parsear dados de formulários URL-encoded

// Servir arquivos estáticos da pasta 'public' (para seu frontend)
app.use(express.static('public'));

// Definir as rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/personagens', personagemRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/hq', hqRoutes);
app.use('/api/pages', pageRoutes);

// Rota raiz para verificar se o servidor está no ar
app.get('/', (req, res) => {
    res.send('API Node.js com MongoDB está funcionando!');
});

// Middleware para tratar rotas não encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ message: "Endpoint não encontrado." });
});

// Middleware de tratamento de erro genérico (deve ser o último middleware)
app.use((err, req, res, next) => {
    console.error("Erro não tratado:", err.stack);
    res.status(500).json({ message: "Ocorreu um erro inesperado no servidor." });
});

// Inicia o servidor APÓS conectar ao banco de dados
async function startServer() {
    try {
        await connectToDatabase(); // Conecta ao MongoDB
        app.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`);
            console.log(`Banco de dados conectado: ${getDb().databaseName}`);
        });
    } catch (error) {
        console.error("Falha ao iniciar o servidor:", error);
        process.exit(1); // Termina a aplicação se não conseguir conectar ao DB
    }
}

startServer();