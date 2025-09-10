

// Função para carregar personagens
async function carregarPersonagens() {
    try {
        const response = await fetch('http://localhost:3000/api/personagens');
        if (!response.ok) throw new Error('Erro ao carregar personagens');
        const personagens = await response.json();
        exibirPersonagensAdmin(personagens);
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagemErro('Erro ao carregar personagens');
    }
}

// Função para exibir personagens na área administrativa
function exibirPersonagensAdmin(personagens) {
    const container = document.getElementById('personagens-admin');
    if (!container) return;

    container.innerHTML = personagens.map(personagem => `
        <div class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow mb-4">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">${personagem.nome}</h3>
                    <p class="text-gray-600 dark:text-gray-300">${personagem.descricao}</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editarPersonagem('${personagem._id}')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                        Editar
                    </button>
                    <button onclick="excluirPersonagem('${personagem._id}')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Função para criar novo personagem
async function criarPersonagem(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const dados = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('http://localhost:5000/api/personagens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        if (!response.ok) throw new Error('Erro ao criar personagem');
        
        mostrarMensagemSucesso('Personagem criado com sucesso!');
        form.reset();
        await carregarPersonagens();
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagemErro('Erro ao criar personagem');
    }
}

// Função para editar personagem
async function editarPersonagem(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/personagens/${id}`);
        if (!response.ok) throw new Error('Erro ao carregar dados do personagem');
        
        const personagem = await response.json();
        preencherFormularioEdicao(personagem);
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagemErro('Erro ao carregar dados do personagem');
    }
}

// Função para preencher formulário de edição
function preencherFormularioEdicao(personagem) {
    const form = document.getElementById('form-edicao');
    if (!form) return;

    form.nome.value = personagem.nome;
    form.descricao.value = personagem.descricao;
    form.imagemURL.value = personagem.imagemURL;
    form.dataset.id = personagem.id;
}

// Função para salvar edição
async function salvarEdicao(event) {
    event.preventDefault();
    const form = event.target;
    const id = form.dataset.id;
    const formData = new FormData(form);
    const dados = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`http://localhost:5000/api/personagens/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        if (!response.ok) throw new Error('Erro ao atualizar personagem');
        
        mostrarMensagemSucesso('Personagem atualizado com sucesso!');
        await carregarPersonagens();
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagemErro('Erro ao atualizar personagem');
    }
}

// Função para excluir personagem
async function excluirPersonagem(id) {
    if (!confirm('Tem certeza que deseja excluir este personagem?')) return;

    try {
        const response = await fetch(`http://localhost:5000/api/personagens/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao excluir personagem');
        
        mostrarMensagemSucesso('Personagem excluído com sucesso!');
        await carregarPersonagens();
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagemErro('Erro ao excluir personagem');
    }
}

// Funções auxiliares para mensagens
function mostrarMensagemSucesso(mensagem) {
    const container = document.getElementById('mensagem-container');
    if (container) {
        container.innerHTML = `
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <span class="block sm:inline">${mensagem}</span>
            </div>
        `;
    }
}

function mostrarMensagemErro(mensagem) {
    const container = document.getElementById('mensagem-container');
    if (container) {
        container.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span class="block sm:inline">${mensagem}</span>
            </div>
        `;
    }
}

// Função para carregar todos os dados
async function carregarDados() {
    await Promise.all([
        carregarPersonagens(),
        carregarPaginas(),
        carregarConteudo()
    ]);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    
    // Adicionar event listeners aos formulários
    const formCriacao = document.getElementById('form-criacao');
    if (formCriacao) {
        formCriacao.addEventListener('submit', criarPersonagem);
    }

    const formEdicao = document.getElementById('form-edicao');
    if (formEdicao) {
        formEdicao.addEventListener('submit', salvarEdicao);
    }
}); 

    