// routes/content.routes.js
const express = require('express');
const router = express.Router();
const Content = require('../models/content.model');

// GET /api/content - Ler o conteúdo
router.get('/', async (req, res) => {
    try {
        const content = await Content.getContent();
        if (!content) {
            // Se o conteúdo ainda não foi carregado, pode retornar 404 ou um objeto vazio
            return res.status(404).json({ message: "Conteúdo não encontrado. Use POST para criar." });
        }
        res.status(200).json(content);
    } catch (error) {
        console.error("Erro ao buscar conteúdo:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar conteúdo." });
    }
});

// POST /api/content - Criar ou substituir completamente o conteúdo
router.post('/', async (req, res) => {
    try {
        const contentData = req.body;
        if (Object.keys(contentData).length === 0) {
            return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
        }
        const savedContent = await Content.saveContent(contentData);
        res.status(201).json({ message: "Conteúdo salvo/substituído com sucesso!", data: savedContent });
    } catch (error) {
        console.error("Erro ao salvar/substituir conteúdo:", error);
        res.status(500).json({ message: "Erro interno do servidor ao salvar/substituir conteúdo." });
    }
});

// PUT /api/content - Atualizar partes do conteúdo
router.put('/', async (req, res) => {
    try {
        const updateData = req.body;
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Corpo da requisição não pode ser vazio para atualização." });
        }

        const existingContent = await Content.getContent();
        if (!existingContent) {
            return res.status(404).json({ message: "Conteúdo não encontrado para atualizar. Crie primeiro com POST." });
        }

        const updatedContent = await Content.updateContent(updateData);
        if (!updatedContent) { // Pode acontecer se o documento for deletado entre o getContent e o update
            return res.status(404).json({ message: "Conteúdo não encontrado durante a tentativa de atualização." });
        }
        res.status(200).json({ message: "Conteúdo atualizado com sucesso!", data: updatedContent });
    } catch (error) {
        console.error("Erro ao atualizar conteúdo:", error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar conteúdo." });
    }
});

// DELETE /api/content - Excluir o conteúdo (opcional)
router.delete('/', async (req, res) => {
    try {
        const result = await Content.deleteContent();
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Conteúdo não encontrado para exclusão." });
        }
        res.status(200).json({ message: "Conteúdo excluído com sucesso!" });
    } catch (error) {
        console.error("Erro ao deletar conteúdo:", error);
        res.status(500).json({ message: "Erro interno do servidor ao deletar conteúdo." });
    }
});

module.exports = router;