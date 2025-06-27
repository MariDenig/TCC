// Elementos da interface
const addPageButton = document.querySelector('#paginas button');
const formSection = document.getElementById('form-pagina');
const cancelButton = formSection.querySelector('button[type="button"]');
const submitButton = formSection.querySelector('button[type="submit"]');

// Event Listeners
addPageButton.addEventListener('click', () => {
    formSection.classList.remove('hidden');
    // Scroll para o formulário
    formSection.scrollIntoView({ behavior: 'smooth' });
});

cancelButton.addEventListener('click', () => {
    formSection.classList.add('hidden');
    // Limpar formulário
    formSection.querySelector('form').reset();
});

// Função para carregar as páginas da HQ
async function loadPages() {
    try {
        const response = await fetch('../data/pages.json');
        const pages = await response.json();
        return pages;
    } catch (error) {
        console.error('Erro ao carregar páginas:', error);
        return [];
    }
}

// Função para salvar uma nova página
async function savePage(pageData) {
    try {
        const response = await fetch('../data/pages.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pageData),
        });
        return response.ok;
    } catch (error) {
        console.error('Erro ao salvar página:', error);
        return false;
    }
}

// Função para atualizar uma página existente
async function updatePage(pageId, pageData) {
    try {
        const response = await fetch(`../data/pages.json/${pageId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pageData),
        });
        return response.ok;
    } catch (error) {
        console.error('Erro ao atualizar página:', error);
        return false;
    }
}

// Função para excluir uma página
async function deletePage(pageId) {
    try {
        const response = await fetch(`../data/pages.json/${pageId}`, {
            method: 'DELETE',
        });
        return response.ok;
    } catch (error) {
        console.error('Erro ao excluir página:', error);
        return false;
    }
}

// Função para renderizar a lista de páginas
function renderPages(pages) {
    const tbody = document.querySelector('#paginas table tbody');
    tbody.innerHTML = pages.map(page => `
        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td class="px-6 py-4">${page.numero}</td>
            <td class="px-6 py-4">
                <img src="${page.imagem}" class="w-16 h-16 object-cover rounded" alt="Página ${page.numero}">
            </td>
            <td class="px-6 py-4">${page.titulo}</td>
            <td class="px-6 py-4">${page.personagens.join(', ')}</td>
            <td class="px-6 py-4">
                <button class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-2" onclick="editPage(${page.id})">
                    Editar
                </button>
                <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" onclick="deletePage(${page.id})">
                    Excluir
                </button>
            </td>
        </tr>
    `).join('');
}

// Função para editar uma página
function editPage(pageId) {
    // Implementar lógica de edição
    formSection.classList.remove('hidden');
    // Scroll para o formulário
    formSection.scrollIntoView({ behavior: 'smooth' });
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    const pages = await loadPages();
    renderPages(pages);
}); 