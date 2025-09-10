const mongoose = require('mongoose');

const hqSchema = new mongoose.Schema({
    type: { type: String, default: 'main_hq', index: true },
}, { strict: false, collection: 'hq' });

const HqModel = mongoose.models.Hq || mongoose.model('Hq', hqSchema);

async function saveHq(hqData) {
    try {
        const filter = { type: 'main_hq' };
        const dataToSave = { ...hqData, type: 'main_hq' };
        const updated = await HqModel.findOneAndReplace(filter, dataToSave, { upsert: true, new: true, lean: true });
        return updated;
    } catch (error) {
        console.error("Erro ao salvar/substituir HQ:", error);
        throw error;
    }
}

async function getHq() {
    try {
        const hq = await HqModel.findOne({ type: 'main_hq' }).lean();
        return hq;
    } catch (error) {
        console.error("Erro ao buscar HQ:", error);
        throw error;
    }
}

async function updateHq(updateData) {
    try {
        delete updateData._id;
        delete updateData.type;
        const updated = await HqModel.findOneAndUpdate(
            { type: 'main_hq' },
            { $set: updateData },
            { new: true, lean: true }
        );
        return updated;
    } catch (error) {
        console.error("Erro ao atualizar HQ:", error);
        throw error;
    }
}

async function deleteHq() {
    try {
        const result = await HqModel.deleteOne({ type: 'main_hq' });
        return { deletedCount: result.deletedCount };
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