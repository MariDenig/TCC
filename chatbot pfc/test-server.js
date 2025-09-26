// Script de teste para verificar a conexão e operações com Mongoose
const mongoose = require('mongoose');

// É uma boa prática especificar o nome do banco de dados na URI de conexão com o Mongoose
const MONGO_URI_HISTORIA = "mongodb+srv://mariaed:mariaissa130308@chatbot.cocduuo.mongodb.net/chatbotHistoriaDB?retryWrites=true&w=majority&appName=chatbot";

// 1. Definir o Schema (a estrutura do documento)
const SessaoChatSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    botId: String,
    startTime: Date,
    endTime: Date,
    messages: [mongoose.Schema.Types.Mixed], // Array de objetos com formato flexível
    lastUpdated: { type: Date, default: Date.now }
}, { collection: 'sessoesChat' }); // Especifica o nome exato da coleção no MongoDB

// 2. Criar o Model a partir do Schema
// O Model é o que usamos para interagir com a coleção
const SessaoChat = mongoose.model('SessaoChat', SessaoChatSchema);

async function testMongooseConnection() {
    try {
        // 3. Conectar ao MongoDB usando Mongoose
        await mongoose.connect(MONGO_URI_HISTORIA);
        console.log("✅ Conexão com Mongoose estabelecida com sucesso!");
        
        // --- Teste de inserção ---
        const testData = {
            sessionId: "test_mongoose_" + Date.now(),
            botId: "test_bot_mongoose",
            startTime: new Date(),
            endTime: new Date(),
            messages: [
                { role: "user", parts: [{ text: "Teste com Mongoose" }] },
                { role: "model", parts: [{ text: "Resposta teste com Mongoose" }] }
            ]
        };
        
        // 4. Criar uma nova instância do Model e salvar
        const novaSessao = new SessaoChat(testData);
        const savedDoc = await novaSessao.save();
        console.log("✅ Teste de inserção com Mongoose bem-sucedido:", savedDoc._id);
        
        // --- Teste de busca ---
        // 5. Buscar documentos usando o Model
        const sessoes = await SessaoChat.find({})
            .sort({ lastUpdated: -1 }) // Ordena pelos mais recentes
            .limit(5); // Limita a 5 resultados
            
        console.log(`✅ Teste de busca com Mongoose bem-sucedido. Encontradas ${sessoes.length} sessões.`);
        
    } catch (error) {
        console.error("❌ Erro no teste com Mongoose:", error.message);
    } finally {
        // 6. Encerrar a conexão no final
        await mongoose.connection.close();
        console.log("✅ Conexão com Mongoose encerrada. Teste concluído!");
    }
}

// Executa a função de teste
testMongooseConnection();