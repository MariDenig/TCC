const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, './db.js'); // Caminho absoluto para db.js

if (fs.existsSync(dbPath)) {
    var { getDb } = require('./db');
} else if (fs.existsSync(path.resolve(__dirname, ('../middleware/js/db.js')))) {
    var { getDb } = require('../middleware/js/db.js');
}else { 
  var { getDb } = require('../middleware/js/db.js');   
}



const COLLECTION_NAME = 'content'; // Coleção para armazenar o documento de conteúdo único


async function saveContent(contentData) {
    const db = getDb();
    try {
        const filter = { type: "main_content" }; // Um identificador para este documento
        const options = { upsert: true, returnDocument: 'after' }; // Cria se não existir, retorna o novo doc

        // Adiciona o identificador ao dado se não existir
        const dataToSave = { ...contentData, type: "main_content" };

        const result = await db.collection(COLLECTION_NAME).findOneAndReplace(
            filter,
            dataToSave,
            options
        );
        return result.value; // Retorna o documento salvo/atualizado
    } catch (error) {
        console.error("Erro ao salvar/substituir conteúdo:", error);
        throw error;
    }
}

// READ
async function getContent() {
    const db = getDb();
    try {
        // Busca o documento de conteúdo (deve haver apenas um com o filtro)
        const content = await db.collection(COLLECTION_NAME).findOne({ type: "main_content" });
        return content;
    } catch (error) {
        console.error("Erro ao buscar conteúdo:", error);
        throw error;
    }
}

// UPDATE (parcial)
// Para atualizar apenas partes específicas do documento de conteúdo
async function updateContent(updateData) {
    const db = getDb();
    try {
        // Não permitir atualização do _id ou do nosso campo 'type'
        delete updateData._id;
        delete updateData.type;

        const filter = { type: "main_content" };
        const updateDoc = {
            $set: updateData, // Atualiza apenas os campos fornecidos
        };
        const options = { returnDocument: 'after' }; // Retorna o documento atualizado

        const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(filter, updateDoc, options);
        return result.value; // Retorna o documento atualizado
    } catch (error) {
        console.error("Erro ao atualizar conteúdo:", error);
        throw error;
    }
}

// DELETE (se necessário)
async function deleteContent() {
    const db = getDb();
    try {
        const result = await db.collection(COLLECTION_NAME).deleteOne({ type: "main_content" });
        return result; // Retorna { acknowledged: true, deletedCount: 1 }
    } catch (error) {
        console.error("Erro ao deletar conteúdo:", error);
        throw error;
    }
}

module.exports = {
    saveContent,
    getContent,
    updateContent,
    deleteContent,
};