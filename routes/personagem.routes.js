const express = require('express');
const router = express.Router();
const Personagem = require('../models/personagem.model'); // Importa o modelo

// CREATE: POST /api/personagens
router.post('/', async (req, res) => {
    try {
        // req.body contém os dados enviados no corpo da requisição POST
        const novoPersonagemData = req.body;
        if (!novoPersonagemData.nome || !novoPersonagemData.descricao) { // Validação básica
            return res.status(400).json({ message: "Nome e descrição são obrigatórios." });
        }
        const result = await Personagem.createPersonagem(novoPersonagemData);
        // O MongoDB retorna um objeto com `insertedId`
        res.status(201).json({ message: "Personagem criado com sucesso!", insertedId: result.insertedId, data: novoPersonagemData });
    } catch (error) {
        console.error("Erro ao criar personagem:", error);
        res.status(500).json({ message: "Erro interno do servidor ao criar personagem." });
    }
});

// READ ALL: GET /api/personagens
router.get('/', async (req, res) => {
    try {
        const personagens = await Personagem.getAllPersonagens();
        res.status(200).json(personagens);
    } catch (error) {
        console.error("Erro ao buscar personagens:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar personagens." });
    }
});

// READ ONE: GET /api/personagens/:id
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id; // Pega o ID da URL
        const personagem = await Personagem.getPersonagemById(id);
        if (!personagem) {
            return res.status(404).json({ message: "Personagem não encontrado." });
        }
        res.status(200).json(personagem);
    } catch (error) {
        // Se o ID for inválido e o modelo não tratar, pode dar erro aqui
        if (error.message.includes("Argument passed in must be a string of 12 bytes or a string of 24 hex characters")) {
             return res.status(400).json({ message: "ID inválido." });
        }
        console.error("Erro ao buscar personagem por ID:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar personagem." });
    }
});

// UPDATE: PUT /api/personagens/:id
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Corpo da requisição não pode ser vazio para atualização." });
        }

        const result = await Personagem.updatePersonagem(id, updateData);
        if (!result) { // Se o modelo retornou null por ID inválido
             return res.status(400).json({ message: "ID inválido fornecido." });
        }
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Personagem não encontrado para atualização." });
        }
        if (result.modifiedCount === 0 && result.matchedCount === 1) {
            return res.status(200).json({ message: "Nenhuma alteração realizada nos dados do personagem.", id });
        }
        res.status(200).json({ message: "Personagem atualizado com sucesso!", id, changes: result.modifiedCount });
    } catch (error) {
        if (error.message.includes("Argument passed in must be a string of 12 bytes or a string of 24 hex characters")) {
             return res.status(400).json({ message: "ID inválido." });
        }
        console.error("Erro ao atualizar personagem:", error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar personagem." });
    }
});

// DELETE: DELETE /api/personagens/:id
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Personagem.deletePersonagem(id);

        if (!result) { // Se o modelo retornou null por ID inválido
             return res.status(400).json({ message: "ID inválido fornecido." });
        }
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Personagem não encontrado para exclusão." });
        }
        res.status(200).json({ message: "Personagem excluído com sucesso!", id });
    } catch (error) {
        if (error.message.includes("Argument passed in must be a string of 12 bytes or a string of 24 hex characters")) {
             return res.status(400).json({ message: "ID inválido." });
        }
        console.error("Erro ao deletar personagem:", error);
        res.status(500).json({ message: "Erro interno do servidor ao deletar personagem." });
    }
});

module.exports = router;