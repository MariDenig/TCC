const express = require('express');
const cors = require('cors');
const { connectToDatabase, getDb } = require('./db'); // Importa a conexão com o banco
const app = express();
const port = 3000;

app.use(cors()); // Habilita o CORS para permitir requisições de qualquer origem

// Rota para obter os dados da coleção 'content'
app.get('/content', async (req, res) => {
    try {
        const db = getDb();
        const content = await db.collection('content').findOne({}); // Assumindo que você quer um único documento
        res.json(content);
    } catch (error) {
        console.error("Erro ao buscar dados do 'content':", error);
        res.status(500).json({ error: "Erro ao buscar dados" });
    }
});

// Rota para obter os dados da coleção 'hq'
app.get('/hq', async (req, res) => {
    try {
        const db = getDb();
        const hq = await db.collection('hq').findOne({}); // Assumindo que você quer um único documento
        res.json(hq);
    } catch (error) {
        console.error("Erro ao buscar dados do 'hq':", error);
        res.status(500).json({ error: "Erro ao buscar dados" });
    }
});

// Rota para obter os dados da coleção 'pages'
app.get('/pages', async (req, res) => {
    try {
        const db = getDb();
        const pages = await db.collection('pages').find().toArray(); // Busca todos os documentos
        res.json(pages);
    } catch (error) {
        console.error("Erro ao buscar dados do 'pages':", error);
        res.status(500).json({ error: "Erro ao buscar dados" });
    }
});

// Rota para obter os dados da coleção 'personagens'
app.get('/personagens', async (req, res) => {
    try {
        const db = getDb();
        const personagens = await db.collection('personagens').find().toArray(); // Busca todos os documentos
        res.json(personagens);
    } catch (error) {
        console.error("Erro ao buscar dados do 'personagens':", error);
        res.status(500).json({ error: "Erro ao buscar dados" });
    }
});

// Inicia o servidor após conectar ao banco de dados
connectToDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error("Erro ao iniciar o servidor:", err);
    });
