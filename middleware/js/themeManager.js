// Função para verificar a preferência de tema do sistema
function getSystemThemePreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Função para verificar o tema salvo no localStorage
function getSavedTheme() {
    return localStorage.getItem('theme');
}

// Função para definir o tema
function setTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
}

// Função para alternar entre temas
function toggleTheme() {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// Função para inicializar o tema
function initializeTheme() {
    const savedTheme = getSavedTheme();
    const systemTheme = getSystemThemePreference();
    
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(systemTheme);
    }
}

// Adicionar listener para mudanças na preferência de tema do sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!getSavedTheme()) {
        setTheme(e.matches ? 'dark' : 'light');
    }
});

// Inicializar o tema quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeTheme); 