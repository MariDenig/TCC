// Função para carregar os personagens
async function carregarPersonagens() {
    try {
        const response = await fetch('/api/personagens');
        if (!response.ok) {
            throw new Error('Erro ao carregar personagens');
        }
        const personagens = await response.json();
        exibirPersonagens(personagens);
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagemErro('Não foi possível carregar os personagens. Tente novamente mais tarde.');
    }
}

// Função para exibir os personagens na página
function exibirPersonagens(personagens) {
    const container = document.getElementById('personagens-container');
    if (!container) return;

    container.innerHTML = personagens.map(personagem => `
        <div class="bg-white dark:bg-gray-700 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div class="md:flex">
                <div class="md:w-1/2">
                    <img src="${personagem.imagemURL}" alt="${personagem.nome}" class="w-full h-full object-cover">
                </div>
                <div class="p-8 md:w-1/2">
                    <h3 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">${personagem.nome}</h3>
                    <p class="text-gray-600 dark:text-gray-300">
                        ${personagem.descricao}
                    </p>
                </div>
            </div>
        </div>
    `).join('');
}

// Função para mostrar mensagens de erro
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

// Carregar personagens quando a página for carregada
document.addEventListener('DOMContentLoaded', carregarPersonagens); 