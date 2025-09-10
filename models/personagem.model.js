const mongoose = require('mongoose');

const personagemSchema = new mongoose.Schema({}, { strict: false, timestamps: true, collection: 'personagens' });

const PersonagemModel = mongoose.models.Personagem || mongoose.model('Personagem', personagemSchema);

// CREATE
async function createPersonagem(personagemData) {
    try {
        const created = await PersonagemModel.create(personagemData);
        return { insertedId: created._id };
    } catch (error) {
        console.error("Erro ao criar personagem:", error);
        throw error;
    }
}

// READ (All)
async function getAllPersonagens() {
    try {
        const personagens = await PersonagemModel.find({}).lean();
        return personagens;
    } catch (error) {
        console.error("Erro ao buscar todos os personagens:", error);
        throw error;
    }
}

// READ (One by ID)
async function getPersonagemById(id) {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const personagem = await PersonagemModel.findById(id).lean();
        return personagem;
    } catch (error) {
        console.error(`Erro ao buscar personagem com ID ${id}:`, error);
        throw error;
    }
}

// UPDATE (by ID)
async function updatePersonagem(id, updateData) {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        delete updateData._id;
        const result = await PersonagemModel.updateOne({ _id: id }, { $set: updateData });
        return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
    } catch (error) {
        console.error(`Erro ao atualizar personagem com ID ${id}:`, error);
        throw error;
    }
}

// DELETE (by ID)
async function deletePersonagem(id) {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const result = await PersonagemModel.deleteOne({ _id: id });
        return { deletedCount: result.deletedCount };
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