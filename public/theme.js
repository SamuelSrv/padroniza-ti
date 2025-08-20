document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // **IMPORTANTE**: Altere os nomes dos arquivos para os ícones que você tem
    const lightIcon = 'img/modo-escuro.png'; // Ícone para mostrar no tema claro (para MUDAR para escuro)
    const darkIcon = 'img/modo-escuro.png';  // Ícone para mostrar no tema escuro (para MUDAR para claro)

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
        // NOVO: Adiciona a classe para iniciar a animação de giro
        themeIcon.classList.add('spin-animation');

        let currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        themeIcon.src = newTheme === 'dark' ? darkIcon : lightIcon;

        // NOVO: Remove a classe após a animação terminar (500ms = 0.5s)
        // Isso permite que a animação ocorra novamente no próximo clique.
        setTimeout(() => {
            themeIcon.classList.remove('spin-animation');
        }, 500);
    });
}

    // Aplica o tema salvo assim que a página carrega
    applyTheme();
});