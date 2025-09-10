const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    type: { type: String, default: 'main_content', index: true },
}, { strict: false, collection: 'content' });

const ContentModel = mongoose.models.Content || mongoose.model('Content', contentSchema);

async function saveContent(contentData) {
    try {
        const filter = { type: 'main_content' };
        const dataToSave = { ...contentData, type: 'main_content' };
        const updated = await ContentModel.findOneAndReplace(filter, dataToSave, { upsert: true, new: true, lean: true });
        return updated;
    } catch (error) {
        console.error("Erro ao salvar/substituir conteúdo:", error);
        throw error;
    }
}

async function getContent() {
    try {
        const content = await ContentModel.findOne({ type: 'main_content' }).lean();
        return content;
    } catch (error) {
        console.error("Erro ao buscar conteúdo:", error);
        throw error;
    }
}

async function updateContent(updateData) {
    try {
        delete updateData._id;
        delete updateData.type;
        const updated = await ContentModel.findOneAndUpdate(
            { type: 'main_content' },
            { $set: updateData },
            { new: true, lean: true }
        );
        return updated;
    } catch (error) {
        console.error("Erro ao atualizar conteúdo:", error);
        throw error;
    }
}

async function deleteContent() {
    try {
        const result = await ContentModel.deleteOne({ type: 'main_content' });
        return { acknowledged: true, deletedCount: result.deletedCount };
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