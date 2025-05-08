 // Função genérica para buscar dados da API
 async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro ao buscar dados de ${url}: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Erro ao buscar dados de ${url}:`, error);
        return null;
    }
}

// Função para preencher a seção de início
async function fillInicioSection() {
    const data = await fetchData('http://localhost:3000/content'); // Ajuste a URL se necessário
    if (!data || !data.inicio) return;

    const tituloInicio = document.getElementById('titulo-inicio');
    const descricaoInicio = document.getElementById('descricao-inicio');
    const bannerInicio = document.getElementById('banner-inicio');

    if (tituloInicio) tituloInicio.textContent = data.inicio.titulo;
    if (descricaoInicio) descricaoInicio.textContent = data.inicio.descricao;
    if (bannerInicio) bannerInicio.src = data.inicio.imagemBanner;
}

// Função para preencher a seção de personagens
async function fillPersonagensSection() {
    const data = await fetchData('http://localhost:3000/personagens'); // Ajuste a URL se necessário
    if (!data) return;

    const container = document.getElementById('personagens-container');
    if (!container) return;

    container.innerHTML = data.map(personagem => `
        <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div class="flex flex-col md:flex-row items-center gap-8">
                <div class="md:w-1/3">
                    <img src="${personagem.imagem}" alt="${personagem.nome}" class="w-full h-auto rounded-xl shadow-lg">
                </div>
                <div class="md:w-2/3">
                    <h3 class="text-2xl font-bold mb-4 dark:text-white text-gray-800">${personagem.nome}</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-6">${personagem.descricao}</p>
                    <a href="${personagem.link}" class="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500">
                        Conhecer mais
                        <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Função para preencher a seção da HQ
async function fillHQSection() {
    const data = await fetchData('http://localhost:3000/hq'); // Ajuste a URL se necessário
    if (!data || !data.hq) return;

    const tituloHQ = document.getElementById('titulo-hq');
    const subtituloHQ = document.getElementById('subtitulo-hq');
    const descricaoHQ = document.getElementById('descricao-hq');
    const capaHQ = document.getElementById('capa-hq');

    if (tituloHQ) tituloHQ.textContent = data.hq.titulo;
    if (subtituloHQ) subtituloHQ.textContent = data.hq.subtitulo;
    if (descricaoHQ) descricaoHQ.textContent = data.hq.descricao;
    if (capaHQ) capaHQ.src = data.hq.capa;
}

// Função para preencher a seção da equipe (adaptar se necessário)
async function fillEquipeSection() {
    const data = await fetchData('http://localhost:3000/content'); // Assumindo que os dados da equipe estão no 'content'
    if (!data || !data.equipe) return;

    const container = document.getElementById('equipe-container');
    if (!container) return;

    container.innerHTML = data.equipe.map(membro => `
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
            <div class="flex flex-col items-center text-center">
                <img src="${membro.imagem}" alt="${membro.nome}" class="w-32 h-32 rounded-full mb-4 object-cover shadow-lg">
       <h3 class="text-xl font-bold mb-2 dark:text-white text-gray-800">${membro.nome}</h3>
                <p class="text-gray-600 dark:text-gray-300 mb-4">${membro.funcao}</p>
                <div class="flex space-x-4">
                    ${membro.redes.map(rede => `
                        <a href="${rede.link}" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                ${rede.icone}
                            </svg>
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Função para inicializar o conteúdo
async function initializeContent() {
    await Promise.all([ // Carrega os dados em paralelo
        fillInicioSection(),
        fillPersonagensSection(),
        fillHQSection(),
        fillEquipeSection()
    ]);
}

// Inicializar o conteúdo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeContent);
