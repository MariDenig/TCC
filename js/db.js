require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME;

const client = new MongoClient(uri, { useUnifiedTopology: true });

let db;

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Conectado ao MongoDB Atlas (pelo db.js)");
        db = client.db(dbName);
    } catch (error) {
        console.error("Erro ao conectar ao MongoDB:", error);
        throw error; // Rejeita a promise para sinalizar o erro
    }
}

function getDb() {
    if (!db) {
        throw new Error("Conexão com o banco de dados não inicializada. Chame connectToDatabase() primeiro.");
    }
    return db;
}

module.exports = { connectToDatabase, getDb };
