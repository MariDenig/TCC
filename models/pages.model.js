const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, './db.js'); // Caminho absoluto para db.js

if (fs.existsSync(dbPath)) {
    var { getDb } = require('./db');
} else if (fs.existsSync(path.resolve(__dirname, '../middleware/js/db.js'))) {
    var { getDb } = require('../middleware/js/db.js');
}else { 
  var { getDb } = require('../middleware/js/db.js');   
}



const COLLECTION_NAME = 'pages';

// CREATE
async function createPage(pageData) {
    const db = getDb();
    try {
        const result = await db.collection(COLLECTION_NAME).insertOne(pageData);
        return result; // Retorna o resultado da inserção, incluindo o insertedId
    } catch (error) {
        console.error("Erro ao criar página:", error);
        throw error;
    }
}

// READ (All)
async function getAllPages() {
    const db = getDb();
    try {
        const pages = await db.collection(COLLECTION_NAME).find({}).toArray();
        return pages;
    } catch (error) {
        console.error("Erro ao buscar todas as páginas:", error);
        throw error;
    }
}

// READ (One by ID)
async function getPageById(id) {
    const db = getDb();
    try {
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const page = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
        return page;
    } catch (error) {
        console.error(`Erro ao buscar página com ID ${id}:`, error);
        throw error;
    }
}

// UPDATE (by ID)
async function updatePage(id, updateData) {
    const db = getDb();
    try {
        if (!ObjectId.isValid(id)) {
            return null;
        }
        delete updateData._id; // Não permitir atualização do _id

        const result = await db.collection(COLLECTION_NAME).updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        return result;
    } catch (error) {
        console.error(`Erro ao atualizar página com ID ${id}:`, error);
        throw error;
    }
}

// DELETE (by ID)
async function deletePage(id) {
    const db = getDb();
    try {
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
        return result;
    } catch (error) {
        console.error(`Erro ao deletar página com ID ${id}:`, error);
        throw error;
    }
}

module.exports = {
    createPage,
    getAllPages,
    getPageById,
    updatePage,
    deletePage
};