const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, './db.js'); // Caminho absoluto para db.js

if (fs.existsSync(dbPath)) {
    var { getDb } = require('../middleware/js/db.js');
} else if (fs.existsSync(path.resolve(__dirname, '../middleware/js/db.js'))) {
    var { getDb } = require('../middleware/js/db.js');
}else { 
  var { getDb } = require('../middleware/js/db.js');   
}




const COLLECTION_NAME = 'hq'; // Coleção para armazenar o documento de HQ único

// Usaremos uma lógica similar ao content.model.js para um documento único
async function saveHq(hqData) {
    const db = getDb();
    try {
        const filter = { type: "main_hq" }; // Identificador para este documento
        const options = { upsert: true, returnDocument: 'after' };
        const dataToSave = { ...hqData, type: "main_hq" };

        const result = await db.collection(COLLECTION_NAME).findOneAndReplace(
            filter,
            dataToSave,
            options
        );
        return result.value;
    } catch (error) {
        console.error("Erro ao salvar/substituir HQ:", error);
        throw error;
    }
}

async function getHq() {
    const db = getDb();
    try {
        const hq = await db.collection(COLLECTION_NAME).findOne({ type: "main_hq" });
        return hq;
    } catch (error) {
        console.error("Erro ao buscar HQ:", error);
        throw error;
    }
}

async function updateHq(updateData) {
    const db = getDb();
    try {
        delete updateData._id;
        delete updateData.type;

        const filter = { type: "main_hq" };
        const updateDoc = { $set: updateData };
        const options = { returnDocument: 'after' };

        const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(filter, updateDoc, options);
        return result.value;
    } catch (error) {
        console.error("Erro ao atualizar HQ:", error);
        throw error;
    }
}

async function deleteHq() {
    const db = getDb();
    try {
        const result = await db.collection(COLLECTION_NAME).deleteOne({ type: "main_hq" });
        return result;
    } catch (error) {
        console.error("Erro ao deletar HQ:", error);
        throw error;
    }
}

module.exports = {
    saveHq,
    getHq,
    updateHq,
    deleteHq,
};