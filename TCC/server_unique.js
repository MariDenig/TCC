// app.js (ou server.js)
require('dotenv').config();
const express = require('express');
const cors = require('cors');


const { connectToDatabase, getDb } = require('./js/db.js'); // Importa a conexão
// Importar as rotas

const Personagem = require('./models/personagem.model'); // Importa o modelo

// CREATE: POST /api/personagens
const router = express.Router();
router.post('/api/personagens', async (req, res) => {
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
router.get('/api/personagens/', async (req, res) => {
    try {
        const personagens = await Personagem.getAllPersonagens();
        res.status(200).json(personagens);
    } catch (error) {
        console.error("Erro ao buscar personagens:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar personagens." });
    }
});

// READ ONE: GET /api/personagens/:id
router.get('/api/personagens/:id', async (req, res) => {
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
router.put('/api/personagens/:id', async (req, res) => {
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
router.delete('/api/personagens/:id', async (req, res) => {
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

// routes/content.routes.js
const Content = require('./models/content.model');

// GET /api/content - Ler o conteúdo
router.get('/api/content', async (req, res) => {
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
router.post('/api/content', async (req, res) => {
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
router.put('/api/content', async (req, res) => {
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
router.delete('/api/content', async (req, res) => {
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

const Hq = require('./models/hq.model');

// GET /api/hq - Ler a HQ
router.get('/api/hq', async (req, res) => {
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
router.post('/api/hq', async (req, res) => {
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
router.put('/api/hq', async (req, res) => {
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
router.delete('/api/hq', async (req, res) => {
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

// routes/page.routes.js
const Page = require('./models/pages.model'); // Importa o modelo

// CREATE: POST /api/pages
router.post('/api/pages', async (req, res) => {
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
router.get('/api/pages', async (req, res) => {
    try {
        const pages = await Page.getAllPages();
        res.status(200).json(pages);
    } catch (error) {
        console.error("Erro ao buscar páginas:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar páginas." });
    }
});

// READ ONE: GET /api/pages/:id
router.get('/api/pages/:id', async (req, res) => {
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
router.put('/api/pages/:id', async (req, res) => {
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
router.delete('/api/pages/:id', async (req, res) => {
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


const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());       // Habilita o CORS para todas as origens
app.use(express.json()); // Para parsear JSON no corpo das requisições (req.body)
app.use(express.urlencoded({ extended: true })); // Para parsear dados de formulários URL-encoded

// Servir arquivos estáticos da pasta 'public' (para seu frontend)
app.use(express.static('public'));



// Rota raiz para verificar se o servidor está no ar
app.get('/', (req, res) => {
    res.send('API Node.js com MongoDB está funcionando!');
});

// Middleware para tratar rotas não encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ message: "Endpoint não encontrado." });
});

// Middleware de tratamento de erro genérico (deve ser o último middleware)
app.use((err, req, res, next) => {
    console.error("Erro não tratado:", err.stack);
    res.status(500).json({ message: "Ocorreu um erro inesperado no servidor." });
});


// Inicia o servidor APÓS conectar ao banco de dados
async function startServer() {
    try {
        await connectToDatabase(); // Conecta ao MongoDB
        app.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`);
            console.log(`Banco de dados conectado: ${getDb().databaseName}`);
        });
    } catch (error) {
        console.error("Falha ao iniciar o servidor:", error);
        process.exit(1); // Termina a aplicação se não conseguir conectar ao DB
    }
}

startServer();