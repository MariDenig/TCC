const express = require('express');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose'); // Importa o Mongoose
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuração das Conexões com Mongoose ---
const MONGO_URI_LOGS = process.env.MONGO_URI || "mongodb+srv://user_log_acess:Log4c3ss2025@cluster0.nbt3sks.mongodb.net/IIW2023A_Logs?retryWrites=true&w=majority&appName=Cluster0";
const MONGO_URI_HISTORIA = process.env.MONGO_URI_HISTORIA || "mongodb+srv://mariaed:mariaissa130308@chatbot.cocduuo.mongodb.net/chatbotHistoriaDB?retryWrites=true&w=majority&appName=chatbot";

let connLogs, connHistoria; // Variáveis para as conexões do Mongoose

// --- Definição dos Schemas e Models do Mongoose ---

// Schema para os logs de acesso
const LogAcessoSchema = new mongoose.Schema({
    col_data: String,
    col_hora: String,
    col_IP: String,
    col_nome_bot: String,
    col_acao: String
}, { collection: 'tb_cl_user_log_acess' }); // Especifica o nome exato da coleção

// Schema para o histórico de chat
const SessaoChatSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    userId: { type: String, default: 'anonimo' },
    botId: String,
    startTime: Date,
    endTime: Date,
    messages: [mongoose.Schema.Types.Mixed], // Array de mensagens com formato flexível
    lastUpdated: { type: Date, default: Date.now }
}, { collection: 'sessoesChat' }); // Especifica o nome exato da coleção

let LogAcesso;
let SessaoChat;


// --- Funções de Conexão com Mongoose ---

async function createMongooseConnection(uri, dbName) {
    if (!uri) {
        console.error(`URI do MongoDB para o banco '${dbName}' não foi definida.`);
        return null;
    }
    try {
        const connection = mongoose.createConnection(uri);
        console.log(`✅ Conexão com MongoDB Atlas estabelecida: ${dbName}`);
        return connection;
    } catch (err) {
        console.error(`❌ Falha ao conectar ao MongoDB ${dbName}:`, err);
        return null;
    }
}

async function initializeDatabases() {
    console.log("Iniciando conexões com os bancos de dados...");
    connLogs = await createMongooseConnection(MONGO_URI_LOGS, "IIW2023A_Logs");
    connHistoria = await createMongooseConnection(MONGO_URI_HISTORIA, "chatbotHistoriaDB");

    if (connLogs) {
        // Vincula o Schema à conexão específica de logs
        LogAcesso = connLogs.model('LogAcesso', LogAcessoSchema);
    }

    if (connHistoria) {
        // Vincula o Schema à conexão específica de histórico
        SessaoChat = connHistoria.model('SessaoChat', SessaoChatSchema);
    }
    
    if (!connLogs || !connHistoria) {
        console.warn("⚠️ Atenção: Uma ou mais conexões com o banco de dados falharam. A aplicação pode funcionar de forma limitada.");
    }
}


// --- Simulação de Armazenamento para Ranking (Mantido) ---
let dadosRankingVitrine = [];

// --- Middlewares ---
app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.set('trust proxy', true);

// --- Rotas da Aplicação ---

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Rota de log de acesso (Usa o Model LogAcesso)
app.post('/api/log-connection', async (req, res) => {
  if (!LogAcesso) { // Verifica se o Model foi inicializado
    return res.status(503).json({ error: "Serviço de log indisponível." });
  }
  try {
    const { acao, nomeBot } = req.body;
    const ip = req.ip || 'IP não detectado';
    if (!acao || !nomeBot) return res.status(400).json({ error: "Dados de log incompletos." });

    const agora = new Date();
    const logEntry = new LogAcesso({ // Cria uma nova instância do Model
      col_data: agora.toISOString().split('T')[0],
      col_hora: agora.toTimeString().split(' ')[0],
      col_IP: ip,
      col_nome_bot: nomeBot,
      col_acao: acao
    });

    await logEntry.save(); // Salva o documento no banco
    console.log('[Servidor] Log de acesso gravado:', logEntry.toObject());
    res.status(201).json({ success: true, message: "Log registrado." });
  } catch (error) {
    console.error("Erro ao gravar log:", error);
    res.status(500).json({ error: true, message: "Erro ao registrar log." });
  }
});

// NOVO ENDPOINT: Rota para salvar o histórico do chat (Usa o Model SessaoChat)
app.post('/api/chat/salvar-historico', async (req, res) => {
    if (!SessaoChat) { // Verifica se o Model foi inicializado
        return res.status(503).json({ error: "Servidor não conectado ao banco de dados de histórico." });
    }
    try {
        const { sessionId, botId, startTime, endTime, messages } = req.body;

        if (!sessionId || !botId || !messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "Dados incompletos para salvar histórico." });
        }

        const sessaoData = {
            sessionId,
            botId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            messages,
            lastUpdated: new Date()
        };
        
        // Usa findOneAndUpdate com upsert: cria se não existir, atualiza se existir.
        const result = await SessaoChat.findOneAndUpdate(
            { sessionId: sessionId }, // Filtro para encontrar a sessão
            sessaoData,               // Dados para atualizar ou inserir
            { upsert: true, new: true, setDefaultsOnInsert: true } // Opções
        );
        
        const message = result.isNew ? "Histórico de sessão criado." : "Histórico de sessão atualizado.";
        console.log(`[Servidor] ${message} ID: ${sessionId}`);
        res.status(201).json({ success: true, message, sessionId });

    } catch (error) {
        console.error("[Servidor] Erro em /api/chat/salvar-historico:", error.message);
        res.status(500).json({ error: "Erro interno ao salvar histórico de chat." });
    }
});

// ENDPOINT: Rota para buscar os históricos de chat (Usa o Model SessaoChat)
app.get('/api/chat/historicos', async (req, res) => {
    if (!SessaoChat) { // Verifica se o Model foi inicializado
        return res.status(503).json({ error: "Servidor não conectado ao banco de dados de histórico." });
    }
    try {
        const sessoes = await SessaoChat.find({})
            .sort({ lastUpdated: -1 }) // Ordena do mais recente para o mais antigo
            .limit(50); // Limita a 50 resultados
        
        console.log(`[Servidor] Buscados ${sessoes.length} históricos de chat`);
        res.json(sessoes);

    } catch (error) {
        console.error("[Servidor] Erro em /api/chat/historicos:", error);
        res.status(500).json({ error: "Erro interno ao buscar históricos de chat." });
    }
});


// Rotas de Ranking e Outras (Mantidas como antes, pois não usam DB)
app.post('/api/ranking/registrar-acesso-bot', (req, res) => { 
    const { botId, nomeBot } = req.body;
    if (!botId || !nomeBot) {
        return res.status(400).json({ error: "ID e Nome do Bot são obrigatórios." });
    }
    const agora = new Date();
    const botExistente = dadosRankingVitrine.find(b => b.botId === botId);
    if (botExistente) {
        botExistente.contagem++;
        botExistente.ultimoAcesso = agora;
    } else {
        dadosRankingVitrine.push({ botId, nomeBot, contagem: 1, ultimoAcesso: agora });
    }
    console.log('[Servidor] Dados de ranking atualizados:', dadosRankingVitrine);
    res.status(201).json({ message: `Acesso ao bot ${nomeBot} registrado.` });
});

app.get('/api/ranking/visualizar', (req, res) => {
    const rankingOrdenado = [...dadosRankingVitrine].sort((a, b) => b.contagem - a.contagem);
    res.json(rankingOrdenado);
});

app.post('/api/weather', async (req, res) => {
  try {
    const { location } = req.body;
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: true, message: 'Chave não configurada no servidor.' });
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric&lang=pt_br`;
    const response = await axios.get(url);
    return res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Erro ao obter dados meteorológicos';
    return res.status(status).json({ error: true, message });
  }
});

// Iniciar o servidor após tentar conectar aos bancos de dados
initializeDatabases().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
});