// Função para carregar dados JSON
async function carregarDados(arquivo) {
    try {
        const response = await fetch(`data/${arquivo}.json`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar ${arquivo}.json`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
}

// Função para preencher seções dinâmicas
async function preencherSecao(secaoId, arquivoDados) {
    const dados = await carregarDados(arquivoDados);
    if (!dados) return;

    const secao = document.getElementById(secaoId);
    if (!secao) return;

    // Aqui você pode adicionar a lógica específica para cada seção
    // Exemplo genérico:
    secao.innerHTML = dados.map(item => `
        <div class="scroll-reveal">
            <h3>${item.titulo}</h3>
            <p>${item.conteudo}</p>
        </div>
    `).join('');
}

// Carrega os dados quando a página estiver pronta
document.addEventListener('DOMContentLoaded', () => {
    // Exemplo de uso:
    // preencherSecao('personagens', 'personagens');
    // preencherSecao('hq', 'hq');
}); 