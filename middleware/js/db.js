// db.js
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fisica_divertida';
const dbName = process.env.DATABASE_NAME || 'fisica_divertida';

// Função para conectar ao banco de dados
async function connectToDatabase() {
    // Evita múltiplas conexões. Se já estiver conectado, não faz nada.
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        // Mongoose usa a URI e pode receber opções, como o nome do banco de dados
        await mongoose.connect(uri, {
            dbName: dbName,
        });
        console.log("✅ Conectado ao MongoDB Atlas com Mongoose (pelo db.js)");

        // Opcional: Adicionar listeners para eventos de conexão
        mongoose.connection.on('error', err => {
            console.error('❌ Erro na conexão com Mongoose:', err);
        });

    } catch (error) {
        console.error("❌ Erro ao conectar ao MongoDB com Mongoose:", error);
        // Em caso de falha na conexão inicial, encerra o processo para evitar
        // que a aplicação rode em um estado inconsistente.
        process.exit(1); 
    }
}

// Não precisamos mais de getDb() com Mongoose.
// Apenas exportamos a função de conexão.
module.exports = { connectToDatabase };
