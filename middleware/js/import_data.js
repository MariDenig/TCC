require('dotenv').config();
const fs = require('fs/promises'); // Usar a versão baseada em Promises do fs
const path = require('path');
const { connectToDatabase, getDb } = require('./db'); // Conexão com o DB

// Importar os modelos
const Personagem = require('../models/personagem.model');
const Content = require('../models/content.model');
const Hq = require('../models/hq.model');
const Page = require('../models/pages.model');

const DATA_DIR = path.join(__dirname, '../data'); // Caminho para a pasta 'data'

// Função para ler arquivo JSON
async function readJsonFile(fileName) {
    try {
        const filePath = path.join(DATA_DIR, fileName);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Erro ao ler o arquivo ${fileName}:`, error);
        throw error;
    }
}

// Função principal de importação
async function importData() {
    try {
        await connectToDatabase();
        const db = getDb(); // Apenas para logar ou verificar, os modelos já usam

        console.log(`Conectado ao banco: ${db.databaseName}. Iniciando importação...`);

        // Limpar coleções antes de importar (OPCIONAL - CUIDADO EM PRODUÇÃO)
        // Se você rodar este script múltiplas vezes, pode querer limpar os dados antigos.
        // Descomente com cautela.
        // console.log('Limpando coleções existentes...');
        // await db.collection('personagens').deleteMany({});
        // await db.collection('content').deleteMany({}); // Ou use o identificador { type: "main_content" }
        // await db.collection('hq').deleteMany({});      // Ou use o identificador { type: "main_hq" }
        // await db.collection('pages').deleteMany({});
        // console.log('Coleções limpas.');

        // 1. Importar Personagens
        console.log('\nImportando Personagens...');
        const personagensData = await readJsonFile('personagens.json');
        if (personagensData && personagensData.personagens) {
            for (const personagem of personagensData.personagens) {
                // Você pode querer transformar o 'id' numérico em algo como 'originalId'
                // se quiser manter e deixar o MongoDB gerar o '_id'.
                // Ex: const { id, ...rest } = personagem;
                // await Personagem.createPersonagem({ originalId: id, ...rest });
                await Personagem.createPersonagem(personagem);
                console.log(`- Personagem "${personagem.nome}" importado.`);
            }
            console.log('Personagens importados com sucesso!');
        } else {
            console.log('Nenhum dado de personagem encontrado ou formato inválido.');
        }

        // 2. Importar Content
        console.log('\nImportando Content...');
        const contentData = await readJsonFile('content.json');
        if (contentData) {
            // O modelo saveContent usa upsert com um filtro {type: "main_content"}
            await Content.saveContent(contentData);
            console.log('- Documento de Content salvo/atualizado com sucesso!');
        } else {
            console.log('Nenhum dado de content encontrado.');
        }

        // 3. Importar HQ
        console.log('\nImportando HQ...');
        const hqData = await readJsonFile('hq.json');
        if (hqData) {
            // O modelo saveHq usa upsert com um filtro {type: "main_hq"}
            await Hq.saveHq(hqData);
            console.log('- Documento de HQ salvo/atualizado com sucesso!');
        } else {
            console.log('Nenhum dado de HQ encontrado.');
        }

        // 4. Importar Pages
        console.log('\nImportando Pages...');
        const pagesData = await readJsonFile('pages.json');
        if (pagesData && pagesData.pages) {
            for (const page of pagesData.pages) {
                await Page.createPage(page);
                console.log(`- Página número "${page.numero || page.id}" importada.`);
            }
            console.log('Páginas importadas com sucesso!');
        } else {
            console.log('Nenhum dado de página encontrado ou formato inválido.');
        }

        console.log('\nImportação de dados concluída!');

    } catch (error) {
        console.error('Erro durante o processo de importação:', error);
    } finally {
        // Fechar a conexão com o banco de dados (se o seu db.js não fizer isso automaticamente ao final)
        // O client do MongoDB geralmente mantém a conexão aberta.
        // Para um script, é bom fechar explicitamente.
        const client = getDb().client; // Acessar o client através do db retornado por getDb()
        if (client) {
            await client.close();
            console.log('Conexão com o MongoDB fechada.');
        }
        process.exit(0); // Termina o script
    }
}

// Executar a função de importação
importData();