const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({}, { strict: false, timestamps: true, collection: 'pages' });

const PageModel = mongoose.models.Page || mongoose.model('Page', pageSchema);

async function createPage(pageData) {
    try {
        const created = await PageModel.create(pageData);
        return { insertedId: created._id };
    } catch (error) {
        console.error("Erro ao criar página:", error);
        throw error;
    }
}

async function getAllPages() {
    try {
        const pages = await PageModel.find({}).lean();
        return pages;
    } catch (error) {
        console.error("Erro ao buscar todas as páginas:", error);
        throw error;
    }
}

async function getPageById(id) {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const page = await PageModel.findById(id).lean();
        return page;
    } catch (error) {
        console.error(`Erro ao buscar página com ID ${id}:`, error);
        throw error;
    }
}

async function updatePage(id, updateData) {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        delete updateData._id;
        const result = await PageModel.updateOne({ _id: id }, { $set: updateData });
        return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
    } catch (error) {
        console.error(`Erro ao atualizar página com ID ${id}:`, error);
        throw error;
    }
}

async function deletePage(id) {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const result = await PageModel.deleteOne({ _id: id });
        return { deletedCount: result.deletedCount };
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