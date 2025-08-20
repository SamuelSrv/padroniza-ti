document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // **IMPORTANTE**: Altere os nomes dos arquivos para os ícones que você tem
    const lightIcon = 'img/lua.png'; // Ícone para mostrar no tema claro (para MUDAR para escuro)
    const darkIcon = 'img/sol.png';  // Ícone para mostrar no tema escuro (para MUDAR para claro)

    function applyTheme() {
        // Pega o tema salvo ou usa 'light' como padrão
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        if (themeIcon) {
            // CORRIGIDO: Define o ícone correto com base no tema atual
            themeIcon.src = savedTheme === 'dark' ? darkIcon : lightIcon;
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // CORRIGIDO: Atualiza a imagem do ícone para refletir o novo estado
            themeIcon.src = newTheme === 'dark' ? darkIcon : lightIcon;
        });
    }

    // Aplica o tema salvo assim que a página carrega
    applyTheme();
});