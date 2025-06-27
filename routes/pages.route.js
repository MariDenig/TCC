// routes/page.routes.js
const express = require('express');
const router = express.Router();
const Page = require('../models/pages.model'); // Importa o modelo

// CREATE: POST /api/pages
router.post('/', async (req, res) => {
    try {
        const novaPageData = req.body;
        
        const result = await Page.createPage(novaPageData);
        res.status(201).json({ message: "Página criada com sucesso!", insertedId: result.insertedId, data: novaPageData });
    } catch (error) {
        console.error("Erro ao criar página:", error);
        res.status(500).json({ message: "Erro interno do servidor ao criar página." });
    }
});

// READ ALL: GET /api/pages
router.get('/', async (req, res) => {
    try {
        const pages = await Page.getAllPages();
        res.status(200).json(pages);
    } catch (error) {
        console.error("Erro ao buscar páginas:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar páginas." });
    }
});

// READ ONE: GET /api/pages/:id
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const page = await Page.getPageById(id);
        if (!page) {
            // Verifica se o ID era inválido (getPageById retorna null) ou simplesmente não encontrado
            if (!require('mongodb').ObjectId.isValid(id)) {
                 return res.status(400).json({ message: "ID da página inválido." });
            }
            return res.status(404).json({ message: "Página não encontrada." });
        }
        res.status(200).json(page);
    } catch (error) {
        console.error("Erro ao buscar página por ID:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar página." });
    }
});

// UPDATE: PUT /api/pages/:id
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Corpo da requisição não pode ser vazio para atualização." });
        }

        const result = await Page.updatePage(id, updateData);

        if (!result) { // Se o modelo retornou null por ID inválido
             return res.status(400).json({ message: "ID da página inválido." });
        }
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Página não encontrada para atualização." });
        }
        if (result.modifiedCount === 0 && result.matchedCount === 1) {
            return res.status(200).json({ message: "Nenhuma alteração realizada nos dados da página.", id });
        }
        res.status(200).json({ message: "Página atualizada com sucesso!", id, changes: result.modifiedCount });
    } catch (error) {
        console.error("Erro ao atualizar página:", error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar página." });
    }
});

// DELETE: DELETE /api/pages/:id
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Page.deletePage(id);

        if (!result) { // Se o modelo retornou null por ID inválido
             return res.status(400).json({ message: "ID da página inválido." });
        }
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Página não encontrada para exclusão." });
        }
        res.status(200).json({ message: "Página excluída com sucesso!", id });
    } catch (error) {
        console.error("Erro ao deletar página:", error);
        res.status(500).json({ message: "Erro interno do servidor ao deletar página." });
    }
});

module.exports = router;