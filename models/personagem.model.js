const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb'); 

const dbPath = path.resolve(__dirname, './db.js'); // Caminho absoluto para db.js

if (fs.existsSync(dbPath)) {
    var { getDb } = require('./db');
} else if (fs.existsSync(path.resolve(__dirname, './js/db.js'))) {
    var { getDb } = require('./js/db');
} else { 
  var { getDb } = require('../js/db');   
}

const COLLECTION_NAME = 'personagens';

// CREATE
async function createPersonagem(personagemData) {
    const db = getDb();
    try {
        const result = await db.collection(COLLECTION_NAME).insertOne(personagemData);
        return result; // Retorna o resultado da inserção, incluindo o insertedId
    } catch (error) {
        console.error("Erro ao criar personagem:", error);
        throw error;
    }
}

// READ (All)
async function getAllPersonagens() {
    const db = getDb();
    try {
        const personagens = await db.collection(COLLECTION_NAME).find({}).toArray();
        return personagens;
    } catch (error) {
        console.error("Erro ao buscar todos os personagens:", error);
        throw error;
    }
}

// READ (One by ID)
async function getPersonagemById(id) {
    const db = getDb();
    try {
        // Validar se o ID é um ObjectId válido antes de consultar
        if (!ObjectId.isValid(id)) {
            return null; // Ou lançar um erro específico
        }
        const personagem = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
        return personagem;
    } catch (error) {
        console.error(`Erro ao buscar personagem com ID ${id}:`, error);
        throw error;
    }
}

// UPDATE (by ID)
async function updatePersonagem(id, updateData) {
    const db = getDb();
    try {
        if (!ObjectId.isValid(id)) {
            return null; // Ou lançar um erro
        }
        // Remove o campo _id de updateData para evitar tentar modificar o _id
        delete updateData._id;

        const result = await db.collection(COLLECTION_NAME).updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData } // $set atualiza apenas os campos fornecidos
        );
        return result; // Retorna informações sobre a operação (matchedCount, modifiedCount)
    } catch (error) {
        console.error(`Erro ao atualizar personagem com ID ${id}:`, error);
        throw error;
    }
}

// DELETE (by ID)
async function deletePersonagem(id) {
    const db = getDb();
    try {
        if (!ObjectId.isValid(id)) {
            return null; // Ou lançar um erro
        }
        const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
        return result; // Retorna informações sobre a operação (deletedCount)
    } catch (error) {
        console.error(`Erro ao deletar personagem com ID ${id}:`, error);
        throw error;
    }
}

module.exports = {
    createPersonagem,
    getAllPersonagens,
    getPersonagemById,
    updatePersonagem,
    deletePersonagem
};