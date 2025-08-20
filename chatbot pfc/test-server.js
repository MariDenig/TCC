// Script de teste para verificar se o servidor está funcionando
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

const MONGO_URI_HISTORIA = "mongodb+srv://mariaed:mariaissa130308@chatbot.cocduuo.mongodb.net/";

async function testMongoConnection() {
    const client = new MongoClient(MONGO_URI_HISTORIA);
    try {
        await client.connect();
        console.log("✅ Conexão com MongoDB estabelecida com sucesso!");
        
        const db = client.db("chatbotHistoriaDB");
        const collection = db.collection("sessoesChat");
        
        // Teste de inserção
        const testData = {
            sessionId: "test_" + Date.now(),
            botId: "test_bot",
            startTime: new Date(),
            endTime: new Date(),
            messages: [
                { role: "user", parts: [{ text: "Teste" }] },
                { role: "model", parts: [{ text: "Resposta teste" }] }
            ],
            lastUpdated: new Date()
        };
        
        const result = await collection.insertOne(testData);
        console.log("✅ Teste de inserção bem-sucedido:", result.insertedId);
        
        // Teste de busca
        const sessoes = await collection.find({}).limit(5).toArray();
        console.log("✅ Teste de busca bem-sucedido. Encontradas", sessoes.length, "sessões");
        
        await client.close();
        console.log("✅ Teste concluído com sucesso!");
        
    } catch (error) {
        console.error("❌ Erro no teste:", error);
    }
}

testMongoConnection(); 