const express = require('express');
const router = express.Router();
const Hq = require('../models/hq.model');

// GET /api/hq - Ler a HQ
router.get('/', async (req, res) => {
    try {
        const hq = await Hq.getHq();
        if (!hq) {
            return res.status(404).json({ message: "HQ não encontrada. Use POST para criar." });
        }
        res.status(200).json(hq);
    } catch (error) {
        console.error("Erro ao buscar HQ:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar HQ." });
    }
});

// POST /api/hq - Criar ou substituir completamente a HQ
router.post('/', async (req, res) => {
    try {
        const hqData = req.body;
        if (Object.keys(hqData).length === 0) {
            return res.status(400).json({ message: "Corpo da requisição não pode ser vazio." });
        }
        const savedHq = await Hq.saveHq(hqData);
        res.status(201).json({ message: "HQ salva/substituída com sucesso!", data: savedHq });
    } catch (error) {
        console.error("Erro ao salvar/substituir HQ:", error);
        res.status(500).json({ message: "Erro interno do servidor ao salvar/substituir HQ." });
    }
});

// PUT /api/hq - Atualizar partes da HQ
router.put('/', async (req, res) => {
    try {
        const updateData = req.body;
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Corpo da requisição não pode ser vazio para atualização." });
        }

        const existingHq = await Hq.getHq();
        if (!existingHq) {
            return res.status(404).json({ message: "HQ não encontrada para atualizar. Crie primeiro com POST." });
        }

        const updatedHq = await Hq.updateHq(updateData);
         if (!updatedHq) {
            return res.status(404).json({ message: "HQ não encontrada durante a tentativa de atualização." });
        }
        res.status(200).json({ message: "HQ atualizada com sucesso!", data: updatedHq });
    } catch (error) {
        console.error("Erro ao atualizar HQ:", error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar HQ." });
    }
});

// DELETE /api/hq - Excluir a HQ (opcional)
router.delete('/', async (req, res) => {
    try {
        const result = await Hq.deleteHq();
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "HQ não encontrada para exclusão." });
        }
        res.status(200).json({ message: "HQ excluída com sucesso!" });
    } catch (error) {
        console.error("Erro ao deletar HQ:", error);
        res.status(500).json({ message: "Erro interno do servidor ao deletar HQ." });
    }
});

module.exports = router;